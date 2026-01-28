"use client";

import { useEffect, useState } from "react";
import { getAllItems, deleteItem, updateItem, ClothingItem, getPCAProfile, PCAProfile, getUserProfile, UserProfile, migrateLocalToCloud } from "@/lib/db";
import { isColorInPalette } from "@/lib/pcaUtils";
import ItemCard from "@/components/closet/ItemCard";
import ItemForm from "@/components/closet/ItemForm";
import AppWrapper from "@/components/layout/AppWrapper";
import { Search, Plus, SlidersHorizontal, Sparkles, Heart, Loader2 } from "lucide-react";
import WardrobeHealth from "@/components/closet/WardrobeHealth";
import LikedOutfitsSection from "@/components/closet/LikedOutfitsSection";
import { performGapAnalysis, analyzeClothingImage } from "@/lib/gemini";
import { generateClosetSnapshot } from "@/lib/gapAnalysis";

export default function ClosetPage() {
    const [items, setItems] = useState<ClothingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [filter, setFilter] = useState({ category: "", occasion: "", season: "", brand: "", size: "" });
    const [showPaletteOnly, setShowPaletteOnly] = useState(false);
    const [search, setSearch] = useState("");
    const [pcaProfile, setPcaProfile] = useState<PCAProfile | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isRefreshingTags, setIsRefreshingTags] = useState(false);
    const [isMigrating, setIsMigrating] = useState(false);
    const [needsMigration, setNeedsMigration] = useState(false);
    const [showLikedOnly, setShowLikedOnly] = useState(false);

    useEffect(() => {
        loadData();
        const handleUpdateEvent = () => loadData();
        window.addEventListener('closet-updated', handleUpdateEvent);
        return () => window.removeEventListener('closet-updated', handleUpdateEvent);
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [allItems, profile, user] = await Promise.all([
            getAllItems(),
            getPCAProfile(),
            getUserProfile()
        ]);

        // Check if migration is needed (local items with base64 images)
        const hasLocalOnly = allItems.some(item => item.image.startsWith('data:'));
        setNeedsMigration(hasLocalOnly);

        setItems(allItems);
        setPcaProfile(profile);
        setUserProfile(user);
        setLoading(false);
    };

    const handleMigrate = async () => {
        setIsMigrating(true);
        try {
            const result = await migrateLocalToCloud();
            if (result.success && result.count! > 0) {
                alert(`Successfully synced ${result.count} items to your cloud account!`);
                await loadData();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsMigrating(false);
        }
    };

    const runAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            if (items.length < 5) throw new Error("Add more items!");
            const snapshot = generateClosetSnapshot(items);
            await performGapAnalysis(snapshot, userProfile!);
            // Handle analysis result if needed
        } catch (err) {
            console.error(err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleBatchRetag = async () => {
        if (!confirm("This will use AI to re-scan your wardrobe colors. It might take a minute. Continue?")) return;

        setIsRefreshingTags(true);
        try {
            const allItems = await getAllItems();
            // Find items with no colors or only 1 color (suspiciously low)
            const itemsToFix = allItems.filter(item => !item.colors || item.colors.length <= 1);

            if (itemsToFix.length === 0) {
                alert("All items already have multiple color tags!");
                return;
            }

            console.log(`Re-tagging ${itemsToFix.length} items...`);

            for (const item of itemsToFix) {
                const analysis = await analyzeClothingImage(undefined, item.image);
                if (analysis && analysis.colors) {
                    await updateItem({
                        ...item,
                        colors: analysis.colors,
                        // Update category if it was "Unknown"
                        category: item.category === "Unknown" ? analysis.category : item.category
                    });
                }
                // Small delay to avoid rate limits
                await new Promise(r => setTimeout(r, 500));
            }

            await loadData();
            alert(`Finished! Re-tagged ${itemsToFix.length} items.`);
        } catch (err) {
            console.error("Batch re-tag failed:", err);
            alert("Something went wrong during re-tagging.");
        } finally {
            setIsRefreshingTags(false);
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.category.toLowerCase().includes(search.toLowerCase()) ||
            (item.brand || "").toLowerCase().includes(search.toLowerCase()) ||
            item.colors.some(c => c.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory = !filter.category || item.category === filter.category;
        const matchesPalette = !showPaletteOnly || (pcaProfile && isColorInPalette(item.colors, pcaProfile.bestColors));
        return matchesSearch && matchesCategory && matchesPalette;
    });

    return (
        <AppWrapper>
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 space-y-10">
                {/* Header */}
                <header className="flex items-center justify-between gap-6">
                    <h1 className="text-[32px] font-bold text-[#1C1A2E] tracking-tight">My Wardrobe</h1>

                    <div className="flex items-center gap-4 flex-1 max-w-2xl justify-end">
                        <div className="relative group flex-1 max-w-sm">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                            <input
                                type="text"
                                placeholder="Search wardrobe..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-[#F1F5F9]/50 border-none rounded-2xl focus:ring-2 focus:ring-purple-100 transition-all text-[14px] font-medium placeholder:text-[#94A3B8]"
                            />
                        </div>
                        <button
                            onClick={() => setIsAddingItem(true)}
                            className="w-11 h-11 rounded-full bg-[#7C3AED] text-white flex items-center justify-center hover:bg-[#6D28D9] transition-all shadow-lg shadow-purple-200 active:scale-95"
                        >
                            <Plus size={24} />
                        </button>
                        <div className="w-11 h-11 rounded-full bg-[#F1F5F9] overflow-hidden border-2 border-white shadow-sm ring-1 ring-[#F1F5F9]">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </header>

                {/* Migration Banner */}
                {needsMigration && !loading && (
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[32px] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-purple-200 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
                                <Sparkles size={32} />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold">Secure Your Wardrobe</h2>
                                <p className="text-purple-100 font-medium">You have local items that haven't been synced to your cloud account yet. Sync now to access them on any device.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleMigrate}
                            disabled={isMigrating}
                            className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-bold hover:bg-purple-50 transition-all active:scale-95 disabled:opacity-70 shrink-0 flex items-center gap-2"
                        >
                            {isMigrating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                                    <span>Syncing...</span>
                                </>
                            ) : (
                                "Sync to Cloud"
                            )}
                        </button>
                    </div>
                )}

                {/* Wardrobe Health Section */}
                {!loading && (
                    <WardrobeHealth
                        itemCount={items.length}
                        onRunDiagnostic={runAnalysis}
                        onBatchRetag={handleBatchRetag}
                        isAnalyzing={isAnalyzing}
                        isRefreshingTags={isRefreshingTags}
                    />
                )}

                {/* Filter Bar */}
                <section className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-2">
                        <button className="flex items-center gap-2 px-6 py-3 bg-[#1C1A2E] text-white rounded-full text-[13px] font-bold transition-all shadow-md">
                            <SlidersHorizontal size={16} />
                            <span>Filters</span>
                        </button>

                        <div className="flex items-center gap-2">
                            {pcaProfile && (
                                <button
                                    onClick={() => setShowPaletteOnly(!showPaletteOnly)}
                                    className={`px-6 py-3 rounded-full text-[13px] font-bold transition-all border ${showPaletteOnly
                                        ? 'bg-[#EDE9FE] border-[#DDD6FE] text-[#7C3AED]'
                                        : 'bg-white border-[#F1F5F9] text-[#64748B] hover:border-[#E2E8F0]'
                                        }`}
                                >
                                    Color Analysis
                                </button>
                            )}
                            <button
                                onClick={() => { setFilter({ ...filter, category: "" }); setShowLikedOnly(false); }}
                                className={`px-6 py-3 rounded-full text-[13px] font-bold transition-all border ${!filter.category && !showLikedOnly
                                    ? 'bg-[#EDE9FE] border-[#DDD6FE] text-[#7C3AED]'
                                    : 'bg-white border-[#F1F5F9] text-[#64748B] hover:border-[#E2E8F0]'
                                    }`}
                            >
                                All Items
                            </button>
                            <button
                                onClick={() => setShowLikedOnly(true)}
                                className={`px-6 py-3 rounded-full text-[13px] font-bold transition-all border ${showLikedOnly
                                    ? 'bg-[#EDE9FE] border-[#DDD6FE] text-[#7C3AED]'
                                    : 'bg-white border-[#F1F5F9] text-[#64748B] hover:border-[#E2E8F0]'
                                    }`}
                            >
                                Saved Looks
                            </button>
                        </div>

                        {/* Quick Color Filters */}
                        <div className="h-8 w-px bg-slate-100 mx-2" />
                        <div className="flex items-center gap-2">
                            {['Black', 'White', 'Blue', 'Red', 'Green', 'Beige'].map(c => (
                                <button
                                    key={c}
                                    onClick={() => setSearch(search === c ? "" : c)}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold border-2 transition-all ${search === c
                                        ? 'bg-slate-800 border-slate-800 text-white'
                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                        }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setShowLikedOnly(!showLikedOnly)}
                        className={`w-11 h-11 flex items-center justify-center rounded-2xl border transition-all ${showLikedOnly ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-white border-[#F1F5F9] text-[#64748B] hover:bg-[#F8FAFC]'
                            }`}
                    >
                        <Heart size={20} className={showLikedOnly ? "fill-current" : ""} />
                    </button>
                </section>

                {/* Main Content */}
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-purple-600" size={32} />
                        <p className="text-[#94A3B8] font-semibold text-sm">Loading your wardrobe...</p>
                    </div>
                ) : showLikedOnly ? (
                    <LikedOutfitsSection />
                ) : filteredItems.length > 0 ? (
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {filteredItems.map(item => (
                            <ItemCard
                                key={item.id}
                                item={item}
                                onEdit={setEditingItem}
                                onDelete={async (id) => {
                                    if (confirm("Delete this piece?")) {
                                        await deleteItem(id);
                                        loadData();
                                    }
                                }}
                                inPalette={pcaProfile ? isColorInPalette(item.colors, pcaProfile.bestColors) : false}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto text-[#CBD5E1]">
                            <Search size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-[#1C1A2E]">No pieces found</h3>
                        <p className="text-[#94A3B8] max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
                    </div>
                )}
            </div>

            {/* Modals */}
            {isAddingItem && (
                <ItemForm
                    onSave={async (newItems) => {
                        setIsAddingItem(false);
                        loadData();
                    }}
                    onClose={() => setIsAddingItem(false)}
                />
            )}

            {editingItem && (
                <ItemForm
                    item={editingItem}
                    onSave={async (updatedItems) => {
                        if (updatedItems[0]) await updateItem(updatedItems[0]);
                        setEditingItem(null);
                        loadData();
                    }}
                    onClose={() => setEditingItem(null)}
                />
            )}
        </AppWrapper>
    );
}

