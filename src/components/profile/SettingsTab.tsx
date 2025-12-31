"use client";

import { useState } from 'react';
import { UserSettings, DEFAULT_SETTINGS } from '@/lib/db';
import { ChevronDown, ChevronUp, Palette, Shirt, MessageSquare, Bell, Lock, Eye, HelpCircle, AlertTriangle } from 'lucide-react';

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

    const updateSetting = async (section: keyof UserSettings, key: string, value: any) => {
        const newSettings = {
            ...localSettings,
            [section]: {
                // @ts-ignore
                ...localSettings[section],
                [key]: value
            }
        };
        setLocalSettings(newSettings);
        await onSave(newSettings);
    };

    const AccordionItem = ({ id, icon: Icon, title, children }: any) => (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <button
                onClick={() => toggleSection(id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-3 font-bold text-slate-800">
                    <Icon size={20} className="text-purple-600" />
                    {title}
                </div>
                {openSection === id ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
            </button>
            {openSection === id && (
                <div className="p-5 pt-0 border-t border-slate-50">
                    <div className="pt-5 space-y-6">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );

    const Toggle = ({ label, checked, onChange, description }: any) => (
        <div className="flex items-center justify-between">
            <div className="pr-4">
                <p className="font-bold text-sm text-slate-900">{label}</p>
                {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${checked ? 'bg-purple-500' : 'bg-slate-200'}`}
            >
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${checked ? 'translate-x-5' : ''}`} />
            </button>
        </div>
    );

    return (
        <div className="space-y-4 animate-in fade-in duration-500 max-w-2xl mx-auto">

            {/* PCA Settings */}
            <AccordionItem id="pca" icon={Palette} title="Color Analysis">
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
            <AccordionItem id="closet" icon={Shirt} title="Wardrobe Settings">
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
            <AccordionItem id="ai" icon={MessageSquare} title="AI Stylist">
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
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Personality Tone</label>
                    <select
                        value={localSettings.aiChat.tone}
                        onChange={(e) => updateSetting('aiChat', 'tone', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-purple-500"
                    >
                        <option>Casual & Friendly</option>
                        <option>Professional</option>
                        <option>Enthusiastic</option>
                        <option>Minimalist</option>
                    </select>
                </div>
            </AccordionItem>

            {/* Privacy */}
            <AccordionItem id="privacy" icon={Lock} title="Privacy & Data">
                <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg">
                    All your photos and data are stored locally on your device via IndexedDB. We do not store your data on any cloud servers.
                </p>
                <Toggle
                    label="Store Selfie Locally"
                    description="Keep your analysis photo on this device"
                    checked={localSettings.privacy.storeSelfie}
                    onChange={(v: boolean) => updateSetting('privacy', 'storeSelfie', v)}
                />
                <button onClick={onDeleteData} className="w-full py-3 mt-2 text-rose-600 font-bold text-sm bg-rose-50 rounded-xl hover:bg-rose-100 flex items-center justify-center gap-2">
                    <AlertTriangle size={16} /> Delete All Data
                </button>
            </AccordionItem>

            {/* Danger Zone */}
            <div className="mt-8 pt-8 border-t border-slate-200">
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5">
                    <h4 className="font-bold text-rose-800 flex items-center gap-2 mb-2">
                        <AlertTriangle size={18} /> Danger Zone
                    </h4>
                    <p className="text-xs text-rose-600 mb-4">Irreversible actions that affect your account.</p>
                    <button onClick={onResetApp} className="w-full py-3 bg-white border border-rose-200 text-rose-600 font-bold rounded-xl text-sm hover:bg-rose-600 hover:text-white transition-colors">
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
