"use client";

import { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, CheckCircle2, TrendingUp, Info } from 'lucide-react';
import { ClothingItem, UserProfile, getUserProfile, getAllItems } from '@/lib/db';
import { generateClosetSnapshot, ClosetSnapshot } from '@/lib/gapAnalysis';
import { performGapAnalysis } from '@/lib/gemini';

export default function WardrobeHealth() {
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const runAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
            const [items, profile] = await Promise.all([
                getAllItems(),
                getUserProfile()
            ]);

            if (items.length < 5) {
                throw new Error("Add at least 5 items to your closet for a meaningful analysis.");
            }

            if (!profile) {
                throw new Error("Please complete your profile first.");
            }

            const snapshot = generateClosetSnapshot(items);
            const result = await performGapAnalysis(snapshot, profile);
            setAnalysis(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'good': return <CheckCircle2 className="text-green-500" size={20} />;
            case 'warning': return <AlertCircle className="text-amber-500" size={20} />;
            case 'critical': return <AlertCircle className="text-rose-500" size={20} />;
            default: return <Info className="text-slate-400" size={20} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'good': return 'bg-green-50 text-green-700 border-green-100';
            case 'warning': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'critical': return 'bg-rose-50 text-rose-700 border-rose-100';
            default: return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    return (
        <section className="mt-8 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        Wardrobe Health <Sparkles className="text-purple-500" size={18} />
                    </h2>
                    <p className="text-sm text-slate-500">AI-driven diagnostic of your clothing collection.</p>
                </div>
                {!analysis && !loading && (
                    <button
                        onClick={runAnalysis}
                        className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                        Run Diagnostic
                    </button>
                )}
            </div>

            {loading && (
                <div className="bg-white rounded-3xl p-12 border-2 border-slate-50 flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="space-y-1">
                        <p className="font-bold text-slate-900">Scanning Wardrobe Architecture...</p>
                        <p className="text-xs text-slate-400">Comparing items against style blueprints</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl flex items-center gap-4 text-rose-700">
                    <AlertCircle />
                    <p className="text-sm font-medium">{error}</p>
                    <button onClick={runAnalysis} className="ml-auto underline text-xs font-bold">Try Again</button>
                </div>
            )}

            {analysis && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basics Gap */}
                    <div className="bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Basics & Essentials</span>
                            {getStatusIcon(analysis.basicsGap.status)}
                        </div>
                        <p className="text-sm text-slate-600">{analysis.basicsGap.message}</p>
                        <div className="flex flex-wrap gap-2">
                            {analysis.basicsGap.missingItems.map((item: string) => (
                                <span key={item} className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase">
                                    + {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Lifestyle Gap */}
                    <div className="bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lifestyle Alignment</span>
                            {getStatusIcon(analysis.lifestyleGap.status)}
                        </div>
                        <p className="text-sm text-slate-600">{analysis.lifestyleGap.message}</p>
                    </div>

                    {/* Color Gap */}
                    <div className="bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Color Strategy</span>
                            {getStatusIcon(analysis.colorGap.status)}
                        </div>
                        <p className="text-sm text-slate-600">{analysis.colorGap.message}</p>
                    </div>

                    {/* Power Unlock */}
                    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100 space-y-6 md:col-span-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <TrendingUp size={120} />
                        </div>
                        <div className="relative z-10 space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/10">
                                <Sparkles size={12} className="text-yellow-400" /> Power Unlock Piece
                            </div>
                            <h3 className="text-3xl font-bold font-poppins">{analysis.powerUnlock.item}</h3>
                            <p className="text-indigo-200 text-sm leading-relaxed max-w-lg">
                                {analysis.powerUnlock.reason}
                            </p>
                        </div>

                        <div className="relative z-10 pt-4 flex items-center gap-4">
                            <div className="bg-white/20 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/20">
                                <span className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">Impact</span>
                                <span className="text-2xl font-bold font-poppins">+{analysis.powerUnlock.unlockCount} New Outfits</span>
                            </div>
                            <button
                                onClick={runAnalysis}
                                className="px-6 py-3 rounded-2xl bg-white text-indigo-900 font-bold hover:bg-slate-100 transition-colors ml-auto"
                            >
                                Re-analyze
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
