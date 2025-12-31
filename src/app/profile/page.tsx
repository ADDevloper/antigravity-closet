"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppWrapper from '@/components/layout/AppWrapper';
import { User, Palette, Settings } from 'lucide-react';
import { getPCAProfile, getAllItems, getUserProfile, getUserSettings, saveUserProfile, saveUserSettings, deletePCAProfile, PCAProfile, ClothingItem, UserProfile, UserSettings as SettingsType, DEFAULT_SETTINGS } from '@/lib/db';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTab from '@/components/profile/ProfileTab';
import MyColorsTab from '@/components/profile/MyColorsTab';
import SettingsTab from '@/components/profile/SettingsTab';

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
                        onDeleteAccount={handleDeleteAccount}
                    />
                )}
                {activeTab === 'colors' && (
                    pca ? (
                        <MyColorsTab pca={pca} items={items} />
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <Palette size={48} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="font-bold text-xl text-slate-900 mb-2">No Color Analysis Yet</h3>
                            <p className="text-slate-500 mb-6 max-w-sm mx-auto">Discover your perfect colors to get personalized fashion advice.</p>
                            <button
                                onClick={() => router.push('/pca')}
                                className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-100"
                            >
                                Start Analysis
                            </button>
                        </div>
                    )
                )}
                {activeTab === 'settings' && (
                    <SettingsTab
                        settings={settings}
                        onSave={handleSaveSettings}
                        onRetakePCA={() => router.push('/pca')}
                        onDeleteData={handleDeleteAccount}
                        onResetApp={handleDeleteAccount}
                    />
                )}
            </div>
        </div>
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
