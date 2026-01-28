import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
});
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Closet | Your AI Fashion Designer",
  description: "Manage your clothes and get personal styling advice with AI",
  manifest: "/manifest.json",
  icons: {
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#9333ea",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${plusJakarta.variable} ${playfair.variable} ${manrope.variable} font-sans antialiased bg-[#F2F2F7] text-slate-900`}>
        <AuthProvider>
          {children}
          <ToastContainer position="bottom-right" autoClose={3000} />
        </AuthProvider>
      </body>
    </html>
  );
}
