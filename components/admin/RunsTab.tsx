"use client";

import { useState } from "react";
import {
  RotateCcw,
  Trash2,
  Eye,
  Search,
  Filter,
  Heart,
  Shield,
  HelpCircle,
  Gem,
  AlertTriangle,
  Clock,
} from "lucide-react";
import RunDetailModal from "./RunDetailModal";

interface RunItem {
  id: string;
  playerId: string;
  displayName: string;
  avatarUrl?: string;
  leaderboardOptIn: boolean;
  status: string;
  currentTurn: string;
  turnSequence: number;
  playerPosition: number;
  computerPosition: number;
  playerHearts: number;
  computerHearts: number;
  playerShields: number;
  computerShields: number;
  playerScore: number;
  computerScore: number;
  playerQuizCorrect: number;
  treasuresCount: number;
  boardSeed: number;
  startedAt: string;
  completedAt?: string;
  durationSeconds?: number;
}

interface RunsTabProps {
  runs: RunItem[];
  loading: boolean;
  adminKey?: string;
  onRefresh: () => void;
}

export default function RunsTab({
  runs,
  loading,
  adminKey = "",
  onRefresh,
}: RunsTabProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [inspectRunId, setInspectRunId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Filter runs locally or trigger search
  const filteredRuns = runs.filter((r) => {
    if (selectedStatus !== "all" && r.status !== selectedStatus) return false;
    if (searchTerm.trim().length > 0) {
      const q = searchTerm.toLowerCase();
      return (
        r.displayName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.playerId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleResetRun = async (run: RunItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to RESET the official attempt for player "${run.displayName}"?\n\nThis will remove their current game progress and leaderboard entry, allowing them to start an entirely fresh run.`
    );
    if (!confirmed) return;

    setActionLoading(run.id);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/runs/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminKey ? { "x-admin-key": adminKey } : {}),
        },
        body: JSON.stringify({ playerId: run.playerId, runId: run.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset run");

      setMessage({
        text: `Run reset for ${run.displayName}. They can now play again.`,
        type: "success",
      });
      onRefresh();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to reset run", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteRun = async (run: RunItem) => {
    const confirmed = window.confirm(
      `Delete run ${run.id.slice(0, 8)}... permanently? This cannot be undone.`
    );
    if (!confirmed) return;

    setActionLoading(run.id);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/runs?runId=${run.id}`, {
        method: "DELETE",
        headers: adminKey ? { "x-admin-key": adminKey } : {},
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete run");

      setMessage({ text: "Run deleted successfully", type: "success" });
      onRefresh();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to delete run", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by player name or run ID..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#fec01f] font-mono"
          />
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All" },
            { id: "in_progress", label: "Active" },
            { id: "player_won", label: "Player Won" },
            { id: "computer_won", label: "AI Won" },
            { id: "player_eliminated", label: "Eliminated" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-colors ${
                selectedStatus === tab.id
                  ? "bg-[#fec01f] text-black font-bold"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="underline font-mono text-[10px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Runs Table */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/5 border-b border-white/10 text-white/50 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Score</th>
                <th className="py-3 px-3">Position</th>
                <th className="py-3 px-3">Hearts/Shields</th>
                <th className="py-3 px-3">Quizzes</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-3">Started</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-white/50">
                    Loading game runs...
                  </td>
                </tr>
              ) : filteredRuns.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-white/40 italic">
                    No runs matched the selected filter or search.
                  </td>
                </tr>
              ) : (
                filteredRuns.map((r) => {
                  const isBusy = actionLoading === r.id;

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      {/* Player */}
                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold text-white text-sm">
                          {r.displayName}
                        </div>
                        <div className="text-[10px] text-white/40 font-mono">
                          {r.id.slice(0, 8)}... · Seed {r.boardSeed || 2026}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            r.status === "player_won"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : r.status === "computer_won"
                              ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                              : r.status === "player_eliminated"
                              ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                              : "bg-[#fec01f]/15 text-[#fec01f] border border-[#fec01f]/30"
                          }`}
                        >
                          {r.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Score */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-white">{r.playerScore}</span>
                        <span className="text-white/40 text-[10px] block">
                          AI: {r.computerScore}
                        </span>
                      </td>

                      {/* Position */}
                      <td className="py-3 px-3">
                        <span className="text-white">Sq {r.playerPosition}</span>
                        <span className="text-white/40 text-[10px] block">
                          AI Sq {r.computerPosition}
                        </span>
                      </td>

                      {/* Hearts / Shields */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-red-400 flex items-center gap-0.5">
                            <Heart size={12} className="fill-current" />
                            {r.playerHearts}
                          </span>
                          <span className="text-blue-400 flex items-center gap-0.5">
                            <Shield size={12} className="fill-current" />
                            {r.playerShields}
                          </span>
                        </div>
                      </td>

                      {/* Quizzes */}
                      <td className="py-3 px-3">
                        <span className="text-white">{r.playerQuizCorrect} correct</span>
                        <span className="text-white/40 text-[10px] block">
                          {r.treasuresCount} treasures
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-3 text-white/70">
                        {r.durationSeconds ? `${r.durationSeconds}s` : "In-flight"}
                      </td>

                      {/* Started */}
                      <td className="py-3 px-3 text-white/50 text-[11px]">
                        {new Date(r.startedAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect */}
                          <button
                            onClick={() => setInspectRunId(r.id)}
                            title="Inspect Run Telemetry"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Reset Attempt */}
                          <button
                            onClick={() => handleResetRun(r)}
                            disabled={isBusy}
                            title="Reset Run (Allow Replay)"
                            className="p-1.5 rounded-lg bg-[#fec01f]/10 hover:bg-[#fec01f]/20 text-[#fec01f] transition-colors disabled:opacity-50"
                          >
                            <RotateCcw size={14} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteRun(r)}
                            disabled={isBusy}
                            title="Delete Run"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Run Telemetry Modal */}
      {inspectRunId && (
        <RunDetailModal
          runId={inspectRunId}
          adminKey={adminKey}
          onClose={() => setInspectRunId(null)}
        />
      )}
    </div>
  );
}
