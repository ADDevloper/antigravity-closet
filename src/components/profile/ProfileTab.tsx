"use client";

import { useState } from 'react';
import { ClothingItem, UserProfile } from '@/lib/db';
import { PieChart, Save, Clock, Download, Trash2, Edit } from 'lucide-react';

interface ProfileTabProps {
    user: UserProfile | null;
    items: ClothingItem[];
    onUpdateBio: (bio: string) => Promise<void>;
    onUpdateProfile: (data: Partial<UserProfile>) => Promise<void>;
    onDeleteAccount: () => void;
}

export default function ProfileTab({ user, items, onUpdateBio, onUpdateProfile, onDeleteAccount }: ProfileTabProps) {
    const [bio, setBio] = useState(user?.bio || "");
    const [isEditingBio, setIsEditingBio] = useState(false);

    // Profile Editing State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [tempGender, setTempGender] = useState<'male' | 'female'>(user?.gender || 'female');
    const [tempLifestyle, setTempLifestyle] = useState(user?.lifestyle || {
        work: 40,
        casual: 30,
        athletic: 15,
        social: 15
    });

    const categories = items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedCategories = Object.entries(categories)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    const handleSaveBio = async () => {
        await onUpdateBio(bio);
        setIsEditingBio(false);
    };

    const handleSaveProfile = async () => {
        await onUpdateProfile({
            gender: tempGender,
            lifestyle: tempLifestyle
        });
        setIsEditingProfile(false);
    };

    const updateLifestyle = (id: string, val: number) => {
        setTempLifestyle(prev => ({ ...prev, [id]: val }));
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* About Me */}
            <section className="bg-white/90 backdrop-blur-xl rounded-[32px] p-8 border border-[#E2E8F0] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-[#1C1A2E]">About Me</h3>
                    {!isEditingBio && (
                        <button onClick={() => setIsEditingBio(true)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-purple-600 hover:bg-purple-50 transition-colors">
                            <Edit size={18} />
                        </button>
                    )}
                </div>
                {isEditingBio ? (
                    <div className="space-y-4">
                        <textarea
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            className="w-full p-5 bg-slate-50 border-2 border-[#E2E8F0] rounded-2xl focus:outline-none focus:border-purple-500 min-h-[120px] text-sm text-[#1C1A2E] font-normal"
                            placeholder="Tell us about your style..."
                            maxLength={200}
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsEditingBio(false)} className="px-6 py-2.5 text-slate-600 text-sm font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                            <button onClick={handleSaveBio} className="px-6 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-purple-100">
                                <Save size={16} /> Save Bio
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-[#475569] text-base leading-relaxed font-medium">
                        {bio || <span className="text-slate-400 italic">No bio added yet. Tell us about your fashion journey!</span>}
                    </p>
                )}
            </section>

            {/* Style Identity & Lifestyle */}
            <section className="bg-white/90 backdrop-blur-xl rounded-[32px] p-8 border border-[#E2E8F0] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-xl text-[#1C1A2E]">Style Identity & Lifestyle</h3>
                    {!isEditingProfile ? (
                        <button onClick={() => setIsEditingProfile(true)} className="px-5 py-2.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors">
                            <Edit size={16} /> Edit Identity
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button onClick={() => setIsEditingProfile(false)} className="px-4 py-2 text-slate-600 text-sm font-bold hover:bg-slate-100 rounded-xl">Cancel</button>
                            <button onClick={handleSaveProfile} className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-purple-100">
                                <Save size={16} /> Save Identity
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Gender Selection */}
                    <div className="space-y-6">
                        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Base Silhouette</h4>
                        {isEditingProfile ? (
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setTempGender('male')}
                                    className={`flex-1 p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${tempGender === 'male' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-[#F1F5F9] bg-[#F8FAFC] text-slate-400 hover:border-blue-200'}`}
                                >
                                    <span className="text-2xl">♂️</span> <span className="text-sm font-bold">Male</span>
                                </button>
                                <button
                                    onClick={() => setTempGender('female')}
                                    className={`flex-1 p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${tempGender === 'female' ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-md' : 'border-[#F1F5F9] bg-[#F8FAFC] text-slate-400 hover:border-pink-200'}`}
                                >
                                    <span className="text-2xl">♀️</span> <span className="text-sm font-bold">Female</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-5 bg-slate-50 p-6 rounded-[24px] border border-[#E2E8F0]">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${user?.gender === 'male' ? 'bg-blue-100' : 'bg-pink-100'}`}>
                                    {user?.gender === 'male' ? '♂️' : '♀️'}
                                </div>
                                <div>
                                    <p className="font-bold text-lg text-[#1C1A2E] capitalize">{user?.gender || 'Not set'}</p>
                                    <p className="text-sm text-slate-500 font-medium">Master silhouette anchor</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Lifestyle Sliders */}
                    <div className="space-y-6">
                        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Activity Mix (%)</h4>
                        <div className="space-y-5">
                            {[
                                { id: 'work', label: 'Work', emoji: '💼', color: 'bg-indigo-600' },
                                { id: 'casual', label: 'Casual', emoji: '👕', color: 'bg-emerald-600' },
                                { id: 'athletic', label: 'Athletic', emoji: '🏃', color: 'bg-orange-600' },
                                { id: 'social', label: 'Social', emoji: '🥂', color: 'bg-purple-600' },
                            ].map(cat => (
                                <div key={cat.id} className="space-y-2">
                                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wide">
                                        <span className="text-slate-600 flex items-center gap-2">{cat.emoji} {cat.label}</span>
                                        <span className="text-[#1C1A2E]">{isEditingProfile ? tempLifestyle[cat.id as keyof typeof tempLifestyle] : user?.lifestyle?.[cat.id as keyof typeof tempLifestyle] || 0}%</span>
                                    </div>
                                    {isEditingProfile ? (
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={tempLifestyle[cat.id as keyof typeof tempLifestyle]}
                                            onChange={(e) => updateLifestyle(cat.id, parseInt(e.target.value))}
                                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                        />
                                    ) : (
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                            <div
                                                className={`h-full rounded-full ${cat.color} shadow-sm`}
                                                style={{ width: `${user?.lifestyle?.[cat.id as keyof typeof tempLifestyle] || 0}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Wardrobe Stats */}
            <section className="bg-white/90 backdrop-blur-xl rounded-[32px] p-8 border border-[#E2E8F0] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <h3 className="font-bold text-xl text-[#1C1A2E] mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <PieChart size={20} strokeWidth={2.5} />
                    </div>
                    Wardrobe Breakdown
                </h3>

                {items.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {sortedCategories.map(([cat, count]) => (
                            <div key={cat} className="space-y-2">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.1em]">
                                    <span className="text-slate-600">{cat}</span>
                                    <span className="text-slate-900 bg-slate-50 px-2 py-0.5 rounded-md border border-[#F1F5F9]">{count} items</span>
                                </div>
                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-sm"
                                        style={{ width: `${(count / items.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-[#CBD5E1]">
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Add items to see your stats!</p>
                    </div>
                )}
            </section>

            {/* Timeline */}
            <section className="bg-white/90 backdrop-blur-xl rounded-[32px] p-8 border border-[#E2E8F0] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <h3 className="font-bold text-xl text-[#1C1A2E] mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Clock size={20} strokeWidth={2.5} />
                    </div>
                    Recent Activity
                </h3>
                <div className="space-y-8 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[3px] before:bg-slate-100">
                    <div className="relative pl-10">
                        <div className="absolute left-0 top-1 w-[18px] h-[18px] rounded-full bg-purple-600 border-4 border-white shadow-md z-10" />
                        <p className="text-base font-bold text-[#1C1A2E]">Opened Closet App</p>
                        <p className="text-sm text-slate-500 font-medium mt-1">Just now</p>
                    </div>
                    {items.length > 0 && (
                        <div className="relative pl-10">
                            <div className="absolute left-0 top-1 w-[18px] h-[18px] rounded-full bg-indigo-500 border-4 border-white shadow-md z-10" />
                            <p className="text-base font-bold text-[#1C1A2E]">Updated Wardrobe</p>
                            <p className="text-sm text-slate-500 font-medium mt-1">Recently</p>
                        </div>
                    )}
                    <div className="relative pl-10">
                        <div className="absolute left-0 top-1 w-[18px] h-[18px] rounded-full bg-slate-400 border-4 border-white shadow-md z-10" />
                        <p className="text-base font-bold text-[#1C1A2E]">Created Account</p>
                        <p className="text-sm text-slate-500 font-medium mt-1">Start of journey</p>
                    </div>
                </div>
            </section>

            {/* Actions */}
            <section className="flex flex-col md:flex-row gap-4">
                <button
                    onClick={() => alert("Data export coming soon!")}
                    className="flex-1 py-5 bg-white border border-[#E2E8F0] text-[#1C1A2E] rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm"
                >
                    <Download size={20} /> Download My Data
                </button>
                <button
                    onClick={onDeleteAccount}
                    className="flex-1 py-5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-rose-100 transition-all shadow-sm"
                >
                    <Trash2 size={20} /> Delete Account
                </button>
            </section>
        </div>
    );
}
