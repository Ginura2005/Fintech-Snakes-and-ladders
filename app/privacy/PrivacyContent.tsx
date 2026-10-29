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
  ArrowRight,
  ArrowLeft,
  Printer,
  ExternalLink,
  Mail,
  Scale,
  KeyRound,
  Server,
  Share2,
  MapPin,
  Building,
} from "lucide-react";

export default function PrivacyContent() {
  const [user, setUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState("who-we-are");
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
    { id: "who-we-are", label: "01. Who We Are" },
    { id: "what-we-collect", label: "02. What We Collect" },
    { id: "how-we-use-it", label: "03. How We Use It" },
    { id: "who-we-share-it-with", label: "04. Who We Share It With" },
    { id: "how-long-we-keep-it", label: "05. How Long We Keep It" },
    { id: "cookies", label: "06. Cookies & Storage" },
    { id: "security", label: "07. Security" },
    { id: "your-rights", label: "08. Your Rights" },
    { id: "contact-us", label: "09. Contact Us" },
    { id: "changes", label: "10. Changes & Revisions" },
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
              data-cursor="link"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white/60 hover:text-[#fec01f] transition-colors"
            >
              <ArrowLeft size={14} /> Back to Arena
            </Link>
            <span className="text-white/30">/</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-widest bg-[#fec01f]/10 text-[#fec01f] border border-[#fec01f]/30">
              Official Festival Policy
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Privacy Policy
              </h1>
              <p className="mt-3 text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed">
                How <strong className="text-white">FinTech Forum (Guarantee) Limited</strong>, the{" "}
                <strong className="text-[#fec01f]">Sri Lanka FinTech Festival 2026</strong>, and the{" "}
                <strong className="text-white">Lanka FinTechverse</strong> arena collect, protect,
                and honor your personal data under Sri Lanka&#39;s Personal Data Protection Act, No. 9 of 2022 (PDPA).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={handlePrint}
                data-cursor="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 text-xs font-mono uppercase tracking-wider text-white/80 transition-all cursor-pointer"
                title="Print or save PDF"
              >
                <Printer size={14} />
                <span>Print Policy</span>
              </button>
              <Link
                href="/terms"
                data-cursor="link"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#fec01f]/30 bg-[#fec01f]/10 hover:bg-[#fec01f]/20 text-xs font-mono uppercase tracking-wider text-[#fec01f] transition-all"
              >
                <Scale size={14} />
                <span>Terms of Service →</span>
              </Link>
            </div>
          </div>

          {/* 3 Official Core Assurances */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-3">
              <Shield className="h-6 w-6 text-emerald-400 shrink-0" />
              <div>
                <p className="font-heading text-sm font-bold text-white">We Never Sell Your Data</p>
                <p className="text-xs text-white/70">No data brokers, no advertising exchanges, zero commercial monetization.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#fec01f]/30 bg-[#fec01f]/10 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-[#fec01f] shrink-0" />
              <div>
                <p className="font-heading text-sm font-bold text-white">Marketing Only if You Agree</p>
                <p className="text-xs text-white/70">Leaderboard display and marketing are 100% opt-in. Unsubscribe at any time.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center gap-3">
              <Scale className="h-6 w-6 text-blue-400 shrink-0" />
              <div>
                <p className="font-heading text-sm font-bold text-white">Protected by Sri Lankan Law</p>
                <p className="text-xs text-white/70">Fully aligned with the Personal Data Protection Act, No. 9 of 2022 (PDPA).</p>
              </div>
            </div>
          </div>

          {/* Metadata chips */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-4 sm:gap-8 text-xs font-mono text-white/60">
            <div>
              <span className="text-white/40 block">CONTROLLER</span>
              <span className="text-white font-semibold">FinTech Forum (Guarantee) Limited</span>
            </div>
            <div>
              <span className="text-white/40 block">PLATFORM</span>
              <span className="text-white font-semibold">fintechfestival.lk &amp; verse arena</span>
            </div>
            <div>
              <span className="text-white/40 block">STATUTE</span>
              <span className="text-white font-semibold">Sri Lanka PDPA No. 9 of 2022</span>
            </div>
            <div>
              <span className="text-white/40 block">LAST REVISED</span>
              <span className="text-[#fec01f] font-semibold">January 2026</span>
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
                      data-cursor="link"
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
                  Data Protection Officer
                </p>
                <p className="text-xs text-white/80 leading-relaxed mb-3">
                  FinTech Forum (Guarantee) Limited
                  <br />
                  No.161A, Dharmapala Mawatha, Colombo 07
                </p>
                <a
                  href="mailto:connect@fintechfestival.lk"
                  data-cursor="link"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#fec01f] hover:underline"
                >
                  <Mail size={13} />
                  connect@fintechfestival.lk
                </a>
              </div>
            </div>
          </aside>

          {/* Legal Prose Content: 10 Official Sections */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-12">
            {/* Section 01: Who We Are */}
            <section id="who-we-are" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  01
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Who We Are
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                <strong>FinTech Forum (Guarantee) Limited</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;),
                located at <strong>No.161A, Dharmapala Mawatha, Colombo 07, Sri Lanka</strong>, runs{" "}
                <code className="text-[#fec01f] text-xs bg-white/5 px-2 py-0.5 rounded">
                  fintechfestival.lk
                </code>
                , the <strong>Sri Lanka FinTech Festival 2026</strong>, and its official digital game and logic arena{" "}
                <code className="text-[#fec01f] text-xs bg-white/5 px-2 py-0.5 rounded">
                  verse.fintechfestival.lk
                </code>
                .
              </p>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                We protect your personal data in strict compliance with Sri Lanka&rsquo;s{" "}
                <strong>Personal Data Protection Act, No. 9 of 2022 (PDPA)</strong> and international privacy standards.
              </p>
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <p className="text-xs text-white/70 leading-relaxed">
                  <strong className="text-white">Educational &amp; Capacity-Building Purpose:</strong> Lanka
                  FinTechverse is an educational, non-gambling festival game created to build capacity,
                  spark financial technology awareness, and celebrate Sri Lanka&rsquo;s digital finance
                  ecosystem. We never sell, monetize, or market personal information.
                </p>
              </div>
            </section>

            {/* Section 02: What We Collect */}
            <section id="what-we-collect" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  02
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  What We Collect
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                We collect only the minimum data required to deliver our festival experiences, ticketing, awards, and digital arena:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <UserCheck size={16} className="text-[#fec01f]" />
                    <span>Details You Give Us</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Name, job title, company, email, phone number, ticket details, billing details, and any accessibility or dietary needs you communicate to us.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <Building size={16} className="text-teal-400" />
                    <span>Awards, Enquiries &amp; Exhibits</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    The information you submit when you apply for an award, submit a speaker proposal, or enquire about sponsorship, exhibiting, or media passes.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <KeyRound size={16} className="text-purple-400" />
                    <span>Google Account &amp; Player Profile</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    When you sign in using Google OAuth for the arena: verified email address, Google full name, profile picture URL, and a unique Subject ID. Your email address remains private and is never published on leaderboards.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <Server size={16} className="text-blue-400" />
                    <span>Arena Moves &amp; Telemetry</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Dice roll sequences, board position, hearts remaining, shields collected, quiz responses, daily puzzle completion streaks, and match timestamps to verify competitive integrity.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <Mail size={16} className="text-amber-400" />
                    <span>Messages</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Emails, web forms, and WhatsApp messages sent to our official support and sales lines (+94 77 793 0472).
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <Globe size={16} className="text-rose-400" />
                    <span>Website &amp; Event Presence</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Device and browser type, IP address, and pages visited (through essential cookies). At physical venue events: attendance records, badge scans, and official event photographs or videos.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 03: How We Use It */}
            <section id="how-we-use-it" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  03
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  How We Use It
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                Your data is processed strictly for the execution, fair administration, and safety of the festival and its interactive games:
              </p>
              <ul className="space-y-2.5 text-sm text-white/80">
                <li className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <CheckCircle2 size={16} className="text-[#fec01f] shrink-0 mt-0.5" />
                  <span>To sell tickets, process payments, and manage your festival registration.</span>
                </li>
                <li className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <CheckCircle2 size={16} className="text-[#fec01f] shrink-0 mt-0.5" />
                  <span>To send you event updates, schedules, speaker notifications, and important attendee advisories.</span>
                </li>
                <li className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <CheckCircle2 size={16} className="text-[#fec01f] shrink-0 mt-0.5" />
                  <span>To manage the FinTech Awards, speaker sessions, and exhibition booths.</span>
                </li>
                <li className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <CheckCircle2 size={16} className="text-[#fec01f] shrink-0 mt-0.5" />
                  <span>To enforce fair tournament play in the Snakes &amp; Ladders arena (one official game run per player account).</span>
                </li>
                <li className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <CheckCircle2 size={16} className="text-[#fec01f] shrink-0 mt-0.5" />
                  <span>To display voluntary leaderboard scores and generate customized social sharing cards.</span>
                </li>
                <li className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <CheckCircle2 size={16} className="text-[#fec01f] shrink-0 mt-0.5" />
                  <span>To answer your questions, resolve technical support requests, and address feedback.</span>
                </li>
                <li className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <CheckCircle2 size={16} className="text-[#fec01f] shrink-0 mt-0.5" />
                  <span>To send marketing about future events, <em>only if you explicitly agree</em>. You can unsubscribe at any time.</span>
                </li>
                <li className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <CheckCircle2 size={16} className="text-[#fec01f] shrink-0 mt-0.5" />
                  <span>To run the event safely, protect against fraud or bot manipulation, and meet statutory Sri Lankan accounting requirements.</span>
                </li>
              </ul>
            </section>

            {/* Section 04: Who We Share It With */}
            <section id="who-we-share-it-with" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  04
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Who We Share It With
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base font-semibold text-white">
                We do not sell your personal data. Under no circumstances do we trade, lease, or monetize your information.
              </p>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                We share it only with:
              </p>
              <div className="space-y-3 text-xs sm:text-sm text-white/80">
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                  <strong className="text-white block mb-1">• Trusted Service Providers:</strong>
                  <span>
                    Infrastructure and technology partners who help us run the website, database, and event (Supabase PostgreSQL, Vercel cloud hosting, Google OAuth authentication, payment processing, and event badge check-in).
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                  <strong className="text-white block mb-1">• Sponsors or Exhibitors:</strong>
                  <span>
                    <em>Only if you agree</em> (for example, by voluntarily consenting to let an exhibitor scan your conference badge or participating in sponsored partner quizzes).
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                  <strong className="text-white block mb-1">• Awards Judges:</strong>
                  <span>
                    Independent evaluation panels assessing festival award submissions.
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                  <strong className="text-white block mb-1">• Legal Authorities &amp; Professional Advisers:</strong>
                  <span>
                    Where required by Sri Lankan law or statutory regulatory bodies.
                  </span>
                </div>
              </div>

              {/* Google Limited Use Callout Box */}
              <div className="mt-4 p-5 rounded-2xl border-2 border-[#fec01f]/40 bg-gradient-to-br from-[#fec01f]/10 via-[#0a0a28] to-[#06061f] space-y-3">
                <div className="flex items-center gap-2 text-[#fec01f] font-heading font-bold text-base">
                  <Lock size={18} />
                  <span>Google API Services User Data Policy Compliance</span>
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
                  , including the <strong>Limited Use</strong> requirements. We never transfer Google user data to advertising networks or AI model trainers.
                </p>
              </div>

              <p className="text-xs text-white/60 leading-relaxed pt-2">
                Your name, job title, and company may appear on your attendee badge. Speakers and award winners may be named on the website and in festival promotional material. Some of our cloud providers may store data outside Sri Lanka; we ensure all cross-border transfers are protected as the law requires.
              </p>
            </section>

            {/* Section 05: How Long We Keep It */}
            <section id="how-long-we-keep-it" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  05
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  How Long We Keep It
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                We keep your data only until the Festival and its audit activities are concluded:
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-white/80 list-disc list-inside">
                <li>If you have agreed to receive marketing about future FinTech Festival editions, we keep your contact details until you unsubscribe.</li>
                <li>Official tournament scores and leaderboard records are retained for the duration of the 2026 campaign to distribute awards and prizes.</li>
                <li>Where the law requires us to keep certain records (for example, payment, invoicing, and accounting records), we keep those for the period mandated by Sri Lankan statute.</li>
                <li>After that, we securely delete or permanently anonymise your data.</li>
              </ul>
            </section>

            {/* Section 06: Cookies */}
            <section id="cookies" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  06
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Cookies &amp; Local Storage
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                We use cookies and local browser storage to make the website and game arena work seamlessly:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <strong className="text-[#fec01f] block text-sm mb-1">Essential Session Authentication</strong>
                  <p className="text-white/70 leading-relaxed">
                    Managed by Supabase Auth (<code className="text-white/90">sb-*-auth-token</code>) to verify your secure session token across pages.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <strong className="text-teal-400 block text-sm mb-1">Game Progress &amp; Preferences</strong>
                  <p className="text-white/70 leading-relaxed">
                    Local storage records your sound mute preferences, daily puzzle draft moves, and share card customizations so they persist when you return.
                  </p>
                </div>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                The main festival portal (<code className="text-[#fec01f]">fintechfestival.lk</code>) may use Google Analytics and Meta Pixel to understand event traffic. You can block or delete cookies in your browser settings, though authenticated arena features require cookies to stay logged in.
              </p>
            </section>

            {/* Section 07: Security */}
            <section id="security" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  07
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Security
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                We use reasonable organizational and technical measures to protect your personal data. All web traffic is transmitted via HTTPS/TLS 1.3 encryption, and database tables are protected with PostgreSQL Row Level Security (RLS).
              </p>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                No online system is completely infallible, but if a data security incident affects you, we will promptly notify you and the Data Protection Authority of Sri Lanka as required by law. All card payments for festival passes are processed directly through secure PCI-DSS compliant payment gateways; we never store your payment card numbers.
              </p>
            </section>

            {/* Section 08: Your Rights */}
            <section id="your-rights" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  08
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Your Rights Under Sri Lanka PDPA
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                Under the <strong>Personal Data Protection Act, No. 9 of 2022</strong>, you have the right to:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                  <strong className="text-white block mb-1">Access Your Personal Data</strong>
                  <span className="text-white/70">
                    Ask us to show you the personal data and player records we hold about you.
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                  <strong className="text-white block mb-1">Correction &amp; Rectification</strong>
                  <span className="text-white/70">
                    Update or correct inaccurate display names, profile pictures, or contact details.
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                  <strong className="text-white block mb-1">Deletion &amp; Erasure</strong>
                  <span className="text-white/70">
                    Ask us to erase your player account, scores, and match runs completely.
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                  <strong className="text-white block mb-1">Withdraw Consent</strong>
                  <span className="text-white/70">
                    Stop using your data for marketing or immediately remove your name from the public leaderboard.
                  </span>
                </div>
              </div>
              <p className="text-xs text-white/70 leading-relaxed pt-1">
                You also have the right to lodge a complaint with the <strong>Data Protection Authority of Sri Lanka</strong> if you believe your data has been handled inconsistently with the law. To make any request, please reach out to our team below.
              </p>
            </section>

            {/* Section 09: Contact Us */}
            <section id="contact-us" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  09
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Contact Us
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                For any question about this policy, or to exercise your rights under the PDPA regarding your personal data, please get in touch with our team:
              </p>

              <div className="p-6 rounded-2xl border border-white/15 bg-white/[0.03] space-y-5">
                <div>
                  <span className="text-white/50 block font-mono text-xs uppercase tracking-wider">
                    Data Protection Enquiries &amp; Controller
                  </span>
                  <strong className="text-white font-heading text-lg block mt-0.5">
                    FinTech Forum (Guarantee) Limited
                  </strong>
                  <div className="flex items-start gap-2 text-white/70 text-sm mt-1">
                    <MapPin size={16} className="text-[#fec01f] shrink-0 mt-0.5" />
                    <span>No.161A, Dharmapala Mawatha, Colombo 07, Sri Lanka</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-white/50 block">GENERAL ENQUIRIES</span>
                    <a
                      href="mailto:connect@fintechfestival.lk"
                      data-cursor="link"
                      className="text-[#fec01f] hover:underline font-bold text-sm inline-flex items-center gap-1.5 mt-0.5"
                    >
                      <Mail size={14} />
                      connect@fintechfestival.lk
                    </a>
                  </div>

                  <div>
                    <span className="text-white/50 block">SALES &amp; SPONSORSHIPS</span>
                    <a
                      href="mailto:sales@fintechfestival.lk"
                      data-cursor="link"
                      className="text-white hover:text-[#fec01f] font-medium text-sm inline-flex items-center gap-1.5 mt-0.5"
                    >
                      <Mail size={14} />
                      sales@fintechfestival.lk
                    </a>
                  </div>

                  <div>
                    <span className="text-white/50 block">SALES WHATSAPP</span>
                    <a
                      href="https://wa.me/94777930472"
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="link"
                      className="text-white hover:text-[#fec01f] font-medium text-sm inline-flex items-center gap-1.5 mt-0.5"
                    >
                      +94 77 793 0472
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 10: Changes */}
            <section id="changes" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center font-mono text-xs text-[#fec01f] font-bold">
                  10
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Changes &amp; Revisions
                </h2>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                We may update this policy periodically to reflect evolving festival features or statutory guidance from the Data Protection Authority of Sri Lanka. The latest version and effective date will always be posted on this page.
              </p>
            </section>

            {/* Bottom Actions */}
            <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/terms"
                data-cursor="link"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#fec01f] hover:text-[#fec01f]/80 transition-colors"
              >
                Read Arena Terms of Service <ArrowRight size={16} />
              </Link>
              <Link
                href="/"
                data-cursor="button"
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
