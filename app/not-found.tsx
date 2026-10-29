import Link from "next/link";
import Image from "next/image";
import FestivalButton from "@/components/ui/FestivalButton";
import SectionBadge from "@/components/ui/SectionBadge";
import { ArrowLeft, Puzzle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-white flex flex-col justify-between p-4 sm:p-6 selection:bg-primary selection:text-black">
      <header className="w-full max-w-container-max mx-auto flex items-center justify-between py-2 px-margin-mobile lg:px-margin-desktop">
        <Link href="/" className="relative h-8 sm:h-9 w-36 sm:w-44 block">
          <Image
            src="/long-logo-removebg-preview.png"
            alt="Sri Lanka FinTech Festival"
            fill
            className="object-contain object-left"
            priority
          />
        </Link>

        <SectionBadge variant="primary">404</SectionBadge>
      </header>

      <main className="my-auto max-w-xl mx-auto w-full text-center space-y-6 relative z-10 py-12 px-4">
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
            Page not found
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            This page doesn&apos;t exist
          </h1>
          <p className="text-sm sm:text-base text-white/70 max-w-md mx-auto leading-relaxed">
            The link may be outdated, or the page has moved. Head back to the game or puzzles hub.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <FestivalButton href="/game" className="w-full sm:w-auto text-xs uppercase tracking-wider">
            Enter Arena
          </FestivalButton>

          <FestivalButton
            href="/puzzles"
            variant="outline"
            className="w-full sm:w-auto text-xs uppercase tracking-wider"
          >
            <Puzzle size={16} aria-hidden />
            Daily Puzzles
          </FestivalButton>

          <FestivalButton
            href="/"
            variant="secondary"
            className="w-full sm:w-auto text-xs uppercase tracking-wider"
          >
            <ArrowLeft size={15} aria-hidden />
            Home
          </FestivalButton>
        </div>
      </main>

      <footer className="text-center text-xs font-mono text-white/40 py-2">
        Sri Lanka FinTech Festival 2026
      </footer>
    </div>
  );
}
