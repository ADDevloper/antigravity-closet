"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Palette, Camera, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { PCA_QUESTIONS, calculateQuizSeason, getSeasonData, getSeasonName, getSeasonDescription, QuizAnswers } from '@/lib/pcaUtils';
import { analyzePCAImage } from '@/lib/gemini';
import { savePCAProfile, PCAProfile, ColorSeason } from '@/lib/db';

type Step = 'welcome' | 'quiz' | 'selfie' | 'analyzing' | 'conflict' | 'results';

export default function PCAOnboarding() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('welcome');
    const [quizAnswers, setQuizAnswers] = useState<Partial<QuizAnswers>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selfieDataUrl, setSelfieDataUrl] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [pcaResult, setPcaResult] = useState<PCAProfile | null>(null);
    const [conflictData, setConflictData] = useState<{ quizSeason: ColorSeason, photoSeason: ColorSeason, photoReasoning: string } | null>(null);
    const [error, setError] = useState<string>('');

    const handleQuizAnswer = (questionId: string, value: string) => {
        setQuizAnswers(prev => ({ ...prev, [questionId]: value }));

        if (currentQuestionIndex < PCA_QUESTIONS.length - 1) {
            setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 300);
        } else {
            setTimeout(() => setStep('selfie'), 500);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSelfieCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setSelfieDataUrl(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleAnalyze = async () => {
        if (!selfieDataUrl) {
            setError('Please capture a selfie first');
            return;
        }

        setIsAnalyzing(true);
        setStep('analyzing');
        setError('');

        try {
            const quizResult = calculateQuizSeason(quizAnswers as QuizAnswers);
            const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

            const imageAnalysis = await analyzePCAImage(
                apiKey,
                selfieDataUrl,
                quizResult.season,
                quizResult.confidence
            );

            if (!imageAnalysis) {
                throw new Error('Failed to analyze image');
            }

            // Check for conflict
            if (!imageAnalysis.agreesWithQuiz && imageAnalysis.recommendedSeason !== quizResult.season) {
                setConflictData({
                    quizSeason: quizResult.season,
                    photoSeason: imageAnalysis.recommendedSeason,
                    photoReasoning: imageAnalysis.reasoning
                });

                // Prepare initial PCA result but don't save yet
                const tempProfile: PCAProfile = {
                    quizSeason: quizResult.season,
                    quizConfidence: quizResult.confidence,
                    quizAnswers: quizAnswers as Record<string, string>,
                    selfieDataUrl,
                    skinUndertone: imageAnalysis.skinUndertone,
                    skinUndertoneConfidence: imageAnalysis.skinUndertoneConfidence,
                    contrastLevel: imageAnalysis.contrastLevel,
                    hairTone: imageAnalysis.hairTone,
                    eyeColor: imageAnalysis.eyeColor,
                    recommendedSeason: imageAnalysis.recommendedSeason, // Default to photo, will update if user chooses quiz
                    confidence: imageAnalysis.confidence,
                    reasoning: imageAnalysis.reasoning,
                    agreesWithQuiz: false, // Disagreement!
                    bestColors: [], // Will fill after choice
                    avoidColors: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };
                setPcaResult(tempProfile);
                setStep('conflict');
                return;
            }

            // No conflict or AI agrees
            await finalizeAndSave(imageAnalysis.recommendedSeason, quizResult, imageAnalysis);
        } catch (err) {
            console.error('PCA Analysis Error:', err);
            setError('Failed to analyze your colors. Please try again.');
            setStep('selfie');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Called after conflict resolution or immediately if no conflict
    const finalizeAndSave = async (chosenSeason: ColorSeason, quizResult: any, imageAnalysis: any) => {
        const seasonData = getSeasonData(chosenSeason);

        const profile: PCAProfile = {
            quizSeason: quizResult.season,
            quizConfidence: quizResult.confidence,
            quizAnswers: quizAnswers as Record<string, string>,
            selfieDataUrl,
            skinUndertone: imageAnalysis.skinUndertone,
            skinUndertoneConfidence: imageAnalysis.skinUndertoneConfidence,
            contrastLevel: imageAnalysis.contrastLevel,
            hairTone: imageAnalysis.hairTone,
            eyeColor: imageAnalysis.eyeColor,
            recommendedSeason: chosenSeason,
            confidence: imageAnalysis.confidence,
            reasoning: imageAnalysis.reasoning,
            agreesWithQuiz: chosenSeason === quizResult.season,
            bestColors: seasonData.best,
            avoidColors: seasonData.avoid,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        await savePCAProfile(profile);
        setPcaResult(profile);
        setStep('results');
    };

    const handleConflictChoice = async (season: ColorSeason) => {
        if (!pcaResult) return;
        // We need to reconstruct the params for finalizeAndSave slightly, 
        // but simpler is to just update the profile we already partially built
        const seasonData = getSeasonData(season);

        const finalProfile: PCAProfile = {
            ...pcaResult,
            recommendedSeason: season,
            bestColors: seasonData.best,
            avoidColors: seasonData.avoid,
        };

        await savePCAProfile(finalProfile);
        setPcaResult(finalProfile);
        setStep('results');
    };

    const currentQuestion = PCA_QUESTIONS[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / PCA_QUESTIONS.length) * 100;

    // Helper to render color grid
    const ColorGrid = ({ colors, count = 12 }: { colors: string[], count?: number }) => (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {colors.slice(0, count).map((color, i) => (
                <div key={i} className="group relative">
                    <div
                        className="w-full aspect-square rounded-full shadow-sm border border-black/5 hover:scale-110 transition-transform cursor-pointer"
                        style={{ backgroundColor: color }}
                        title={color}
                    />
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        {color}
                    </span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl">
                {/* Welcome, Quiz, Selfie, Analyzing Steps - Same as before but wrapped in max-w-3xl */}
                {step === 'welcome' && (
                    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center space-y-6 animate-fade-in">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <Palette className="w-10 h-10 text-white" />
                        </div>

                        <h1 className="font-poppins font-bold text-4xl md:text-5xl text-slate-900">
                            Discover Your <br />
                            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Personal Colors
                            </span>
                        </h1>

                        <p className="text-slate-600 text-lg max-w-md mx-auto">
                            Korean Personal Color Analysis helps you find the colors that make you glow.
                            Takes just 3 minutes!
                        </p>

                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 space-y-4">
                            <h3 className="font-semibold text-slate-800">What you'll do:</h3>
                            <div className="space-y-3 text-left">
                                {[
                                    { icon: '📝', text: 'Answer 8 quick questions' },
                                    { icon: '📸', text: 'Take a selfie in natural light' },
                                    { icon: '✨', text: 'Get your personalized color palette' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl">
                                            {item.icon}
                                        </div>
                                        <span className="text-slate-700">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setStep('quiz')}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-8 rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                        >
                            Let's Start!
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {step === 'quiz' && currentQuestion && (
                    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 space-y-6 animate-fade-in">
                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Question {currentQuestionIndex + 1} of {PCA_QUESTIONS.length}</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Question */}
                        <div className="space-y-6 py-4">
                            <h2 className="font-poppins font-bold text-2xl md:text-3xl text-slate-900">
                                {currentQuestion.question}
                            </h2>

                            <div className="space-y-3">
                                {currentQuestion.options.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleQuizAnswer(currentQuestion.id, option.value)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${quizAnswers[currentQuestion.id as keyof QuizAnswers] === option.value
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-slate-200 hover:border-purple-300 hover:bg-purple-50/50'
                                            }`}
                                    >
                                        <span className="text-slate-800 font-medium">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Back Button */}
                        {currentQuestionIndex > 0 && (
                            <button
                                onClick={handlePreviousQuestion}
                                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Previous Question
                            </button>
                        )}
                    </div>
                )}

                {step === 'selfie' && (
                    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 space-y-6 animate-fade-in">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <Camera className="w-8 h-8 text-white" />
                            </div>

                            <h2 className="font-poppins font-bold text-3xl text-slate-900">
                                Take Your Selfie
                            </h2>

                            <div className="bg-purple-50 rounded-xl p-4 text-left space-y-2">
                                <p className="font-semibold text-slate-800">For best results:</p>
                                <ul className="space-y-1 text-sm text-slate-600">
                                    <li>✓ Face the camera directly</li>
                                    <li>✓ Use natural daylight (near a window)</li>
                                    <li>✓ Remove glasses if possible</li>
                                    <li>✓ Show your full face clearly</li>
                                </ul>
                            </div>
                        </div>

                        {selfieDataUrl ? (
                            <div className="space-y-4">
                                <img
                                    src={selfieDataUrl}
                                    alt="Your selfie"
                                    className="w-full max-w-md mx-auto rounded-2xl shadow-lg"
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSelfieDataUrl('')}
                                        className="flex-1 py-3 px-6 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
                                    >
                                        Retake
                                    </button>
                                    <button
                                        onClick={handleAnalyze}
                                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                                    >
                                        Analyze My Colors
                                        <Sparkles className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className="block">
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="user"
                                    onChange={handleSelfieCapture}
                                    className="hidden"
                                />
                                <div className="w-full h-64 border-2 border-dashed border-purple-300 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-purple-50/50 transition-all">
                                    <Camera className="w-16 h-16 text-purple-400" />
                                    <span className="text-purple-600 font-semibold">Tap to Take Photo</span>
                                </div>
                            </label>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                                {error}
                            </div>
                        )}
                    </div>
                )}

                {step === 'analyzing' && (
                    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center space-y-6 animate-fade-in">
                        <div className="w-20 h-20 mx-auto">
                            <div className="w-full h-full border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                        </div>

                        <h2 className="font-poppins font-bold text-3xl text-slate-900">
                            Analyzing Your Colors...
                        </h2>

                        <p className="text-slate-600">
                            Our AI is examining your skin tone, undertones, and contrast. This will take just a moment ✨
                        </p>
                    </div>
                )}

                {/* CONFLICT RESOLUTION STEP */}
                {step === 'conflict' && conflictData && (
                    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 space-y-6 animate-fade-in">
                        <div className="text-center space-y-2">
                            <h2 className="font-poppins font-bold text-2xl md:text-3xl text-slate-900">
                                We found two possibilities!
                            </h2>
                            <p className="text-slate-600">
                                Your quiz and photo suggested different color seasons. Which one feels more like you?
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Card 1: Quiz */}
                            <button
                                onClick={() => handleConflictChoice(conflictData.quizSeason)}
                                className="bg-purple-50 border-2 border-purple-100 hover:border-purple-500 rounded-2xl p-6 text-left transition-all hover:scale-105"
                            >
                                <div className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">Based on Quiz</div>
                                <h3 className="font-bold text-xl text-slate-900 mb-1">{getSeasonName(conflictData.quizSeason)}</h3>
                                <div className="flex gap-1 mt-3">
                                    {getSeasonData(conflictData.quizSeason).best.slice(0, 5).map(c => (
                                        <div key={c} className="w-6 h-6 rounded-full" style={{ background: c }} />
                                    ))}
                                </div>
                            </button>

                            {/* Card 2: Photo */}
                            <button
                                onClick={() => handleConflictChoice(conflictData.photoSeason)}
                                className="bg-indigo-50 border-2 border-indigo-100 hover:border-indigo-500 rounded-2xl p-6 text-left transition-all hover:scale-105"
                            >
                                <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Based on Photo</div>
                                <h3 className="font-bold text-xl text-slate-900 mb-1">{getSeasonName(conflictData.photoSeason)}</h3>
                                <p className="text-xs text-slate-500 mb-3 line-clamp-3">
                                    AI Reasoning: {conflictData.photoReasoning}
                                </p>
                                <div className="flex gap-1 mt-3">
                                    {getSeasonData(conflictData.photoSeason).best.slice(0, 5).map(c => (
                                        <div key={c} className="w-6 h-6 rounded-full" style={{ background: c }} />
                                    ))}
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* New Enhanced Results Step */}
                {step === 'results' && pcaResult && (() => {
                    const seasonData = getSeasonData(pcaResult.recommendedSeason);

                    return (
                        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
                            {/* Hero Section */}
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 md:p-12 text-center text-white relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-4 backdrop-blur-sm">
                                        {pcaResult.agreesWithQuiz ? '✓ Verification Match' : '✨ Your Style Choice'}
                                    </div>
                                    <h2 className="font-poppins font-bold text-4xl md:text-5xl mb-4">
                                        You're a {getSeasonName(pcaResult.recommendedSeason)}
                                    </h2>
                                    <p className="text-slate-300 text-lg max-w-lg mx-auto leading-relaxed">
                                        {getSeasonDescription(pcaResult.recommendedSeason)}
                                    </p>
                                </div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                            </div>

                            <div className="p-8 md:p-12 space-y-10">
                                {/* Perfect Colors */}
                                <section>
                                    <h3 className="font-poppins font-bold text-2xl text-slate-900 mb-2">Your Perfect Colors</h3>
                                    <p className="text-slate-600 text-sm mb-6">These shades make your skin glow and eyes sparkle.</p>
                                    <ColorGrid colors={seasonData.best} count={12} />
                                </section>

                                {/* Styling Advice */}
                                <section className="bg-purple-50 rounded-2xl p-6">
                                    <h3 className="font-poppins font-bold text-xl text-slate-900 mb-3">Why These Colors Work</h3>
                                    <p className="text-slate-700 leading-relaxed">
                                        {pcaResult.reasoning || seasonData.stylingAdvice}
                                    </p>
                                </section>

                                {/* Best Neutrals */}
                                <section>
                                    <h3 className="font-poppins font-bold text-xl text-slate-900 mb-4">Your Best Neutrals</h3>
                                    <p className="text-slate-600 text-sm mb-4">Build your wardrobe foundation with these versatile shades.</p>
                                    <ColorGrid colors={seasonData.neutrals} count={6} />
                                </section>

                                {/* Colors to Avoid */}
                                <section>
                                    <h3 className="font-poppins font-bold text-xl text-slate-900 mb-2">Colors to Approach Carefully</h3>
                                    <p className="text-slate-600 text-sm mb-4">
                                        Not banned! Just style them away from your face or balance with cool-toned pieces.
                                    </p>
                                    <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                                        {seasonData.avoid.map(c => (
                                            <div key={c} className="w-12 h-12 rounded-full shadow-sm" style={{ background: c }} title={c} />
                                        ))}
                                    </div>
                                </section>

                                {/* Quick Tips */}
                                <section className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                                    <h3 className="font-poppins font-bold text-xl text-amber-900 mb-4 flex items-center gap-2">
                                        <Sparkles size={20} className="text-amber-500" /> Quick Styling Tips
                                    </h3>
                                    <ul className="space-y-3">
                                        {seasonData.tips.map((tip, i) => (
                                            <li key={i} className="flex gap-3 text-amber-900/80">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                {/* CTA */}
                                <button
                                    onClick={() => router.push('/profile?tab=colors')}
                                    className="w-full bg-slate-900 text-white font-bold py-4 px-8 rounded-xl hover:bg-slate-800 hover:scale-[1.02] transition-all shadow-xl flex items-center justify-center gap-2 group"
                                >
                                    View My Color Profile
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <p className="text-center text-xs text-slate-400 mt-4">
                                    Remember: These are guidelines, not rules. Wear what makes YOU feel confident! 💕
                                </p>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Slick Back Button */}
            <button
                onClick={() => router.push('/profile')}
                className="fixed top-6 left-6 z-50 p-3 bg-white/50 backdrop-blur-md border border-white/50 rounded-full shadow-sm text-slate-600 hover:text-purple-600 hover:bg-white hover:scale-110 hover:shadow-md transition-all duration-300 group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
        </div>
    );
}
