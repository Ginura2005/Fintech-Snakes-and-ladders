"use client";

import {
  Users,
  Gamepad2,
  Trophy,
  Flame,
  Clock,
  HelpCircle,
  Database,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Download,
  RotateCcw,
  Sparkles,
  Shield,
  Activity,
} from "lucide-react";
import TournamentCountdown from "@/components/tournament/TournamentCountdown";

interface AdminStats {
  summary: {
    totalPlayers: number;
    totalRuns: number;
    inProgress: number;
    playerWon: number;
    computerWon: number;
    playerEliminated: number;
    completed: number;
    winRatePercent: number;
    highScore: number;
    avgScore: number;
    fastestWinSeconds: number | null;
    avgDurationSeconds: number | null;
    totalLeaderboard: number;
    totalQuizzes: number;
    correctQuizzes: number;
    quizAccuracyRate: number;
  };
  tablesHealth: {
    player_profiles: boolean;
    game_runs: boolean;
    leaderboard_entries: boolean;
    quiz_attempts: boolean;
  };
}

interface CommandCenterTabProps {
  stats: AdminStats | null;
  loading: boolean;
  onNavigateTab: (tabId: string) => void;
  onExportCsv: () => void;
}

export default function CommandCenterTab({
  stats,
  loading,
  onNavigateTab,
  onExportCsv,
}: CommandCenterTabProps) {
  if (loading || !stats) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3 text-white/50">
        <div className="w-8 h-8 border-2 border-[#fec01f] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest">
          Polling telemetry and database state...
        </p>
      </div>
    );
  }

  const { summary, tablesHealth } = stats;

  return (
    <div className="space-y-8">
      {/* Tournament Deadline Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#fec01f]/30 bg-gradient-to-r from-[#06061f] via-[#125252]/40 to-[#06061f] p-6 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#fec01f]/15 border border-[#fec01f]/40 text-[#fec01f] text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles size={13} />
              <span>Official Festival Tournament</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Sri Lanka FinTech Festival 2026 Ticket Cutoff
            </h2>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Ticket distribution to the physical festival (Nov 2–3, 2026) locks on{" "}
              <strong className="text-white">October 31, 2026 at 23:59:59 (+05:30)</strong>.
              Arbiters can audit ties, inspect anomalies, and export winner lists directly below.
            </p>
          </div>

          <div className="shrink-0 bg-white/5 border border-white/10 rounded-xl p-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/50 mb-1 text-center">
              Time Remaining Until Snapshot
            </p>
            <TournamentCountdown compact />
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Registered Players */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-[#fec01f]/40 transition-all group">
          <div className="flex items-center justify-between text-white/60 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Total Players</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {summary.totalPlayers}
            </span>
            <span className="text-xs text-white/50 font-mono">registered</span>
          </div>
          <p className="text-[11px] text-white/40 mt-2">
            Google OAuth profile records created
          </p>
        </div>

        {/* Arena Game Runs */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-[#fec01f]/40 transition-all group">
          <div className="flex items-center justify-between text-white/60 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Arena Runs</span>
            <div className="w-8 h-8 rounded-lg bg-[#fec01f]/10 text-[#fec01f] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Gamepad2 size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {summary.totalRuns}
            </span>
            <span className="text-xs text-[#fec01f] font-mono">
              ({summary.inProgress} active)
            </span>
          </div>
          <p className="text-[11px] text-white/40 mt-2">
            {summary.completed} matches finished ({summary.playerWon} wins)
          </p>
        </div>

        {/* Win Rate */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-[#fec01f]/40 transition-all group">
          <div className="flex items-center justify-between text-white/60 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Player Win Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 font-mono">
              {summary.winRatePercent}%
            </span>
            <span className="text-xs text-white/50 font-mono">vs Computer AI</span>
          </div>
          <p className="text-[11px] text-white/40 mt-2">
            {summary.computerWon} AI wins · {summary.playerEliminated} eliminated
          </p>
        </div>

        {/* Top Score & Average */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-[#fec01f]/40 transition-all group">
          <div className="flex items-center justify-between text-white/60 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">High / Avg Score</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Flame size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {summary.highScore}
            </span>
            <span className="text-xs text-white/50 font-mono">
              avg: {summary.avgScore} pts
            </span>
          </div>
          <p className="text-[11px] text-white/40 mt-2">
            Fastest win: {summary.fastestWinSeconds ? `${summary.fastestWinSeconds}s` : "N/A"}
          </p>
        </div>
      </div>

      {/* Secondary Metrics & Database Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quiz Bank Accuracy */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
                <HelpCircle size={16} className="text-purple-400" />
                <span>FinTech Quiz Health</span>
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                25 Questions
              </span>
            </div>
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-black text-white font-mono">
                {summary.quizAccuracyRate}%
              </span>
              <span className="text-xs text-white/60 font-mono">
                correct answer rate
              </span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              {summary.correctQuizzes} correct answers across {summary.totalQuizzes} total
              player quiz square encounters.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab("quizzes")}
            className="mt-5 w-full py-2.5 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <span>View Question Analytics</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Database Health Check */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
                <Database size={16} className="text-cyan-400" />
                <span>PostgreSQL Schemas</span>
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                Supabase RLS
              </span>
            </div>
            <div className="space-y-2">
              {Object.entries(tablesHealth).map(([table, isHealthy]) => (
                <div
                  key={table}
                  className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-white/[0.03] text-xs font-mono"
                >
                  <span className="text-white/80">{table}</span>
                  {isHealthy ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                      <CheckCircle2 size={13} />
                      <span>Ready</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-400 text-[11px]">
                      <XCircle size={13} />
                      <span>Pending Migration</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-white/40 mt-4">
            Service role client bypasses RLS for administrative auditing.
          </p>
        </div>

        {/* Quick Operations Actions */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
                <Activity size={16} className="text-[#fec01f]" />
                <span>Operational Shortcuts</span>
              </h3>
            </div>
            <div className="space-y-2.5">
              <button
                onClick={() => onNavigateTab("runs")}
                className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-[#fec01f]/10 border border-white/10 hover:border-[#fec01f]/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-[#fec01f]">
                    Arena Game Runs &amp; Resets
                  </p>
                  <p className="text-[11px] text-white/50">
                    Reset player attempt or inspect move history
                  </p>
                </div>
                <ArrowRight size={14} className="text-white/40 group-hover:text-[#fec01f]" />
              </button>

              <button
                onClick={() => onNavigateTab("leaderboard")}
                className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-[#fec01f]/10 border border-white/10 hover:border-[#fec01f]/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-[#fec01f]">
                    Fair Play &amp; Audit
                  </p>
                  <p className="text-[11px] text-white/50">
                    Disqualify fraudulent runs &amp; inspect ties
                  </p>
                </div>
                <ArrowRight size={14} className="text-white/40 group-hover:text-[#fec01f]" />
              </button>

              <button
                onClick={() => onNavigateTab("simulator")}
                className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-[#fec01f]/10 border border-white/10 hover:border-[#fec01f]/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-[#fec01f]">
                    Procedural Board Simulator
                  </p>
                  <p className="text-[11px] text-white/50">
                    Test Mulberry32 board seeds &amp; snake densities
                  </p>
                </div>
                <ArrowRight size={14} className="text-white/40 group-hover:text-[#fec01f]" />
              </button>
            </div>
          </div>

          <button
            onClick={onExportCsv}
            className="mt-4 w-full py-2.5 px-4 rounded-xl bg-[#fec01f] hover:bg-[#e5ac1b] text-black font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
          >
            <Download size={14} />
            <span>Export Official Ticket Winners CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
