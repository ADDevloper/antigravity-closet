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
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* About Me */}
            <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-poppins font-bold text-lg text-slate-900">About Me</h3>
                    {!isEditingBio && (
                        <button onClick={() => setIsEditingBio(true)} className="text-purple-600 hover:text-purple-700">
                            <Edit size={16} />
                        </button>
                    )}
                </div>
                {isEditingBio ? (
                    <div className="space-y-3">
                        <textarea
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-purple-500 min-h-[100px] text-sm"
                            placeholder="Tell us about your style..."
                            maxLength={200}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsEditingBio(false)} className="px-4 py-2 text-slate-500 text-xs font-bold hover:bg-slate-50 rounded-lg">Cancel</button>
                            <button onClick={handleSaveBio} className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg flex items-center gap-2">
                                <Save size={14} /> Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-600 text-sm leading-relaxed">
                        {bio || <span className="text-slate-400 italic">No bio added yet. Tell us about your fashion journey!</span>}
                    </p>
                )}
            </section>

            {/* Style Identity & Lifestyle */}
            <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-poppins font-bold text-lg text-slate-900 font-poppins">Style Identity & Lifestyle</h3>
                    {!isEditingProfile ? (
                        <button onClick={() => setIsEditingProfile(true)} className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm font-bold">
                            <Edit size={14} /> Edit Identity
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={() => setIsEditingProfile(false)} className="px-3 py-1 text-slate-500 text-xs font-bold hover:bg-slate-50 rounded-lg">Cancel</button>
                            <button onClick={handleSaveProfile} className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                                <Save size={12} /> Save
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Gender Selection */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Silhouette</h4>
                        {isEditingProfile ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setTempGender('male')}
                                    className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${tempGender === 'male' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400'}`}
                                >
                                    <span>♂️</span> <span className="text-sm font-bold">Male</span>
                                </button>
                                <button
                                    onClick={() => setTempGender('female')}
                                    className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${tempGender === 'female' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-slate-100 text-slate-400'}`}
                                >
                                    <span>♀️</span> <span className="text-sm font-bold">Female</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${user?.gender === 'male' ? 'bg-blue-100' : 'bg-pink-100'}`}>
                                    {user?.gender === 'male' ? '♂️' : '♀️'}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 capitalize">{user?.gender || 'Not set'}</p>
                                    <p className="text-xs text-slate-500">Master silhouette anchor</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Lifestyle Sliders */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activity Mix (%)</h4>
                        <div className="space-y-4">
                            {[
                                { id: 'work', label: 'Work', emoji: '💼', color: 'bg-indigo-500' },
                                { id: 'casual', label: 'Casual', emoji: '👕', color: 'bg-emerald-500' },
                                { id: 'athletic', label: 'Athletic', emoji: '🏃', color: 'bg-orange-500' },
                                { id: 'social', label: 'Social', emoji: '🥂', color: 'bg-purple-500' },
                            ].map(cat => (
                                <div key={cat.id} className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide">
                                        <span className="text-slate-500">{cat.emoji} {cat.label}</span>
                                        <span className="text-slate-900">{isEditingProfile ? tempLifestyle[cat.id as keyof typeof tempLifestyle] : user?.lifestyle?.[cat.id as keyof typeof tempLifestyle] || 0}%</span>
                                    </div>
                                    {isEditingProfile ? (
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={tempLifestyle[cat.id as keyof typeof tempLifestyle]}
                                            onChange={(e) => updateLifestyle(cat.id, parseInt(e.target.value))}
                                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                        />
                                    ) : (
                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${cat.color}`}
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
            <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-poppins font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                    <PieChart size={20} className="text-purple-500" />
                    Wardrobe Breakdown
                </h3>

                {items.length > 0 ? (
                    <div className="space-y-4">
                        {sortedCategories.map(([cat, count]) => (
                            <div key={cat} className="space-y-1">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                    <span className="text-slate-600">{cat}</span>
                                    <span className="text-slate-400">{count} items</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-purple-500 rounded-full"
                                        style={{ width: `${(count / items.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        Add items to see your stats!
                    </div>
                )}
            </section>

            {/* Timeline (Mock) */}
            <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-poppins font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                    <Clock size={20} className="text-blue-500" />
                    Recent Activity
                </h3>
                <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    <div className="relative pl-8">
                        <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-purple-500 border-2 border-white shadow-sm" />
                        <p className="text-sm font-bold text-slate-800">Opened Closet App</p>
                        <p className="text-xs text-slate-400 mt-1">Just now</p>
                    </div>
                    {items.length > 0 && (
                        <div className="relative pl-8">
                            <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white shadow-sm" />
                            <p className="text-sm font-bold text-slate-800">Updated Wardrobe</p>
                            <p className="text-xs text-slate-400 mt-1">Recently</p>
                        </div>
                    )}
                    <div className="relative pl-8">
                        <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-slate-300 border-2 border-white shadow-sm" />
                        <p className="text-sm font-bold text-slate-800">Created Account</p>
                        <p className="text-xs text-slate-400 mt-1">Start of journey</p>
                    </div>
                </div>
            </section>

            {/* Actions */}
            <section className="flex flex-col gap-3">
                <button
                    onClick={() => alert("Data export coming soon!")}
                    className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50"
                >
                    <Download size={18} /> Download My Data
                </button>
                <button
                    onClick={onDeleteAccount}
                    className="w-full py-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-100"
                >
                    <Trash2 size={18} /> Delete Account
                </button>
            </section>
        </div>
    );
}
