"use client";

import { useState } from 'react';
import { UserSettings, DEFAULT_SETTINGS } from '@/lib/db';
import { Palette, Shirt, MessageSquare, Lock, AlertTriangle, Plus } from 'lucide-react';
import { AccordionItem, Toggle } from './SettingsComponents';

interface SettingsTabProps {
    settings: UserSettings | null;
    onSave: (newSettings: UserSettings) => Promise<void>;
    onRetakePCA: () => void;
    onDeleteData: () => void;
    onResetApp: () => void;
}

export default function SettingsTab({ settings, onSave, onRetakePCA, onDeleteData, onResetApp }: SettingsTabProps) {
    const [localSettings, setLocalSettings] = useState<UserSettings>(settings || { id: 'current', ...DEFAULT_SETTINGS } as UserSettings);
    const [openSection, setOpenSection] = useState<string | null>('pca');

    const toggleSection = (id: string) => setOpenSection(openSection === id ? null : id);

    const updateSetting = async (section: keyof UserSettings, key: string, value: string | boolean) => {
        const newSettings = {
            ...localSettings,
            [section]: {
                // @ts-expect-error - section dynamically indexes settings objects
                ...localSettings[section],
                [key]: value
            }
        };
        setLocalSettings(newSettings);
        await onSave(newSettings);
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500 max-w-2xl mx-auto">

            {/* PCA Settings */}
            <AccordionItem id="pca" icon={Palette} title="Color Analysis" openSection={openSection} toggleSection={toggleSection}>
                <Toggle
                    label="Show Season on Profile"
                    checked={localSettings.pca.showInProfile}
                    onChange={(v: boolean) => updateSetting('pca', 'showInProfile', v)}
                />
                <Toggle
                    label="AI Style Advice"
                    description="Allow AI to mention your palette in chat"
                    checked={localSettings.pca.aiMentions}
                    onChange={(v: boolean) => updateSetting('pca', 'aiMentions', v)}
                />
                <Toggle
                    label="Closet Indicators"
                    description="Show badges on matching clothes"
                    checked={localSettings.pca.showIndicators}
                    onChange={(v: boolean) => updateSetting('pca', 'showIndicators', v)}
                />

                <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                    <button onClick={onRetakePCA} className="w-full py-3 bg-slate-50 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-100">
                        Retake Analysis
                    </button>
                </div>
            </AccordionItem>

            {/* Closet Management */}
            <AccordionItem id="closet" icon={Shirt} title="Wardrobe Settings" openSection={openSection} toggleSection={toggleSection}>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">View Style</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {['grid', 'list'].map((type) => (
                            <button
                                key={type}
                                onClick={() => updateSetting('closet', 'viewType', type)}
                                className={`flex-1 py-2 text-xs font-bold capitalize rounded-lg transition-all ${localSettings.closet.viewType === type ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
                <Toggle
                    label="Show Details on Hover"
                    checked={localSettings.closet.showDetailsOnHover}
                    onChange={(v: boolean) => updateSetting('closet', 'showDetailsOnHover', v)}
                />
            </AccordionItem>

            {/* AI Settings */}
            <AccordionItem id="ai" icon={MessageSquare} title="AI Stylist" openSection={openSection} toggleSection={toggleSection}>
                <Toggle
                    label="Include Weather"
                    checked={localSettings.aiChat.includeWeather}
                    onChange={(v: boolean) => updateSetting('aiChat', 'includeWeather', v)}
                />
                <Toggle
                    label="Identify Wardrobe Gaps"
                    checked={localSettings.aiChat.suggestGaps}
                    onChange={(v: boolean) => updateSetting('aiChat', 'suggestGaps', v)}
                />
                <div className="pt-2">
                    <label className="block text-xs font-black text-[#64748B] uppercase tracking-widest mb-3">Personality Tone</label>
                    <div className="relative">
                        <select
                            value={localSettings.aiChat.tone}
                            onChange={(e) => updateSetting('aiChat', 'tone', e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#1C1A2E] appearance-none focus:ring-2 focus:ring-purple-100 outline-none transition-all cursor-pointer"
                        >
                            <option>Casual & Friendly</option>
                            <option>Professional</option>
                            <option>Enthusiastic</option>
                            <option>Minimalist</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <Plus size={16} className="rotate-45" />
                        </div>
                    </div>
                </div>
            </AccordionItem>

            {/* Privacy */}
            <AccordionItem id="privacy" icon={Lock} title="Privacy & Data" openSection={openSection} toggleSection={toggleSection}>
                <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl mb-4">
                    <p className="text-xs text-blue-800 leading-relaxed font-bold">
                        All your photos and data are stored locally on your device via IndexedDB. Your style remains private and secure.
                    </p>
                </div>
                <Toggle
                    label="Store Selfie Locally"
                    description="Keep your analysis photo on this device"
                    checked={localSettings.privacy.storeSelfie}
                    onChange={(v: boolean) => updateSetting('privacy', 'storeSelfie', v)}
                />
                <button onClick={onDeleteData} className="w-full py-4 mt-4 text-rose-700 font-bold text-sm bg-rose-50 rounded-2xl hover:bg-rose-100 flex items-center justify-center gap-3 transition-colors border border-rose-100 shadow-sm">
                    <AlertTriangle size={18} /> Delete All Data
                </button>
            </AccordionItem>

            {/* Danger Zone */}
            <div className="mt-12 pt-8 border-t-2 border-slate-100">
                <div className="bg-rose-50 border border-rose-100 rounded-[32px] p-8">
                    <h4 className="font-bold text-lg text-rose-800 flex items-center gap-3 mb-3">
                        <AlertTriangle size={24} /> Danger Zone
                    </h4>
                    <p className="text-sm text-rose-700 font-medium mb-6 leading-relaxed">Irreversible actions that will permanently remove your data and reset your experience.</p>
                    <button onClick={onResetApp} className="w-full py-4 bg-white border-2 border-rose-200 text-rose-600 font-black rounded-2xl text-sm hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95">
                        Reset Application
                    </button>
                </div>
            </div>

            <div className="text-center pt-8 pb-4">
                <p className="text-xs text-slate-400 font-medium">Antigravity Closet v1.0.0</p>
            </div>
        </div>
    );
}
