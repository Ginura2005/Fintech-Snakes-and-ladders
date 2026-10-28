"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import {
  Trophy,
  Menu,
  X,
  ExternalLink,
  LogOut,
  Play,
  Gamepad2,
  Puzzle,
  User as UserIcon,
  Sparkles,
} from "lucide-react";

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
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#06061f]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Festival Logo */}
        <div className="flex items-center shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 group transition-opacity hover:opacity-95"
            aria-label="Sri Lanka FinTech Festival Home"
          >
            <div className="relative h-8 sm:h-9 w-32 sm:w-44">
              <Image
                src="/long-logo-removebg-preview.png"
                alt="Sri Lanka FinTech Festival"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Desktop Navigation — Icon-forward, concise labels, zero text bloat */}
        <nav
          aria-label="Arena Navigation"
          className="hidden md:flex items-center gap-1 sm:gap-2 lg:gap-3 text-xs font-mono uppercase tracking-wider"
        >
          <Link
            href="/game"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activePath === "/game"
                ? "bg-[#fec01f]/15 text-[#fec01f] border border-[#fec01f]/40 font-bold"
                : "text-white/75 hover:text-white hover:bg-white/5"
            }`}
          >
            <Gamepad2 size={15} className="shrink-0" />
            <span>Arena</span>
          </Link>

          <Link
            href="/puzzles"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activePath === "/puzzles"
                ? "bg-[#fec01f]/15 text-[#fec01f] border border-[#fec01f]/40 font-bold"
                : "text-white/75 hover:text-white hover:bg-white/5"
            }`}
          >
            <Puzzle size={15} className="shrink-0" />
            <span>Puzzles</span>
          </Link>

          <Link
            href="/leaderboard"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activePath === "/leaderboard"
                ? "bg-[#fec01f]/15 text-[#fec01f] border border-[#fec01f]/40 font-bold"
                : "text-white/75 hover:text-white hover:bg-white/5"
            }`}
          >
            <Trophy size={15} className="shrink-0 text-[#fec01f]" />
            <span>Ranks</span>
          </Link>

          <a
            href="https://fintechfestival.lk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/60 hover:text-[#fec01f] hover:bg-white/5 transition-all"
            title="Main Festival Website"
          >
            <ExternalLink size={14} className="shrink-0 opacity-70" />
            <span>Festival</span>
          </a>
        </nav>

        {/* User Status / Action Buttons — Proportioned, balanced height */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/game"
                className="h-9 px-3.5 sm:px-4 rounded-xl bg-[#fec01f] hover:bg-[#e5ac1b] text-black font-semibold text-xs tracking-wider uppercase inline-flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Play size={13} className="fill-current" />
                <span>Play</span>
              </Link>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  title="Sign out"
                  className="h-9 w-9 rounded-xl border border-white/15 bg-white/5 text-white/70 hover:text-white hover:border-[#fec01f] flex items-center justify-center transition-colors active:scale-95"
                  aria-label="Sign out"
                >
                  <LogOut size={15} />
                </button>
              )}
            </div>
          ) : (
            onSignIn && (
              <button
                onClick={onSignIn}
                disabled={signingIn}
                className="h-9 px-3.5 sm:px-4 rounded-xl bg-[#fec01f] hover:bg-[#e5ac1b] text-black font-semibold text-xs tracking-wide inline-flex items-center gap-2 shadow-sm active:scale-95 transition-all disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>{signingIn ? "Connecting…" : "Sign In"}</span>
              </button>
            )
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden h-9 w-9 rounded-xl border border-white/15 bg-white/5 text-white/80 hover:text-white hover:border-[#fec01f] flex items-center justify-center transition-colors active:scale-95"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#06061f] px-4 py-4 space-y-2 animate-slide-up">
          <nav className="flex flex-col space-y-1 text-sm font-mono uppercase tracking-wider text-white/80">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg hover:bg-white/5 hover:text-[#fec01f] transition-colors flex items-center gap-2.5"
            >
              <Sparkles size={16} className="text-[#fec01f]" />
              <span>Home</span>
            </Link>
            <Link
              href="/game"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg hover:bg-white/5 hover:text-[#fec01f] transition-colors flex items-center gap-2.5"
            >
              <Gamepad2 size={16} className="text-teal-400" />
              <span>Game Arena</span>
            </Link>
            <Link
              href="/game?mode=practice"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg hover:bg-white/5 text-teal-300 hover:text-teal-200 transition-colors flex items-center gap-2.5"
            >
              <Play size={16} />
              <span>Practice Mode</span>
            </Link>
            <Link
              href="/puzzles"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg hover:bg-white/5 hover:text-[#fec01f] transition-colors flex items-center gap-2.5"
            >
              <Puzzle size={16} className="text-[#fec01f]" />
              <span>FinTech Puzzles</span>
            </Link>
            <Link
              href="/leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg hover:bg-white/5 hover:text-[#fec01f] transition-colors flex items-center gap-2.5"
            >
              <Trophy size={16} className="text-[#fec01f]" />
              <span>Leaderboard</span>
            </Link>
            <a
              href="https://fintechfestival.lk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/5 hover:text-[#fec01f] transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <ExternalLink size={16} />
                <span>Main Website</span>
              </span>
              <span className="text-xs text-white/40">fintechfestival.lk</span>
            </a>
          </nav>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50 px-3 font-mono">
            <Link
              href="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#fec01f] transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-white/20">·</span>
            <Link
              href="/terms"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#fec01f] transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
