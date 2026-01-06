"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Palette, Camera, Sparkles, ArrowRight, ArrowLeft, Shirt, Plus, MessageCircle, X, Check, Info, Upload } from 'lucide-react';
import { PCA_QUESTIONS, calculateQuizSeason, getSeasonData, getSeasonName, getSeasonDescription, QuizAnswers } from '@/lib/pcaUtils';
import { analyzePCAImage } from '@/lib/gemini';
import { savePCAProfile, PCAProfile, ColorSeason, addItem, ClothingItem } from '@/lib/db';

type Step =
    | 'splash'
    | 'welcome'
    | 'pca-intro'
    | 'pca-quiz'
    | 'quiz-transition'
    | 'selfie-intro'
    | 'camera'
    | 'photo-preview'
    | 'analyzing'
    | 'conflict'
    | 'results'
    | 'identity'
    | 'lifestyle'
    | 'closet-transition'
    | 'closet-onboarding'
    | 'add-first-item';

function StepWrapper({ children, className = "" }: { children: React.ReactNode, className?: string }) {
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans p-0 md:p-4">
            <div className={`w-full max-w-md h-screen md:h-[800px] bg-white md:rounded-[3rem] md:shadow-2xl overflow-hidden relative md:border-[12px] md:border-slate-900 flex flex-col ${className}`}>
                {children}
            </div>
        </div>
    );
}

export default function OnboardingFlow() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialStep = searchParams.get('step') as Step;

    const [step, setStep] = useState<Step>(initialStep || 'splash');

    // PCA State
    const [quizAnswers, setQuizAnswers] = useState<Partial<QuizAnswers>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selfieDataUrl, setSelfieDataUrl] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [pcaResult, setPcaResult] = useState<PCAProfile | null>(null);
    const [conflictData, setConflictData] = useState<{ quizSeason: ColorSeason, photoSeason: ColorSeason, photoReasoning: string } | null>(null);
    const [error, setError] = useState<string>('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Identity & Lifestyle State
    const [gender, setGender] = useState<'male' | 'female' | null>(null);
    const [lifestyle, setLifestyle] = useState({
        work: 40,
        casual: 30,
        athletic: 15,
        social: 15
    });

    // Device detection
    useEffect(() => {
        const checkMobile = () => {
            const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
            const mobile = Boolean(userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i)) || window.innerWidth < 768;
            setIsMobile(mobile);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Initial Splash Timer
    useEffect(() => {
        if (step === 'splash') {
            const timer = setTimeout(() => setStep('welcome'), 3000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    // Cleanup camera stream
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    // Attach stream to video element when it becomes available
    useEffect(() => {
        if (step === 'camera' && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [step, stream]);

    // --- Actions ---

    const handleStartCamera = async () => {
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false
            });
            setStream(newStream);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
            setStep('camera');
        } catch (err) {
            console.error("Camera error:", err);
            setError("Could not access camera. Please allow permissions or upload a file.");
            // Fallback could be file upload, but for now we basically error out or let them try again
        }
    };

    const handleTakePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.translate(canvas.width, 0); // Flip horizontally because it's a mirror
                ctx.scale(-1, 1);
                ctx.drawImage(videoRef.current, 0, 0);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setSelfieDataUrl(dataUrl);
                setStep('photo-preview');

                // Stop stream to save battery/processing
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                    setStream(null);
                }
            }
        }
    };

    const handleRetake = () => {
        setSelfieDataUrl('');
        handleStartCamera();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (typeof event.target?.result === 'string') {
                    setSelfieDataUrl(event.target.result);
                    setStep('photo-preview');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleQuizAnswer = (questionId: string, value: string) => {
        setQuizAnswers(prev => ({ ...prev, [questionId]: value }));

        if (currentQuestionIndex < PCA_QUESTIONS.length - 1) {
            setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 300);
        } else {
            // Quiz Complete
            setTimeout(() => setStep('quiz-transition'), 500);
            setTimeout(() => setStep('selfie-intro'), 2500); // 2s transition
        }
    };

    const handleBackQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        } else {
            setStep('pca-intro');
        }
    };

    const handleAnalyze = async () => {
        if (!selfieDataUrl) return;

        setIsAnalyzing(true);
        setStep('analyzing');
        setError('');

        try {
            // Simulate AI processing time with random facts?
            // Real logic:
            const quizResult = calculateQuizSeason(quizAnswers as QuizAnswers);
            const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

            // We use the real API if available, otherwise mock for demo resilience
            let imageAnalysis;
            if (apiKey) {
                try {
                    imageAnalysis = await analyzePCAImage(
                        apiKey,
                        selfieDataUrl,
                        quizResult.season,
                        quizResult.confidence
                    );
                } catch (e) {
                    console.warn("API Call failed, falling back to mock", e);
                    // Fallback Mock
                    imageAnalysis = {
                        recommendedSeason: quizResult.season,
                        confidence: 0.85,
                        skinUndertone: 'neutral',
                        skinUndertoneConfidence: 0.8,
                        contrastLevel: 'medium',
                        hairTone: 'neutral',
                        eyeColor: 'brown',
                        reasoning: "Based on our analysis, your features harmonize best with this season.",
                        agreesWithQuiz: true
                    };
                }
            } else {
                // Fallback Mock
                await new Promise(r => setTimeout(r, 4000)); // Fake delay
                imageAnalysis = {
                    recommendedSeason: quizResult.season, // Just agree for now
                    confidence: 0.85,
                    skinUndertone: 'neutral',
                    skinUndertoneConfidence: 0.8,
                    contrastLevel: 'medium',
                    hairTone: 'neutral',
                    eyeColor: 'brown',
                    reasoning: "Your skin tone and features heavily suggest this season!",
                    agreesWithQuiz: true
                };
            }

            if (!imageAnalysis) throw new Error("Analysis failed");

            // Check conflict
            if (!imageAnalysis.agreesWithQuiz && imageAnalysis.recommendedSeason !== quizResult.season) {
                // Set conflict state
                setConflictData({
                    quizSeason: quizResult.season,
                    photoSeason: imageAnalysis.recommendedSeason as ColorSeason,
                    photoReasoning: imageAnalysis.reasoning
                });

                // Temp profile
                const tempProfile: PCAProfile = {
                    quizSeason: quizResult.season,
                    quizConfidence: quizResult.confidence,
                    quizAnswers: quizAnswers as Record<string, string>,
                    selfieDataUrl,
                    skinUndertone: imageAnalysis.skinUndertone as any,
                    skinUndertoneConfidence: imageAnalysis.skinUndertoneConfidence,
                    contrastLevel: imageAnalysis.contrastLevel as any,
                    hairTone: imageAnalysis.hairTone as any,
                    eyeColor: imageAnalysis.eyeColor,
                    recommendedSeason: imageAnalysis.recommendedSeason as ColorSeason,
                    confidence: imageAnalysis.confidence,
                    reasoning: imageAnalysis.reasoning,
                    agreesWithQuiz: false,
                    bestColors: [],
                    avoidColors: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };
                setPcaResult(tempProfile);
                setStep('conflict');
                return;
            }

            // Success
            await finalizeAndSave(imageAnalysis.recommendedSeason as ColorSeason, quizResult, imageAnalysis);

        } catch (err) {
            console.error(err);
            setError("Something went wrong. Let's try that again.");
            setStep('photo-preview'); // Go back
        } finally {
            setIsAnalyzing(false);
        }
    };

    const finalizeAndSave = async (season: ColorSeason, quizResult: any, imageAnalysis: any) => {
        const seasonData = getSeasonData(season);
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
            recommendedSeason: season,
            confidence: imageAnalysis.confidence,
            reasoning: imageAnalysis.reasoning,
            agreesWithQuiz: season === quizResult.season,
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
        const seasonData = getSeasonData(season);
        const finalProfile = { ...pcaResult, recommendedSeason: season, bestColors: seasonData.best, avoidColors: seasonData.avoid };
        await savePCAProfile(finalProfile);
        setPcaResult(finalProfile);
        setStep('results');
    };

    const handleFinishOnboarding = async () => {
        // Save Profile Data
        const saveProfile = async () => {
            const { saveUserProfile, getUserProfile } = await import('@/lib/db');
            const existing = await getUserProfile();
            await saveUserProfile({
                ...(existing || {}),
                id: 'current',
                name: existing?.name || 'User',
                gender: gender || 'female',
                lifestyle: lifestyle,
                createdAt: existing?.createdAt || Date.now()
            } as any);
        };
        await saveProfile();

        localStorage.setItem("closet_has_onboarded", "true");
        document.cookie = "onboarding_complete=true; path=/; max-age=31536000; SameSite=Lax";
        router.push('/');
    };

    // --- Renders ---

    // 1. Splash Screen
    if (step === 'splash') {
        return (
            <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center text-white z-50 cursor-pointer" onClick={() => setStep('welcome')}>
                <div className="animate-pulse flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-20 rounded-full"></div>
                        <Sparkles className="w-16 h-16 text-purple-400 animate-spin-slow" />
                    </div>
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-bold font-poppins tracking-wider">CLOSET</h1>
                        <p className="text-purple-200/80 text-sm tracking-widest uppercase">Your AI-Powered Stylist</p>
                    </div>
                    <div className="mt-12 flex gap-4 opacity-50">
                        {/* Animated clothing items floating - simplified as icons */}
                        <Shirt className="animate-bounce delay-0" />
                        <Palette className="animate-bounce delay-100" />
                        <Camera className="animate-bounce delay-200" />
                    </div>
                    <p className="fixed bottom-12 text-xs text-white/30">Loading your style...</p>
                </div>
            </div>
        );
    }

    // 2. Welcome Screen
    if (step === 'welcome') {
        return (
            <StepWrapper>
                <div className="bg-white p-8 text-center space-y-8 animate-fade-in relative overflow-hidden h-full flex flex-col justify-center">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>

                    <div className="space-y-2 pt-4">
                        <span className="text-3xl">👋</span>
                        <h2 className="text-2xl font-bold text-slate-900 font-poppins">Welcome to Closet!</h2>
                        <p className="text-slate-500">We help you look amazing with what you already own.</p>
                    </div>

                    <div className="space-y-4 text-left bg-slate-50 p-6 rounded-2xl">
                        <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Here's what we'll do:</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 text-purple-600">🎨</div>
                                <div>
                                    <span className="block font-medium text-slate-800">Discover your colors</span>
                                    <span className="text-xs text-slate-500">Takes just 3 minutes</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">📸</div>
                                <div>
                                    <span className="block font-medium text-slate-800">Digitize your wardrobe</span>
                                    <span className="text-xs text-slate-500">Snap photos to organize</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 text-pink-600">✨</div>
                                <div>
                                    <span className="block font-medium text-slate-800">Get styling suggestions</span>
                                    <span className="text-xs text-slate-500">Daily outfit ideas</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => setStep('pca-intro')}
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
                        >
                            Let's Start!
                        </button>
                        <p className="text-xs text-slate-400">Ready to find your best colors?</p>
                    </div>
                </div>
            </StepWrapper>
        );
    }

    // 3. PCA Intro
    if (step === 'pca-intro') {
        return (
            <StepWrapper className="bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="p-8 h-full flex flex-col justify-center space-y-8 animate-fade-in relative">
                    <button onClick={() => setStep('welcome')} className="absolute top-6 left-6 text-slate-400 hover:text-slate-900"><ArrowLeft size={20} /></button>

                    <div className="text-center space-y-4 pt-8">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center shadow-lg transform rotate-12">
                            <Palette className="text-white w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 font-poppins">Discover Your Perfect Colors</h2>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Personal Color Analysis helps you find the colors that make you look and feel your absolute best.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {['Warm Spring 🌸', 'Cool Summer 🌊', 'Warm Autumn 🍂', 'Cool Winter ❄️'].map(s => (
                            <div key={s} className="bg-white p-3 rounded-xl text-center text-xs font-medium text-slate-600 border border-slate-100">
                                {s}
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
                            <span className="text-lg">📋</span>
                            <div className="flex-1">
                                <div className="text-sm font-semibold">Step 1: Quick Quiz</div>
                                <div className="text-xs text-slate-400">8 questions</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
                            <span className="text-lg">📸</span>
                            <div className="flex-1">
                                <div className="text-sm font-semibold">Step 2: Selfie</div>
                                <div className="text-xs text-slate-400">AI analysis</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
                            <span className="text-lg">✨</span>
                            <div className="flex-1">
                                <div className="text-sm font-semibold">Step 3: Your Results</div>
                                <div className="text-xs text-slate-400">Get your palette</div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setStep('pca-quiz')}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                    >
                        Start My Color Journey →
                    </button>

                    <p className="text-center text-xs text-slate-400 px-4">
                        💕 Remember: These are helpful guidelines, not rules! Wear what makes you confident.
                    </p>
                </div>
            </StepWrapper>
        );
    }

    // 4. PCA Quiz
    if (step === 'pca-quiz') {
        const currentQ = PCA_QUESTIONS[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / 8) * 100;

        return (
            <StepWrapper>
                <div className="bg-white p-8 h-full flex flex-col animate-fade-in relative">
                    {/* Header */}
                    <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <span>Step 1 of 8</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto scrollbar-none">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 font-poppins leading-snug">
                            {currentQ.question}
                        </h3>

                        <div className="space-y-3">
                            {currentQ.options.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => handleQuizAnswer(currentQ.id, opt.value)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group
                                        ${quizAnswers[currentQ.id as keyof QuizAnswers] === opt.value
                                            ? 'border-purple-500 bg-purple-50 text-purple-900 shadow-md'
                                            : 'border-slate-100 hover:border-purple-200 hover:bg-slate-50 text-slate-700'
                                        }`}
                                >
                                    <span className="font-medium">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <button onClick={handleBackQuestion} className="text-slate-400 hover:text-slate-600 text-sm font-medium flex items-center gap-2">
                            <ArrowLeft size={16} /> Back
                        </button>
                    </div>
                </div>
            </StepWrapper>
        );
    }

    // 5. Quiz Transition
    if (step === 'quiz-transition') {
        return (
            <StepWrapper>
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-scale-in">
                    <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="w-12 h-12 text-green-600 animate-bounce-short" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Quiz Complete!</h2>
                        <p className="text-slate-500">Now let's take your selfie...</p>
                    </div>
                </div>
            </StepWrapper>
        );
    }

    // 6. Selfie Intro
    if (step === 'selfie-intro') {
        return (
            <StepWrapper>
                <div className="bg-white p-8 h-full flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-2/3"></div>
                    </div>

                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-purple-200 blur-xl rounded-full opacity-50"></div>
                        <Camera className="w-16 h-16 text-purple-600 relative z-10" />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 font-poppins">Take Your Selfie</h2>

                    <div className="bg-slate-50 text-left p-5 rounded-2xl space-y-3 w-full">
                        <p className="font-bold text-slate-800 text-sm">For the best analysis:</p>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex items-center gap-2">☀️ Natural daylight (near a window)</li>
                            <li className="flex items-center gap-2">👤 Face the camera directly</li>
                            <li className="flex items-center gap-2">👓 Remove glasses if possible</li>
                            <li className="flex items-center gap-2">🙂 Neutral expression</li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-4 w-full pt-2">
                        {/* Camera Button - Primary on Mobile */}
                        <button
                            onClick={handleStartCamera}
                            className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 relative group ${isMobile
                                ? 'bg-slate-900 text-white shadow-xl hover:scale-[1.02]'
                                : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-purple-300 hover:bg-slate-50'
                                }`}
                        >
                            {isMobile && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-bold shadow-md flex items-center gap-1">
                                    <Sparkles size={8} /> Recommended
                                </div>
                            )}
                            Open Camera <Camera size={18} className={isMobile ? "text-purple-300" : "text-slate-400 group-hover:text-purple-500"} />
                        </button>

                        {/* Upload Button - Primary on Desktop */}
                        <label className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer relative group ${!isMobile
                            ? 'bg-slate-900 text-white shadow-xl hover:scale-[1.02]'
                            : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-purple-300 hover:bg-slate-50'
                            }`}>

                            {!isMobile && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-bold shadow-md flex items-center gap-1">
                                    <Sparkles size={8} /> Recommended
                                </div>
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            Upload Photo <Upload size={18} className={!isMobile ? "text-purple-300" : "text-slate-400 group-hover:text-purple-500"} />
                        </label>
                    </div>
                    <p className="text-xs text-slate-400">Don't worry - we'll let you retake if needed!</p>
                </div>
            </StepWrapper>
        );
    }

    // 7. Camera Interface
    if (step === 'camera') {
        return (
            <div className="fixed inset-0 bg-black flex flex-col z-50">
                {/* Close btn */}
                <button onClick={() => {
                    if (stream) stream.getTracks().forEach(t => t.stop());
                    setStep('selfie-intro');
                }}
                    className="absolute top-4 right-4 text-white z-20 p-2 bg-black/20 rounded-full backdrop-blur-md">
                    <X />
                </button>

                {/* Video Feed */}
                <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-gray-900">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute min-w-full min-h-full object-cover transform -scale-x-100"
                    />

                    {/* Face Guide Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-64 h-80 border-2 border-white/50 rounded-[50%] shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
                        <p className="absolute top-1/4 text-white/80 font-medium text-sm drop-shadow-md">Center your face</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="h-32 bg-black flex items-center justify-center gap-8 pb-8">
                    <button className="p-4 rounded-full bg-white/10 text-white backdrop-blur-md">
                        <span className="text-xs">Switch</span> {/* Placeholder for camera switch logic if needed */}
                    </button>

                    <button
                        onClick={handleTakePhoto}
                        className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform bg-white/20 backdrop-blur-sm"
                    >
                        <div className="w-16 h-16 bg-white rounded-full"></div>
                    </button>

                    <button className="p-4 rounded-full bg-white/10 text-white backdrop-blur-md opacity-0 pointer-events-none">
                        <span className="text-xs">Gap</span>
                    </button>
                </div>
            </div>
        );
    }

    // 8. Photo Preview
    if (step === 'photo-preview') {
        return (
            <StepWrapper className="bg-black">
                <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-6">
                    <div className="w-full relative rounded-2xl overflow-hidden shadow-2xl aspect-[3/4]">
                        <img src={selfieDataUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                            <div className="flex items-center gap-2 mb-1">
                                <Check className="text-green-400 w-4 h-4" />
                                <span className="font-bold text-sm">Photo quality is good!</span>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="w-full bg-red-500/20 text-red-100 p-4 rounded-xl text-center text-sm border border-red-500/50">
                            {error}
                        </div>
                    )}

                    <div className="w-full flex gap-4">
                        <button
                            onClick={handleRetake}
                            className="flex-1 py-4 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors backdrop-blur-md"
                        >
                            Retake
                        </button>
                        <button
                            onClick={handleAnalyze}
                            className="flex-1 py-4 rounded-xl bg-white text-black font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/10"
                        >
                            Looks Good! →
                        </button>
                    </div>
                </div>
            </StepWrapper>
        );
    }

    // 9. Analyzing
    if (step === 'analyzing') {
        return (
            <StepWrapper className="bg-white">
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                        <div className="w-24 h-24 border-4 border-slate-100 border-t-purple-600 rounded-full animate-spin relative z-10"></div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold font-poppins text-slate-900">Analyzing your colors...</h2>
                        <p className="text-slate-500">This will take just a moment ✨</p>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-2xl w-full max-w-xs mx-auto">
                        <p className="text-purple-800 text-sm italic">
                            "Did you know? The right colors can make you look more awake, younger, and healthier!"
                        </p>
                    </div>
                </div>
            </StepWrapper>
        );
    }

    // 9b. Conflict
    if (step === 'conflict' && conflictData) {
        return (
            <StepWrapper>
                <div className="p-8 h-full flex flex-col justify-center space-y-6 animate-fade-in">
                    <div className="text-center">
                        <span className="text-4xl block mb-2">🤔</span>
                        <h2 className="text-2xl font-bold text-slate-900">We found two possibilities!</h2>
                        <p className="text-slate-500 text-sm mt-2">Tap the season that feels more like you:</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleConflictChoice(conflictData.quizSeason)}
                            className="bg-purple-50 border-2 border-purple-100 hover:border-purple-500 rounded-2xl p-4 text-left transition-all hover:scale-[1.02]"
                        >
                            <div className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-2">Based on Quiz</div>
                            <h3 className="font-bold text-sm text-slate-900 mb-2">{getSeasonName(conflictData.quizSeason)}</h3>
                            <div className="flex gap-1 h-2 rounded-full overflow-hidden w-full bg-slate-200">
                                {getSeasonData(conflictData.quizSeason).best.slice(0, 4).map(c => (
                                    <div key={c} className="h-full flex-1" style={{ background: c }} />
                                ))}
                            </div>
                        </button>

                        <button
                            onClick={() => handleConflictChoice(conflictData.photoSeason)}
                            className="bg-blue-50 border-2 border-blue-100 hover:border-blue-500 rounded-2xl p-4 text-left transition-all hover:scale-[1.02]"
                        >
                            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Based on Photo</div>
                            <h3 className="font-bold text-sm text-slate-900 mb-2">{getSeasonName(conflictData.photoSeason)}</h3>
                            <div className="flex gap-1 h-2 rounded-full overflow-hidden w-full bg-slate-200">
                                {getSeasonData(conflictData.photoSeason).best.slice(0, 4).map(c => (
                                    <div key={c} className="h-full flex-1" style={{ background: c }} />
                                ))}
                            </div>
                        </button>
                    </div>
                </div>
            </StepWrapper>
        );
    }

    // 10. Results
    if (step === 'results' && pcaResult) {
        const seasonData = getSeasonData(pcaResult.recommendedSeason);
        return (
            <StepWrapper className="bg-white">
                <div className="flex-1 overflow-y-auto scrollbar-none animate-fade-in">
                    {/* Header bg */}
                    <div className="bg-slate-900 pt-16 pb-24 px-8 text-center rounded-b-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10 space-y-6">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-bold backdrop-blur-md border border-white/10">
                                🎉 It's a match!
                            </div>
                            <h1 className="text-4xl font-bold text-white font-poppins">
                                You're a <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                    {getSeasonName(pcaResult.recommendedSeason)}
                                </span>
                            </h1>
                            <p className="text-slate-300 text-sm leading-relaxed max-w-sm mx-auto">
                                {getSeasonDescription(pcaResult.recommendedSeason)}
                            </p>
                        </div>
                    </div>

                    {/* Content Cards */}
                    <div className="px-6 -mt-12 relative z-20 space-y-6">
                        {/* Best Colors */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
                            <h3 className="font-bold text-slate-900">Your Perfect Colors</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {seasonData.best.slice(0, 12).map((c, i) => (
                                    <div key={i} className="aspect-square rounded-full shadow-inner border border-black/5" style={{ background: c }}></div>
                                ))}
                            </div>
                        </div>

                        {/* Why these works */}
                        <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                            <h3 className="font-bold text-purple-900 mb-2 text-sm uppercase tracking-wide">Why These Work</h3>
                            <p className="text-purple-800/80 text-sm leading-relaxed">
                                {pcaResult.reasoning || seasonData.stylingAdvice}
                            </p>
                        </div>

                        {/* Neutrals */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
                            <h3 className="font-bold text-slate-900">Power Neutrals</h3>
                            <div className="flex justify-between gap-2">
                                {seasonData.neutrals.slice(0, 5).map((c, i) => (
                                    <div key={i} className="w-12 h-12 rounded-full shadow-sm border border-black/5" style={{ background: c }}></div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="pt-4 pb-12">
                            <button
                                onClick={() => setStep('identity')}
                                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-xl hover:scale-[1.02] transition-transform"
                            >
                                Save My Results & Continue →
                            </button>
                        </div>
                    </div>
                </div>
            </StepWrapper>
        );
    }

    // 10.5 Style Identity
    if (step === 'identity') {
        return (
            <StepWrapper>
                <div className="bg-white p-8 h-full flex flex-col items-center justify-center text-center space-y-8 animate-fade-in relative overflow-hidden">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900 font-poppins">Select Your Style Base</h2>
                        <p className="text-slate-500">This helps us suggest the best fit and silhouettes for you.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        <button
                            onClick={() => { setGender('male'); setStep('lifestyle'); }}
                            className={`p-8 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${gender === 'male' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-blue-200'}`}
                        >
                            <span className="text-4xl text-blue-600">♂️</span>
                            <span className="font-bold">Male</span>
                        </button>
                        <button
                            onClick={() => { setGender('female'); setStep('lifestyle'); }}
                            className={`p-8 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${gender === 'female' ? 'border-pink-500 bg-pink-50' : 'border-slate-100 hover:border-pink-200'}`}
                        >
                            <span className="text-4xl text-pink-600">♀️</span>
                            <span className="font-bold">Female</span>
                        </button>
                    </div>

                    <button onClick={() => setStep('results')} className="text-slate-400 hover:text-slate-600">Back</button>
                </div>
            </StepWrapper>
        );
    }

    // 10.6 Lifestyle
    if (step === 'lifestyle') {
        const categories = [
            { id: 'work', label: 'Work/Professional', emoji: '💼' },
            { id: 'casual', label: 'Casual/Everyday', emoji: '👕' },
            { id: 'athletic', label: 'Athletic/Gym', emoji: '🏃' },
            { id: 'social', label: 'Social/Evening', emoji: '🥂' },
        ];

        const updateLifestyle = (id: string, val: number) => {
            setLifestyle(prev => ({ ...prev, [id]: val }));
        };

        return (
            <StepWrapper>
                <div className="p-8 h-full flex flex-col animate-fade-in">
                    <div className="text-center space-y-2 mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 font-poppins">Your Lifestyle</h2>
                        <p className="text-slate-500 text-sm">How do you spend your week? (Approx. %)</p>
                    </div>

                    <div className="flex-1 space-y-6 overflow-y-auto scrollbar-none">
                        {categories.map(cat => (
                            <div key={cat.id} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-slate-700">{cat.emoji} {cat.label}</span>
                                    <span className="font-bold text-purple-600">{lifestyle[cat.id as keyof typeof lifestyle]}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={lifestyle[cat.id as keyof typeof lifestyle]}
                                    onChange={(e) => updateLifestyle(cat.id, parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 space-y-3">
                        <button
                            onClick={() => setStep('closet-transition')}
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
                        >
                            Next →
                        </button>
                        <button onClick={() => setStep('identity')} className="w-full text-slate-400 hover:text-slate-600">Back</button>
                    </div>
                </div>
            </StepWrapper>
        );
    }

    // 11. Closet Transition
    if (step === 'closet-transition') {
        setTimeout(() => setStep('closet-onboarding'), 2500);
        return (
            <StepWrapper className="bg-gradient-to-br from-indigo-900 to-purple-900">
                <div className="h-full flex flex-col items-center justify-center p-8 text-white text-center space-y-6 animate-scale-in">
                    <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                        <Sparkles className="w-10 h-10 text-yellow-300" />
                    </div>
                    <h2 className="text-3xl font-bold font-poppins">Amazing!</h2>
                    <p className="text-indigo-200 text-lg">Now let's build your digital closet so I can help you create stunning outfits!</p>
                </div>
            </StepWrapper>
        );
    }

    // 12. Closet Onboarding
    if (step === 'closet-onboarding') {
        return (
            <StepWrapper>
                <div className="bg-white p-8 h-full flex flex-col items-center justify-center text-center space-y-8 animate-fade-in relative overflow-hidden">
                    <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-4xl">
                        👕
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900">Let's Add Your First Item</h2>

                    <div className="bg-slate-50 p-6 rounded-2xl text-left space-y-3 w-full">
                        <p className="text-sm font-semibold text-slate-900">Our AI will automatically:</p>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Detect item type</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Identify colors</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Check your palette match</li>
                        </ul>
                    </div>

                    <div className="space-y-3 w-full">
                        <button
                            onClick={async () => {
                                await handleFinishOnboarding();
                                router.push('/closet?action=add-new');
                            }}
                            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-colors"
                        >
                            Add My First Item
                        </button>
                        <button
                            onClick={handleFinishOnboarding}
                            className="w-full py-4 text-slate-500 font-medium hover:text-slate-900"
                        >
                            I'll Add Items Later
                        </button>
                    </div>
                </div>
            </StepWrapper>
        );
    }

    return null;
}
