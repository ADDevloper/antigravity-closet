"use client";

import { PCAProfile, ClothingItem } from "@/lib/db";
import { getSeasonData, getSeasonName, getSeasonDescription, isColorInPalette } from "@/lib/pcaUtils";
import { Sparkles, ArrowRight, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface MyColorsTabProps {
    pca: PCAProfile;
    items: ClothingItem[];
}

export default function MyColorsTab({ pca, items }: MyColorsTabProps) {
    const seasonData = getSeasonData(pca.recommendedSeason);
    const seasonName = getSeasonName(pca.recommendedSeason);
    const description = getSeasonDescription(pca.recommendedSeason);

    // Calculate Wardrobe Match
    const matchingItems = items.filter(item => isColorInPalette(item.colors, pca.bestColors));
    const matchPercent = items.length > 0 ? Math.round((matchingItems.length / items.length) * 100) : 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* 1. Season Overview Card */}
            <section className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                        <CheckCircle size={14} className="text-emerald-300" />
                        <span className="text-xs font-bold uppercase tracking-wider">Analysis Complete</span>
                    </div>
                    <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-4 leading-tight">
                        You're a {seasonName}
                    </h2>
                    <p className="text-purple-100 leading-relaxed max-w-lg mb-6">
                        {description}
                    </p>
                    <div className="flex gap-3">
                        <Link href="/pca" className="px-5 py-2.5 bg-white text-purple-700 rounded-xl font-bold text-sm shadow-lg hover:bg-purple-50 transition-colors">
                            Retake Analysis
                        </Link>
                    </div>
                </div>
                {/* Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            </section>

            {/* 2. Your Perfect Colors */}
            <section>
                <h3 className="font-poppins font-bold text-xl text-slate-900 mb-6 flex items-center gap-2">
                    <Sparkles size={24} className="text-purple-500" />
                    Your Perfect Colors
                </h3>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {seasonData.best.map((color, i) => (
                        <div key={i} className="group relative aspect-square rounded-2xl shadow-sm hover:shadow-lg transition-transform hover:scale-105 cursor-pointer border border-slate-100" style={{ backgroundColor: color }}>
                            <div className="absolute inset-x-0 bottom-0 py-1 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl flex justify-center">
                                <span className="text-[10px] text-white font-mono uppercase">{color}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. Best Neutrals */}
            <section>
                <h3 className="font-poppins font-bold text-lg text-slate-900 mb-4">Your Go-To Neutrals</h3>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
                        {seasonData.neutrals.map((color, i) => (
                            <div key={i} className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl shadow-sm border border-slate-100" style={{ backgroundColor: color }} />
                        ))}
                    </div>
                    <p className="mt-4 text-sm text-slate-500 italic flex gap-2">
                        <Info size={16} className="shrink-0 text-slate-400" />
                        Use these as your base foundation instead of generic black or white.
                    </p>
                </div>
            </section>

            {/* 4. Avoid Colors */}
            <section>
                <h3 className="font-poppins font-bold text-lg text-slate-900 mb-4">Colors to Style Carefully</h3>
                <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100">
                    <div className="flex gap-4 overflow-x-auto scrollbar-none pb-4">
                        {seasonData.avoid.map((color, i) => (
                            <div key={i} className="w-12 h-12 shrink-0 rounded-full shadow-sm border-2 border-white ring-2 ring-rose-100" style={{ backgroundColor: color }} />
                        ))}
                    </div>
                    <div className="flex gap-2 items-start mt-2">
                        <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                        <div className="space-y-2">
                            <p className="text-sm font-bold text-rose-700">Not banned, just tricky!</p>
                            <p className="text-xs text-rose-600 leading-relaxed">
                                These colors might clash with your natural undertones. Try wearing them away from your face (as pants or shoes) or balancing them with your best colors.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Quick Tips */}
            <section>
                <h3 className="font-poppins font-bold text-lg text-slate-900 mb-4">Styling Tips</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {seasonData.tips.map((tip, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex gap-3 items-start">
                            <div className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">
                                {i + 1}
                            </div>
                            <p className="text-sm text-slate-700 font-medium leading-relaxed">{tip}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 6. Wardrobe Analysis */}
            <section className="bg-slate-900 text-slate-200 rounded-3xl p-8 shadow-xl">
                <h3 className="font-poppins font-bold text-xl text-white mb-6">Your Closet & Your Colors</h3>
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Ring Chart */}
                    <div className="relative w-32 h-32 flex-center shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#334155"
                                strokeWidth="3"
                            />
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#2DD4BF"
                                strokeWidth="3"
                                strokeDasharray={`${matchPercent}, 100`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-3xl font-bold text-white">{matchPercent}%</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <p className="leading-relaxed">
                            <strong className="text-purple-400">{matchingItems.length} items</strong> in your closet match your <strong>{seasonName}</strong> palette perfectly.
                        </p>
                        <Link href="/closet" className="inline-flex items-center gap-2 text-white font-bold border-b border-purple-500 pb-0.5 hover:text-purple-400 transition-colors">
                            See matching items <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
