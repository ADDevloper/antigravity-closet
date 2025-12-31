"use client";

import { useState } from "react";
import { ClothingItem } from "@/lib/db";
import { X, Search, Check } from "lucide-react";

interface ClosetPickerProps {
    items: ClothingItem[];
    onSelect: (selectedIds: number[]) => void;
    onClose: () => void;
}

export default function ClosetPicker({ items, onSelect, onClose }: ClosetPickerProps) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("");

    const toggleSelection = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.category.toLowerCase().includes(search.toLowerCase()) ||
            (item.brand || "").toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !filterCategory || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = Array.from(new Set(items.map(i => i.category)));

    const handleConfirm = () => {
        onSelect(selectedIds);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-3xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <header className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="font-poppins font-bold text-xl text-slate-900">Select Items</h2>
                        <p className="text-sm text-slate-500">{selectedIds.length} items selected</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 font-bold">
                        <X size={24} />
                    </button>
                </header>

                <div className="p-4 border-b border-slate-100 flex gap-2 overflow-x-auto scrollbar-none">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-purple-500"
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {filteredItems.map(item => {
                            const isSelected = item.id ? selectedIds.includes(item.id) : false;
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => item.id && toggleSelection(item.id)}
                                    className={`
                                        relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer transition-all border-2
                                        ${isSelected ? 'border-purple-500 ring-4 ring-purple-500/20' : 'border-slate-200 hover:border-purple-300'}
                                    `}
                                >
                                    <img src={item.image} alt={item.category} className="w-full h-full object-cover" />

                                    {isSelected && (
                                        <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                                            <div className="bg-purple-500 text-white rounded-full p-1 shadow-md">
                                                <Check size={20} className="stroke-[3px]" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                        <p className="text-[10px] text-white font-bold truncate capitalize">{item.category}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <footer className="p-4 md:p-6 border-t border-slate-100 bg-white flex justify-end gap-3 filter backdrop-blur-md">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={selectedIds.length === 0}
                        className="px-8 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 disabled:opacity-50 disabled:shadow-none"
                    >
                        Add {selectedIds.length} Items
                    </button>
                </footer>
            </div>
        </div>
    );
}
