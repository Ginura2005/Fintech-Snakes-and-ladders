"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import FestivalHeader from "@/components/layout/FestivalHeader";
import FestivalFooter from "@/components/layout/FestivalFooter";
import {
  Shield,
  Lock,
  Eye,
  Database,
  Globe,
  UserCheck,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Printer,
  ExternalLink,
  Mail,
  Scale,
  KeyRound,
  Server,
  Share2,
} from "lucide-react";

export default function PrivacyContent() {
  const [user, setUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState("overview");
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
    { id: "overview", label: "1. Overview & Scope" },
    { id: "data-collection", label: "2. Information We Collect" },
    { id: "google-data", label: "3. Google User Data & Limited Use" },
    { id: "data-usage", label: "4. How We Use Data" },
    { id: "legal-basis", label: "5. Legal Grounds & PDPA" },
    { id: "leaderboard-privacy", label: "6. Leaderboard & Privacy Controls" },
    { id: "cookies-storage", label: "7. Cookies & Local Storage" },
    { id: "security-retention", label: "8. Storage, Security & Retention" },
    { id: "user-rights", label: "9. Your Rights Under Sri Lanka Law" },
    { id: "children", label: "10. Children's Privacy" },
    { id: "contact", label: "11. Contact & Data Controller" },
  ];

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#06061f] text-white flex flex-col selection:bg-[#fec01f] selection:text-black">
      <FestivalHeader user={user} activePath="/privacy" />

      {/* Hero Section */}
      <div className="relative border-b border-white/10 bg-gradient-to-b from-[#0a0a28] to-[#06061f] overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#125252]/20 via-[#fec01f]/10 to-transparent blur-3xl opacity-70" />
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
              Official Legal Document
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Privacy Policy
              </h1>
              <p className="mt-3 text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed">
                How <strong className="text-white">Lanka FinTechverse</strong> and the{" "}
                <strong className="text-[#fec01f]">Sri Lanka FinTech Festival 2026</strong> collect,
                protect, and honor your personal data in full compliance with the Sri Lanka Personal Data
                Protection Act (PDPA) No. 9 of 2022 and Google API Services User Data Policies.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 text-xs font-mono uppercase tracking-wider text-white/80 transition-all"
                title="Print or save PDF"
              >
                <Printer size={14} />
                <span>Print Policy</span>
              </button>
              <Link
                href="/terms"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#fec01f]/30 bg-[#fec01f]/10 hover:bg-[#fec01f]/20 text-xs font-mono uppercase tracking-wider text-[#fec01f] transition-all"
              >
                <Scale size={14} />
                <span>Terms of Service →</span>
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
              <span className="text-white/40 block">ORGANIZATION</span>
              <span className="text-white font-semibold">Sri Lanka FinTech Festival 2026</span>
            </div>
            <div>
              <span className="text-white/40 block">JURISDICTION</span>
              <span className="text-white font-semibold">Sri Lanka (PDPA No. 9 of 2022)</span>
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

              {/* Quick Summary Box */}
              <div className="p-5 rounded-2xl border border-[#125252]/40 bg-[#125252]/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-teal-300 font-mono text-xs uppercase tracking-wider font-bold mb-2">
                  <Shield size={14} />
                  Privacy at a Glance
                </div>
                <ul className="space-y-2 text-xs text-white/70 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 size={13} className="text-teal-400 shrink-0 mt-0.5" />
                    <span>No commercial advertising or data broking</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 size={13} className="text-teal-400 shrink-0 mt-0.5" />
                    <span>Leaderboard is 100% voluntary (opt-in only)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 size={13} className="text-teal-400 shrink-0 mt-0.5" />
                    <span>Display handle is separate from your email</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 size={13} className="text-teal-400 shrink-0 mt-0.5" />
                    <span>Google user data strictly adheres to Limited Use</span>
                  </li>
                </ul>
              </div>

              {/* Contact Card */}
              <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
                <p className="font-mono text-xs uppercase tracking-wider text-white/50 mb-1">
                  Need Assistance?
                </p>
                <p className="text-xs text-white/80 leading-relaxed mb-3">
                  Have questions about your data or want to request account deletion?
                </p>
                <a
                  href="mailto:privacy@fintechfestival.lk"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#fec01f] hover:underline"
                >
                  <Mail size={13} />
                  privacy@fintechfestival.lk
                </a>
              </div>
            </div>
          </aside>

          {/* Legal Prose Content */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-12">
            {/* Section 1 */}
            <section id="overview" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  01
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Overview &amp; Scope
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                Welcome to <strong>Lanka FinTechverse</strong> (accessible via{" "}
                <code className="text-[#fec01f] text-xs bg-white/5 px-2 py-0.5 rounded">
                  verse.fintechfestival.lk
                </code>
                ), the official interactive digital game developed for the{" "}
                <strong>Sri Lanka FinTech Festival 2026</strong> (&ldquo;Festival&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;),
                taking place in Colombo, Sri Lanka.
              </p>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                This Privacy Policy explains how the Sri Lanka FinTech Festival Committee collects,
                processes, stores, and safeguards personal data when you access our web application,
                authenticate via Google, play the Snakes &amp; Ladders or LinkedIn-style Puzzles arena,
                and participate in our festival leaderboard. We are deeply committed to safeguarding
                your digital privacy in accordance with the{" "}
                <strong>Sri Lanka Personal Data Protection Act (PDPA) No. 9 of 2022</strong> and
                international data protection principles.
              </p>
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <p className="text-xs text-white/70 leading-relaxed">
                  <strong className="text-white">Non-Commercial Educational Purpose:</strong> Lanka
                  FinTechverse is an educational, non-gambling festival game created to build capacity,
                  spark financial technology awareness, and celebrate Sri Lanka&rsquo;s digital finance
                  ecosystem. We never sell, monetize, or market personal information.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="data-collection" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  02
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Information We Collect &amp; Receive
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                We believe in strict data minimization. We only collect the minimal information necessary
                to securely authenticate you, prevent duplicate festival game entries, compute your
                score, and optionally display your ranking.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <KeyRound size={16} className="text-[#fec01f]" />
                    <span>A. Google Account Identity</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    When you sign in using Google Identity Services / OAuth, we receive:
                  </p>
                  <ul className="text-xs text-white/60 space-y-1 list-disc list-inside">
                    <li>Your verified email address</li>
                    <li>Your full name (as registered with Google)</li>
                    <li>Your public profile photo / avatar URL</li>
                    <li>A unique Google OAuth identifier (Subject ID)</li>
                  </ul>
                  <p className="text-[11px] text-white/50 italic pt-1">
                    Your Google email is kept strictly private and is never shown on public screens.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <UserCheck size={16} className="text-teal-400" />
                    <span>B. Public Player Handle</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Upon onboarding, you choose a customizable public display name (e.g.,{" "}
                    <code className="text-[#fec01f]">Satoshi_LK</code>):
                  </p>
                  <ul className="text-xs text-white/60 space-y-1 list-disc list-inside">
                    <li>Between 2 and 30 characters in length</li>
                    <li>Can be a pseudonym, handle, or professional alias</li>
                    <li>Stored separately from your Google email</li>
                    <li>Can be updated at any time in your player profile</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <Server size={16} className="text-purple-400" />
                    <span>C. Game Telemetry &amp; Runs</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    To compute game logic server-authoritatively and prevent manipulation:
                  </p>
                  <ul className="text-xs text-white/60 space-y-1 list-disc list-inside">
                    <li>Dice roll outcomes and timestamped move sequences</li>
                    <li>Board position, hearts remaining, and shields collected</li>
                    <li>FinTech quiz answers (correct/incorrect tally)</li>
                    <li>Match duration and completion timestamp</li>
                    <li>Daily puzzle completion times and streaks</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <Globe size={16} className="text-blue-400" />
                    <span>D. Technical &amp; Security Data</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Standard web server logs collected automatically for system defense:
                  </p>
                  <ul className="text-xs text-white/60 space-y-1 list-disc list-inside">
                    <li>IP address (for rate-limiting and DDoS mitigation)</li>
                    <li>Browser user-agent and operating system</li>
                    <li>Session authentication tokens managed by Supabase Auth</li>
                    <li>Cryptographic challenge link tokens</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3: Google Limited Use */}
            <section id="google-data" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  03
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Google API Services User Data Policy Compliance
                </h2>
              </div>

              <div className="p-5 rounded-2xl border-2 border-[#fec01f]/40 bg-gradient-to-br from-[#fec01f]/10 via-[#0a0a28] to-[#06061f] space-y-3">
                <div className="flex items-center gap-2 text-[#fec01f] font-heading font-bold text-base">
                  <Lock size={18} />
                  <span>Google Limited Use Disclosure</span>
                </div>
                <p className="text-sm text-white/90 leading-relaxed">
                  Lanka FinTechverse&rsquo;s use and transfer of information received from Google APIs
                  to any other app will adhere to the{" "}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#fec01f] underline hover:text-white inline-flex items-center gap-1"
                  >
                    Google API Services User Data Policy
                    <ExternalLink size={12} />
                  </a>
                  , including the <strong>Limited Use</strong> requirements.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-white/80">
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                    <span className="text-rose-400 font-bold flex items-center gap-1.5 mb-1">
                      <XCircle size={14} className="shrink-0" />
                      <span>NEVER SOLD OR RENTED</span>
                    </span>
                    <span>
                      We never sell, lease, transfer, or exchange your Google user data with any advertising
                      network, data broker, or commercial third party.
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                    <span className="text-rose-400 font-bold flex items-center gap-1.5 mb-1">
                      <XCircle size={14} className="shrink-0" />
                      <span>NO AD TARGETING</span>
                    </span>
                    <span>
                      Your Google profile data is never used to serve targeted advertisements, retargeting
                      campaigns, or behavioral user profiling.
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                    <span className="text-rose-400 font-bold flex items-center gap-1.5 mb-1">
                      <XCircle size={14} className="shrink-0" />
                      <span>NO AI/ML TRAINING</span>
                    </span>
                    <span>
                      We do not feed your Google personal information or user credentials into generative AI
                      or machine learning training models.
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                    <span className="text-teal-400 font-bold flex items-center gap-1.5 mb-1">
                      <CheckCircle2 size={14} className="shrink-0" />
                      <span>STRICTLY ESSENTIAL</span>
                    </span>
                    <span>
                      Google authentication is used exclusively to verify identity, establish secure sessions,
                      and enforce the one-official-run game rule.
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="data-usage" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  04
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  How We Use Your Data
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                Your data is processed strictly for the execution and fair administration of the festival
                digital experience:
              </p>
              <ul className="space-y-3 text-sm text-white/80">
                <li className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="w-6 h-6 rounded-md bg-[#fec01f]/20 text-[#fec01f] flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-white">Tournament Fairness &amp; One-Run Enforcement:</strong>{" "}
                    To ensure competitive integrity for festival prizes and recognition, each authenticated
                    player is granted exactly one official game run. Your Google account ID ensures no
                    duplicate runs are submitted under multiple aliases.
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="w-6 h-6 rounded-md bg-[#fec01f]/20 text-[#fec01f] flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-white">Authoritative Score Computation:</strong> All dice rolls,
                    ladder climbs, snake hazards, and quiz point deltas are calculated on the server to prevent
                    client-side game tampering or manipulation.
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="w-6 h-6 rounded-md bg-[#fec01f]/20 text-[#fec01f] flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-white">Voluntary Leaderboard Presentation:</strong> If and only if
                    you choose to opt in, your public display handle, score, win/loss status, and duration
                    are published on the live festival leaderboard displayed at venue screens and online.
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="w-6 h-6 rounded-md bg-[#fec01f]/20 text-[#fec01f] flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                    4
                  </span>
                  <div>
                    <strong className="text-white">Dynamic Challenge Links &amp; Share Cards:</strong> When
                    you share your game result, our system generates cryptographic tokens that allow colleagues
                    to challenge your run without exposing your personal email or Google account ID.
                  </div>
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="legal-basis" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  05
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Legal Grounds &amp; Sri Lanka PDPA Compliance
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                Under the <strong>Personal Data Protection Act No. 9 of 2022 of Sri Lanka</strong>, we process
                your personal data on the following statutory legal bases:
              </p>
              <div className="space-y-3 text-xs sm:text-sm text-white/80">
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                  <strong className="text-[#fec01f] block mb-1">
                    • Consent (Section 5, PDPA)
                  </strong>
                  <span>
                    When you sign in with Google, opt into the public leaderboard, or choose your custom handle,
                    you provide explicit, informed consent for those specific purposes. You may withdraw consent
                    at any time.
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                  <strong className="text-teal-400 block mb-1">
                    • Performance of Contract / Service Terms (Section 5, PDPA)
                  </strong>
                  <span>
                    Processing necessary to deliver the game functionality, calculate game state, and provide
                    authenticated session access as requested by you.
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                  <strong className="text-purple-400 block mb-1">
                    • Legitimate Interests (Section 5, PDPA)
                  </strong>
                  <span>
                    Maintaining the technical integrity and security of the game application, preventing bot
                    abuse, enforcing tournament fairness, and defending against unauthorized API tampering.
                  </span>
                </div>
              </div>
            </section>

            {/* Section 6: Leaderboard Privacy */}
            <section id="leaderboard-privacy" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  06
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Leaderboard &amp; Privacy By Design
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                We designed Lanka FinTechverse with strict privacy boundaries:
              </p>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                  <Eye size={18} className="text-[#fec01f] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Opt-In By Default is FALSE</strong>
                    <span className="text-white/70">
                      When your match completes, your score is NOT publicly visible until you explicitly check
                      the opt-in box. If you do not opt in, your match remains completely private between you
                      and our server.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                  <UserCheck size={18} className="text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Strict Identity Decoupling</strong>
                    <span className="text-white/70">
                      The public leaderboard view only queries your self-chosen display name, final score, quiz
                      points, and duration. Your Google email address, internal UUIDs, and private OAuth tokens
                      are never exposed in public views or API payloads.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                  <Share2 size={18} className="text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Instant Opt-Out Anytime</strong>
                    <span className="text-white/70">
                      You can toggle your leaderboard participation off at any time directly on your results
                      screen or by calling our profile API. Opting out takes effect immediately and removes
                      your name from the public leaderboard table.
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section id="cookies-storage" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  07
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Cookies &amp; Local Storage
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                We use strictly essential cookies and browser storage required for core game functionality:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <strong className="text-[#fec01f] block text-sm mb-1">Essential Session Cookies</strong>
                  <p className="text-white/70 leading-relaxed">
                    Managed by Supabase Auth (
                    <code className="text-white/90">sb-*-auth-token</code>) to maintain your secure login
                    across page navigation and verify server API requests.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <strong className="text-teal-400 block text-sm mb-1">Browser Local Storage</strong>
                  <p className="text-white/70 leading-relaxed">
                    Used to store offline daily puzzle states (e.g. Queens grid placements, Tango rules progress)
                    and unranked practice session telemetry so you don&rsquo;t lose progress if reloaded.
                  </p>
                </div>
              </div>
              <p className="text-xs text-white/50 italic">
                Notice: We do NOT use third-party analytics pixels, Meta Pixels, advertising cookies, or
                cross-site tracking beacons.
              </p>
            </section>

            {/* Section 8 */}
            <section id="security-retention" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  08
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Data Storage, Security &amp; Retention
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                We deploy robust technological and operational safeguards to protect your data against
                unauthorized access, accidental loss, or unlawful processing:
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-white/75">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#fec01f] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">End-to-End Encryption:</strong> All web traffic is
                    encrypted in transit via TLS 1.3 / HTTPS. All backend database storage is encrypted at
                    rest using industry-standard AES-256.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#fec01f] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">PostgreSQL Row Level Security (RLS):</strong> Strict database
                    access policies ensure players can only read and write their own active game state. Cross-account
                    data querying is blocked at the database engine level.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#fec01f] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Retention Schedule:</strong> Official match data and
                    leaderboard statistics are retained during the Sri Lanka FinTech Festival 2026 and for an
                    audit archive period not exceeding 12 months following festival conclusion. After this
                    period, personal identifiers are purged or permanently anonymized.
                  </span>
                </li>
              </ul>
            </section>

            {/* Section 9 */}
            <section id="user-rights" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  09
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Your Rights Under Sri Lanka Law
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                Under the Sri Lanka Personal Data Protection Act (PDPA), you are entitled to several rights
                as a data subject:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                  <strong className="text-white block mb-1">Right of Access</strong>
                  <span className="text-white/70">
                    You have the right to request a copy of the personal data we hold about your player account.
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                  <strong className="text-white block mb-1">Right to Rectification</strong>
                  <span className="text-white/70">
                    You have the right to modify or update inaccurate display names and profile details at any time.
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                  <strong className="text-white block mb-1">Right to Erasure (&ldquo;To Be Forgotten&rdquo;)</strong>
                  <span className="text-white/70">
                    You can request complete deletion of your account, scores, and match runs by contacting us.
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                  <strong className="text-white block mb-1">Right to Withdraw Consent</strong>
                  <span className="text-white/70">
                    You may revoke your leaderboard opt-in at any time with immediate effect.
                  </span>
                </div>
              </div>
            </section>

            {/* Section 10 */}
            <section id="children" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  10
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Children&rsquo;s Privacy
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                Lanka FinTechverse is designed for festival attendees, university students, industry
                professionals, and the general public interested in financial innovation. We do not knowingly
                collect personal information from individuals under the age of 13. If you believe a minor has
                provided personal data through Google sign-in without parental authorization, please contact us
                promptly and we will remove the record.
              </p>
            </section>

            {/* Section 11: Contact */}
            <section id="contact" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  11
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Contact Information &amp; Data Controller
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                The data controller responsible for the processing of your personal data under this policy is
                the <strong>Sri Lanka FinTech Festival 2026 Committee</strong>.
              </p>

              <div className="p-6 rounded-2xl border border-white/15 bg-white/[0.03] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-white/50 block font-mono text-xs uppercase">Organizer</span>
                    <strong className="text-white font-heading text-base">
                      Sri Lanka FinTech Festival 2026
                    </strong>
                    <p className="text-white/60 text-xs mt-1">
                      Connecting financial institutions, technology builders, policymakers, and innovators.
                    </p>
                  </div>
                  <div>
                    <span className="text-white/50 block font-mono text-xs uppercase">Location</span>
                    <p className="text-white font-medium">Colombo, Sri Lanka</p>
                    <p className="text-white/60 text-xs mt-1">
                      Festival Dates: 2–3 November 2026
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs font-mono">
                  <div>
                    <span className="text-white/50 block">DATA PROTECTION &amp; PRIVACY INQUIRIES</span>
                    <a
                      href="mailto:privacy@fintechfestival.lk"
                      className="text-[#fec01f] hover:underline font-bold text-sm inline-flex items-center gap-1.5 mt-0.5"
                    >
                      <Mail size={14} />
                      privacy@fintechfestival.lk
                    </a>
                  </div>
                  <div>
                    <span className="text-white/50 block">GENERAL FESTIVAL SECRETARIAT</span>
                    <a
                      href="mailto:secretariat@fintechfestival.lk"
                      className="text-white hover:text-[#fec01f] font-medium text-sm inline-flex items-center gap-1.5 mt-0.5"
                    >
                      <Mail size={14} />
                      secretariat@fintechfestival.lk
                    </a>
                  </div>
                  <div>
                    <span className="text-white/50 block">OFFICIAL FESTIVAL PORTAL</span>
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
                href="/terms"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#fec01f] hover:text-[#fec01f]/80 transition-colors"
              >
                Read Application Terms of Service <ArrowRight size={16} />
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
