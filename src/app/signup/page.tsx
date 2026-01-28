"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Mail, Lock, ArrowRight, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                    },
                },
            });

            if (error) throw error;

            if (data.session) {
                toast.success("Account created successfully!");
                router.push("/closet");
            } else {
                toast.info("Please check your email to confirm your account.");
                router.push("/login");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to sign up");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#F8FAFC]">
            {/* Background Decor */}
            <div className="absolute inset-0 z-0 opacity-[0.4]" style={{ backgroundImage: 'url("/images/login-bg.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-slate-50" />
            </div>

            {/* Floating Elements */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 right-[15%] w-24 h-24 bg-purple-100 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-20 left-[10%] w-32 h-32 bg-blue-100 rounded-full blur-3xl"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-[480px] px-6 py-12"
            >
                <div className="bg-white/90 backdrop-blur-2xl rounded-[48px] p-8 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-white">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 mb-6 rotate-6 group">
                            <Sparkles className="text-white group-hover:rotate-12 transition-transform" size={28} />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-poppins mb-2 text-[32px]">
                            Join the Studio
                        </h1>
                        <p className="text-slate-500 font-medium text-center max-w-[280px]">
                            Elevate your personal style with the future of wardrobe management
                        </p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-1">Your Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={18} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50/80 border-2 border-slate-100/50 rounded-2xl focus:outline-none focus:border-purple-600 focus:bg-white transition-all font-medium text-slate-700"
                                    placeholder="Alexander McQueen"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-1">Work Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50/80 border-2 border-slate-100/50 rounded-2xl focus:outline-none focus:border-purple-600 focus:bg-white transition-all font-medium text-slate-700"
                                    placeholder="alexander@studio.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-1">Define Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50/80 border-2 border-slate-100/50 rounded-2xl focus:outline-none focus:border-purple-600 focus:bg-white transition-all font-medium text-slate-700"
                                    placeholder="Min. 8 characters"
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>

                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-2">
                            {[
                                "Sync across all devices",
                                "Advanced Personal Color Analysis",
                                "Unlimited closet storage",
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-2 text-[12px] font-bold text-slate-500">
                                    <CheckCircle2 size={14} className="text-green-500" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-slate-100 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 mt-6 group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-slate-500 font-medium text-sm">
                        Already a member?{" "}
                        <Link href="/login" className="text-purple-600 font-bold hover:underline">
                            Log in here
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
