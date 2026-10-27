"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import { Trophy, Menu, X, ArrowUpRight, LogOut, Play, User as UserIcon } from "lucide-react";

interface FestivalHeaderProps {
  user?: User | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
  signingIn?: boolean;
  activePath?: string;
}

export default function FestivalHeader({
  user,
  onSignIn,
  onSignOut,
  signingIn = false,
  activePath = "/",
}: FestivalHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#06061f]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Festival Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 group transition-opacity hover:opacity-95"
            aria-label="Sri Lanka FinTech Festival Home"
          >
            <div className="relative h-9 sm:h-12 w-36 sm:w-52">
              <Image
                src="/long-logo-removebg-preview.png"
                alt="Sri Lanka FinTech Festival"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>
          <span className="hidden lg:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[#fec01f]/10 text-[#fec01f] border border-[#fec01f]/30">
            Game Arena
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav
          aria-label="Festival Primary"
          className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-mono uppercase tracking-widest text-white/80"
        >
          <a
            href="https://fintechfestival.lk/agenda"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-[#fec01f] transition-colors py-1"
          >
            Agenda
            <ArrowUpRight size={12} className="opacity-60" />
          </a>
          <a
            href="https://fintechfestival.lk/speakers"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-[#fec01f] transition-colors py-1"
          >
            Speakers
            <ArrowUpRight size={12} className="opacity-60" />
          </a>
          <a
            href="https://fintechfestival.lk/exhibition"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-[#fec01f] transition-colors py-1"
          >
            Exhibition
            <ArrowUpRight size={12} className="opacity-60" />
          </a>
          <Link
            href="/leaderboard"
            className={`inline-flex items-center gap-1.5 transition-colors py-1 ${
              activePath === "/leaderboard"
                ? "text-[#fec01f] font-bold border-b-2 border-[#fec01f]"
                : "hover:text-[#fec01f]"
            }`}
          >
            <Trophy size={13} className="text-[#fec01f]" />
            Leaderboard
          </Link>
        </nav>

        {/* User Status / Action Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/game"
                className="interactive-btn interactive-btn--primary text-xs sm:text-sm font-bold uppercase tracking-wider py-2 px-3 sm:px-4"
              >
                <Play size={14} className="fill-current" />
                <span>Play Game</span>
              </Link>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  title="Sign out"
                  className="p-2 rounded-lg border border-white/15 bg-white/5 text-white/70 hover:text-white hover:border-[#fec01f] transition-colors"
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>
          ) : (
            onSignIn && (
              <button
                onClick={onSignIn}
                disabled={signingIn}
                className="interactive-btn interactive-btn--primary text-xs sm:text-sm font-bold uppercase tracking-wider py-2 px-3.5 sm:px-5 disabled:opacity-60"
              >
                <svg className="w-4 h-4 mr-1 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {signingIn ? "Connecting…" : "Sign In with Google"}
              </button>
            )
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg border border-white/15 bg-white/5 text-white hover:border-[#fec01f] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#06061f] px-4 py-4 space-y-3 animate-slide-up">
          <nav className="flex flex-col space-y-2 text-sm font-mono uppercase tracking-wider text-white/80">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/5 hover:text-[#fec01f] transition-colors"
            >
              Home
            </Link>
            <Link
              href="/game"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/5 hover:text-[#fec01f] transition-colors"
            >
              Play Game
            </Link>
            <Link
              href="/leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/5 hover:text-[#fec01f] transition-colors"
            >
              Leaderboard
            </Link>
            <a
              href="https://fintechfestival.lk/agenda"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 hover:text-[#fec01f] transition-colors"
            >
              Festival Agenda
              <ArrowUpRight size={14} />
            </a>
            <a
              href="https://fintechfestival.lk/speakers"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 hover:text-[#fec01f] transition-colors"
            >
              Speakers
              <ArrowUpRight size={14} />
            </a>
            <a
              href="https://fintechfestival.lk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 hover:text-[#fec01f] transition-colors"
            >
              Main Website
              <ArrowUpRight size={14} />
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
