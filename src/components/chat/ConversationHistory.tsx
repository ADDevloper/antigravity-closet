"use client";

import { Conversation } from "@/lib/db";
import { X, Trash2, MessageSquare, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ConversationHistoryProps {
    conversations: Conversation[];
    currentConvId: number | null;
    onSelectConversation: (conv: Conversation) => void;
    onDeleteConversation: (id: number) => void;
    onNewConversation: () => void;
    onClose: () => void;
    isOpen: boolean;
}

export default function ConversationHistory({
    conversations,
    currentConvId,
    onSelectConversation,
    onDeleteConversation,
    onNewConversation,
    onClose,
    isOpen,
}: ConversationHistoryProps) {
    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this conversation?")) {
            onDeleteConversation(id);
        }
    };

    const getPreview = (conv: Conversation) => {
        const firstUserMessage = conv.messages.find(m => m.role === 'user');
        return firstUserMessage?.content.substring(0, 60) || "New conversation";
    };

    const formatDate = (timestamp: number) => {
        try {
            return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
        } catch {
            return "Recently";
        }
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="font-poppins font-bold text-xl text-slate-900">Conversations</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* New Conversation Button */}
                <div className="px-6 py-4 border-b border-slate-100">
                    <button
                        onClick={() => {
                            onNewConversation();
                            onClose();
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all active:scale-95 shadow-md shadow-purple-100"
                    >
                        <Plus size={20} />
                        New Conversation
                    </button>
                </div>

                {/* Conversations List */}
                <div className="overflow-y-auto h-[calc(100vh-180px)] px-4 py-2">
                    {conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-6">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare size={32} className="text-slate-400" />
                            </div>
                            <h3 className="font-poppins font-semibold text-slate-800 mb-2">No conversations yet</h3>
                            <p className="text-sm text-slate-500">
                                Start a new conversation with your AI fashion assistant!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {conversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    onClick={() => {
                                        onSelectConversation(conv);
                                        onClose();
                                    }}
                                    className={`group relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${conv.id === currentConvId
                                            ? 'border-purple-500 bg-purple-50/50 shadow-sm'
                                            : 'border-slate-100 hover:border-slate-200 bg-white'
                                        }`}
                                >
                                    {/* Active Indicator */}
                                    {conv.id === currentConvId && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-purple-600 rounded-r-full" />
                                    )}

                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-slate-900 truncate mb-1">
                                                {conv.title}
                                            </h3>
                                            <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                                                {getPreview(conv)}
                                            </p>
                                            <div className="flex items-center gap-3 text-[10px] text-slate-400">
                                                <span>{formatDate(conv.updatedAt)}</span>
                                                <span>•</span>
                                                <span>{conv.messages.length} messages</span>
                                            </div>
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => handleDelete(e, conv.id!)}
                                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-rose-50 rounded-lg transition-all text-slate-400 hover:text-rose-500"
                                            title="Delete conversation"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
