"use client";

import { User, Edit2, Sparkles, Shirt, Calendar, Clock } from 'lucide-react';
import { UserProfile, PCAProfile } from '@/lib/db';
import { getSeasonName } from '@/lib/pcaUtils';
import { useState } from 'react';

interface ProfileHeaderProps {
    user: UserProfile | null;
    pca: PCAProfile | null;
    itemCount: number;
    outfitCount?: number;
    daysActive?: number;
    onUpdateName: (name: string) => Promise<void>;
    onTabChange: (tab: 'profile' | 'colors' | 'settings') => void;
}

export default function ProfileHeader({ user, pca, itemCount, outfitCount = 0, daysActive = 1, onUpdateName, onTabChange }: ProfileHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || "Fashionista");

    const handleSave = async () => {
        await onUpdateName(name);
        setIsEditing(false);
    };

    return (
        <div className="bg-white/90 backdrop-blur-xl rounded-[32px] p-8 md:p-10 border border-[#E2E8F0] shadow-[0_12px_40px_rgba(0,0,0,0.06)] mb-10 relative overflow-hidden">

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                {/* Avatar */}
                <div className="relative group">
                    <div className="w-28 h-28 md:w-32 md:h-32 bg-slate-100 rounded-full border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User size={48} className="text-slate-500" />
                        )}
                    </div>
                    <button className="absolute bottom-1 right-1 bg-white p-2.5 rounded-full shadow-lg text-slate-600 hover:text-purple-600 border border-[#E2E8F0] transition-all hover:scale-110" title="Change Photo (Coming Soon)">
                        <Edit2 size={16} />
                    </button>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left space-y-6">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        {isEditing ? (
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="text-3xl font-bold text-[#1C1A2E] border-b-2 border-purple-500 focus:outline-none bg-transparent"
                                    autoFocus
                                />
                                <button onClick={handleSave} className="px-5 py-1.5 bg-purple-600 text-white rounded-full font-bold text-sm shadow-md hover:bg-purple-700 transition-colors">Save</button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditing(true)}>
                                <h1 className="text-4xl font-black text-[#1C1A2E] tracking-tight">{name}</h1>
                                <Edit2 size={18} className="text-[#64748B] group-hover:text-purple-500 transition-colors opacity-0 group-hover:opacity-100" />
                            </div>
                        )}

                        {pca && (
                            <div
                                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-black shadow-lg shadow-purple-100 uppercase tracking-wider"
                            >
                                <Sparkles size={14} />
                                {getSeasonName(pca.recommendedSeason)}
                            </div>
                        )}
                    </div>

                    {/* Stats Row */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6">
                        <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-[#E2E8F0] shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                <Shirt size={20} strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                                <p className="text-lg font-black text-[#1C1A2E] leading-none">{itemCount}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Items</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-[#E2E8F0] shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                <Calendar size={20} strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                                <p className="text-lg font-black text-[#1C1A2E] leading-none">{outfitCount}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Outfits</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-[#E2E8F0] shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Clock size={20} strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                                <p className="text-lg font-black text-[#1C1A2E] leading-none">{daysActive}d</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Active</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
