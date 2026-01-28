"use client";

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Message, ClothingItem, Conversation, PCAProfile, UserProfile, Outfit, Recommendation, addConversation, updateConversation, getAllItems, getAllConversations, deleteConversation, getPCAProfile, getUserProfile } from "@/lib/db";
import { getFashionAdvice } from "@/lib/gemini";
import { Send, Plus, Loader2, Sparkles, User, History, Calendar, Paperclip, ArrowUp } from "lucide-react";
import ConversationHistory from "./ConversationHistory";
import { motion, AnimatePresence } from "framer-motion";
import RatingButtons from "./RatingButtons";

interface ChatInterfaceProps {
    initialPrompt?: string;
    onConversationCountChange?: (count: number) => void;
}

function ShopRecommendationCard({ recommendation }: { recommendation: Recommendation }) {
    const searchQuery = encodeURIComponent(recommendation.searchQuery);
    const searchUrl = `https://www.amazon.in/s?k=${searchQuery}&tag=closetai-21`;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm relative overflow-hidden group rounded-3xl"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-indigo-900 opacity-95" />
            <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-fuchsia-500/30 rounded-full blur-3xl group-hover:bg-fuchsia-500/40 transition-colors duration-700" />
            <div className="relative z-10 p-5 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1 px-2 bg-white/10 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                                <Sparkles size={10} className="text-violet-200" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-violet-100">Smart Pick</span>
                            </div>
                        </div>
                        <h4 className="font-serif font-medium text-xl text-white leading-tight">{recommendation.itemName}</h4>
                    </div>
                </div>
                <p className="text-sm text-violet-100/90 leading-relaxed font-light">
                    {recommendation.reason}
                </p>
                <div className="pt-2 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/20 rounded-xl border border-white/5">
                        <div className="w-3 h-3 rounded-full shadow-inner" style={{ background: recommendation.colorSuggestion }} />
                        <span className="text-[10px] font-medium text-violet-200 uppercase tracking-widest">Color Match</span>
                    </div>
                    <a
                        href={searchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-white text-violet-900 font-bold px-4 py-3 rounded-xl text-xs hover:bg-violet-50 transition-all shadow-lg active:scale-95 uppercase tracking-wider"
                    >
                        View on Amazon <Send size={12} />
                    </a>
                </div>
            </div>
        </motion.div>
    );
}

function OutfitCard({ outfit, closet }: { outfit: Outfit, closet: ClothingItem[] }) {
    const [isHidden, setIsHidden] = useState(false);
    const items = outfit.itemIds.map((id: number) => closet.find(i => i.id === id)).filter(Boolean) as ClothingItem[];

    return (
        <AnimatePresence>
            {!isHidden && (
                <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="flex-shrink-0 w-80 glass-card rounded-[24px] overflow-hidden flex flex-col group border border-white/50 bg-white/40 backdrop-blur-md shadow-sm"
                >
                    <div className="p-4 border-b border-neutral-100/50 bg-white/30 flex justify-between items-start">
                        <div>
                            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-1 block">Curated Look</span>
                            <h4 className="font-serif font-medium text-lg text-neutral-900 leading-tight">{outfit.name}</h4>
                        </div>
                    </div>
                    <div className="flex-1 p-2 grid grid-cols-2 grid-rows-2 gap-2 h-64">
                        {items.slice(0, 3).map((item: ClothingItem, i: number) => (
                            <div
                                key={i}
                                className={`relative rounded-xl overflow-hidden border border-white/50 bg-white shadow-sm transition-transform duration-500 hover:scale-[1.02] ${items.length === 3 && i === 0 ? "row-span-2" : ""
                                    }`}
                            >
                                <img src={item.image} alt={item.category} className="w-full h-full object-cover" />
                                {item.brand && (
                                    <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-sm text-white text-[8px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                                        {item.brand}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="px-4 pb-4 space-y-4">
                        <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                            {outfit.description}
                        </p>
                        {outfit.stylingTips && outfit.stylingTips.length > 0 && (
                            <div className="bg-purple-50/50 rounded-2xl p-3 border border-purple-100/50">
                                <p className="text-[10px] font-bold text-purple-700 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                    <Sparkles size={12} /> Stylist Note
                                </p>
                                <ul className="space-y-1.5">
                                    {outfit.stylingTips.map((tip: string, i: number) => (
                                        <li key={i} className="text-[10px] text-neutral-600 pl-2 border-l-2 border-purple-200 leading-relaxed">
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="flex gap-2 pt-2 border-t border-neutral-100/50">
                            <button className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-[10px] font-bold text-neutral-600 hover:bg-neutral-50 transition-colors uppercase tracking-wider flex items-center justify-center gap-2">
                                <Calendar size={14} /> Schedule
                            </button>
                            <button className="flex-1 py-2.5 rounded-xl bg-purple-600 text-[10px] font-bold text-white hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/20 uppercase tracking-wider">
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

const ChatInterface = forwardRef<any, ChatInterfaceProps>(({ initialPrompt, onConversationCountChange }, ref) => {
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
    const textareaRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialPrompt && initialPrompt.trim()) {
            setInput(initialPrompt);
        }
    }, [initialPrompt]);

    useEffect(() => {
        loadCloset();
        loadConversations();
        loadPCAProfile();
        loadUserProfile();
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

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
        const sorted = convs.sort((a, b) => b.updatedAt - a.updatedAt);
        setConversations(sorted);
        if (onConversationCountChange) {
            onConversationCountChange(sorted.length);
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

            const title = newMessages[0].content.substring(0, 50) + (newMessages[0].content.length > 50 ? '...' : '');
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

    useImperativeHandle(ref, () => ({
        openHistory: () => setShowHistory(true),
        startNewConversation: handleNewConversation
    }));

    return (
        <div className="flex flex-col h-full bg-transparent overflow-hidden relative">
            {/* Loading Overlay */}
            {isLoadingConv && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-30 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 size={32} className="animate-spin text-purple-600" />
                        <span className="text-xs font-bold text-purple-600 uppercase tracking-widest animate-pulse">Loading Chat...</span>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth pb-40 px-6 md:px-10">
                <div className="max-w-[1000px] mx-auto w-full h-full">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-end pb-32 space-y-8">
                            <div className="space-y-6 text-center">
                                <div className="relative inline-flex items-center justify-center">
                                    <div className="absolute inset-0 bg-[#7322c3]/25 blur-[60px] rounded-full transform scale-150"></div>
                                    <div className="relative w-20 h-20 rounded-3xl bg-white shadow-[0_30px_60px_-12px_rgba(115,34,195,0.3)] flex items-center justify-center border border-white/50">
                                        <Sparkles size={40} className="text-[#7322c3]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-5xl tracking-tight text-[#1C1A2E] font-display">Hello, Style Icon.</h3>
                                    <p className="text-[#64748B] text-lg max-w-md mx-auto leading-relaxed">
                                        I've analyzed your closet. What are we styling today?
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl animate-fade-in delay-100">
                                {[
                                    "What should I wear today?",
                                    "Curate a date night outfit",
                                    "Analyze my wardrobe gaps",
                                    "Style my vintage jacket"
                                ].map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setInput(prompt)}
                                        className="glass-chip px-6 py-4 rounded-xl text-[14px] font-medium text-[#1C1A2E] transition-all text-center border-2 border-transparent bg-[#F3E8FF] hover:border-purple-200 hover:shadow-lg hover:-translate-y-1"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="pt-8 space-y-8">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-scale-in origin-bottom`}>
                                    <div className={`flex gap-4 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-[#1C1A2E] text-white' : 'bg-white text-[#7322c3] ring-1 ring-[#7322c3]/10'}`}>
                                            {msg.role === 'user' ? <User size={16} /> : <Sparkles size={18} />}
                                        </div>

                                        <div className="space-y-4">
                                            <div className={`px-6 py-4 rounded-[24px] text-[16px] leading-[1.6] shadow-sm ${msg.role === 'user'
                                                ? 'bg-neutral-900 text-white rounded-tr-sm'
                                                : 'bg-white text-neutral-800 rounded-tl-sm border border-gray-100'
                                                }`}>
                                                {msg.content}
                                            </div>

                                            {msg.outfits && msg.outfits.length > 0 && (
                                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
                                                    {msg.outfits.map(outfit => (
                                                        <div key={outfit.id} className="snap-center">
                                                            <OutfitCard outfit={outfit} closet={closet} />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {msg.recommendations && msg.recommendations.length > 0 && (
                                                <div className="space-y-4">
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
                                <div className="flex justify-start animate-pulse">
                                    <div className="flex gap-4 max-w-[85%]">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#7322c3] ring-1 ring-[#7322c3]/10 shadow-sm">
                                            <Loader2 size={18} className="animate-spin" />
                                        </div>
                                        <div className="bg-white px-6 py-4 rounded-3xl rounded-tl-sm border border-white/60">
                                            <div className="flex gap-1.5 items-center h-5">
                                                <span className="w-1.5 h-1.5 bg-[#7322c3] rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                <span className="w-1.5 h-1.5 bg-[#7322c3] rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                <span className="w-1.5 h-1.5 bg-[#7322c3] rounded-full animate-bounce" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 pb-12 px-6 md:px-10 bg-gradient-to-t from-[#F2F2F7] via-[#F2F2F7]/95 to-transparent pt-32 pointer-events-none">
                <div className="max-w-3xl mx-auto pointer-events-auto">
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-white/40 rounded-[3rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                        <form
                            onSubmit={handleSend}
                            className="relative flex items-center bg-white border border-slate-100 rounded-3xl p-3 pl-8 shadow-2xl shadow-slate-200/50 transition-all focus-within:ring-4 ring-[#7322c3]/5"
                        >
                            <div className="pr-4 flex items-center">
                                <Paperclip
                                    size={24}
                                    className="text-slate-400 cursor-pointer hover:text-[#7322c3] transition-colors -rotate-45"
                                    strokeWidth={2}
                                />
                            </div>
                            <input
                                ref={textareaRef}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Ask your stylist anything..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-lg py-4 placeholder:text-slate-300 font-normal"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="w-14 h-14 bg-[#581c87] text-white rounded-2xl flex items-center justify-center shadow-[0_20px_40px_-12px_rgba(88,28,135,0.3)] hover:bg-[#4c1d95] transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:shadow-none flex-shrink-0"
                            >
                                <ArrowUp size={24} strokeWidth={2.5} />
                            </button>
                        </form>
                    </div>
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
        </div>
    );
});

ChatInterface.displayName = 'ChatInterface';

export default ChatInterface;
