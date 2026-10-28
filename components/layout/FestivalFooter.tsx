import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export default function FestivalFooter() {
  return (
    <footer className="relative z-10 w-full overflow-hidden border-t-2 border-white/10 bg-[#06061f]">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -bottom-32 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-t from-[#fec01f]/10 to-transparent blur-3xl opacity-50" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 lg:gap-12">
          {/* Brand Info */}
          <div className="flex flex-col gap-4 md:col-span-5">
            <Link href="/" className="w-fit">
              <div className="relative h-12 w-52 sm:w-64">
                <Image
                  src="/long-logo-removebg-preview.png"
                  alt="Sri Lanka FinTech Festival"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="font-mono text-xs uppercase tracking-widest text-[#fec01f]">
              Sri Lanka FinTech Festival 2026 · Colombo
            </p>
            <p className="text-sm leading-relaxed text-white/70 max-w-md">
              Building Capacity. Creating Opportunities. Scaling Sri Lanka&#39;s Digital Future.
              Connecting financial institutions, tech builders, policymakers, and innovators.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.linkedin.com/company/sri-lanka-fintech-festival/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg border border-white/20 bg-white/5 flex items-center justify-center text-white/80 hover:border-[#fec01f] hover:text-[#fec01f] hover:bg-[#fec01f]/10 transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/slfintechfest/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg border border-white/20 bg-white/5 flex items-center justify-center text-white/80 hover:border-[#fec01f] hover:text-[#fec01f] hover:bg-[#fec01f]/10 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://fintechfestival.lk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg border border-white/20 bg-white/5 flex items-center justify-center text-white/80 hover:border-[#fec01f] hover:text-[#fec01f] hover:bg-[#fec01f]/10 transition-colors"
                aria-label="Website"
              >
                <ArrowUpRight size={18} />
              </a>
            </div>
          </div>

          {/* Festival Links */}
          <div className="md:col-span-3 sm:col-span-6">
            <p className="font-mono text-xs uppercase tracking-widest text-white/90 mb-4 font-bold">
              The Festival
            </p>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li>
                <a
                  href="https://fintechfestival.lk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#fec01f] transition-colors inline-flex items-center gap-1"
                >
                  fintechfestival.lk
                  <ArrowUpRight size={12} className="opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://fintechfestival.lk/agenda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#fec01f] transition-colors inline-flex items-center gap-1"
                >
                  Agenda &amp; Tracks
                  <ArrowUpRight size={12} className="opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://fintechfestival.lk/speakers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#fec01f] transition-colors inline-flex items-center gap-1"
                >
                  Speakers
                  <ArrowUpRight size={12} className="opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://fintechfestival.lk/exhibition"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#fec01f] transition-colors inline-flex items-center gap-1"
                >
                  Exhibition &amp; Pavilions
                  <ArrowUpRight size={12} className="opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Game Links */}
          <div className="md:col-span-4 sm:col-span-6">
            <p className="font-mono text-xs uppercase tracking-widest text-white/90 mb-4 font-bold">
              Lanka FinTechverse
            </p>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li>
                <Link href="/" className="hover:text-[#fec01f] transition-colors">
                  Game Arena Home
                </Link>
              </li>
              <li>
                <Link href="/game" className="hover:text-[#fec01f] transition-colors">
                  Play Snakes &amp; Ladders
                </Link>
              </li>
              <li>
                <Link href="/puzzles" className="hover:text-[#fec01f] transition-colors">
                  LinkedIn Puzzles Arena
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-[#fec01f] transition-colors">
                  Live Festival Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#fec01f] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#fec01f] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>

            <div className="mt-5 p-3.5 rounded-xl border border-white/10 bg-white/[0.03]">
              <p className="text-xs text-white/60 leading-relaxed">
                Official promotional game of the Sri Lanka FinTech Festival 2026. One official game run per player account.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4">
            <p>© 2026 Sri Lanka FinTech Festival. All rights reserved.</p>
            <span className="hidden sm:inline text-white/20">|</span>
            <Link href="/privacy" className="hover:text-[#fec01f] transition-colors">
              Privacy Policy
            </Link>
            <span className="text-white/20">·</span>
            <Link href="/terms" className="hover:text-[#fec01f] transition-colors">
              Terms of Service
            </Link>
          </div>
          <p className="font-mono text-[11px] tracking-wider uppercase text-center md:text-right">
            Powered by Sri Lanka FinTech Community &amp; Partners
          </p>
        </div>
      </div>
    </footer>
  );
}
