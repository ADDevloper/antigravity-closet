import { Plus, MoreVertical, CheckCircle2, SlidersHorizontal, Search, Heart, Sparkles } from "lucide-react";

interface WardrobeHealthProps {
    itemCount: number;
    onRunDiagnostic: () => void;
    onBatchRetag: () => void;
    isAnalyzing: boolean;
    isRefreshingTags: boolean;
}

export default function WardrobeHealth({ itemCount, onRunDiagnostic, onBatchRetag, isAnalyzing, isRefreshingTags }: WardrobeHealthProps) {
    return (
        <section className="bg-white rounded-[32px] p-10 border border-[#F1F5F9] shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
            {/* Ghost Hanger Icon */}
            <div className="absolute right-20 top-1/2 -translate-y-1/2 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                <svg width="240" height="150" viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M120 20C120 20 120 10 110 10C100 10 95 18 95 25C95 35 110 40 120 50C130 60 230 110 230 115C230 125 210 125 210 125L30 125C30 125 10 125 10 115C10 110 110 60 120 50Z" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                <div className="space-y-6 text-center md:text-left">
                    <div className="space-y-1">
                        <h2 className="text-[#64748B] font-medium text-[15px] tracking-wide">Wardrobe Health</h2>
                        <div className="flex items-baseline gap-2 justify-center md:justify-start">
                            <span className="text-[64px] font-bold text-[#1C1A2E] leading-none">{itemCount}</span>
                            <span className="text-[#64748B] text-lg font-medium">Items</span>
                        </div>
                    </div>
                    <p className="text-[#94A3B8] text-[15px] font-medium max-w-[300px]">
                        AI-driven diagnostic of your clothing collection.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-[#F0FDF4] flex items-center justify-center text-[#22C55E] shadow-sm">
                            <CheckCircle2 size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-bold text-[#22C55E] uppercase tracking-[0.2em]">Ready</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={onRunDiagnostic}
                            disabled={isAnalyzing || isRefreshingTags}
                            className="bg-[#3B82F6] text-white px-8 py-4 rounded-2xl font-bold text-[15px] shadow-[0_12px_24px_rgba(59,130,246,0.15)] hover:bg-[#2563EB] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center gap-3"
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Analyzing...</span>
                                </>
                            ) : (
                                "Run Diagnostic"
                            )}
                        </button>

                        <button
                            onClick={onBatchRetag}
                            disabled={isAnalyzing || isRefreshingTags}
                            className="bg-white border-2 border-[#F1F5F9] text-[#64748B] px-8 py-4 rounded-2xl font-bold text-[15px] hover:border-purple-200 hover:text-purple-600 hover:bg-purple-50 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center gap-3"
                        >
                            {isRefreshingTags ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                                    <span>Updating Colors...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} />
                                    <span>Refresh Tags</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

