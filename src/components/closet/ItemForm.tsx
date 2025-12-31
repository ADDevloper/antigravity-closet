"use client";

import { useState, useRef, useEffect } from "react";
import { ClothingItem } from "@/lib/db";
import { analyzeClothingImage } from "@/lib/gemini";
import { compressImage, blobToBase64 } from "@/lib/utils";
import { Camera, Upload, X, Check, Loader2, AlertCircle, Trash2, PlusCircle, Sparkles } from "lucide-react";

interface ItemFormProps {
    item?: ClothingItem;
    onSave: (items: ClothingItem[]) => void;
    onClose: () => void;
}

interface UploadQueueItem {
    id: string;
    file: File;
    preview: string;
    status: 'pending' | 'compressing' | 'analyzing' | 'complete' | 'error';
    progress: number;
    analysis?: {
        category: string;
        colors: string[];
        suggestedOccasions: string[];
        suggestedSeasons: string[];
        brand: string | null;
    };
    error?: string;
}

const OCCASIONS = ["casual", "formal", "business", "party", "gym", "beach", "date night", "everyday"];
const SEASONS = ["spring", "summer", "fall", "winter", "all-season"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size", "36", "38", "40", "42", "44"];

export default function ItemForm({ item, onSave, onClose }: ItemFormProps) {
    const [queue, setQueue] = useState<UploadQueueItem[]>([]);
    const [isBatchMode, setIsBatchMode] = useState(!item);

    // Single item edit states
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(item?.image || null);
    const [category, setCategory] = useState(item?.category || "");
    const [colors, setColors] = useState<string[]>(item?.colors || []);
    const [occasions, setOccasions] = useState<string[]>(item?.occasions || []);
    const [seasons, setSeasons] = useState<string[]>(item?.seasons || []);
    const [brand, setBrand] = useState(item?.brand || "");
    const [size, setSize] = useState(item?.size || "");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropRef = useRef<HTMLDivElement>(null);

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        if (item) {
            // Single edit mode
            const file = files[0];
            setLoading(true);
            try {
                const compressed = await compressImage(file);
                const base64 = await blobToBase64(compressed);
                setPreview(base64);
                const analysis = await analyzeClothingImage(undefined, base64);
                if (analysis) {
                    setCategory(analysis.category || "");
                    setColors(analysis.colors || []);
                    setOccasions(analysis.suggestedOccasions || []);
                    setSeasons(analysis.suggestedSeasons || []);
                    setBrand(analysis.brand || "");
                }
            } catch (err) {
                console.error("Upload failed", err);
            } finally {
                setLoading(false);
            }
            return;
        }

        // Batch upload mode
        const newItems: UploadQueueItem[] = await Promise.all(Array.from(files).map(async (file) => {
            const url = URL.createObjectURL(file);
            return {
                id: Math.random().toString(36).substr(2, 9),
                file,
                preview: url,
                status: 'pending',
                progress: 0,
            };
        }));

        setQueue(prev => [...prev, ...newItems]);
    };

    // Process queue
    useEffect(() => {
        const processQueue = async () => {
            const pending = queue.find(q => q.status === 'pending');
            if (!pending) return;

            setQueue(prev => prev.map(q => q.id === pending.id ? { ...q, status: 'compressing', progress: 20 } : q));

            try {
                const compressed = await compressImage(pending.file);
                setQueue(prev => prev.map(q => q.id === pending.id ? { ...q, status: 'analyzing', progress: 40 } : q));

                const base64 = await blobToBase64(compressed);
                const analysis = await analyzeClothingImage(undefined, base64);

                setQueue(prev => prev.map(q => q.id === pending.id ? {
                    ...q,
                    status: 'complete',
                    progress: 100,
                    preview: base64, // Replace blob URL with final base64
                    analysis: analysis || undefined
                } : q));
            } catch (err) {
                setQueue(prev => prev.map(q => q.id === pending.id ? { ...q, status: 'error', error: 'Failed to analyze' } : q));
            }
        };

        processQueue();
    }, [queue]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form Submit Triggered. Item mode:", !!item);

        if (item) {
            if (!preview) return;
            console.log("Saving single edited item");
            onSave([{
                ...item,
                image: preview,
                category,
                colors,
                occasions,
                seasons,
                brand,
                size,
                createdAt: item.createdAt || Date.now(),
            }]);
            return;
        }

        const validItems = queue.filter(q => q.status === 'complete').map(q => ({
            image: q.preview,
            category: q.analysis?.category || "Unknown",
            colors: q.analysis?.colors || [],
            occasions: q.analysis?.suggestedOccasions || [],
            seasons: q.analysis?.suggestedSeasons || [],
            brand: q.analysis?.brand || "",
            size: "M", // Default size for batch
            createdAt: Date.now(),
        }));

        console.log(`Batch saving ${validItems.length} items out of ${queue.length} in queue`);
        if (validItems.length > 0) {
            onSave(validItems);
        } else {
            console.warn("No complete items to save!");
        }
    };

    const toggleSelection = (list: string[], setList: (l: string[]) => void, val: string) => {
        if (list.includes(val)) {
            setList(list.filter(i => i !== val));
        } else {
            setList([...list, val]);
        }
    };

    const completionPercent = queue.length > 0
        ? Math.round((queue.filter(q => q.status === 'complete' || q.status === 'error').length / queue.length) * 100)
        : 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col font-sans">
                <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <h2 className="font-poppins font-bold text-xl">{item ? "Edit Item" : (queue.length > 0 ? "Analyzing Batch" : "Add Items")}</h2>
                        {queue.length > 0 && <p className="text-xs text-slate-500 font-medium">{queue.length} items in queue • {completionPercent}% complete</p>}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <X size={24} />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-6">
                    {item || queue.length === 0 ? (
                        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
                            {/* Single / Initial Upload */}
                            <section>
                                <div
                                    className={`relative aspect-[4/3] w-full max-w-md mx-auto rounded-3xl bg-slate-50 border-2 border-dashed transition-all cursor-pointer group flex flex-col items-center justify-center gap-4 ${preview ? 'border-purple-100' : 'border-slate-200 hover:border-purple-400 hover:bg-purple-50/30'
                                        }`}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={e => e.preventDefault()}
                                    onDrop={e => {
                                        e.preventDefault();
                                        if (!item) handleFiles(e.dataTransfer.files);
                                    }}
                                >
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-2xl p-2" />
                                    ) : loading ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={48} className="animate-spin text-purple-600" />
                                            <p className="text-sm font-bold text-slate-500">Processing...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                <Upload size={32} />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-poppins font-bold text-slate-700">Drop your clothes here</p>
                                                <p className="text-xs text-slate-400 mt-1">or click to browse {item ? '' : '(Supports batch selection)'}</p>
                                            </div>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={e => handleFiles(e.target.files)}
                                        multiple={!item}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                                        <input
                                            type="text"
                                            value={category}
                                            onChange={e => setCategory(e.target.value)}
                                            className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all font-semibold"
                                            placeholder="Shirt, Pants, etc."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Brand</label>
                                        <input
                                            type="text"
                                            value={brand}
                                            onChange={e => setBrand(e.target.value)}
                                            className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all font-semibold"
                                            placeholder="Zara, Nike, etc."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Size</label>
                                        <div className="flex flex-wrap gap-2">
                                            {SIZES.slice(0, 8).map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setSize(s)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${size === s ? 'bg-purple-600 border-purple-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                                                        }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Occasions</label>
                                        <div className="flex flex-wrap gap-2">
                                            {OCCASIONS.map(occ => (
                                                <button
                                                    key={occ}
                                                    type="button"
                                                    onClick={() => toggleSelection(occasions, setOccasions, occ)}
                                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border-2 transition-all capitalize ${occasions.includes(occ) ? 'bg-slate-800 border-slate-800 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                                                        }`}
                                                >
                                                    {occ}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Seasons</label>
                                        <div className="flex flex-wrap gap-2">
                                            {SEASONS.map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => toggleSelection(seasons, setSeasons, s)}
                                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border-2 transition-all capitalize ${seasons.includes(s) ? 'bg-amber-500 border-amber-500 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                                                        }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex gap-4">
                                <button type="button" onClick={onClose} className="flex-1 py-4 px-6 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                                <button type="submit" disabled={loading || !preview} className="flex-[2] py-4 px-6 bg-purple-600 text-white rounded-2xl font-bold shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all active:scale-[0.98] disabled:opacity-50">
                                    {loading ? "Analyzing..." : (item ? "Save Changes" : "Save to Closet")}
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* Batch Processing UI */
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {queue.map((q) => (
                                    <div key={q.id} className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border-2 border-slate-100 shadow-sm group">
                                        <img src={q.preview} alt="Upload" className={`w-full h-full object-cover transition-all ${q.status === 'analyzing' || q.status === 'compressing' ? 'blur-sm grayscale opacity-50' : ''}`} />

                                        {/* Status Overlay */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-black/5">
                                            {q.status === 'compressing' && <Loader2 className="animate-spin text-purple-600" size={24} />}
                                            {q.status === 'analyzing' && <div className="animate-pulse flex flex-col items-center gap-1">
                                                <Sparkles className="text-purple-500" size={24} />
                                                <span className="text-[10px] font-bold text-white drop-shadow-md">AI Analyzing...</span>
                                            </div>}
                                            {q.status === 'complete' && <div className="bg-purple-500 text-white rounded-full p-1 shadow-lg animate-in zoom-in">
                                                <Check size={16} />
                                            </div>}
                                            {q.status === 'error' && <div className="text-rose-500 flex flex-col items-center">
                                                <AlertCircle size={24} />
                                                <span className="text-[10px] font-bold">Failed</span>
                                            </div>}
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-200">
                                            <div
                                                className="h-full bg-purple-500 transition-all duration-500 ease-out"
                                                style={{ width: `${q.progress}%` }}
                                            />
                                        </div>

                                        {/* Summary metadata preview if complete */}
                                        {q.status === 'complete' && q.analysis && (
                                            <div className="absolute top-2 left-2 right-2 flex gap-1 overflow-hidden">
                                                <span className="text-[8px] bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md font-bold text-slate-700 shadow-sm truncate">
                                                    {q.analysis.category}
                                                </span>
                                            </div>
                                        )}

                                        {/* Delete from queue */}
                                        <button
                                            onClick={() => setQueue(prev => prev.filter(item => item.id !== q.id))}
                                            className="absolute top-2 right-2 p-1 bg-white/90 text-slate-400 hover:text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                                {/* Add more to queue */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-600 transition-all"
                                >
                                    <PlusCircle size={32} />
                                    <span className="text-xs font-bold">Add More</span>
                                </button>
                            </div>

                            <footer className="sticky bottom-0 bg-white/90 backdrop-blur-md pt-6 border-t border-slate-100 flex gap-4 items-center">
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Queue Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${completionPercent}%` }} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{completionPercent}%</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={onClose} className="py-4 px-8 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors">Discard</button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={queue.length === 0 || queue.some(q => q.status === 'analyzing' || q.status === 'pending')}
                                        className="py-4 px-10 bg-purple-600 text-white rounded-2xl font-bold shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all disabled:opacity-50 disabled:grayscale"
                                    >
                                        Add {queue.filter(q => q.status === 'complete').length} Items
                                    </button>
                                </div>
                            </footer>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


