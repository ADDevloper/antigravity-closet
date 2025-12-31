"use client";

import { ClothingItem } from "@/lib/db";
import { Edit2, Trash2 } from "lucide-react";

interface ItemCardProps {
    item: ClothingItem;
    onEdit?: (item: ClothingItem) => void;
    onDelete?: (id: number) => void;
    inPalette?: boolean;
}

export default function ItemCard({ item, onEdit, onDelete, inPalette }: ItemCardProps) {
    return (
        <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
            <div className="aspect-[4/5] relative overflow-hidden">
                <img
                    src={item.image}
                    alt={item.category}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {inPalette && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-md flex items-center justify-center" title="In your color palette">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                )}

                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {onEdit && (
                        <button
                            onClick={() => onEdit(item)}
                            className="p-2 bg-white rounded-full text-slate-800 hover:bg-purple-50 transition-colors"
                        >
                            <Edit2 size={18} />
                        </button>
                    )}
                    {onDelete && item.id && (
                        <button
                            onClick={() => onDelete(item.id!)}
                            className="p-2 bg-white rounded-full text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-poppins font-bold text-sm capitalize text-slate-900">{item.category}</h3>
                        {item.brand && (
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{item.brand}</p>
                        )}
                    </div>
                    <div className="flex gap-1 items-center">
                        {item.size && (
                            <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-lg border border-purple-100 font-bold mr-1">
                                {item.size}
                            </span>
                        )}
                        <div className="flex gap-1">
                            {item.colors.slice(0, 3).map((color, i) => (
                                <div
                                    key={i}
                                    className="w-3 h-3 rounded-full border border-slate-200 shadow-sm"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                    {item.occasions.map(occ => (
                        <span key={occ} className="text-[9px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md border border-slate-100 capitalize font-medium">
                            {occ}
                        </span>
                    ))}
                    {item.seasons.map(season => (
                        <span key={season} className="text-[9px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md border border-amber-100 capitalize font-bold">
                            {season}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
