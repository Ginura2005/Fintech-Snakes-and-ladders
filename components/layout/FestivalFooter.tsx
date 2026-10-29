import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  MapPin,
  ArrowUpRight,
  MessageCircle,
} from "lucide-react";

export default function FestivalFooter() {
  return (
    <footer className="relative z-10 w-full overflow-hidden border-t-[3px] border-black bg-[#06061f]">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -bottom-36 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-t from-[#fec01f]/10 to-transparent blur-3xl opacity-40" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 lg:pt-20">
        {/* Main Grid: 12 Columns */}
        <div className="grid grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Brand & Mission Column (col-span-5) */}
          <div className="flex min-w-0 flex-col gap-5 sm:gap-6 lg:col-span-5">
            <a
              href="https://fintechfestival.lk"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sri Lanka FinTech Festival home"
              className="w-fit max-w-full"
              data-cursor="link"
            >
              <div className="relative h-12 w-56 sm:h-16 sm:w-72 lg:h-20 lg:w-80">
                <Image
                  src="/long-logo-removebg-preview.png"
                  alt="Sri Lanka FinTech Festival"
                  fill
                  className="object-contain object-left"
                  priority={false}
                />
              </div>
            </a>

            <p className="text-xs uppercase tracking-widest text-white sm:text-sm font-bold font-mono">
              Sri Lanka FinTech Festival 2026
            </p>

            <p className="max-w-sm text-sm leading-relaxed text-white/75">
              Building Capacity. Creating Opportunities. Scaling Sri Lanka&#39;s Digital Future.
            </p>

            {/* Social Media Button Icons */}
            <nav aria-label="Social media" className="flex flex-wrap gap-2.5 sm:gap-3">
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/sri-lanka-fintech-festival/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                data-cursor="link"
                className="group inline-flex h-11 w-11 items-center justify-center border-[3px] border-white/25 bg-white/5 transition-all hover:border-[#fec01f] hover:bg-[#fec01f] hover:text-black text-white sm:h-12 sm:w-12 rounded-none"
              >
                <svg className="h-5 w-5 fill-current transition-colors group-hover:fill-black" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/fintechfestival.lk/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                data-cursor="link"
                className="group inline-flex h-11 w-11 items-center justify-center border-[3px] border-white/25 bg-white/5 transition-all hover:border-[#fec01f] hover:bg-[#fec01f] hover:text-black text-white sm:h-12 sm:w-12 rounded-none"
              >
                <svg className="h-5 w-5 fill-current transition-colors group-hover:fill-black" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/@SriLankaFintechFestival"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                data-cursor="link"
                className="group inline-flex h-11 w-11 items-center justify-center border-[3px] border-white/25 bg-white/5 transition-all hover:border-[#fec01f] hover:bg-[#fec01f] hover:text-black text-white sm:h-12 sm:w-12 rounded-none"
              >
                <svg className="h-5 w-5 fill-current transition-colors group-hover:fill-black" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/FintechFestival.lk/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                data-cursor="link"
                className="group inline-flex h-11 w-11 items-center justify-center border-[3px] border-white/25 bg-white/5 transition-all hover:border-[#fec01f] hover:bg-[#fec01f] hover:text-black text-white sm:h-12 sm:w-12 rounded-none"
              >
                <svg className="h-5 w-5 fill-current transition-colors group-hover:fill-black" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* Threads */}
              <a
                href="https://www.threads.com/@fintechfestival.lk"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Threads"
                data-cursor="link"
                className="group inline-flex h-11 w-11 items-center justify-center border-[3px] border-white/25 bg-white/5 transition-all hover:border-[#fec01f] hover:bg-[#fec01f] hover:text-black text-white sm:h-12 sm:w-12 rounded-none"
              >
                <svg
                  className="h-5 w-5 fill-current transition-colors group-hover:fill-black"
                  viewBox="0 0 192 192"
                >
                  <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4384 44.7442 97.315 44.7438 97.1915 44.7438C82.2676 44.7438 70.218 51.5284 63.2686 63.8344L77.0163 71.9568C81.996 63.1388 90.5289 59.9839 97.1915 59.9839C111.459 59.9839 122.288 69.5898 123.837 89.066C116.368 87.4111 108.064 86.8203 99.071 87.2798C68.9663 88.8184 50.8872 105.132 52.0195 127.279C53.0769 148.047 70.8143 162.256 93.3032 162.256C112.597 162.256 125.688 153.251 133.208 141.341C137.777 153.947 149.257 162.256 164.218 162.256C176.626 162.256 186.299 156.452 192 147.228L179.37 137.728C176.656 142.062 171.492 144.756 164.218 144.756C153.763 144.756 148.337 138.414 148.337 126.177V125.266C148.337 124.972 148.339 124.679 148.342 124.385C148.91 123.639 149.52 122.923 150.169 122.235C163.639 108.006 162.973 89.8735 141.537 88.9883ZM133.067 114.73C131.229 116.671 129.072 118.423 126.634 119.957C122.392 122.628 116.903 124.081 110.457 124.41C95.5323 125.172 87.625 116.643 87.0315 105.034C86.438 93.4248 93.3444 86.8203 104.996 86.2268C114.887 85.7225 124.492 88.085 133.398 93.3768C134.116 100.865 134.004 108.106 133.067 114.73Z" />
                </svg>
              </a>
            </nav>
          </div>

          {/* Navigation Links Columns (col-span-7) */}
          <div className="grid min-w-0 grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 sm:gap-x-8 lg:col-span-7 lg:gap-x-6">
            {/* Column 1: Explore */}
            <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
              <p className="font-mono text-[11px] uppercase tracking-widest text-[#fec01f] font-bold">
                Explore
              </p>
              <nav className="flex flex-col gap-2.5 sm:gap-2">
                <a
                  href="https://fintechfestival.lk"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="link"
                  className="text-sm text-white/80 transition-colors hover:text-[#fec01f] inline-flex items-center gap-1"
                >
                  The Festival
                  <ArrowUpRight size={12} className="opacity-60" />
                </a>
                <a
                  href="https://fintechfestival.lk/agenda"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="link"
                  className="text-sm text-white/80 transition-colors hover:text-[#fec01f] inline-flex items-center gap-1"
                >
                  Agenda
                  <ArrowUpRight size={12} className="opacity-60" />
                </a>
                <a
                  href="https://fintechfestival.lk/speakers"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="link"
                  className="text-sm text-white/80 transition-colors hover:text-[#fec01f] inline-flex items-center gap-1"
                >
                  Speakers
                  <ArrowUpRight size={12} className="opacity-60" />
                </a>
                <a
                  href="https://fintechfestival.lk/exhibition"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="link"
                  className="text-sm text-white/80 transition-colors hover:text-[#fec01f] inline-flex items-center gap-1"
                >
                  Exhibition
                  <ArrowUpRight size={12} className="opacity-60" />
                </a>
                <a
                  href="https://fintechfestival.lk/awards"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="link"
                  className="text-sm text-white/80 transition-colors hover:text-[#fec01f] inline-flex items-center gap-1"
                >
                  Awards
                  <ArrowUpRight size={12} className="opacity-60" />
                </a>
                <a
                  href="https://fintechfestival.lk/media"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="link"
                  className="text-sm text-white/80 transition-colors hover:text-[#fec01f] inline-flex items-center gap-1"
                >
                  Media
                  <ArrowUpRight size={12} className="opacity-60" />
                </a>
              </nav>
            </div>

            {/* Column 2: Participate & Arena */}
            <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
              <p className="font-mono text-[11px] uppercase tracking-widest text-[#fec01f] font-bold">
                Participate
              </p>
              <nav className="flex flex-col gap-2.5 sm:gap-2">
                <Link
                  href="/game"
                  data-cursor="link"
                  className="text-sm text-white/80 transition-colors hover:text-[#fec01f]"
                >
                  Snakes &amp; Ladders
                </Link>
                <Link
                  href="/leaderboard"
                  data-cursor="link"
                  className="text-sm text-white/80 transition-colors hover:text-[#fec01f]"
                >
                  Live Leaderboard
                </Link>
                <Link
                  href="/daily-puzzle"
                  data-cursor="link"
                  className="text-sm text-white/80 transition-colors hover:text-[#fec01f]"
                >
                  FinTech Codex Puzzles
                </Link>
                <Link
                  href="/profile"
                  data-cursor="link"
                  className="text-sm text-white/80 transition-colors hover:text-[#fec01f]"
                >
                  Player Profile
                </Link>
                <a
                  href="https://fintechfestival.lk/tickets"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="link"
                  className="text-sm text-white/80 transition-colors hover:text-[#fec01f] inline-flex items-center gap-1"
                >
                  Tickets
                  <ArrowUpRight size={12} className="opacity-60" />
                </a>
                <a
                  href="https://fintechfestival.lk/sponsors"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="link"
                  className="text-sm text-white/80 transition-colors hover:text-[#fec01f] inline-flex items-center gap-1"
                >
                  Sponsors
                  <ArrowUpRight size={12} className="opacity-60" />
                </a>
              </nav>
            </div>

            {/* Column 3: Connect */}
            <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
              <p className="font-mono text-[11px] uppercase tracking-widest text-[#fec01f] font-bold">
                Connect
              </p>
              <nav className="flex flex-col gap-2.5 sm:gap-2">
                <a
                  href="https://fintechfestival.lk/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="link"
                  className="text-sm text-white/80 transition-colors hover:text-[#fec01f] inline-flex items-center gap-1"
                >
                  About Us
                  <ArrowUpRight size={12} className="opacity-60" />
                </a>
                <a
                  href="https://fintechfestival.lk/links"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="link"
                  className="text-sm text-white/80 transition-colors hover:text-[#fec01f] inline-flex items-center gap-1"
                >
                  Official Links
                  <ArrowUpRight size={12} className="opacity-60" />
                </a>
                <a
                  href="https://fintechfestival.lk/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="link"
                  className="text-sm text-white/80 transition-colors hover:text-[#fec01f] inline-flex items-center gap-1"
                >
                  Contact Us
                  <ArrowUpRight size={12} className="opacity-60" />
                </a>
                <a
                  href="https://www.linkedin.com/company/sri-lanka-fintech-festival/"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="link"
                  className="text-sm text-white/80 transition-colors hover:text-[#fec01f] inline-flex items-center gap-1"
                >
                  LinkedIn
                  <ArrowUpRight size={12} className="opacity-60" />
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* 3-Card Official Contact Strip */}
        <div className="mt-10 mb-5 grid grid-cols-1 gap-px border-2 border-white/15 bg-white/15 sm:mt-12 sm:mb-7 sm:grid-cols-2 lg:mt-14 lg:mb-8 lg:grid-cols-3">
          {/* Card 1: Sales WhatsApp */}
          <a
            href="https://wa.me/94777930472?text=Hi%2C%20I'd%20like%20to%20know%20more%20about%20Sri%20Lanka%20FinTech%20Festival%202026."
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with sales on WhatsApp, +94 77 793 0472"
            data-cursor="link"
            className="group flex min-w-0 items-center gap-4 bg-[#06061f] p-4 transition-colors hover:bg-[#0d0d2e] sm:p-5 lg:px-6"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-white/20 bg-white/5 text-white transition-colors group-hover:border-[#fec01f] group-hover:bg-[#fec01f] group-hover:text-black">
              <MessageCircle className="h-5 w-5" />
            </span>
            <span className="flex min-w-0 flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/50 sm:text-[11px]">
                Sales WhatsApp
              </span>
              <span className="font-heading text-sm font-bold text-white transition-colors group-hover:text-[#fec01f] sm:text-base">
                +94 77 793 0472
              </span>
            </span>
          </a>

          {/* Card 2: Sales Email */}
          <a
            href="mailto:sales@fintechfestival.lk"
            aria-label="Email sales at sales@fintechfestival.lk"
            data-cursor="link"
            className="group flex min-w-0 items-center gap-4 bg-[#06061f] p-4 transition-colors hover:bg-[#0d0d2e] sm:p-5 lg:px-6"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-white/20 bg-white/5 text-white transition-colors group-hover:border-[#fec01f] group-hover:bg-[#fec01f] group-hover:text-black">
              <Mail className="h-5 w-5" />
            </span>
            <span className="flex min-w-0 flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/50 sm:text-[11px]">
                Sales Email
              </span>
              <span className="font-heading text-sm font-bold text-white transition-colors group-hover:text-[#fec01f] sm:text-base break-all">
                sales@fintechfestival.lk
              </span>
            </span>
          </a>

          {/* Card 3: Office Address */}
          <a
            href="https://www.google.com/maps/search/?api=1&query=No.161A%2C%20Dharmapala%20Mawatha%2C%20Colombo%2007%2C%20Sri%20Lanka"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Office: No.161A, Dharmapala Mawatha, Colombo 07, Sri Lanka"
            data-cursor="link"
            className="group flex min-w-0 items-center gap-4 bg-[#06061f] p-4 transition-colors hover:bg-[#0d0d2e] sm:p-5 lg:px-6 sm:col-span-2 lg:col-span-1"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-white/20 bg-white/5 text-white transition-colors group-hover:border-[#fec01f] group-hover:bg-[#fec01f] group-hover:text-black">
              <MapPin className="h-5 w-5" />
            </span>
            <span className="flex min-w-0 flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/50 sm:text-[11px]">
                Office
              </span>
              <address className="text-sm leading-snug text-white/85 not-italic transition-colors group-hover:text-[#fec01f]">
                <span className="block">No.161A, Dharmapala Mawatha,</span>
                <span className="block">Colombo 07, Sri Lanka</span>
              </address>
            </span>
          </a>
        </div>
      </div>

      {/* Large Ambient Watermark & Legal Bottom Bar */}
      <div className="relative">
        <div aria-hidden="true" className="footer-wordmark">
          <span className="footer-wordmark__text">
            <span>FinTech</span> <span>Festival</span>
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2.5 px-4 pb-3 text-left md:flex-row md:items-center sm:px-6 lg:px-8 lg:pb-6">
            <p className="max-w-full font-mono text-[9px] uppercase tracking-wider text-white/60 sm:text-[10px] sm:tracking-widest">
              © 2026 Sri Lanka FinTech Festival. All Rights Reserved.
            </p>
            <nav className="flex flex-wrap gap-x-4 gap-y-2">
              <Link
                href="/privacy"
                data-cursor="link"
                className="font-mono text-[10px] uppercase tracking-widest text-white/50 transition-colors hover:text-[#fec01f]"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                data-cursor="link"
                className="font-mono text-[10px] uppercase tracking-widest text-white/50 transition-colors hover:text-[#fec01f]"
              >
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
