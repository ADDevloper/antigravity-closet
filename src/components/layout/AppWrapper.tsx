"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import DesktopSidebar from "@/components/layout/DesktopSidebar";
import ItemForm from "@/components/closet/ItemForm";
import { addItem, ClothingItem, getPCAProfile } from "@/lib/db";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
    const [isAddingItem, setIsAddingItem] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkPCAStatus();
    }, [pathname]);

    const checkPCAStatus = async () => {
        // Don't check if we are already on the PCA page or hidden routes
        if (pathname === '/pca' || pathname === '/settings') {
            return;
        }

        try {
            const profile = await getPCAProfile();
            if (!profile) {
                // No profile found, force onboarding
                console.log("No PCA profile found, redirecting to onboarding...");
                router.replace('/pca');
            }
        } catch (e) {
            console.error("Error checking PCA status", e);
        }
    };

    const handleAddItems = async (items: ClothingItem[]) => {
        console.log(`Starting to add ${items.length} items to closet...`);
        try {
            for (const item of items) {
                console.log(`Adding item:`, item.category);
                await addItem(item);
            }
            console.log("All items added successfully!");
            setIsAddingItem(false);
            window.dispatchEvent(new CustomEvent('closet-updated'));
        } catch (error) {
            console.error("Critical error adding items to DB:", error);
            alert("Failed to save items. Check console for details.");
        }
    };

    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <>
            <DesktopSidebar
                onAddClick={() => setIsAddingItem(true)}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />
            <Navbar onAddClick={() => setIsAddingItem(true)} />
            <main className={`min-h-screen transition-all duration-300 ${isCollapsed ? "lg:pl-24" : "lg:pl-[288px]"
                } ${pathname === '/' ? '' : 'pb-24 pt-4 px-4 lg:pb-8 lg:pt-8 lg:pr-8 max-w-[1600px] lg:ml-0'}`}>
                {children}
            </main>
            {isAddingItem && (
                <ItemForm
                    onSave={handleAddItems}
                    onClose={() => setIsAddingItem(false)}
                />
            )}
        </>
    );
}
