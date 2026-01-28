"use client";

import { Sparkles, History, Plus } from "lucide-react";

interface ChatHeaderProps {
    onHistoryClick: () => void;
    onNewChatClick: () => void;
    conversationCount: number;
}

export default function ChatHeader({ onHistoryClick, onNewChatClick, conversationCount }: ChatHeaderProps) {
    return (
        <header className="h-[72px] px-6 flex items-center justify-between bg-transparent">
            {/* Left Section */}
            <div className="flex items-center gap-6">

                {/* Fashion Assistant Info */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[10px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center text-purple-600">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h2 className="font-semibold text-[18px] text-[#1C1A2E] leading-tight">Fashion Assistant</h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                            <p className="text-[10px] text-[#9CA3AF] font-semibold uppercase tracking-widest">ACTIVE NOW</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
                {/* History Button */}
                <button
                    onClick={onHistoryClick}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-purple-600 hover:shadow-md transition-all shadow-sm"
                    title="Conversation History"
                >
                    <History size={20} />
                </button>

                {/* New Chat Button */}
                <button
                    onClick={onNewChatClick}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-purple-600 hover:shadow-md transition-all shadow-sm"
                    title="New Chat"
                >
                    <Plus size={20} />
                </button>

                {/* User Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm ml-1 border-2 border-white">
                    <img
                        src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
                        alt="User"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </header>
    );
}
