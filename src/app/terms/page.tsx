"use client";

import AppWrapper from "@/components/layout/AppWrapper";
import { FileText, CheckCircle, XCircle, AlertTriangle, Scale } from "lucide-react";

export default function TermsPage() {
    return (
        <AppWrapper>
            <div className="max-w-4xl mx-auto pb-20 animate-in fade-in">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                            <FileText className="text-purple-600" size={24} />
                        </div>
                        <h1 className="font-poppins font-bold text-3xl text-slate-900">Terms of Service</h1>
                    </div>
                    <p className="text-slate-500 text-sm">Last updated: January 6, 2026</p>
                </div>

                <div className="space-y-8">
                    {/* Introduction */}
                    <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <p className="text-slate-700 leading-relaxed">
                            Welcome to <strong>Antigravity Closet</strong>! By accessing or using our AI-powered fashion assistant and digital wardrobe platform, you agree to be bound by these Terms of Service. Please read them carefully.
                        </p>
                    </section>

                    {/* Acceptance */}
                    <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="text-purple-600" size={20} />
                            <h2 className="font-bold text-xl text-slate-900">1. Acceptance of Terms</h2>
                        </div>
                        <div className="space-y-4 text-slate-700 leading-relaxed">
                            <p>
                                By creating an account, uploading images, or using any features of Antigravity Closet, you acknowledge that you have read, understood, and agree to these Terms of Service and our Privacy Policy.
                            </p>
                            <p>
                                If you do not agree with any part of these terms, please discontinue use of the platform immediately.
                            </p>
                        </div>
                    </section>

                    {/* Service Description */}
                    <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="text-purple-600" size={20} />
                            <h2 className="font-bold text-xl text-slate-900">2. Service Description</h2>
                        </div>
                        <div className="space-y-4 text-slate-700 leading-relaxed">
                            <p>Antigravity Closet provides:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>AI-powered clothing item analysis and categorization</li>
                                <li>Personal Color Analysis (PCA) based on uploaded selfies</li>
                                <li>Personalized outfit recommendations using your digital wardrobe</li>
                                <li>Shopping recommendations via affiliate links to third-party retailers</li>
                                <li>Wardrobe gap analysis and lifestyle-based styling advice</li>
                            </ul>
                            <p className="text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <strong>Note:</strong> All AI-generated recommendations are suggestions only. We do not guarantee specific results or outcomes.
                            </p>
                        </div>
                    </section>

                    {/* User Responsibilities */}
                    <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Scale className="text-purple-600" size={20} />
                            <h2 className="font-bold text-xl text-slate-900">3. User Responsibilities</h2>
                        </div>
                        <div className="space-y-4 text-slate-700 leading-relaxed">
                            <p>You agree to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Provide accurate information when using the platform</li>
                                <li>Only upload images that you own or have permission to use</li>
                                <li>Not upload inappropriate, offensive, or copyrighted content</li>
                                <li>Use the platform for personal, non-commercial purposes only</li>
                                <li>Not attempt to reverse-engineer, hack, or misuse the AI systems</li>
                            </ul>
                        </div>
                    </section>

                    {/* Intellectual Property */}
                    <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h2 className="font-bold text-xl text-slate-900 mb-4">4. Intellectual Property</h2>
                        <div className="space-y-4 text-slate-700 leading-relaxed">
                            <p>
                                <strong>Your Content:</strong> You retain all rights to the images and data you upload. By using our service, you grant us a limited license to process your images via AI for the purpose of providing our services.
                            </p>
                            <p>
                                <strong>Our Platform:</strong> The Antigravity Closet platform, including its design, code, AI models, and branding, is protected by copyright and intellectual property laws. You may not copy, modify, or distribute any part of our platform without permission.
                            </p>
                        </div>
                    </section>

                    {/* Affiliate Disclosure */}
                    <section className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="text-purple-600" size={20} />
                            <h2 className="font-bold text-xl text-slate-900">5. Affiliate Disclosure</h2>
                        </div>
                        <div className="space-y-4 text-slate-700 leading-relaxed">
                            <p>
                                Antigravity Closet participates in affiliate marketing programs. When you click on product recommendations and make a purchase, we may earn a commission at no additional cost to you.
                            </p>
                            <p>
                                <strong>Important:</strong> Our AI recommendations are based on your personal style profile and wardrobe needs, not on commission rates. We prioritize your best interests in all suggestions.
                            </p>
                            <p className="text-sm">
                                We are a participant in the Amazon Associates Program and may include affiliate links from other fashion retailers including Myntra, Ajio, and international brands.
                            </p>
                        </div>
                    </section>

                    {/* Disclaimer */}
                    <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <XCircle className="text-purple-600" size={20} />
                            <h2 className="font-bold text-xl text-slate-900">6. Disclaimer of Warranties</h2>
                        </div>
                        <div className="space-y-4 text-slate-700 leading-relaxed">
                            <p>
                                Antigravity Closet is provided "AS IS" without warranties of any kind. We do not guarantee:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>100% accuracy of AI color analysis or outfit recommendations</li>
                                <li>Availability of third-party affiliate products or links</li>
                                <li>Uninterrupted or error-free service</li>
                                <li>Specific fashion outcomes or personal satisfaction</li>
                            </ul>
                            <p className="text-sm bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                <strong>Fashion is Personal:</strong> Our AI provides guidance based on color theory and style principles, but your personal preferences and comfort should always take priority.
                            </p>
                        </div>
                    </section>

                    {/* Limitation of Liability */}
                    <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h2 className="font-bold text-xl text-slate-900 mb-4">7. Limitation of Liability</h2>
                        <p className="text-slate-700 leading-relaxed">
                            To the maximum extent permitted by law, Antigravity Closet and its creators shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform, including but not limited to data loss, purchase decisions, or dissatisfaction with AI recommendations.
                        </p>
                    </section>

                    {/* Termination */}
                    <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h2 className="font-bold text-xl text-slate-900 mb-4">8. Account Termination</h2>
                        <div className="space-y-4 text-slate-700 leading-relaxed">
                            <p>
                                You may delete your account and all associated data at any time via Settings → Privacy & Data → Delete All Data.
                            </p>
                            <p>
                                We reserve the right to suspend or terminate access to users who violate these Terms of Service or engage in abusive behavior.
                            </p>
                        </div>
                    </section>

                    {/* Changes to Terms */}
                    <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h2 className="font-bold text-xl text-slate-900 mb-4">9. Changes to Terms</h2>
                        <p className="text-slate-700 leading-relaxed">
                            We may update these Terms of Service from time to time. Continued use of the platform after changes are posted constitutes acceptance of the new terms. We will notify users of significant changes via the app interface.
                        </p>
                    </section>

                    {/* Governing Law */}
                    <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h2 className="font-bold text-xl text-slate-900 mb-4">10. Governing Law</h2>
                        <p className="text-slate-700 leading-relaxed">
                            These Terms of Service are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in [Your City/State], India.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                        <h2 className="font-bold text-xl text-slate-900 mb-4">11. Contact Information</h2>
                        <p className="text-slate-700 leading-relaxed">
                            For questions about these Terms of Service, please contact us at:{" "}
                            <a href="mailto:legal@antigravitycloset.com" className="text-purple-600 font-bold hover:underline">
                                legal@antigravitycloset.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </AppWrapper>
    );
}
