"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, LayoutGrid, Shirt, Calendar, PlusCircle, PanelLeft, Sparkles } from "lucide-react";

interface DesktopSidebarProps {
    onAddClick: () => void;
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
}

export default function DesktopSidebar({ onAddClick, isCollapsed, setIsCollapsed }: DesktopSidebarProps) {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Stylist Chat", icon: MessageSquare },
        { href: "/closet", label: "My Wardrobe", icon: Shirt },
        { href: "/calendar", label: "Daily Outfits", icon: Calendar },
        { href: "/profile", label: "Dashboard", icon: LayoutGrid },
    ];

    return (
        <aside
            className={`hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:z-50 transition-all duration-300 ${isCollapsed ? "lg:w-20" : "lg:w-[288px]"
                }`}
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRight: '1px solid #E2E8F0'
            }}
        >
            {/* Logo & Toggle Section */}
            <div className={`px-6 py-6 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
                {!isCollapsed && (
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <span className="font-semibold text-[20px] text-[#1C1A2E] tracking-tight">
                            CLOSET
                        </span>
                    </div>
                )}

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-purple-600 transition-all"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    <PanelLeft size={20} className={isCollapsed ? "rotate-180" : ""} />
                </button>
            </div>
            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-2 space-y-1">
                {links.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all ${isActive
                                ? "bg-[#EDE9FE] text-[#7C3AED] font-semibold"
                                : "text-[#64748B] hover:bg-[#F9FAFB] hover:text-[#1C1A2E]"
                                } ${isCollapsed ? "justify-center" : ""}`}
                            title={isCollapsed ? label : undefined}
                        >
                            <Icon size={24} className="flex-shrink-0" strokeWidth={2} />
                            {!isCollapsed && <span className="text-[16px] font-medium">{label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Add Item Button */}
            <div className={`px-4 pb-12 transition-all duration-300 ${isCollapsed ? "flex justify-center" : ""}`}>
                <button
                    onClick={onAddClick}
                    className={`${isCollapsed ? "w-[48px]" : "w-full"
                        } flex items-center justify-center gap-2.5 h-[48px] rounded-[12px] bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white hover:from-[#7c3aed] hover:to-[#6d28d9] transition-all shadow-[0_4px_12px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.4)]`}
                    title={isCollapsed ? "Add Item" : undefined}
                >
                    <PlusCircle size={20} className="flex-shrink-0" strokeWidth={2.5} />
                    {!isCollapsed && <span className="text-[15px] font-semibold">Add Item</span>}
                </button>
            </div>
        </aside>
    );
}
