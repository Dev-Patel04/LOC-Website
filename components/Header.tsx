"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <header className="sticky top-0 z-50 bg-loc-bg/95 backdrop-blur-sm border-b border-loc-border">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
          <button 
            onClick={() => setMenuOpen(true)}
            className="text-loc-muted hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <Link href="/scores" className="text-center">
            <h1 className="text-sm font-bold tracking-wider uppercase">LOC Basketball League</h1>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-loc-live animate-pulse" />
              <span className="text-[10px] tracking-widest text-loc-live uppercase font-medium">
                Live Sync Active
              </span>
            </div>
          </Link>

          <button className="text-loc-muted hover:text-white transition-colors relative">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </button>
        </div>
      </header>

      {/* Slide-out Menu Overlay */}
      {menuOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setMenuOpen(false)}
        >
          <div 
            className="fixed inset-y-0 left-0 w-64 bg-loc-card shadow-2xl p-6 flex flex-col transform transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8 border-b border-loc-border pb-4">
              <h2 className="text-lg font-bold tracking-wider uppercase">Menu</h2>
              <button 
                onClick={() => setMenuOpen(false)}
                className="text-loc-muted hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <nav className="flex flex-col gap-6 text-sm font-semibold tracking-wider flex-1">
              <Link href="/games" onClick={() => setMenuOpen(false)} className="hover:text-loc-accent transition-colors">Games</Link>
              <Link href="/scores" onClick={() => setMenuOpen(false)} className="hover:text-loc-accent transition-colors">Scores</Link>
              <Link href="/news" onClick={() => setMenuOpen(false)} className="hover:text-loc-accent transition-colors">News</Link>
              <Link href="/stats" onClick={() => setMenuOpen(false)} className="hover:text-loc-accent transition-colors">Stats</Link>
            </nav>

            <div className="mt-auto border-t border-loc-border pt-6">
              <Link 
                href="/admin" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-loc-muted hover:text-white transition-colors text-sm font-medium"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
