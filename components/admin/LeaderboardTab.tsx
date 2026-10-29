"use client";

import { useState } from "react";
import {
  Trophy,
  Download,
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flame,
  Award,
  Heart,
  HelpCircle,
  Clock,
} from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  id: string;
  runId: string;
  playerId: string;
  displayName: string;
  finalScore: number;
  playerWon: boolean;
  quizCorrect: number;
  heartsRemaining: number;
  durationSeconds: number | null;
  optedIn: boolean;
  anomalyFlags: string[];
}

interface LeaderboardTabProps {
  entries: LeaderboardEntry[];
  loading: boolean;
  adminKey?: string;
  onRefresh: () => void;
  onExportCsv: () => void;
}

export default function LeaderboardTab({
  entries,
  loading,
  adminKey = "",
  onRefresh,
  onExportCsv,
}: LeaderboardTabProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterOptInOnly, setFilterOptInOnly] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const displayedEntries = filterOptInOnly
    ? entries.filter((e) => e.optedIn)
    : entries;

  const handleToggleOptIn = async (entry: LeaderboardEntry, targetOptIn: boolean) => {
    setActionLoading(entry.id);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/leaderboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminKey ? { "x-admin-key": adminKey } : {}),
        },
        body: JSON.stringify({
          playerId: entry.playerId,
          action: targetOptIn ? "opt_in" : "opt_out",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      setMessage(
        targetOptIn
          ? `Reinstated ${entry.displayName} to public leaderboard`
          : `Disqualified / removed ${entry.displayName} from public view`
      );
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to update player status");
    } finally {
      setActionLoading(null);
    }
  };

  const top3 = displayedEntries.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Top Banner & CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-950/30 to-[#06061f] border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={18} className="text-[#fec01f]" />
            <h3 className="text-base font-bold text-white">
              Official Festival Tournament Standings
            </h3>
          </div>
          <p className="text-xs text-white/60">
            Ranked by: Final Score ↓ · Won Status ↓ · Quiz Accuracy ↓ · Hearts Left ↓ · Duration (fastest) ↑
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-mono text-white/70 cursor-pointer">
            <input
              type="checkbox"
              checked={filterOptInOnly}
              onChange={(e) => setFilterOptInOnly(e.target.checked)}
              className="rounded bg-white/10 border-white/20 text-[#fec01f] focus:ring-0"
            />
            <span>Opted-In Only ({entries.filter((e) => e.optedIn).length})</span>
          </label>

          <button
            onClick={onExportCsv}
            className="py-2 px-3.5 rounded-xl bg-[#fec01f] hover:bg-[#e5ac1b] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all active:scale-95 font-mono"
          >
            <Download size={14} />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-[#fec01f]/10 border border-[#fec01f]/30 text-[#fec01f] text-xs font-mono flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="underline text-[10px]">
            Dismiss
          </button>
        </div>
      )}

      {/* Top 3 Podium Cards */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3.map((entry, idx) => {
            const medalColors = [
              "border-[#fec01f]/50 bg-[#fec01f]/5 text-[#fec01f]", // 1st
              "border-slate-300/40 bg-slate-300/5 text-slate-200", // 2nd
              "border-amber-700/50 bg-amber-700/5 text-amber-500", // 3rd
            ];

            return (
              <div
                key={entry.id}
                className={`relative p-5 rounded-2xl border ${medalColors[idx]} overflow-hidden`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-black font-mono text-sm">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-mono uppercase tracking-wider opacity-80">
                      {idx === 0 ? "Gold Leader" : idx === 1 ? "Silver" : "Bronze"}
                    </span>
                  </div>
                  <Award size={20} />
                </div>

                <h4 className="text-lg font-black text-white truncate mb-1">
                  {entry.displayName}
                </h4>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-black font-mono text-white">
                    {entry.finalScore}
                  </span>
                  <span className="text-xs font-mono opacity-60">points</span>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-3 border-t border-white/10 text-[10px] font-mono text-white/70 text-center">
                  <div>
                    <span className="block opacity-50">Quiz</span>
                    <span className="font-bold text-white">{entry.quizCorrect}/3</span>
                  </div>
                  <div>
                    <span className="block opacity-50">Hearts</span>
                    <span className="font-bold text-white">{entry.heartsRemaining}</span>
                  </div>
                  <div>
                    <span className="block opacity-50">Time</span>
                    <span className="font-bold text-white">
                      {entry.durationSeconds ? `${entry.durationSeconds}s` : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/5 border-b border-white/10 text-white/50 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-16">Rank</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-3">Score</th>
                <th className="py-3 px-3">Outcome</th>
                <th className="py-3 px-3">Quiz</th>
                <th className="py-3 px-3">Hearts</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-3">Public Opt-in</th>
                <th className="py-3 px-3">Audit Flags</th>
                <th className="py-3 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-white/50">
                    Loading tournament standings...
                  </td>
                </tr>
              ) : displayedEntries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-white/40 italic">
                    No leaderboard entries recorded yet.
                  </td>
                </tr>
              ) : (
                displayedEntries.map((e) => {
                  const isBusy = actionLoading === e.id;

                  return (
                    <tr
                      key={e.id}
                      className={`hover:bg-white/[0.03] transition-colors ${
                        e.anomalyFlags.length > 0 ? "bg-red-500/[0.03]" : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-white">
                        #{e.rank}
                      </td>

                      <td className="py-3 px-4 font-sans">
                        <span className="font-bold text-white text-sm block">
                          {e.displayName}
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">
                          ID: {e.playerId.slice(0, 8)}...
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-[#fec01f] text-sm">
                          {e.finalScore}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            e.playerWon
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-white/10 text-white/70"
                          }`}
                        >
                          {e.playerWon ? "Won" : "Finished"}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-white/80">
                        {e.quizCorrect} / 3
                      </td>

                      <td className="py-3 px-3 text-red-400">
                        {e.heartsRemaining} left
                      </td>

                      <td className="py-3 px-3 text-white/70">
                        {e.durationSeconds ? `${e.durationSeconds}s` : "N/A"}
                      </td>

                      <td className="py-3 px-3">
                        {e.optedIn ? (
                          <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                            <CheckCircle size={13} />
                            <span>Opted In</span>
                          </span>
                        ) : (
                          <span className="text-white/40 flex items-center gap-1 text-[11px]">
                            <XCircle size={13} />
                            <span>Private</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {e.anomalyFlags.length > 0 ? (
                          <span
                            title={e.anomalyFlags.join(", ")}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px]"
                          >
                            <AlertTriangle size={12} />
                            <span>Flagged ({e.anomalyFlags.length})</span>
                          </span>
                        ) : (
                          <span className="text-emerald-500/50 text-[11px]">Clean</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {e.optedIn ? (
                          <button
                            onClick={() => handleToggleOptIn(e, false)}
                            disabled={isBusy}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-mono uppercase tracking-wider transition-colors disabled:opacity-50"
                          >
                            Disqualify / Hide
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleOptIn(e, true)}
                            disabled={isBusy}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase tracking-wider transition-colors disabled:opacity-50"
                          >
                            Reinstate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
