"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Shirt, PlusCircle, MessageSquare, Calendar, User } from "lucide-react";

interface NavbarProps {
    onAddClick: () => void;
}

export default function Navbar({ onAddClick }: NavbarProps) {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Chat", icon: MessageSquare },
        { href: "/closet", label: "Wardrobe", icon: Shirt },
        { href: "/calendar", label: "Outfits", icon: Calendar },
        { href: "/profile", label: "Dashboard", icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 px-6 py-3 flex justify-around items-center z-50 lg:hidden">
            {links.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                    <Link
                        key={href}
                        href={href}
                        className={`flex flex-col items-center gap-1 transition-colors ${isActive ? "text-purple-600" : "text-slate-500 hover:text-slate-800"
                            }`}
                    >
                        <Icon size={24} />
                        <span className="text-[10px] font-medium uppercase tracking-wider">
                            {label}
                        </span>
                    </Link>
                );
            })}

            <button
                onClick={onAddClick}
                className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all active:scale-95"
            >
                <PlusCircle size={24} />
            </button>
        </nav>
    );
}
