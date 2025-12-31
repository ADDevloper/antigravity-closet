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
        <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-slate-100 flex flex-col font-sans">
            <header className="p-6 border-b border-slate-100 bg-white/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
                <div>
                    <h2 className="font-poppins font-bold text-2xl text-slate-900">{format(date, "EEEE")}</h2>
                    <p className="text-slate-500 font-medium">{format(date, "MMMM do, yyyy")}</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                    <X size={24} />
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                {plans.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60 mt-10">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                            <Shirt size={32} />
                        </div>
                        <div>
                            <p className="font-bold text-slate-700">No outfits planned</p>
                            <p className="text-sm text-slate-400">Start your day with style</p>
                        </div>
                    </div>
                ) : (
                    plans.map((plan, idx) => (
                        <div key={plan.id || idx} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 group">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outfit {idx + 1}</span>
                                <button
                                    onClick={() => plan.id && onDeletePlan(plan.id)}
                                    className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                                {plan.itemIds.map((id, i) => {
                                    const item = closetItems[id];
                                    if (!item) return null;
                                    return (
                                        <div key={i} className="relative flex-shrink-0 w-20 aspect-[3/4] rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                                            <img src={item.image} alt={item.category} className="w-full h-full object-cover" />
                                            <div className="absolute bottom-0 inset-x-0 bg-black/40 p-1">
                                                <p className="text-[8px] text-white text-center font-medium truncate capitalize">{item.category}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-white">
                <button
                    onClick={onAddItems}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <Plus size={24} />
                    Plan an Outfit
                </button>
            </div>
        </div>
    );
}
