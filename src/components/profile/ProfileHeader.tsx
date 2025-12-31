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
    onTabChange: (tab: 'colors') => void;
}

export default function ProfileHeader({ user, pca, itemCount, outfitCount = 0, daysActive = 1, onUpdateName, onTabChange }: ProfileHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || "Fashionista");

    const handleSave = async () => {
        await onUpdateName(name);
        setIsEditing(false);
    };

    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mb-8 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                {/* Avatar */}
                <div className="relative group">
                    <div className="w-24 h-24 md:w-28 md:h-28 bg-slate-100 rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User size={40} className="text-slate-400" />
                        )}
                    </div>
                    <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md text-slate-500 hover:text-purple-600 border border-slate-100 transition-colors" title="Change Photo (Coming Soon)">
                        <Edit2 size={14} />
                    </button>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left space-y-4">
                    <div className="flex flex-col md:flex-row items-center gap-3">
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="text-2xl font-bold font-poppins text-slate-900 border-b-2 border-purple-500 focus:outline-none bg-transparent"
                                    autoFocus
                                />
                                <button onClick={handleSave} className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full font-bold">Save</button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditing(true)}>
                                <h1 className="text-3xl font-bold font-poppins text-slate-900">{name}</h1>
                                <Edit2 size={16} className="text-slate-300 group-hover:text-purple-500 transition-colors opacity-0 group-hover:opacity-100" />
                            </div>
                        )}

                        {pca && (
                            <button
                                onClick={() => onTabChange('colors')}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold shadow-sm hover:scale-105 transition-transform"
                            >
                                <Sparkles size={12} />
                                {getSeasonName(pca.recommendedSeason)}
                            </button>
                        )}
                    </div>

                    {/* Stats Row */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8">
                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-purple-600 shadow-sm">
                                <Shirt size={16} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-slate-900">{itemCount}</p>
                                <p className="text-[10px] text-slate-500 font-medium uppercase">Items</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-amber-600 shadow-sm">
                                <Calendar size={16} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-slate-900">{outfitCount}</p>
                                <p className="text-[10px] text-slate-500 font-medium uppercase">Outfits</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm">
                                <Clock size={16} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-slate-900">{daysActive}d</p>
                                <p className="text-[10px] text-slate-500 font-medium uppercase">Active</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
