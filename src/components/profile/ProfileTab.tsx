"use client";

import { useState } from 'react';
import { ClothingItem, UserProfile } from '@/lib/db';
import { PieChart, Save, Clock, Download, Trash2, Edit } from 'lucide-react';

interface ProfileTabProps {
    user: UserProfile | null;
    items: ClothingItem[];
    onUpdateBio: (bio: string) => Promise<void>;
    onDeleteAccount: () => void;
}

export default function ProfileTab({ user, items, onUpdateBio, onDeleteAccount }: ProfileTabProps) {
    const [bio, setBio] = useState(user?.bio || "");
    const [isEditingBio, setIsEditingBio] = useState(false);

    // Stats Calculation
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
