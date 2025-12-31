"use client";

import AppWrapper from "@/components/layout/AppWrapper";
import ChatInterface from "@/components/chat/ChatInterface";

export default function ChatPage() {
    return (
        <AppWrapper>
            <div className="max-w-4xl mx-auto">
                <header className="mb-6">
                    <h1 className="font-poppins font-bold text-3xl text-slate-900">Conversations</h1>
                    <p className="text-slate-500">Get advice from your personal fashion expert</p>
                </header>
                <ChatInterface />
            </div>
        </AppWrapper>
    );
}
