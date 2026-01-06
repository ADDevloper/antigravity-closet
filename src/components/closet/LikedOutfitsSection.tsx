"use client";

import { useEffect, useState } from "react";
import { getLikedOutfits, removeOutfitRating, ClothingItem, getAllItems, OutfitRating, addPlannedOutfit } from "@/lib/db";
import { Heart, Trash2, Calendar, Loader2, Sparkles, X, Check } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

export default function LikedOutfitsSection() {
    const [likedOutfits, setLikedOutfits] = useState<OutfitRating[]>([]);
    const [closet, setCloset] = useState<ClothingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOutfit, setExpandedOutfit] = useState<string | null>(null);

    useEffect(() => {
        loadLiked();
    }, []);

    const loadLiked = async () => {
        setLoading(true);
        try {
            const [liked, allItems] = await Promise.all([
                getLikedOutfits(),
                getAllItems()
            ]);
            setLikedOutfits(liked);
            setCloset(allItems);
        } catch (error) {
            console.error("Failed to load liked outfits", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (id: number) => {
        if (confirm("Remove this outfit from your liked collection?")) {
            await removeOutfitRating(id);
            setLikedOutfits(prev => prev.filter(o => o.id !== id));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-rose-500" size={32} />
            </div>
        );
    }

    if (likedOutfits.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-rose-100 flex flex-col items-center">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-300 mb-6">
                    <Heart size={40} />
                </div>
                <h3 className="font-poppins font-bold text-xl text-slate-900">No liked outfits yet</h3>
                <p className="text-slate-500 max-w-sm mt-2 font-medium">
                    Start rating outfits in your chat! ❤️ suggestions you like will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {likedOutfits.map((rating) => (
                <LikedOutfitCard
                    key={rating.id}
                    rating={rating}
                    closet={closet}
                    onRemove={() => handleRemove(rating.id!)}
                    isExpanded={expandedOutfit === rating.outfitId}
                    onToggleExpand={() => setExpandedOutfit(expandedOutfit === rating.outfitId ? null : rating.outfitId)}
                />
            ))}
        </div>
    );
}

function LikedOutfitCard({
    rating,
    closet,
    onRemove,
    isExpanded,
    onToggleExpand
}: {
    rating: OutfitRating;
    closet: ClothingItem[];
    onRemove: () => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
}) {
    const [isScheduling, setIsScheduling] = useState(false);
    const [scheduleDate, setScheduleDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const items = rating.outfit.itemIds.map(id => closet.find(i => i.id === id)).filter(Boolean);
    const dateStr = format(rating.timestamp, 'MMM d, yyyy');

    const handleSchedule = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isScheduling) {
            setIsScheduling(true);
            return;
        }

        try {
            await addPlannedOutfit({
                date: scheduleDate,
                itemIds: rating.outfit.itemIds,
                createdAt: Date.now()
            });
            toast.success(`Planned for ${format(new Date(scheduleDate + 'T00:00:00'), 'MMM do')}! 📅`);
            setIsScheduling(false);
        } catch (error) {
            toast.error("Failed to schedule.");
        }
    };

    return (
        <>
            <motion.div
                layoutId={`outfit-${rating.outfitId}`}
                onClick={() => !isScheduling && onToggleExpand()}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group relative"
            >
                <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center text-slate-800">
                    <div>
                        <h4 className="font-poppins font-bold tracking-tight">{rating.outfit.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{dateStr}</p>
                    </div>
                    <Heart size={16} className="text-rose-500 fill-current" />
                </div>

                {isScheduling ? (
                    <div className="p-6 space-y-4 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Select Date</label>
                            <input
                                type="date"
                                value={scheduleDate}
                                onChange={e => setScheduleDate(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-purple-500 transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsScheduling(false)}
                                className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleSchedule}
                                className="flex-[2] py-3 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Check size={14} /> CONFIRM
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-4 grid grid-cols-3 gap-2">
                            {items.slice(0, 3).map((item, i) => (
                                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-slate-100 bg-white">
                                    <img src={item!.image} className="w-full h-full object-cover" />
                                </div>
                            ))}
                            {items.length > 3 && (
                                <div className="aspect-square rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] font-bold">
                                    +{items.length - 3} MORE
                                </div>
                            )}
                        </div>

                        <div className="px-4 pb-4 space-y-3">
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed h-8">
                                {rating.outfit.description}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleSchedule}
                                    className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-colors uppercase tracking-wider"
                                >
                                    <Calendar size={12} /> Schedule
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>

            <AnimatePresence>
                {isExpanded && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onToggleExpand}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            layoutId={`outfit-${rating.outfitId}`}
                            className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl relative z-10"
                        >
                            <button
                                onClick={onToggleExpand}
                                className="absolute right-6 top-6 p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all z-20"
                            >
                                <X size={20} />
                            </button>

                            <div className="p-8 space-y-8 max-h-[90vh] overflow-y-auto scrollbar-thin">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-widest">
                                        <Heart size={14} fill="currentColor" /> Liked Outfit
                                    </div>
                                    <h2 className="font-poppins font-bold text-3xl text-slate-900 leading-tight">
                                        {rating.outfit.name}
                                    </h2>
                                    <p className="text-slate-500 leading-relaxed max-w-md">
                                        {rating.outfit.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {items.map((item, i) => (
                                        <div key={i} className="space-y-2 group">
                                            <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 relative">
                                                <img src={item!.image} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                                {item!.brand && (
                                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-md rounded-full text-[8px] font-bold text-slate-900 uppercase">
                                                        {item!.brand}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">{item!.category}</p>
                                        </div>
                                    ))}
                                </div>

                                {rating.outfit.stylingTips && (
                                    <div className="bg-purple-50 rounded-3xl p-6 border border-purple-100">
                                        <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-widest mb-4">
                                            <Sparkles size={14} /> Styling Tips
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {rating.outfit.stylingTips.map((tip, i) => (
                                                <div key={i} className="flex gap-3 text-sm text-slate-700 font-medium">
                                                    <span className="flex-shrink-0 w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] text-purple-600 font-bold shadow-sm">
                                                        {i + 1}
                                                    </span>
                                                    {tip}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={handleSchedule}
                                        className="flex-1 py-4 bg-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all uppercase tracking-wide"
                                    >
                                        <Calendar size={20} /> {isScheduling ? "Confirm Schedule" : "Schedule this look"}
                                    </button>
                                    <button
                                        onClick={onRemove}
                                        className="py-4 px-6 border-2 border-slate-100 rounded-2xl font-bold text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all uppercase tracking-wide"
                                    >
                                        Remove
                                    </button>
                                </div>

                                {isScheduling && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        className="space-y-4 pt-4 border-t border-slate-100"
                                    >
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Select Date</label>
                                            <input
                                                type="date"
                                                value={scheduleDate}
                                                onChange={e => setScheduleDate(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-purple-500 transition-all"
                                            />
                                        </div>
                                        <button
                                            onClick={handleSchedule}
                                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                                        >
                                            <Check size={20} /> Confirm Planning
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
