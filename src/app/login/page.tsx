"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Github, Chrome, Sparkles, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            toast.success("Welcome back!");
            router.push("/closet");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to sign in");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (error: any) {
            toast.error(error.message || "Failed to start Google login");
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#F8FAFC]">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
                style={{ backgroundImage: 'url("/images/login-bg.png")' }}
            >
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-[440px] px-6"
            >
                <div className="bg-white/80 backdrop-blur-xl rounded-[40px] p-8 md:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.1)] border border-white/50">
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 mb-6 rotate-3">
                            <Sparkles className="text-white" size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-poppins mb-2 text-center text-[32px]">
                            Antigravity Closet
                        </h1>
                        <p className="text-slate-500 font-medium text-center">
                            Your AI-powered high-end wardrobe
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-purple-600 transition-all font-medium text-slate-700"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                                <Link href="#" className="text-[12px] font-bold text-purple-600 hover:text-purple-700">Forgot?</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-purple-600 transition-all font-medium text-slate-700"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all active:scale-[0.98] disabled:opacity-70 mt-4 group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                        <div className="relative flex justify-center text-[12px] uppercase font-bold tracking-widest"><span className="px-4 bg-white/80 text-slate-400 backdrop-blur-sm">Or continue with</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={handleGoogleLogin}
                            className="flex items-center justify-center gap-2 py-3.5 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600"
                        >
                            <Chrome size={18} />
                            <span>Google</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 py-3.5 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600">
                            <Github size={18} />
                            <span>GitHub</span>
                        </button>
                    </div>

                    <p className="mt-8 text-center text-slate-500 font-medium">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-purple-600 font-bold hover:underline">
                            Sign up free
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
