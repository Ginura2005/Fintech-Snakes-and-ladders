"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import FestivalHeader from "@/components/layout/FestivalHeader";
import FestivalFooter from "@/components/layout/FestivalFooter";
import {
  Scale,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Ban,
  Trophy,
  Gamepad2,
  Coins,
  ArrowRight,
  ArrowLeft,
  Printer,
  ExternalLink,
  Mail,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Award,
  Globe,
  Share2,
} from "lucide-react";

export default function TermsContent() {
  const [user, setUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState("acceptance");
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const navItems = [
    { id: "acceptance", label: "1. Acceptance & Eligibility" },
    { id: "non-gambling", label: "2. Non-Gambling & Educational Nature" },
    { id: "game-rules", label: "3. Game Rules & 1-Run Tournament" },
    { id: "fair-play", label: "4. Fair Play & Anti-Cheat Policy" },
    { id: "leaderboard", label: "5. Leaderboard & Awards Discretion" },
    { id: "ip-rights", label: "6. Intellectual Property & Licenses" },
    { id: "sharing-cards", label: "7. Result Cards & Social Sharing" },
    { id: "google-auth", label: "8. Google Identity & Third Parties" },
    { id: "service-changes", label: "9. System Availability & Changes" },
    { id: "disclaimers", label: "10. Disclaimers & Liability Limits" },
    { id: "governing-law", label: "11. Governing Law & Jurisdiction" },
    { id: "contact", label: "12. Contact & Notices" },
  ];

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#06061f] text-white flex flex-col selection:bg-[#fec01f] selection:text-black">
      <FestivalHeader user={user} activePath="/terms" />

      {/* Hero Section */}
      <div className="relative border-b border-white/10 bg-gradient-to-b from-[#0a0a28] to-[#06061f] overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#8d1739]/20 via-[#fec01f]/10 to-transparent blur-3xl opacity-70" />
        <div className="pointer-events-none absolute -right-20 top-0 w-96 h-96 opacity-10">
          <Image src="/elements/circles.webp" alt="" fill className="object-contain" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white/60 hover:text-[#fec01f] transition-colors"
            >
              <ArrowLeft size={14} /> Back to Arena
            </Link>
            <span className="text-white/30">/</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-widest bg-[#fec01f]/10 text-[#fec01f] border border-[#fec01f]/30">
              Official Legal Terms
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Application Terms of Service
              </h1>
              <p className="mt-3 text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed">
                Rules of engagement, competitive integrity policies, intellectual property rights,
                and educational disclaimers governing your participation in{" "}
                <strong className="text-white">Lanka FinTechverse</strong> for the{" "}
                <strong className="text-[#fec01f]">Sri Lanka FinTech Festival 2026</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 text-xs font-mono uppercase tracking-wider text-white/80 transition-all"
                title="Print or save PDF"
              >
                <Printer size={14} />
                <span>Print Terms</span>
              </button>
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#fec01f]/30 bg-[#fec01f]/10 hover:bg-[#fec01f]/20 text-xs font-mono uppercase tracking-wider text-[#fec01f] transition-all"
              >
                <ShieldCheck size={14} />
                <span>Privacy Policy →</span>
              </Link>
            </div>
          </div>

          {/* Metadata chips */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-4 sm:gap-8 text-xs font-mono text-white/60">
            <div>
              <span className="text-white/40 block">APPLICATION</span>
              <span className="text-white font-semibold">Lanka FinTechverse</span>
            </div>
            <div>
              <span className="text-white/40 block">FESTIVAL</span>
              <span className="text-white font-semibold">Sri Lanka FinTech Festival 2026</span>
            </div>
            <div>
              <span className="text-white/40 block">GOVERNING LAW</span>
              <span className="text-white font-semibold">Democratic Socialist Republic of Sri Lanka</span>
            </div>
            <div>
              <span className="text-white/40 block">EFFECTIVE DATE</span>
              <span className="text-[#fec01f] font-semibold">October 28, 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Sticky Table of Contents Sidebar */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-28 space-y-4">
              <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
                <p className="font-mono text-xs uppercase tracking-widest text-[#fec01f] font-bold mb-3 flex items-center gap-2">
                  <FileText size={14} />
                  Table of Contents
                </p>
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={() => setActiveSection(item.id)}
                      className={`block py-1.5 px-2.5 rounded-lg text-xs font-medium transition-colors ${
                        activeSection === item.id
                          ? "bg-[#fec01f]/15 text-[#fec01f] font-bold"
                          : "text-white/70 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Crucial Notice Box */}
              <div className="p-5 rounded-2xl border border-[#8d1739]/50 bg-[#8d1739]/15 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-rose-300 font-mono text-xs uppercase tracking-wider font-bold mb-2">
                  <Coins size={14} />
                  Strictly Non-Gambling
                </div>
                <p className="text-xs text-white/80 leading-relaxed">
                  Lanka FinTechverse is an educational promotional game. Scores, hearts, and shields have{" "}
                  <strong>zero real-world cash value</strong> and cannot be traded or redeemed for fiat currency.
                </p>
              </div>

              {/* Tournament Rule Box */}
              <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-2 text-[#fec01f] font-mono text-xs uppercase tracking-wider font-bold mb-2">
                  <Gamepad2 size={14} />
                  1 Official Run Policy
                </div>
                <p className="text-xs text-white/70 leading-relaxed mb-3">
                  Each authenticated participant is granted exactly one official competitive attempt. Unranked
                  practice mode is available for training.
                </p>
                <Link
                  href="/game?mode=practice"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-teal-300 hover:text-teal-200"
                >
                  Enter Practice Arena →
                </Link>
              </div>
            </div>
          </aside>

          {/* Legal Prose Content */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-12">
            {/* Section 1 */}
            <section id="acceptance" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  01
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Acceptance of Terms &amp; Eligibility
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                These Application Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement
                between you (&ldquo;User&rdquo;, &ldquo;Player&rdquo;, or &ldquo;you&rdquo;) and the{" "}
                <strong>Sri Lanka FinTech Festival 2026 Organizing Committee</strong> (&ldquo;Festival&rdquo;,
                &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) concerning your access to and use of the{" "}
                <strong>Lanka FinTechverse</strong> web application (located at{" "}
                <code className="text-[#fec01f] text-xs bg-white/5 px-2 py-0.5 rounded">
                  verse.fintechfestival.lk
                </code>
                ) and related digital games, puzzles, and leaderboards.
              </p>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                By signing in with Google, rolling dice, solving puzzles, or otherwise accessing the platform,
                you explicitly acknowledge that you have read, understood, and agreed to be bound by these
                Terms and our accompanying{" "}
                <Link href="/privacy" className="text-[#fec01f] underline hover:text-white">
                  Privacy Policy
                </Link>
                . If you do not agree, you must immediately discontinue use of the application.
              </p>
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-2 text-xs text-white/70">
                <strong className="text-white block">Participant Eligibility:</strong>
                <p>
                  Lanka FinTechverse is open to attendees of the Sri Lanka FinTech Festival 2026, industry
                  professionals, university students, and members of the public aged 13 and above. You agree to
                  provide accurate registration details and maintain only one authentic account.
                </p>
              </div>
            </section>

            {/* Section 2: Non-Gambling & Educational */}
            <section id="non-gambling" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  02
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Purely Educational &amp; Non-Gambling Declaration
                </h2>
              </div>

              <div className="p-6 rounded-2xl border-2 border-[#8d1739]/60 bg-gradient-to-br from-[#8d1739]/20 via-[#0a0a28] to-[#06061f] space-y-4">
                <div className="flex items-center gap-2 text-rose-300 font-heading font-bold text-base">
                  <ShieldAlert size={20} />
                  <span>CRITICAL REGULATORY &amp; EDUCATIONAL NOTICE</span>
                </div>
                <div className="space-y-3 text-sm text-white/90 leading-relaxed">
                  <p>
                    <strong>1. Absolutely NOT Gambling or Wagering:</strong> Lanka FinTechverse is an
                    interactive educational simulation and brand engagement experience designed exclusively
                    for the Sri Lanka FinTech Festival 2026. It is <strong>NOT</strong> a lottery, betting
                    system, gambling enterprise, or game of chance for real money.
                  </p>
                  <p>
                    <strong>2. Zero Monetary Value of In-Game Assets:</strong> Any virtual assets referenced
                    in the game—including scores, points, ladders, &ldquo;hearts&rdquo;, &ldquo;shields&rdquo;,
                    and treasures—are purely cosmetic digital mechanics for gameplay. They hold{" "}
                    <strong>no real-world monetary, cryptocurrency, or cash value</strong> and cannot be
                    exchanged, transferred, sold, or redeemed for fiat currency, vouchers, or goods.
                  </p>
                  <p>
                    <strong>3. Educational FinTech Trivia Disclaimer:</strong> FinTech knowledge quiz questions
                    and explanations (covering LankaPay, Central Bank of Sri Lanka [CBSL] regulations, digital
                    payments, open banking, fraud prevention, and blockchain) are curated solely for general
                    informational and digital literacy purposes. Nothing contained in the game constitutes
                    formal financial, investment, regulatory, legal, or accounting advice.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: Game Rules */}
            <section id="game-rules" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  03
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Game Mechanics &amp; The &ldquo;One Official Attempt&rdquo; Rule
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                To guarantee tournament fairness among thousands of festival attendees and international
                participants, Lanka FinTechverse enforces strict architectural game mechanics:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
                  <div className="flex items-center gap-2 text-[#fec01f] font-semibold">
                    <Trophy size={16} />
                    <span>One Official Attempt Per Player</span>
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    Each authenticated Google user is permitted exactly <strong>ONE (1)</strong> official run
                    on the festival Snakes &amp; Ladders board. The final score achieved on this run is permanently
                    locked and cannot be restarted or overwritten.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
                  <div className="flex items-center gap-2 text-teal-300 font-semibold">
                    <Gamepad2 size={16} />
                    <span>Unlimited Practice Arena</span>
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    Players can access the unranked Practice Arena at any time to enjoy unlimited casual games
                    against the computer AI. Practice runs do NOT affect your official tournament score or
                    leaderboard ranking.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
                  <div className="flex items-center gap-2 text-purple-300 font-semibold">
                    <Sparkles size={16} />
                    <span>LinkedIn-Style Puzzle Arena</span>
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    Attendees can also challenge daily logic puzzles (Queens, Tango, Mini-Sudoku, Pinpoint, Zip,
                    and Crossclimb) to test deductive reasoning and earn daily achievement streaks.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
                  <div className="flex items-center gap-2 text-blue-300 font-semibold">
                    <CheckCircle2 size={16} />
                    <span>Server-Authoritative Engine</span>
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    All random dice rolls, board moves, snake deductions, and quiz score additions are generated
                    and validated authoritatively on our secure server using cryptographically secure random number
                    generators.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: Fair Play */}
            <section id="fair-play" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  04
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Fair Play, Code of Conduct &amp; Anti-Cheat Policy
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                Fair competition and respect are paramount. When using Lanka FinTechverse, you strictly agree
                NOT to engage in any of the following prohibited behaviors:
              </p>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <Ban size={18} className="text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-rose-200 block mb-0.5">Automated Scripts &amp; Bots</strong>
                    <span className="text-white/70">
                      Using automated scripts, bots, headless browsers, scrapers, macros, or automated solvers
                      to interact with the game engine or solve puzzles without authentic human interaction is
                      expressly forbidden.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <Ban size={18} className="text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-rose-200 block mb-0.5">Multi-Accounting &amp; Sybil Attempts</strong>
                    <span className="text-white/70">
                      Creating multiple Google accounts or disposable email aliases to attempt multiple official
                      game runs or inflate scores is strictly prohibited.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <Ban size={18} className="text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-rose-200 block mb-0.5">API Tampering &amp; Network Exploits</strong>
                    <span className="text-white/70">
                      Intercepting, forging, or replaying HTTP API payloads, faking dice results, or exploiting
                      race conditions to artificially modify scores constitutes malicious conduct.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <Ban size={18} className="text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-rose-200 block mb-0.5">Offensive Display Names</strong>
                    <span className="text-white/70">
                      Player handles must not contain profanity, hate speech, defamation, impersonation of festival
                      speakers/dignitaries, or trademark violations. We reserve the right to sanitize or revoke
                      offensive handles.
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <p className="text-xs text-white/70 leading-relaxed">
                  <strong className="text-white">Disqualification Authority:</strong> The Festival Organizing
                  Committee reserves the absolute and unilateral right to disqualify any participant, purge
                  scores from the leaderboard, or revoke access without prior notice if fraudulent activity, bot
                  usage, or breach of fair play is detected.
                </p>
              </div>
            </section>

            {/* Section 5: Leaderboard */}
            <section id="leaderboard" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  05
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Leaderboard Rankings &amp; Festival Discretion
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                The Festival Leaderboard ranks opted-in participants based on a transparent, objective formula:
              </p>
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-2 text-xs font-mono text-white/80">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-[#fec01f]">1. PRIMARY CRITERION</span>
                  <span className="text-white font-bold">Highest Final Score</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-teal-400">2. FIRST TIE-BREAKER</span>
                  <span className="text-white font-bold">Victory Status (Player Won &gt; Eliminated)</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-purple-400">3. SECOND TIE-BREAKER</span>
                  <span className="text-white font-bold">FinTech Quiz Correct Answers</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-blue-400">4. THIRD TIE-BREAKER</span>
                  <span className="text-white font-bold">Remaining Hearts (Survival Health)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">5. FOURTH TIE-BREAKER</span>
                  <span className="text-white font-bold">Fastest Match Duration (Seconds)</span>
                </div>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                <strong>Committee Finality:</strong> Any recognition, certificates, or awards announced during the
                Sri Lanka FinTech Festival 2026 are subject to identity verification. The decisions of the Festival
                Committee in resolving scoring disputes, ties, or disqualifications are final, conclusive, and
                non-appealable.
              </p>
            </section>

            {/* Section 6: IP Rights */}
            <section id="ip-rights" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  06
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Intellectual Property &amp; License to Use
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                All rights, title, and interest in and to Lanka FinTechverse—including but not limited to the
                &ldquo;Sri Lanka FinTech Festival&rdquo; trademark, brand marks, logos, illustrations, board designs,
                quiz question database, 3D dice animations, audio assets, and underlying software source code—are
                owned exclusively by the Sri Lanka FinTech Festival, its organizing partners, and technology providers.
              </p>
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] text-xs text-white/70 space-y-2">
                <strong className="text-white block">Limited Player License:</strong>
                <p>
                  Subject to your adherence to these Terms, we grant you a personal, non-exclusive, non-transferable,
                  revocable license to access the application and participate in matches for personal, non-commercial
                  educational entertainment. You may not copy, decompile, modify, or commercially distribute any
                  element of the software.
                </p>
              </div>
            </section>

            {/* Section 7: Result Cards */}
            <section id="sharing-cards" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  07
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Result Cards &amp; Social Sharing
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                We encourage players to celebrate their fintech knowledge and match achievements! Lanka FinTechverse
                provides high-resolution downloadable cards (1080×1350 for feeds, 1080×1920 for stories) and
                cryptographic challenge links.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-white/75">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#fec01f] shrink-0 mt-0.5" />
                  <span>
                    You are explicitly licensed to download and publish your branded match result cards on LinkedIn,
                    Instagram, X, Facebook, and WhatsApp.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#fec01f] shrink-0 mt-0.5" />
                  <span>
                    You grant the Festival permission to display your opted-in public display handle and game score
                    on festival video walls, conference screens, and official festival highlight posts.
                  </span>
                </li>
              </ul>
            </section>

            {/* Section 8: Google Auth */}
            <section id="google-auth" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  08
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Google Identity &amp; Third-Party Services
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                Authentication is facilitated through Google Identity Services. Your relationship with Google is
                governed by Google&rsquo;s own Terms of Service and Privacy Policy. The Sri Lanka FinTech Festival is
                not responsible for Google account suspensions, access loss, or third-party credential management.
              </p>
            </section>

            {/* Section 9: Service Availability */}
            <section id="service-changes" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  09
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  System Availability &amp; Modifications
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                Lanka FinTechverse is made available for the duration of the Sri Lanka FinTech Festival 2026. We
                reserve the right to modify quiz questions, update balance rules, schedule maintenance, or retire the
                service following festival conclusion without legal liability.
              </p>
            </section>

            {/* Section 10: Disclaimers */}
            <section id="disclaimers" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  10
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Disclaimers &amp; Limitation of Liability
                </h2>
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3 text-xs sm:text-sm text-white/80 leading-relaxed">
                <p>
                  <strong className="text-white uppercase font-mono">“AS IS” AND “AS AVAILABLE”:</strong> THE APPLICATION
                  IS PROVIDED WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
                  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR UNINTERRUPTED AVAILABILITY.
                </p>
                <p>
                  <strong className="text-white uppercase font-mono">LIMITATION OF LIABILITY:</strong> TO THE FULLEST
                  EXTENT PERMITTED UNDER SRI LANKAN LAW, NEITHER THE SRI LANKA FINTECH FESTIVAL COMMITTEE, SPONSORS,
                  TECHNOLOGY CONTRACTORS, NOR VOLUNTEERS SHALL BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
                  OR CONSEQUENTIAL LOSSES OR INCONVENIENCES ARISING FROM YOUR USE OF OR INABILITY TO USE THE APPLICATION.
                </p>
              </div>
            </section>

            {/* Section 11: Governing Law */}
            <section id="governing-law" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  11
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Governing Law &amp; Jurisdiction
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                These Terms and any dispute or claim arising out of or in connection with them shall be governed by
                and construed in accordance with the substantive laws of the{" "}
                <strong>Democratic Socialist Republic of Sri Lanka</strong>.
              </p>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                The parties agree that the competent courts situated in <strong>Colombo, Sri Lanka</strong> shall have
                exclusive jurisdiction to settle any disputes or legal proceedings arising in relation to these Terms.
              </p>
            </section>

            {/* Section 12: Contact */}
            <section id="contact" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  12
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Contact Information &amp; Official Inquiries
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                For questions regarding these Terms, fair play investigations, or legal notices, please reach out to:
              </p>

              <div className="p-6 rounded-2xl border border-white/15 bg-white/[0.03] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-white/50 block font-mono text-xs uppercase">Secretariat</span>
                    <strong className="text-white font-heading text-base">
                      Sri Lanka FinTech Festival 2026 Committee
                    </strong>
                    <p className="text-white/60 text-xs mt-1">
                      Promoting innovation, regulatory clarity, and financial inclusion.
                    </p>
                  </div>
                  <div>
                    <span className="text-white/50 block font-mono text-xs uppercase">Official Headquarters</span>
                    <p className="text-white font-medium">Colombo, Sri Lanka</p>
                    <p className="text-white/60 text-xs mt-1">Festival: 2–3 November 2026</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs font-mono">
                  <div>
                    <span className="text-white/50 block">LEGAL &amp; COMPLIANCE DESK</span>
                    <a
                      href="mailto:legal@fintechfestival.lk"
                      className="text-[#fec01f] hover:underline font-bold text-sm inline-flex items-center gap-1.5 mt-0.5"
                    >
                      <Mail size={14} />
                      legal@fintechfestival.lk
                    </a>
                  </div>
                  <div>
                    <span className="text-white/50 block">GENERAL SECRETARIAT</span>
                    <a
                      href="mailto:secretariat@fintechfestival.lk"
                      className="text-white hover:text-[#fec01f] font-medium text-sm inline-flex items-center gap-1.5 mt-0.5"
                    >
                      <Mail size={14} />
                      secretariat@fintechfestival.lk
                    </a>
                  </div>
                  <div>
                    <span className="text-white/50 block">FESTIVAL PORTAL</span>
                    <a
                      href="https://fintechfestival.lk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-[#fec01f] font-medium text-sm inline-flex items-center gap-1.5 mt-0.5"
                    >
                      <Globe size={14} />
                      fintechfestival.lk
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Bottom Actions */}
            <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#fec01f] hover:text-[#fec01f]/80 transition-colors"
              >
                <ShieldCheck size={16} /> Read Privacy Policy
              </Link>
              <Link
                href="/"
                className="py-2.5 px-5 rounded-xl interactive-btn interactive-btn--primary font-bold text-xs font-mono uppercase tracking-wider"
              >
                Back to Game Arena
              </Link>
            </div>
          </main>
        </div>
      </div>

      <FestivalFooter />
    </div>
  );
}
