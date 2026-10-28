import Link from "next/link";
import Image from "next/image";
import { Gamepad2, ArrowLeft, Puzzle, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#06061f] text-white flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden selection:bg-[#fec01f] selection:text-black">
      {/* Background radial glows */}
      <div className="pointer-events-none absolute w-[500px] h-[500px] rounded-full bg-radial from-[#fec01f]/10 via-[#125252]/15 to-transparent blur-3xl -top-24 left-1/2 -translate-x-1/2" />
      <div className="pointer-events-none absolute w-[400px] h-[400px] rounded-full bg-radial from-[#8d1739]/20 to-transparent blur-3xl -bottom-24 right-10" />

      {/* Top Navbar Header */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between py-2">
        <Link href="/" className="relative h-8 sm:h-9 w-36 sm:w-44 block">
          <Image
            src="/long-logo-removebg-preview.png"
            alt="Sri Lanka FinTech Festival"
            fill
            className="object-contain object-left"
            priority
          />
        </Link>

        <span className="section-badge section-badge-primary">
          GRID HAZARD · 404
        </span>
      </header>

      {/* Main 404 Visual Content */}
      <main className="my-auto max-w-xl mx-auto w-full text-center space-y-6 relative z-10 py-12">
        {/* Hologram Circle */}
        <div className="relative mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-[#8d1739]/30 via-black to-[#125252]/30 border-2 border-white/20 flex items-center justify-center text-[#fec01f] shadow-[0_0_50px_rgba(254,192,31,0.2)]">
          <Compass size={44} className="animate-spin text-[#fec01f]" style={{ animationDuration: "12s" }} />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-[#fec01f] font-bold">
            Square 404 // Out of Bounds
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Lost in the FinTechverse
          </h1>
          <p className="text-sm sm:text-base text-white/70 max-w-md mx-auto leading-relaxed">
            You&apos;ve rolled beyond the 25-square arena grid. The coordinate you requested does not exist or has relocated.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/game"
            className="w-full sm:w-auto h-12 px-6 rounded-xl interactive-btn interactive-btn--primary font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(254,192,31,0.35)]"
          >
            <Gamepad2 size={16} />
            <span>Launch Arena</span>
          </Link>

          <Link
            href="/puzzles"
            className="w-full sm:w-auto h-12 px-6 rounded-xl interactive-btn interactive-btn--outline font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2"
          >
            <Puzzle size={16} />
            <span>Daily Puzzles</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto h-12 px-5 rounded-xl border border-white/10 hover:border-white/30 text-white/70 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={15} />
            <span>Home</span>
          </Link>
        </div>
      </main>

      {/* Footer minimal info */}
      <footer className="text-center text-xs font-mono text-white/40 py-2">
        Sri Lanka FinTech Festival 2026 · Digital Finance Arena
      </footer>
    </div>
  );
}
