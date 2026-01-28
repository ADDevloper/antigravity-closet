"use client";

import { format } from "date-fns";
import { PlannedOutfit, ClothingItem } from "@/lib/db";
import { X, Plus, Trash2, Shirt } from "lucide-react";

interface DateDetailPanelProps {
    date: Date;
    plans: PlannedOutfit[];
    closetItems: Record<number, ClothingItem>;
    onClose: () => void;
    onAddItems: () => void;
    onDeletePlan: (id: number) => void;
}

export default function DateDetailPanel({ date, plans, closetItems, onClose, onAddItems, onDeletePlan }: DateDetailPanelProps) {
    return (
        <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] bg-white shadow-[-20px_0_80px_rgba(0,0,0,0.05)] transform transition-transform duration-500 ease-out border-l border-[#F1F5F9] flex flex-col sm:rounded-l-[40px] overflow-hidden">
            {/* Header */}
            <header className="p-8 border-b border-[#F1F5F9] bg-white flex items-center justify-between sticky top-0 z-10">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-[#1C1A2E]">{format(date, "EEEE")}</h2>
                    <p className="text-[#94A3B8] font-medium text-sm tracking-wide uppercase">{format(date, "MMMM do, yyyy")}</p>
                </div>
                <button
                    onClick={onClose}
                    className="w-11 h-11 flex items-center justify-center bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-2xl text-[#64748B] transition-all active:scale-95"
                >
                    <X size={20} strokeWidth={2.5} />
                </button>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#F8FAFC]/30">
                {plans.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
                        <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-[#CBD5E1] shadow-[0_8px_20px_rgba(0,0,0,0.03)] border border-[#F1F5F9]">
                            <Shirt size={40} strokeWidth={1.5} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-[#1C1A2E]">No outfits planned</h3>
                            <p className="text-[#94A3B8] text-sm max-w-[200px] mx-auto font-medium">Curate a stunning look for this day.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {plans.map((plan, idx) => (
                            <div key={plan.id || idx} className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[#F1F5F9] group relative">
                                <div className="flex justify-between items-center mb-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                                        <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.15em]">Curated Look</span>
                                    </div>
                                    <button
                                        onClick={() => plan.id && onDeletePlan(plan.id)}
                                        className="p-2 text-[#CBD5E1] hover:text-[#EF4444] rounded-xl hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-4 gap-3">
                                    {plan.itemIds.map((id, i) => {
                                        const item = closetItems[id];
                                        if (!item) return null;
                                        return (
                                            <div key={i} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#F1F5F9] bg-[#F8FAFC] group/item">
                                                <img src={item.image} alt={item.category} className="w-full h-full object-cover transition-transform group-hover/item:scale-110" />
                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                                    <p className="text-[8px] text-white font-bold truncate uppercase tracking-wider">{item.category}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Sticky Footer */}
            <div className="p-8 border-t border-[#F1F5F9] bg-white">
                <button
                    onClick={onAddItems}
                    className="w-full py-5 bg-[#1C1A2E] text-white rounded-[24px] font-bold text-[15px] shadow-[0_12px_24px_rgba(28,26,46,0.15)] hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                    <Plus size={20} strokeWidth={3} />
                    Plan a Look
                </button>
            </div>
        </div>
    );
}
