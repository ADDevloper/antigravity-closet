"use client";

import { useState, useRef } from "react";
import AppWrapper from "@/components/layout/AppWrapper";
import ChatInterface from "@/components/chat/ChatInterface";
import ChatHeader from "@/components/chat/ChatHeader";

export default function StylistChatPage() {
  const [showHistory, setShowHistory] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);
  const chatInterfaceRef = useRef<any>(null);

  const handleHistoryClick = () => {
    setShowHistory(true);
    // Trigger history panel in ChatInterface
    if (chatInterfaceRef.current?.openHistory) {
      chatInterfaceRef.current.openHistory();
    }
  };

  const handleNewChatClick = () => {
    // Trigger new conversation in ChatInterface
    if (chatInterfaceRef.current?.startNewConversation) {
      chatInterfaceRef.current.startNewConversation();
    }
  };

  return (
    <AppWrapper>
      <div className="flex flex-col h-screen bg-[#F2F2F7]">
        <ChatHeader
          onHistoryClick={handleHistoryClick}
          onNewChatClick={handleNewChatClick}
          conversationCount={conversationCount}
        />
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            ref={chatInterfaceRef}
            onConversationCountChange={setConversationCount}
          />
        </div>
      </div>
    </AppWrapper>
  );
}
