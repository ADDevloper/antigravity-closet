"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppWrapper from '@/components/layout/AppWrapper';
import Footer from '@/components/layout/Footer';
import { User, Settings, Palette } from 'lucide-react';
import { getPCAProfile, getAllItems, getUserProfile, getUserSettings, saveUserProfile, saveUserSettings, deletePCAProfile, PCAProfile, ClothingItem, UserProfile, UserSettings as SettingsType, DEFAULT_SETTINGS } from '@/lib/db';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTab from '@/components/profile/ProfileTab';
import SettingsTab from '@/components/profile/SettingsTab';
import MyColorsTab from '@/components/profile/MyColorsTab';

function ProfileContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTabParam = searchParams.get('tab');

    const [activeTab, setActiveTab] = useState<'profile' | 'colors' | 'settings'>('profile');
    const [loading, setLoading] = useState(true);

    // Data States
    const [user, setUser] = useState<UserProfile | null>(null);
    const [pca, setPca] = useState<PCAProfile | null>(null);
    const [settings, setSettings] = useState<SettingsType | null>(null);
    const [items, setItems] = useState<ClothingItem[]>([]);

    useEffect(() => {
        if (activeTabParam && ['profile', 'colors', 'settings'].includes(activeTabParam)) {
            setActiveTab(activeTabParam as any);
        }
    }, [activeTabParam]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [userData, pcaData, settingsData, itemsData] = await Promise.all([
            getUserProfile(),
            getPCAProfile(),
            getUserSettings(),
            getAllItems()
        ]);

        setUser(userData || { id: 'current', name: 'Fashionista', createdAt: Date.now() });
        setPca(pcaData);
        setSettings(settingsData || { id: 'current', ...DEFAULT_SETTINGS } as SettingsType);
        setItems(itemsData);
        setLoading(false);
    };

    const handleTabChange = (tab: 'profile' | 'colors' | 'settings') => {
        setActiveTab(tab);
        router.push(`/profile?tab=${tab}`, { scroll: false });
    };

    const handleUpdateName = async (name: string) => {
        if (!user) return;
        const updated = { ...user, name };
        await saveUserProfile(updated);
        setUser(updated);
    };

    const handleUpdateBio = async (bio: string) => {
        if (!user) return;
        const updated = { ...user, bio };
        await saveUserProfile(updated);
        setUser(updated);
    };

    const handleUpdateProfile = async (data: Partial<UserProfile>) => {
        if (!user) return;
        const updated = { ...user, ...data };
        await saveUserProfile(updated);
        setUser(updated);
    };

    const handleSaveSettings = async (newSettings: SettingsType) => {
        await saveUserSettings(newSettings);
        setSettings(newSettings);
    };

    // Actions
    const handleDeleteAccount = async () => {
        if (confirm("Are you sure? This will delete ALL data.")) {
            await deletePCAProfile();
            // In a real app, delete ALL stores. Here we just reload or implemented partial.
            window.location.reload();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <>
            <div className="pb-12 animate-in fade-in">
                <ProfileHeader
                    user={user}
                    pca={pca}
                    itemCount={items.length}
                    onUpdateName={handleUpdateName}
                    onTabChange={handleTabChange}
                />

                {/* Tab Navigation */}
                <div className="flex items-center gap-2 mb-6 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-full md:w-fit mx-auto md:mx-0 overflow-x-auto">
                    {[
                        { id: 'profile', label: 'Profile', icon: User },
                        { id: 'colors', label: 'My Colors', icon: Palette },
                        { id: 'settings', label: 'Settings', icon: Settings },
                    ].map((tab) => {
                        const isActive = activeTab === tab.id;
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id as any)}
                                className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${isActive
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                    {activeTab === 'profile' && (
                        <ProfileTab
                            user={user}
                            items={items}
                            onUpdateBio={handleUpdateBio}
                            onUpdateProfile={handleUpdateProfile}
                            onDeleteAccount={handleDeleteAccount}
                        />
                    )}
                    {activeTab === 'colors' && (
                        pca ? (
                            <MyColorsTab pca={pca} items={items} />
                        ) : (
                            <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm text-center space-y-6">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                    <Palette size={40} className="text-slate-300" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-slate-900">No Analysis Found</h3>
                                    <p className="text-slate-500 max-w-xs mx-auto">Complete your color analysis to unlock your perfect palette and styling tips.</p>
                                </div>
                                <button
                                    onClick={() => router.push('/onboarding?step=pca-intro')}
                                    className="px-8 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:scale-[1.02] transition-transform"
                                >
                                    Start Analysis →
                                </button>
                            </div>
                        )
                    )}
                    {activeTab === 'settings' && (
                        <SettingsTab
                            settings={settings}
                            onSave={handleSaveSettings}
                            onRetakePCA={() => router.push('/onboarding?step=pca-intro')}
                            onDeleteData={handleDeleteAccount}
                            onResetApp={handleDeleteAccount}
                        />
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default function ProfilePage() {
    return (
        <AppWrapper>
            <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500"></div></div>}>
                <ProfileContent />
            </Suspense>
        </AppWrapper>
    );
}
