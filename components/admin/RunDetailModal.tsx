"use client";

import { useState, useEffect } from "react";
import {
  X,
  Shield,
  Heart,
  Trophy,
  Dices,
  HelpCircle,
  Clock,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
} from "lucide-react";

interface RunDetailModalProps {
  runId: string;
  onClose: () => void;
  adminKey?: string;
}

export default function RunDetailModal({
  runId,
  onClose,
  adminKey = "",
}: RunDetailModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"moves" | "ledger" | "quizzes">("moves");

  useEffect(() => {
    const fetchRunDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers: Record<string, string> = adminKey ? { "x-admin-key": adminKey } : {};
        const res = await fetch(`/api/admin/runs/${runId}`, {
          headers,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load run details");
        setData(json);
      } catch (err: any) {
        setError(err.message || "Failed to fetch run details");
      } finally {
        setLoading(false);
      }
    };

    fetchRunDetails();
  }, [runId, adminKey]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#080824] border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center text-[#fec01f]">
              <Activity size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  {data?.run?.player_profiles?.display_name || "Telemetry Inspector"}
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-white/70">
                  Run ID: {runId.slice(0, 8)}...
                </span>
              </div>
              <p className="text-xs text-white/50 font-mono mt-0.5">
                Authoritative server state &amp; move timeline
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-white/50">
            <div className="w-8 h-8 border-2 border-[#fec01f] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono uppercase tracking-widest">
              Reconstructing turn state...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 text-sm">
            <AlertTriangle className="mx-auto mb-2 text-red-400" size={24} />
            <span>{error}</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Run Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-[10px] font-mono uppercase text-white/50 block">Status</span>
                <span className="text-sm font-bold capitalize text-[#fec01f]">
                  {data.run.status.replace("_", " ")}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-[10px] font-mono uppercase text-white/50 block">Final Score</span>
                <span className="text-sm font-bold text-white font-mono">
                  {data.run.player_score} pts
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-[10px] font-mono uppercase text-white/50 block">Hearts / Shields</span>
                <span className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                  <span className="text-red-400 flex items-center gap-1">
                    <Heart size={14} className="fill-current" />
                    {data.run.player_hearts}
                  </span>
                  <span className="text-blue-400 flex items-center gap-1">
                    <Shield size={14} className="fill-current" />
                    {data.run.player_shields}
                  </span>
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-[10px] font-mono uppercase text-white/50 block">Duration / Seed</span>
                <span className="text-xs font-mono text-white/80 block mt-1">
                  {data.run.duration_seconds ? `${data.run.duration_seconds}s` : "In-flight"} · Seed: {data.run.board_seed || "Classic"}
                </span>
              </div>
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <button
                onClick={() => setActiveSubTab("moves")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
                  activeSubTab === "moves"
                    ? "bg-[#fec01f]/20 text-[#fec01f] border border-[#fec01f]/40 font-bold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Turn Moves ({data.moves?.length || 0})
              </button>
              <button
                onClick={() => setActiveSubTab("ledger")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
                  activeSubTab === "ledger"
                    ? "bg-[#fec01f]/20 text-[#fec01f] border border-[#fec01f]/40 font-bold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Score Ledger ({data.ledger?.length || 0})
              </button>
              <button
                onClick={() => setActiveSubTab("quizzes")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
                  activeSubTab === "quizzes"
                    ? "bg-[#fec01f]/20 text-[#fec01f] border border-[#fec01f]/40 font-bold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Quiz Responses ({data.quizAttempts?.length || 0})
              </button>
            </div>

            {/* Tab: Turn Moves */}
            {activeSubTab === "moves" && (
              <div className="space-y-2">
                {data.moves?.length === 0 ? (
                  <p className="text-xs text-white/50 italic py-4 text-center">
                    No moves logged yet for this run.
                  </p>
                ) : (
                  <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
                    {data.moves.map((m: any, idx: number) => (
                      <div
                        key={m.id || idx}
                        className="p-3 bg-white/[0.01] hover:bg-white/[0.04] flex items-center justify-between gap-4 text-xs font-mono"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center font-bold text-white/70">
                            #{m.turn_sequence}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                              m.actor === "player"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                            }`}
                          >
                            {m.actor}
                          </span>
                          <span className="text-white/80 flex items-center gap-1.5">
                            <Dices size={14} className="text-[#fec01f]" />
                            <span>Rolled <strong className="text-white">{m.dice_result}</strong></span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-white/50">Square {m.from_position}</span>
                          <ArrowRight size={12} className="text-white/30" />
                          <span className="text-[#fec01f] font-bold">Square {m.to_position}</span>
                        </div>

                        {Array.isArray(m.events) && m.events.length > 0 && (
                          <div className="flex items-center gap-1">
                            {m.events.map((ev: any, evIdx: number) => (
                              <span
                                key={evIdx}
                                className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-white/80"
                              >
                                {typeof ev === "string" ? ev : ev.type || "event"}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Score Ledger */}
            {activeSubTab === "ledger" && (
              <div className="space-y-2">
                {data.ledger?.length === 0 ? (
                  <p className="text-xs text-white/50 italic py-4 text-center">
                    No score ledger transactions recorded.
                  </p>
                ) : (
                  <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5 font-mono text-xs">
                    {data.ledger.map((entry: any, idx: number) => (
                      <div
                        key={entry.id || idx}
                        className="p-3 bg-white/[0.01] hover:bg-white/[0.04] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-white/40">Turn #{entry.turn_sequence}</span>
                          <span className="text-white font-semibold">{entry.event}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`font-bold ${
                              entry.delta > 0
                                ? "text-emerald-400"
                                : entry.delta < 0
                                ? "text-rose-400"
                                : "text-white/50"
                            }`}
                          >
                            {entry.delta > 0 ? `+${entry.delta}` : entry.delta} pts
                          </span>
                          <span className="text-white/60 text-[11px]">
                            Balance: {entry.balance_after}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Quiz Attempts */}
            {activeSubTab === "quizzes" && (
              <div className="space-y-3">
                {data.quizAttempts?.length === 0 ? (
                  <p className="text-xs text-white/50 italic py-4 text-center">
                    No quiz questions answered in this run.
                  </p>
                ) : (
                  data.quizAttempts.map((q: any, idx: number) => (
                    <div
                      key={q.id || idx}
                      className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between text-xs font-mono"
                    >
                      <div>
                        <span className="text-[#fec01f] font-bold block">
                          Square {q.square_number} · Question {q.question_id}
                        </span>
                        <span className="text-white/60 text-[11px] mt-0.5 block">
                          Selected Option Index: {q.selected_option}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          q.is_correct
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {q.is_correct ? "+50 Pts Correct" : "Incorrect"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-mono uppercase tracking-wider transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
