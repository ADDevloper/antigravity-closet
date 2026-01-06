"use client";

import { useState, useEffect, useRef } from "react";
import { Message, ClothingItem, Conversation, PCAProfile, UserProfile, addConversation, updateConversation, getAllItems, getAllConversations, deleteConversation, getPCAProfile, getUserProfile } from "@/lib/db";
import { getFashionAdvice } from "@/lib/gemini";
import { Send, Plus, Loader2, Sparkles, User, History, Calendar } from "lucide-react";
import ConversationHistory from "./ConversationHistory";
import { motion, AnimatePresence } from "framer-motion";
import RatingButtons from "./RatingButtons";

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [closet, setCloset] = useState<ClothingItem[]>([]);
    const [currentConvId, setCurrentConvId] = useState<number | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isLoadingConv, setIsLoadingConv] = useState(false);
    const [pcaProfile, setPcaProfile] = useState<PCAProfile | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadCloset();
        loadConversations();
        loadPCAProfile();
        loadUserProfile();
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    const loadCloset = async () => {
        const items = await getAllItems();
        setCloset(items);
    };

    const loadPCAProfile = async () => {
        const profile = await getPCAProfile();
        setPcaProfile(profile);
    };

    const loadUserProfile = async () => {
        const profile = await getUserProfile();
        setUserProfile(profile);
    };

    const loadConversations = async () => {
        const convs = await getAllConversations();
        // Sort by updatedAt descending (newest first)
        const sorted = convs.sort((a, b) => b.updatedAt - a.updatedAt);
        setConversations(sorted);

        // Load most recent conversation on startup if exists
        if (sorted.length > 0 && messages.length === 0 && !currentConvId) {
            handleSelectConversation(sorted[0]);
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: Date.now(),
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const response = await getFashionAdvice(undefined, closet, newMessages, input, pcaProfile || undefined, userProfile);

            const assistantMessage: Message = {
                role: 'assistant',
                content: response.content,
                outfits: response.outfits,
                recommendations: response.recommendations,
                timestamp: Date.now(),
            };

            const finalMessages = [...newMessages, assistantMessage];
            setMessages(finalMessages);

            // Generate title from first user message
            const title = newMessages[0].content.substring(0, 50) + (newMessages[0].content.length > 50 ? '...' : '');

            // Persist conversation
            const now = Date.now();
            if (currentConvId) {
                await updateConversation({
                    id: currentConvId,
                    title,
                    messages: finalMessages,
                    createdAt: conversations.find(c => c.id === currentConvId)?.createdAt || now,
                    updatedAt: now,
                });
            } else {
                const id = await addConversation({
                    title,
                    messages: finalMessages,
                    createdAt: now,
                    updatedAt: now,
                });
                if (id) setCurrentConvId(id);
            }

            // Reload conversations to update the list
            await loadConversations();
        } catch (err) {
            console.error("Chat failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleNewConversation = () => {
        setMessages([]);
        setCurrentConvId(null);
    };

    const handleSelectConversation = async (conv: Conversation) => {
        setIsLoadingConv(true);
        setMessages(conv.messages);
        setCurrentConvId(conv.id || null);
        setTimeout(() => setIsLoadingConv(false), 300);
    };

    const handleDeleteConversation = async (id: number) => {
        await deleteConversation(id);
        if (currentConvId === id) {
            handleNewConversation();
        }
        await loadConversations();
    };

    return (
        <>
            <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden max-w-4xl mx-auto w-full">
                {/* Header */}
                <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h2 className="font-poppins font-bold text-lg">Fashion Assistant</h2>
                            <p className="text-[10px] text-purple-600 font-semibold uppercase tracking-widest">Always Online</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowHistory(true)}
                            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors relative"
                            title="Conversation History"
                        >
                            <History size={20} />
                            {conversations.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                    {conversations.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={handleNewConversation}
                            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
                            title="New Chat"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </header>

                {/* Loading Overlay */}
                {isLoadingConv && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-30 flex items-center justify-center">
                        <Loader2 size={32} className="animate-spin text-purple-600" />
                    </div>
                )}

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                            <div className="w-16 h-16 rounded-3xl bg-purple-50 flex items-center justify-center text-purple-600 mb-2">
                                <Sparkles size={32} />
                            </div>
                            <h3 className="font-poppins font-bold text-xl text-slate-800">Hello! I'm your Closet AI</h3>
                            <p className="text-slate-500 max-w-xs text-sm">
                                Ask me for outfit ideas, styling tips, or a wardrobe analysis. I know exactly what's in your closet!
                            </p>
                            <div className="grid grid-cols-1 gap-2 w-full max-w-sm pt-4">
                                <button onClick={() => setInput("What should I wear today?")} className="text-left px-4 py-2 rounded-xl border border-slate-100 hover:bg-slate-50 text-xs text-slate-600 transition-colors">
                                    "What should I wear today?"
                                </button>
                                <button onClick={() => setInput("How can I style my favorite pieces?")} className="text-left px-4 py-2 rounded-xl border border-slate-100 hover:bg-slate-50 text-xs text-slate-600 transition-colors">
                                    "How can I style my favorite pieces?"
                                </button>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-100 text-slate-400' : 'bg-purple-50 text-purple-600'
                                    }`}>
                                    {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                                </div>

                                <div className="space-y-4">
                                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-purple-600 text-white rounded-tr-none shadow-md shadow-purple-100'
                                        : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'
                                        }`}>
                                        {msg.content}
                                    </div>

                                    {msg.outfits && msg.outfits.length > 0 && (
                                        <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
                                            {msg.outfits.map(outfit => (
                                                <OutfitCard key={outfit.id} outfit={outfit} closet={closet} />
                                            ))}
                                        </div>
                                    )}

                                    {msg.recommendations && msg.recommendations.length > 0 && (
                                        <div className="space-y-3">
                                            {msg.recommendations.map(reco => (
                                                <ShopRecommendationCard key={reco.id} recommendation={reco} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                    <Loader2 size={16} className="animate-spin" />
                                </div>
                                <div className="bg-slate-50 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-0" />
                                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150" />
                                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-300" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-100 bg-white md:p-6">
                    <form
                        onSubmit={handleSend}
                        className="relative group flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-3xl p-2 focus-within:ring-4 focus-within:ring-purple-500/10 focus-within:border-purple-500 transition-all hover:bg-white focus-within:bg-white shadow-sm"
                    >
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Ask your fashion assistant..."
                            rows={1}
                            className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-[200px] py-3 pl-4 text-sm text-slate-800 placeholder:text-slate-400 leading-relaxed scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
                            style={{ minHeight: '44px' }}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="p-2.5 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none mb-0.5 mr-0.5 flex-shrink-0"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>

            {/* Conversation History Sidebar */}
            <ConversationHistory
                conversations={conversations}
                currentConvId={currentConvId}
                onSelectConversation={handleSelectConversation}
                onDeleteConversation={handleDeleteConversation}
                onNewConversation={handleNewConversation}
                onClose={() => setShowHistory(false)}
                isOpen={showHistory}
            />
        </>
    );
}

function ShopRecommendationCard({ recommendation }: { recommendation: any }) {
    const searchUrl = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(recommendation.searchQuery)}`;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-4 text-white shadow-xl shadow-purple-100 flex flex-col gap-3 relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 p-8 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-colors" />

            <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md">
                            <Sparkles size={14} className="text-purple-200" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-200">Personal Recommendation</span>
                    </div>
                    <h4 className="font-poppins font-bold text-lg leading-tight">{recommendation.itemName}</h4>
                </div>
            </div>

            <p className="text-sm text-purple-50/90 leading-relaxed relative z-10">
                {recommendation.reason}
            </p>

            <div className="relative z-10 pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-white/30" style={{ background: recommendation.colorSuggestion }} />
                    <span className="text-[10px] font-medium text-purple-100">Suggested Color</span>
                </div>
                <a
                    href={searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white text-purple-700 font-bold px-4 py-2 rounded-xl text-xs hover:bg-purple-50 transition-colors shadow-lg active:scale-95"
                >
                    Shop Similar <Send size={12} />
                </a>
            </div>
        </motion.div>
    );
}

function OutfitCard({ outfit, closet }: { outfit: any, closet: ClothingItem[] }) {
    const [isHidden, setIsHidden] = useState(false);
    const items = outfit.itemIds.map((id: number) => closet.find(i => i.id === id)).filter(Boolean);

    return (
        <AnimatePresence>
            {!isHidden && (
                <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, x: -20, filter: "blur(10px)" }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 w-72 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-purple-200 transition-all hover:shadow-md group"
                >
                    <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                        <h4 className="font-poppins font-bold text-sm text-slate-800 truncate">{outfit.name}</h4>
                        <div className="flex gap-1">
                            {items.slice(0, 3).map((item: ClothingItem, i: number) => (
                                <div key={i} className="w-4 h-4 rounded-full border border-slate-200 overflow-hidden">
                                    <img src={item.image} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 p-3 grid grid-cols-2 gap-2 bg-white">
                        {items.map((item: ClothingItem, i: number) => (
                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                                <img src={item.image} alt={item.category} className="w-full h-full object-cover" />
                                {item.brand && (
                                    <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded-tl-md font-bold uppercase backdrop-blur-sm">
                                        {item.brand}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="px-3 pb-3 space-y-3">
                        <div className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                            {outfit.description}
                        </div>

                        {outfit.stylingTips && outfit.stylingTips.length > 0 && (
                            <div className="bg-purple-50/50 rounded-xl p-2.5 border border-purple-100/50">
                                <p className="text-[10px] font-bold text-purple-700 mb-1 uppercase tracking-wider flex items-center gap-1">
                                    <Sparkles size={10} /> Styling Tips
                                </p>
                                <ul className="list-disc list-inside text-[10px] text-slate-600 space-y-0.5">
                                    {outfit.stylingTips.map((tip: string, i: number) => (
                                        <li key={i}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex gap-2 pt-1 border-b border-slate-50 pb-3">
                            <button className="flex-1 py-1.5 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 uppercase tracking-wider">
                                <Calendar size={12} /> Schedule
                            </button>
                            <button className="flex-1 py-1.5 rounded-xl bg-purple-600 text-[10px] font-bold text-white hover:bg-purple-700 transition-colors shadow-sm shadow-purple-100 uppercase tracking-wider">
                                Wear now
                            </button>
                        </div>

                        <RatingButtons outfit={outfit} onDislike={() => setIsHidden(true)} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
