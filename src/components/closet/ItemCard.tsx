import { ClothingItem } from "@/lib/db";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";

interface ItemCardProps {
    item: ClothingItem;
    onEdit?: (item: ClothingItem) => void;
    onDelete?: (id: number) => void;
    inPalette?: boolean;
}

export default function ItemCard({ item, onEdit, onDelete, inPalette }: ItemCardProps) {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="group bg-white rounded-[32px] overflow-hidden border border-[#F1F5F9] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 mb-6 break-inside-avoid relative">
            {/* Palette Badge */}
            {inPalette && (
                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md text-[#7C3AED] w-8 h-8 rounded-full shadow-sm flex items-center justify-center animate-fade-in border border-purple-50">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                </div>
            )}

            {/* Image Section */}
            <div className="relative aspect-[3/4] overflow-hidden bg-[#F8FAFC]">
                <img
                    src={item.image}
                    alt={item.category}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
            </div>

            {/* Content Section */}
            <div className="p-6">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5 flex-1">
                        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em]">
                            {item.category}
                        </p>
                        <h3 className="text-[16px] font-semibold text-[#1C1A2E] leading-snug">
                            {item.brand ? `${item.brand} ${item.category}` : `Essential ${item.category}`}
                        </h3>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1.5 text-[#CBD5E1] hover:text-[#64748B] transition-colors rounded-lg hover:bg-[#F8FAFC]"
                        >
                            <MoreVertical size={20} />
                        </button>

                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-20"
                                    onClick={() => setShowMenu(false)}
                                />
                                <div className="absolute right-0 bottom-full mb-2 w-36 bg-white rounded-2xl shadow-xl border border-[#F1F5F9] py-2 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    {onEdit && (
                                        <button
                                            onClick={() => { onEdit(item); setShowMenu(false); }}
                                            className="w-full px-4 py-2.5 text-left text-[13px] font-semibold text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#7C3AED] flex items-center gap-2.5 transition-colors"
                                        >
                                            <Edit2 size={14} /> Edit Piece
                                        </button>
                                    )}
                                    {onDelete && item.id && (
                                        <button
                                            onClick={() => { onDelete(item.id!); setShowMenu(false); }}
                                            className="w-full px-4 py-2.5 text-left text-[13px] font-semibold text-[#EF4444] hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                                        >
                                            <Trash2 size={14} /> Remove
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Optional Dots for color/size if they exist */}
                <div className="mt-4 flex items-center gap-3">
                    {item.colors.slice(0, 3).map((color, i) => (
                        <div
                            key={i}
                            className="w-2.5 h-2.5 rounded-full ring-1 ring-[#F1F5F9] shadow-sm"
                            style={{ backgroundColor: color }}
                        />
                    ))}
                    {item.size && (
                        <span className="text-[10px] font-bold text-[#94A3B8] ml-auto border border-[#F1F5F9] px-2 py-0.5 rounded-md">
                            {item.size}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

