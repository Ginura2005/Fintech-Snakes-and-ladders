"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { signInWithGoogle } from "@/lib/auth/google-sign-in";
import {
  LayoutDashboard,
  Gamepad2,
  Trophy,
  HelpCircle,
  Dices,
  Puzzle,
  RefreshCw,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Lock,
  ArrowLeft,
  User as UserIcon,
  Crown,
  Megaphone,
  History,
} from "lucide-react";

import CommandCenterTab from "@/components/admin/CommandCenterTab";
import RunsTab from "@/components/admin/RunsTab";
import LeaderboardTab from "@/components/admin/LeaderboardTab";
import QuizBankTab from "@/components/admin/QuizBankTab";
import BoardSimulatorTab from "@/components/admin/BoardSimulatorTab";
import PuzzlesTab from "@/components/admin/PuzzlesTab";
import RolesManagementTab from "@/components/admin/RolesManagementTab";
import FestivalOperationsTab from "@/components/admin/FestivalOperationsTab";
import AuditLogsTab from "@/components/admin/AuditLogsTab";
import FestivalFooter from "@/components/layout/FestivalFooter";

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = checking
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("command_center");

  // Telemetry states
  const [stats, setStats] = useState<any>(null);
  const [runs, setRuns] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [quizCategories, setQuizCategories] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  // 1. Check user authentication & admin database privilege
  const checkAuthAndAdmin = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (!user) {
        setIsAdmin(false);
        return;
      }

      // Query database admin check endpoint
      const res = await fetch("/api/admin/check");
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(Boolean(data.isAdmin));
        setAdminRole(data.role || "admin");
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Admin verification error:", err);
      setIsAdmin(false);
    }
  }, [supabase.auth]);

  useEffect(() => {
    checkAuthAndAdmin();
  }, [checkAuthAndAdmin]);

  // 2. Fetch all telemetry datasets
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, runsRes, lbRes, quizRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/runs?limit=100"),
        fetch("/api/admin/leaderboard?limit=150"),
        fetch("/api/admin/quizzes"),
      ]);

      if (statsRes.status === 403 || statsRes.status === 401) {
        setIsAdmin(false);
        return;
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (runsRes.ok) {
        const runsData = await runsRes.json();
        setRuns(runsData.runs || []);
      }

      if (lbRes.ok) {
        const lbData = await lbRes.json();
        setLeaderboard(lbData.entries || []);
      }

      if (quizRes.ok) {
        const quizData = await quizRes.json();
        setQuizzes(quizData.questions || []);
        setQuizCategories(quizData.categories || {});
      }
    } catch (e) {
      console.error("Failed to load admin telemetry:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin, fetchAllData]);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle(supabase, {
        nextUrl: "/admin",
        onError: () => setSigningIn(false),
      });
    } catch {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  const handleExportCsv = async () => {
    try {
      const res = await fetch("/api/admin/leaderboard?format=csv");
      if (!res.ok) throw new Error("CSV generation failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fintechverse_ticket_winners_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || "Failed to download CSV");
    }
  };

  // State A: Checking auth
  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#06061f] flex flex-col items-center justify-center text-white/50 gap-3">
        <div className="w-8 h-8 border-2 border-[#fec01f] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest">
          Verifying administrative credentials...
        </p>
      </div>
    );
  }

  // State B: Not signed in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#06061f] text-white flex flex-col justify-between selection:bg-[#fec01f] selection:text-black">
        <header className="border-b border-white/10 bg-[#06061f]/90 py-4 px-6 flex items-center justify-between">
          <Link href="/" className="relative h-8 w-40 block">
            <Image
              src="/long-logo-removebg-preview.png"
              alt="Sri Lanka FinTech Festival"
              fill
              className="object-contain object-left"
              priority
            />
          </Link>
          <Link
            href="/"
            className="text-xs font-mono text-white/60 hover:text-white transition-colors"
          >
            ← Return to Arena
          </Link>
        </header>

        <div className="mx-auto w-full max-w-md px-4 py-16 text-center">
          <div className="bg-gradient-to-b from-[#0a0a28] to-[#040417] border border-white/15 rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="w-14 h-14 rounded-2xl bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center text-[#fec01f] mx-auto mb-4">
              <Lock size={26} />
            </div>

            <h2 className="text-xl font-black uppercase font-mono tracking-tight text-white">
              Administrator Gateway
            </h2>
            <p className="text-xs text-[#fec01f] font-mono tracking-widest uppercase mt-1">
              Sri Lanka FinTech Festival 2026
            </p>
            <p className="text-xs text-white/60 mt-3 leading-relaxed">
              Sign in with your authorized administrator Google account to access Mission Control.
            </p>

            <div className="mt-8">
              <button
                onClick={handleSignIn}
                disabled={signingIn}
                className="w-full py-3 px-4 rounded-xl bg-[#fec01f] hover:bg-[#e5ac1b] text-black font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-60"
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
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{signingIn ? "Connecting..." : "Sign in with Google"}</span>
              </button>
            </div>
          </div>
        </div>

        <FestivalFooter />
      </div>
    );
  }

  // State C: Signed in, but not an admin in the database table
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#06061f] text-white flex flex-col justify-between selection:bg-[#fec01f] selection:text-black">
        <header className="border-b border-white/10 bg-[#06061f]/90 py-4 px-6 flex items-center justify-between">
          <Link href="/" className="relative h-8 w-40 block">
            <Image
              src="/long-logo-removebg-preview.png"
              alt="Sri Lanka FinTech Festival"
              fill
              className="object-contain object-left"
              priority
            />
          </Link>
          <button
            onClick={handleSignOut}
            className="text-xs font-mono text-white/60 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </header>

        <div className="mx-auto w-full max-w-md px-4 py-16 text-center">
          <div className="bg-gradient-to-b from-[#1a0a14] to-[#0a040b] border border-red-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4">
              <ShieldAlert size={28} />
            </div>

            <h2 className="text-xl font-black uppercase font-mono tracking-tight text-white">
              403 Access Denied
            </h2>
            <p className="text-xs text-rose-400 font-mono tracking-widest uppercase mt-1">
              Unauthorized Account
            </p>

            <div className="my-5 p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white/80 break-all">
              {user.email}
            </div>

            <p className="text-xs text-white/60 leading-relaxed mb-6">
              This Google account does not have administrative privileges in the system database.
              If you are a festival arbiter, please request access from the system administrator.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={handleSignOut}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs uppercase tracking-wider transition-colors"
              >
                Switch Account
              </button>
              <Link
                href="/game"
                className="w-full py-2.5 px-4 rounded-xl bg-[#fec01f] hover:bg-[#e5ac1b] text-black font-bold font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center"
              >
                Return to Game
              </Link>
            </div>
          </div>
        </div>

        <FestivalFooter />
      </div>
    );
  }

  // State D: Authorized Admin!
  const tabs = [
    { id: "command_center", label: "Command Center", icon: LayoutDashboard },
    { id: "runs", label: "Arena Runs & Support", icon: Gamepad2, count: runs.length },
    { id: "leaderboard", label: "Tournament Podium", icon: Trophy, count: leaderboard.length },
    { id: "roles", label: "Team & Roles", icon: Crown },
    { id: "operations", label: "Broadcast & Ops", icon: Megaphone },
    { id: "audit", label: "Audit Log", icon: History },
    { id: "quizzes", label: "FinTech Quiz Bank", icon: HelpCircle, count: quizzes.length },
    { id: "simulator", label: "Board Seed Engine", icon: Dices },
    { id: "puzzles", label: "Puzzles Hub", icon: Puzzle, count: 6 },
  ];

  return (
    <div className="min-h-screen bg-[#06061f] text-white flex flex-col selection:bg-[#fec01f] selection:text-black">
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#06061f]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="relative h-8 w-36 sm:w-44 block">
              <Image
                src="/long-logo-removebg-preview.png"
                alt="Sri Lanka FinTech Festival"
                fill
                className="object-contain object-left"
                priority
              />
            </Link>

            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#fec01f]/15 border border-[#fec01f]/40 text-[#fec01f] text-[11px] font-mono font-bold uppercase tracking-wider">
              Mission Control
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin identity badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/80 max-w-[160px] truncate" title={user.email}>
                {user.email}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-[#fec01f]/20 text-[#fec01f] text-[10px] uppercase font-bold">
                {adminRole}
              </span>
            </div>

            <button
              onClick={fetchAllData}
              disabled={loading}
              title="Refresh Telemetry"
              className="h-9 px-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white flex items-center gap-1.5 text-xs font-mono transition-colors disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-[#fec01f]" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              href="/game"
              className="h-9 px-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white flex items-center gap-1.5 text-xs font-mono transition-colors"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">Arena</span>
            </Link>

            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="h-9 px-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center gap-1.5 text-xs font-mono transition-colors"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Row */}
        <div className="border-t border-white/5 bg-white/[0.01]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-[#fec01f]/15 text-[#fec01f] border border-[#fec01f]/40 font-bold shadow-sm"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon size={14} className={isActive ? "text-[#fec01f]" : "text-white/50"} />
                    <span>{tab.label}</span>
                    {typeof tab.count === "number" && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? "bg-[#fec01f]/30 text-[#fec01f]"
                            : "bg-white/10 text-white/50"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Tab Content View */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeTab === "command_center" && (
          <CommandCenterTab
            stats={stats}
            loading={loading}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onExportCsv={handleExportCsv}
          />
        )}

        {activeTab === "runs" && (
          <RunsTab
            runs={runs}
            loading={loading}
            onRefresh={fetchAllData}
          />
        )}

        {activeTab === "leaderboard" && (
          <LeaderboardTab
            entries={leaderboard}
            loading={loading}
            onRefresh={fetchAllData}
            onExportCsv={handleExportCsv}
          />
        )}

        {activeTab === "roles" && (
          <RolesManagementTab
            currentUserRole={adminRole}
            currentUserEmail={user?.email}
          />
        )}

        {activeTab === "operations" && (
          <FestivalOperationsTab onRefreshRuns={fetchAllData} />
        )}

        {activeTab === "audit" && (
          <AuditLogsTab />
        )}

        {activeTab === "quizzes" && (
          <QuizBankTab
            questions={quizzes}
            categories={quizCategories}
            loading={loading}
          />
        )}

        {activeTab === "simulator" && (
          <BoardSimulatorTab />
        )}

        {activeTab === "puzzles" && (
          <PuzzlesTab />
        )}
      </main>

      <FestivalFooter />
    </div>
  );
}
