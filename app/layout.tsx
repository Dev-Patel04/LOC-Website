import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LOC Basketball League",
  description: "Live basketball scores, stats, and updates for the LOC Basketball League",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-loc-bg min-h-screen`}>
        <Header />
        <main className="max-w-lg mx-auto pb-20">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
