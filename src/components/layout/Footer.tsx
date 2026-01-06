"use client";

import Link from "next/link";
import { Heart, Shield, FileText } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-slate-100 mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                    {/* Brand */}
                    <div className="space-y-3">
                        <h3 className="font-poppins font-bold text-lg text-slate-900">CLOSET</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Your AI-powered personal fashion stylist and digital wardrobe manager.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Quick Links</h4>
                        <div className="flex flex-col gap-2">
                            <Link href="/" className="text-sm text-slate-600 hover:text-purple-600 transition-colors">
                                Home
                            </Link>
                            <Link href="/closet" className="text-sm text-slate-600 hover:text-purple-600 transition-colors">
                                My Closet
                            </Link>
                            <Link href="/chat" className="text-sm text-slate-600 hover:text-purple-600 transition-colors">
                                AI Assistant
                            </Link>
                            <Link href="/profile" className="text-sm text-slate-600 hover:text-purple-600 transition-colors">
                                Profile
                            </Link>
                        </div>
                    </div>

                    {/* Legal */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Legal</h4>
                        <div className="flex flex-col gap-2">
                            <Link href="/privacy" className="text-sm text-slate-600 hover:text-purple-600 transition-colors flex items-center gap-2">
                                <Shield size={14} />
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="text-sm text-slate-600 hover:text-purple-600 transition-colors flex items-center gap-2">
                                <FileText size={14} />
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Affiliate Disclosure */}
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-6">
                    <p className="text-xs text-slate-600 leading-relaxed">
                        <strong className="text-purple-700">Affiliate Disclosure:</strong> Antigravity Closet participates in affiliate marketing programs.
                        We may earn a commission when you purchase products through our recommendations, at no additional cost to you.
                        Our AI suggestions are based on your personal style profile and wardrobe needs, not commission rates.
                    </p>
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-500">
                        © {new Date().getFullYear()} Antigravity Closet. All rights reserved.
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                        Made with <Heart size={12} className="text-rose-500 fill-rose-500" /> in India
                    </p>
                </div>
            </div>
        </footer>
    );
}
