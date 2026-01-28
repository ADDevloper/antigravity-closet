"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleAuth = async () => {
            const { error } = await supabase.auth.getSession();
            if (error) {
                console.error('Error during auth callback:', error.message);
                router.push('/login');
            } else {
                router.push('/closet');
            }
        };

        handleAuth();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                <p className="text-slate-500 font-bold animate-pulse">Authenticating your session...</p>
            </div>
        </div>
    );
}
