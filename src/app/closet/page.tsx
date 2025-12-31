"use client";

import { useEffect, useState } from "react";
import { getAllItems, deleteItem, updateItem, ClothingItem, getPCAProfile, PCAProfile } from "@/lib/db";
import { isColorInPalette } from "@/lib/pcaUtils";
import ItemCard from "@/components/closet/ItemCard";
import ItemForm from "@/components/closet/ItemForm";
import AppWrapper from "@/components/layout/AppWrapper";
import { Search, Filter, Loader2, X, SlidersHorizontal, Sparkles } from "lucide-react";

export default function ClosetPage() {
    const [items, setItems] = useState<ClothingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);
    const [filter, setFilter] = useState({ category: "", occasion: "", season: "", brand: "", size: "" });
    const [showPaletteOnly, setShowPaletteOnly] = useState(false);
    const [search, setSearch] = useState("");
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [pcaProfile, setPcaProfile] = useState<PCAProfile | null>(null);

    useEffect(() => {
        loadData();

        // Listen for updates from AppWrapper
        const handleUpdateEvent = () => loadData();
        window.addEventListener('closet-updated', handleUpdateEvent);
        return () => window.removeEventListener('closet-updated', handleUpdateEvent);
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [allItems, profile] = await Promise.all([
            getAllItems(),
            getPCAProfile()
        ]);
        setItems(allItems);
        setPcaProfile(profile);
        setLoading(false);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this item?")) {
            await deleteItem(id);
            loadData();
        }
    };

    const handleUpdate = async (updatedItems: ClothingItem[]) => {
        if (updatedItems.length > 0) {
            await updateItem(updatedItems[0]); // In edit mode it's always one item
        }
        setEditingItem(null);
        loadData();
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.category.toLowerCase().includes(search.toLowerCase()) ||
            (item.brand || "").toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !filter.category || item.category === filter.category;
        const matchesOccasion = !filter.occasion || item.occasions.includes(filter.occasion);
        const matchesSeason = !filter.season || item.seasons.includes(filter.season);
        const matchesBrand = !filter.brand || item.brand === filter.brand;
        const matchesSize = !filter.size || item.size === filter.size;

        // PCA Filter
        const matchesPalette = !showPaletteOnly || (pcaProfile && isColorInPalette(item.colors, pcaProfile.bestColors));

        return matchesSearch && matchesCategory && matchesOccasion && matchesSeason && matchesBrand && matchesSize && matchesPalette;
    });

    const categories = Array.from(new Set(items.map(i => i.category)));
    const brands = Array.from(new Set(items.map(i => i.brand).filter(Boolean)));
    const sizes = Array.from(new Set(items.map(i => i.size).filter(Boolean)));
    const occasions = ["casual", "formal", "business", "party", "gym", "beach", "date night", "everyday"];
    const seasons = ["spring", "summer", "fall", "winter", "all-season"];

    return (
        <AppWrapper>
            <div className="space-y-8">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="font-poppins font-bold text-4xl text-slate-900 tracking-tight">My Closet</h1>
                        <p className="text-slate-500 font-medium">You have <span className="text-purple-600 font-bold">{items.length} clothes</span> in your collection</p>
                    </div>

                    <div className="relative group max-w-sm w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Find a category or brand..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all text-sm shadow-sm font-medium"
                        />
                    </div>
                </header>

                <section className="bg-white p-2 rounded-3xl border-2 border-slate-50 shadow-sm overflow-hidden">
                    <div className="flex flex-wrap gap-2 p-2">
                        <button
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${showAdvancedFilters ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <SlidersHorizontal size={14} />
                            {showAdvancedFilters ? "Hide Filters" : "Show Filters"}
                        </button>

                        <div className="flex-1 overflow-x-auto scrollbar-none flex gap-2">
                            {/* PCA Filter Toggle */}
                            {pcaProfile && (
                                <button
                                    onClick={() => setShowPaletteOnly(!showPaletteOnly)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border-2 border-transparent whitespace-nowrap ${showPaletteOnly
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-200'
                                        : 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 hover:border-purple-200'
                                        }`}
                                >
                                    <Sparkles size={14} className={showPaletteOnly ? "animate-pulse" : ""} />
                                    {showPaletteOnly ? "Showing My Colors" : "My Color Palette"}
                                </button>
                            )}

                            {/* Quick Category Filter */}
                            <select
                                value={filter.category}
                                onChange={e => setFilter({ ...filter, category: e.target.value })}
                                className="px-4 py-2.5 bg-slate-50 border-2 border-transparent hover:border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:bg-white focus:border-purple-500 transition-all cursor-pointer"
                            >
                                <option value="">All Categories</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>

                            <select
                                value={filter.occasion}
                                onChange={e => setFilter({ ...filter, occasion: e.target.value })}
                                className="px-4 py-2.5 bg-slate-50 border-2 border-transparent hover:border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:bg-white focus:border-purple-500 transition-all cursor-pointer"
                            >
                                <option value="">All Occasions</option>
                                {occasions.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>

                            {(filter.category || filter.occasion || filter.season || filter.brand || filter.size || showPaletteOnly) && (
                                <button
                                    onClick={() => {
                                        setFilter({ category: "", occasion: "", season: "", brand: "", size: "" });
                                        setShowPaletteOnly(false);
                                    }}
                                    className="px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                >
                                    RESET
                                </button>
                            )}
                        </div>
                    </div>

                    {showAdvancedFilters && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-t border-slate-50 animate-in slide-in-from-top duration-300">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Season</label>
                                <select
                                    value={filter.season}
                                    onChange={e => setFilter({ ...filter, season: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:border-purple-500 transition-all"
                                >
                                    <option value="">Any Season</option>
                                    {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Brand</label>
                                <select
                                    value={filter.brand}
                                    onChange={e => setFilter({ ...filter, brand: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:border-purple-500 transition-all"
                                >
                                    <option value="">Any Brand</option>
                                    {brands.map(b => <option key={b!} value={b!}>{b}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Size</label>
                                <select
                                    value={filter.size}
                                    onChange={e => setFilter({ ...filter, size: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:border-purple-500 transition-all"
                                >
                                    <option value="">Any Size</option>
                                    {sizes.map(s => <option key={s!} value={s!}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                </section>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="relative">
                            <Loader2 className="animate-spin text-purple-600" size={48} />
                            <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-xl animate-pulse" />
                        </div>
                        <p className="text-slate-400 font-bold tracking-wide">ORGANIZING YOUR WARDROBE...</p>
                    </div>
                ) : filteredItems.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {filteredItems.map(item => (
                            <ItemCard
                                key={item.id}
                                item={item}
                                onDelete={handleDelete}
                                onEdit={setEditingItem}
                                inPalette={pcaProfile ? isColorInPalette(item.colors, pcaProfile.bestColors) : false}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-100 flex flex-col items-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6 shadow-inner">
                            <Search size={48} />
                        </div>
                        <h3 className="font-poppins font-bold text-2xl text-slate-900">Your filters found nothing</h3>
                        <p className="text-slate-500 max-w-sm mt-3 font-medium">
                            Try broadening your search or resetting the filters to see your full collection.
                        </p>
                        <button
                            onClick={() => {
                                setFilter({ category: "", occasion: "", season: "", brand: "", size: "" });
                                setShowPaletteOnly(false);
                            }}
                            className="mt-8 px-8 py-3 bg-purple-600 text-white rounded-2xl font-bold shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all active:scale-95"
                        >
                            Reset All Filters
                        </button>
                    </div>
                )}

                {editingItem && (
                    <ItemForm
                        item={editingItem}
                        onSave={handleUpdate}
                        onClose={() => setEditingItem(null)}
                    />
                )}
            </div>
        </AppWrapper>
    );
}
