"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import ItemForm from "@/components/closet/ItemForm";
import { addItem, ClothingItem, getPCAProfile } from "@/lib/db";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
    const [isAddingItem, setIsAddingItem] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const [checkingPCA, setCheckingPCA] = useState(true);

    useEffect(() => {
        checkPCAStatus();
    }, [pathname]);

    const checkPCAStatus = async () => {
        // Don't check if we are already on the PCA page or hidden routes
        if (pathname === '/pca' || pathname === '/settings') {
            setCheckingPCA(false);
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
        } finally {
            setCheckingPCA(false);
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

    return (
        <>
            <Navbar onAddClick={() => setIsAddingItem(true)} />
            <main className="min-h-screen pb-24 pt-4 md:pt-24 px-4 md:px-12 max-w-7xl mx-auto">
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
