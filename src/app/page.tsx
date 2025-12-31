"use client";

import AppWrapper from "@/components/layout/AppWrapper";
import ChatInterface from "@/components/chat/ChatInterface";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <AppWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-wider mb-4">
              <Sparkles size={12} />
              Beta AI Designer
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-5xl text-slate-900 leading-tight">
              Your Personal AI <br />
              <span className="text-purple-600 underline decoration-purple-100 underline-offset-8">Fashion Stylist</span>
            </h1>
          </header>

          <ChatInterface />
        </div>

        <div className="lg:col-span-4 space-y-6 hidden lg:block sticky top-24">
          <div className="bg-gradient-to-br from-purple-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-purple-100 overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="font-poppins font-bold text-2xl mb-4">Digitize Your Style</h3>
              <p className="text-purple-50/80 text-sm leading-relaxed mb-6">
                Upload your clothes and let AI help you create the perfect outfit for any occasion.
              </p>
              <ul className="space-y-3 text-sm font-medium">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</div>
                  Snap a photo of your clothes
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</div>
                  AI automatically tags everything
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</div>
                  Ask for outfit suggestions!
                </li>
              </ul>
            </div>
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h4 className="font-poppins font-bold text-slate-800 mb-4">Try Asking:</h4>
            <div className="space-y-3">
              {[
                "Suggest a casual outfit for a coffee date",
                "What should I wear with my blue jeans?",
                "Analyze my wardrobe gaps",
                "Ideas for a beach wedding?"
              ].map(q => (
                <button
                  key={q}
                  className="w-full text-left px-4 py-3 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all text-xs text-slate-600"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppWrapper>
  );
}
