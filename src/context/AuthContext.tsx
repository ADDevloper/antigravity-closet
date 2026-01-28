"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check active sessions and sets the user
        const checkUser = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            if (error) {
                console.error('Error fetching session:', error);
            }
        };

        checkUser();

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);

                if (_event === 'SIGNED_IN') {
                    router.refresh();
                }

                if (_event === 'SIGNED_OUT') {
                    router.push('/login');
                    router.refresh();
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    // Protect routes - if not logged in and not on login/signup pages, redirect to login
    useEffect(() => {
        if (!loading) {
            const publicRoutes = ['/login', '/signup', '/landing'];
            const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

            if (!user && !isPublicRoute) {
                router.push('/login');
            }
        }
    }, [user, loading, pathname, router]);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
