"use client";

import { useState } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { ClothingItem } from "@/lib/db";
import { X, Search, Check, Plus, Shirt, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ClosetPickerProps {
    items: ClothingItem[];
    onSelect: (selectedIds: number[]) => Promise<void>;
    onClose: () => void;
    currentDate: Date;
    onDateChange: (date: Date) => void;
}

export default function ClosetPicker({ items, onSelect, onClose, currentDate, onDateChange }: ClosetPickerProps) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [activeTab, setActiveTab] = useState<'wardrobe' | 'ensemble'>('wardrobe');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Generate Weekly Strip based on currentDate
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const toggleSelection = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleConfirm = async () => {
        if (selectedIds.length === 0) return;
        setIsSubmitting(true);
        try {
            await onSelect(selectedIds);
            onClose();
        } catch (error) {
            console.error("Failed to save ensemble:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.category.toLowerCase().includes(search.toLowerCase()) ||
            (item.brand || "").toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !filterCategory || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const selectedItems = items.filter(i => i.id && selectedIds.includes(i.id));
    const categories = Array.from(new Set(items.map(i => i.category)));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-500 overflow-hidden font-display">
            {/* Backdrop: Matching HTML style #111827 */}
            <div className="absolute inset-0 bg-[#111827]/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-[#F9FAFB] w-full max-w-7xl h-[92vh] rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden border border-white/20">

                {/* Header: Exact to HTML */}
                <header className="p-8 pb-4 flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="text-3xl font-[800] text-slate-900 tracking-tight">Outfit Architect</h1>
                        <p className="text-slate-400 font-medium text-sm">{format(currentDate, "EEEE, MMMM do")}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </header>

                {/* Date Strip: Exact to HTML */}
                <div className="px-8 mb-6 shrink-0">
                    <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
                        {weekDays.map((day, i) => {
                            const active = isSameDay(day, currentDate);
                            return (
                                <button
                                    key={i}
                                    onClick={() => onDateChange(day)}
                                    className={`
                                        min-w-[100px] p-4 rounded-[1.25rem] border transition-all text-center cursor-pointer flex flex-col items-center gap-1
                                        ${active
                                            ? 'bg-[#1E1B4B] border-[#1E1B4B] text-white shadow-lg shadow-indigo-200'
                                            : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}
                                    `}
                                >
                                    <p className={`text-[10px] font-bold uppercase ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                                        {format(day, "eee")}
                                    </p>
                                    <p className={`text-xl font-[800] ${active ? 'text-white' : 'text-slate-800'}`}>
                                        {format(day, "d")}
                                    </p>
                                    {active && <div className="w-1 h-1 bg-[#7C3AED] rounded-full mx-auto" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Main area: Vision Canvas (Left) */}
                    <main className="flex-1 p-8 bg-slate-50/50 flex flex-col min-w-0 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-6 shrink-0">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Today&apos;s Vision</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Selected Items:</span>
                                <span className="bg-[#7C3AED]/10 text-[#7C3AED] px-2 py-0.5 rounded text-[10px] font-black">
                                    {selectedIds.length} PCS
                                </span>
                            </div>
                        </div>

                        {/* Vision Container: Exact rounded-2rem and border-2 dashed */}
                        <div className="flex-1 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-12 overflow-y-auto scrollbar-none">
                            {selectedItems.length === 0 ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                        <Shirt size={40} className="text-slate-300" />
                                    </div>
                                    <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest">Select pieces from library</p>
                                    <p className="text-slate-300 text-xs mt-2 max-w-[240px]">Drag and drop or click items in your wardrobe to begin building your look.</p>
                                </div>
                            ) : (
                                <motion.div layout className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl p-4">
                                    <AnimatePresence mode="popLayout">
                                        {selectedItems.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="relative aspect-square group"
                                            >
                                                <div className="w-full h-full bg-white rounded-[1.5rem] border border-slate-100 overflow-hidden p-6 hover:border-[#7C3AED] transition-all flex items-center justify-center shadow-sm">
                                                    <img src={item.image} alt={item.category} className="w-full h-full object-contain mix-blend-multiply transition-transform group-hover:scale-105" />
                                                </div>
                                                <button
                                                    onClick={() => item.id && toggleSelection(item.id)}
                                                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shadow-lg hover:bg-[#6D28D9] transition-colors"
                                                >
                                                    <X size={14} strokeWidth={3} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </div>
                    </main>

                    {/* Sidebar: Wardrobe Selection (Right) */}
                    <aside className="w-[520px] flex flex-col shrink-0 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.02)] border-l border-slate-100 h-full">
                        {/* Tabs: Exact style from HTML */}
                        <div className="flex p-6 pb-0">
                            <div className="flex w-full bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                                <button
                                    onClick={() => setActiveTab('wardrobe')}
                                    className={`flex-1 py-4 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center ${activeTab === 'wardrobe' ? 'bg-white text-slate-900 shadow-sm border-b-[3px] border-[#7C3AED] font-bold' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Wardrobe
                                </button>
                                <button
                                    onClick={() => setActiveTab('ensemble')}
                                    className={`flex-1 py-4 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center ${activeTab === 'ensemble' ? 'bg-white text-slate-900 shadow-sm border-b-[3px] border-[#7C3AED] font-bold' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Ensemble ({selectedIds.length})
                                </button>
                            </div>
                        </div>

                        {/* Search & Filters */}
                        <div className="p-6 space-y-5">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Find in closet..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-12 pr-6 py-5 bg-slate-50 border-none rounded-xl text-sm placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-indigo-100 text-slate-700 font-normal"
                                />
                            </div>
                            <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-1">
                                <button
                                    onClick={() => setFilterCategory("")}
                                    className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-tight transition-all cursor-pointer shrink-0 ${!filterCategory ? 'bg-[#7C3AED]/10 text-[#7C3AED]' : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-300'}`}
                                >
                                    All
                                </button>
                                {categories.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setFilterCategory(c)}
                                        className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-tight transition-all cursor-pointer shrink-0 ${filterCategory === c ? 'bg-[#7C3AED]/10 text-[#7C3AED]' : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-300'}`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Library Grid: Exact Item Card Style */}
                        <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-none">
                            <div className="grid grid-cols-2 gap-5">
                                {activeTab === 'wardrobe' ? (
                                    filteredItems.map(item => {
                                        const isSelected = item.id ? selectedIds.includes(item.id) : false;
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => item.id && toggleSelection(item.id)}
                                                className={`bg-white rounded-xl overflow-hidden border flex flex-col group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${isSelected ? 'border-[#7C3AED] shadow-[0_8px_16px_rgba(124,58,237,0.12)]' : 'border-slate-200'}`}
                                            >
                                                <div className="aspect-square bg-slate-50 relative p-4 flex items-center justify-center">
                                                    <img src={item.image} alt={item.category} className="w-full h-full object-contain mix-blend-multiply transition-transform group-hover:scale-110" />
                                                    <div className="absolute top-3 right-3 flex gap-1">
                                                        <div
                                                            className="w-3.5 h-3.5 rounded-full border border-white shadow-sm"
                                                            style={{ backgroundColor: item.colors?.[0] || '#ccc' }}
                                                        />
                                                    </div>
                                                    {isSelected && (
                                                        <div className="absolute inset-0 bg-[#7C3AED]/10 flex items-center justify-center">
                                                            <div className="bg-[#7C3AED] text-white rounded-full p-2 shadow-xl scale-110">
                                                                <Check size={16} strokeWidth={4} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-4 bg-white">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-tight">{item.brand || 'No Brand'}</span>
                                                        <span className="text-[9px] font-bold text-[#7C3AED] bg-[#7C3AED]/5 px-1.5 rounded">ITEM</span>
                                                    </div>
                                                    <h4 className="font-bold text-slate-800 text-xs truncate leading-tight capitalize">{item.category}</h4>
                                                    <div className="mt-2.5 pt-2.5 border-t border-slate-50 flex items-center justify-between">
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] text-slate-400 uppercase font-bold">Category</span>
                                                            <span className="text-[10px] text-slate-600 font-bold capitalize">{item.category}</span>
                                                        </div>
                                                        <span className="text-[10px] font-black text-emerald-500">New</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    selectedItems.map(item => (
                                        <div
                                            key={item.id}
                                            className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 flex flex-col group relative"
                                        >
                                            <div className="aspect-square bg-slate-50 relative p-4 flex items-center justify-center">
                                                <img src={item.image} alt={item.category} className="w-full h-full object-contain mix-blend-multiply" />
                                            </div>
                                            <div className="p-4 bg-white border-t border-slate-50">
                                                <h4 className="font-bold text-slate-800 text-xs truncate leading-tight capitalize">{item.category}</h4>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{item.brand || 'Personal Piece'}</p>
                                            </div>
                                            <button
                                                onClick={() => item.id && toggleSelection(item.id)}
                                                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110"
                                            >
                                                <X size={12} strokeWidth={3} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Footer: Exact Button Style */}
                        <div className="p-6 pt-0 shrink-0">
                            <button
                                onClick={handleConfirm}
                                disabled={selectedIds.length === 0 || isSubmitting}
                                className={`w-full py-5 rounded-[0.75rem] uppercase text-xs tracking-widest font-black transition-all flex items-center justify-center gap-2
                                    ${(selectedIds.length === 0 || isSubmitting)
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-[0_12px_24px_rgba(124,58,237,0.15)] cursor-pointer active:scale-[0.98]'
                                    }`}
                            >
                                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Confirm Curation"}
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
