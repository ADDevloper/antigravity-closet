"use client";

import AppWrapper from "@/components/layout/AppWrapper";
import { Shield, Lock, Database, Eye, Mail } from "lucide-react";

export default function PrivacyPage() {
    return (
        <AppWrapper>
            <div className="max-w-4xl mx-auto pb-20 animate-in fade-in">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                            <Shield className="text-purple-600" size={24} />
                        </div>
                        <h1 className="font-poppins font-bold text-3xl text-slate-900">Privacy Policy</h1>
                    </div>
                    <p className="text-slate-500 text-sm">Last updated: January 6, 2026</p>
                </div>

                <div className="space-y-8">
                    {/* Introduction */}
                    <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <p className="text-slate-700 leading-relaxed">
                            At <strong>Antigravity Closet</strong>, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our AI-powered fashion assistant and digital wardrobe management platform.
                        </p>
                    </section>

                    {/* Data Storage */}
                    <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="text-purple-600" size={20} />
                            <h2 className="font-bold text-xl text-slate-900">1. Data Storage & Collection</h2>
                        </div>
                        <div className="space-y-4 text-slate-700 leading-relaxed">
                            <p>
                                <strong>Local Storage:</strong> All your personal data, including clothing images, Personal Color Analysis (PCA) results, outfit preferences, and conversation history, is stored <strong>locally on your device</strong> using IndexedDB technology. We do not store this data on any external servers or cloud platforms.
                            </p>
                            <p>
                                <strong>What We Collect:</strong>
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Clothing item photos you upload</li>
                                <li>Personal Color Analysis selfie (optional, stored locally only if you consent)</li>
                                <li>Your style preferences, gender, and lifestyle data</li>
                                <li>AI chat conversation history</li>
                                <li>Outfit ratings and feedback</li>
                            </ul>
                        </div>
                    </section>

                    {/* AI Processing */}
                    <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Eye className="text-purple-600" size={20} />
                            <h2 className="font-bold text-xl text-slate-900">2. AI Image Analysis</h2>
                        </div>
                        <div className="space-y-4 text-slate-700 leading-relaxed">
                            <p>
                                When you upload photos for clothing analysis or Personal Color Analysis, these images are temporarily sent to <strong>Google's Gemini AI API</strong> for processing. The images are:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Processed in real-time and not permanently stored by Google</li>
                                <li>Used solely for generating style recommendations and color analysis</li>
                                <li>Subject to Google's AI API privacy policies</li>
                            </ul>
                            <p className="text-sm bg-purple-50 p-3 rounded-lg border border-purple-100">
                                <strong>Note:</strong> You can choose to delete your PCA selfie from local storage at any time via Settings → Privacy & Data.
                            </p>
                        </div>
                    </section>

                    {/* Third-Party Services */}
                    <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Lock className="text-purple-600" size={20} />
                            <h2 className="font-bold text-xl text-slate-900">3. Third-Party Services & Affiliate Links</h2>
                        </div>
                        <div className="space-y-4 text-slate-700 leading-relaxed">
                            <p>
                                Our platform may include affiliate links to third-party retailers (such as Amazon, Myntra, or other fashion platforms). When you click these links:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>You will be redirected to the retailer's website</li>
                                <li>The retailer may collect data according to their own privacy policies</li>
                                <li>We may earn a commission if you make a purchase (at no extra cost to you)</li>
                                <li>We do not share your personal wardrobe data with these retailers</li>
                            </ul>
                        </div>
                    </section>

                    {/* User Rights */}
                    <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="text-purple-600" size={20} />
                            <h2 className="font-bold text-xl text-slate-900">4. Your Rights & Control</h2>
                        </div>
                        <div className="space-y-4 text-slate-700 leading-relaxed">
                            <p>You have complete control over your data:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Access:</strong> View all your stored data at any time</li>
                                <li><strong>Delete:</strong> Remove individual items, conversations, or your entire account</li>
                                <li><strong>Export:</strong> Download your wardrobe data (feature coming soon)</li>
                                <li><strong>Opt-out:</strong> Disable AI recommendations or PCA features in Settings</li>
                            </ul>
                        </div>
                    </section>

                    {/* Cookies */}
                    <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h2 className="font-bold text-xl text-slate-900 mb-4">5. Cookies & Analytics</h2>
                        <div className="space-y-4 text-slate-700 leading-relaxed">
                            <p>
                                We currently do not use cookies or third-party analytics tools. All app functionality is powered by local browser storage.
                            </p>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                        <div className="flex items-center gap-3 mb-4">
                            <Mail className="text-purple-600" size={20} />
                            <h2 className="font-bold text-xl text-slate-900">6. Contact Us</h2>
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                            If you have any questions about this Privacy Policy or how we handle your data, please contact us at:{" "}
                            <a href="mailto:privacy@antigravitycloset.com" className="text-purple-600 font-bold hover:underline">
                                privacy@antigravitycloset.com
                            </a>
                        </p>
                    </section>

                    {/* Compliance */}
                    <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h2 className="font-bold text-xl text-slate-900 mb-4">7. Compliance</h2>
                        <p className="text-slate-700 leading-relaxed">
                            This Privacy Policy is designed to comply with applicable data protection laws, including India's Digital Personal Data Protection Act, 2023 (DPDPA) and international standards.
                        </p>
                    </section>
                </div>
            </div>
        </AppWrapper>
    );
}
