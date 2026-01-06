"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { addOutfitRating, Outfit } from "@/lib/db";

interface RatingButtonsProps {
    outfit: Outfit;
    onDislike: () => void;
}

export default function RatingButtons({ outfit, onDislike }: RatingButtonsProps) {
    const [rating, setRating] = useState<'up' | 'down' | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleRate = async (type: 'up' | 'down') => {
        if (rating || isAnimating) return;

        setIsAnimating(true);
        setRating(type);

        try {
            if (type === 'up') {
                await addOutfitRating({
                    outfitId: outfit.id,
                    rating: 'up',
                    outfit,
                    timestamp: Date.now()
                });
                toast.success("Outfit saved to Liked Outfits! ❤️");
            } else {
                await addOutfitRating({
                    outfitId: outfit.id,
                    rating: 'down',
                    outfit,
                    timestamp: Date.now()
                });
                toast.info("Outfit hidden. We'll avoid similar combinations 🙅");
                // Trigger fade out in parent
                setTimeout(() => {
                    onDislike();
                }, 800);
            }
        } catch (error) {
            console.error("Failed to save rating", error);
            toast.error("Failed to save preference.");
            setRating(null);
        } finally {
            setIsAnimating(false);
        }
    };

    return (
        <div className="flex items-center justify-center gap-6 py-2 border-t border-slate-50 mt-2">
            {/* Thumbs Up */}
            <div className="relative">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={rating === 'up' ? {
                        scale: [1, 1.3, 1],
                        rotate: [0, -15, 0]
                    } : {}}
                    transition={{ duration: 0.4 }}
                    onClick={() => handleRate('up')}
                    disabled={rating !== null}
                    className={`p-2 rounded-full transition-colors border-2 ${rating === 'up'
                        ? 'bg-white text-slate-900 border-slate-900 shadow-md scale-110'
                        : 'text-slate-400 border-transparent hover:bg-slate-50'
                        } ${rating === 'down' ? 'opacity-30' : ''}`}
                >
                    <ThumbsUp size={18} fill={rating === 'up' ? "currentColor" : "none"} strokeWidth={2.5} />
                </motion.button>

                <AnimatePresence>
                    {rating === 'up' && (
                        <motion.div
                            initial={{ opacity: 0, y: 0 }}
                            animate={{ opacity: 1, y: -45 }}
                            exit={{ opacity: 0 }}
                            className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-10"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                className="bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg border border-white/20 whitespace-nowrap"
                            >
                                <Check size={8} /> SAVED +1
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Thumbs Down */}
            <div className="relative">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={rating === 'down' ? {
                        scale: [1, 1.3, 1],
                        x: [0, -4, 4, -4, 4, 0]
                    } : {}}
                    transition={{ duration: 0.5 }}
                    onClick={() => handleRate('down')}
                    disabled={rating !== null}
                    className={`p-2 rounded-full transition-colors border-2 ${rating === 'down'
                        ? 'bg-white text-slate-900 border-slate-900 shadow-md scale-110'
                        : 'text-slate-400 border-transparent hover:bg-slate-50'
                        } ${rating === 'up' ? 'opacity-30' : ''}`}
                >
                    <ThumbsDown size={18} fill={rating === 'down' ? "currentColor" : "none"} strokeWidth={2.5} />
                </motion.button>

                <AnimatePresence>
                    {rating === 'down' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1, y: -45 }}
                            exit={{ opacity: 0 }}
                            className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-10"
                        >
                            <motion.div
                                animate={{ rotate: [0, -5, 5, 0] }}
                                className="bg-slate-800 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg border border-white/20 whitespace-nowrap"
                            >
                                <X size={8} /> HIDDEN
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
