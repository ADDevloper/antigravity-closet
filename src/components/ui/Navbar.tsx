"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Shirt, PlusCircle, MessageSquare, Calendar, Palette, User } from "lucide-react";

interface NavbarProps {
    onAddClick: () => void;
}

export default function Navbar({ onAddClick }: NavbarProps) {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Home", icon: Home },
        { href: "/chat", label: "Assistant", icon: MessageSquare },
        { href: "/closet", label: "Closet", icon: Shirt },
        { href: "/calendar", label: "Plan", icon: Calendar },
        { href: "/profile", label: "Me", icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 px-6 py-3 flex justify-around items-center z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b md:px-12">
            <div className="hidden md:block font-poppins font-bold text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                CLOSET
            </div>

            <div className="flex gap-8 items-center">
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
                            <span className="text-[10px] font-medium uppercase tracking-wider md:text-sm md:normal-case md:tracking-normal">
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>

            <button
                onClick={onAddClick}
                className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all active:scale-95 md:rounded-xl md:px-6 md:py-2 md:flex md:items-center md:gap-2"
            >
                <PlusCircle size={24} />
                <span className="hidden md:inline font-medium">Add Item</span>
            </button>
        </nav>
    );
}
