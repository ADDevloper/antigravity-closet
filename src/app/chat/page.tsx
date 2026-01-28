"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChatPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to home page (merged Stylist Chat)
        router.replace("/");
    }, [router]);

    return null;
}
