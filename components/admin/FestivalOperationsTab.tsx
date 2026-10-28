"use client";

import { useState, useEffect } from "react";
import {
  Megaphone,
  Radio,
  Clock,
  PauseCircle,
  PlayCircle,
  StopCircle,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Send,
  Search,
  RotateCcw,
  Zap,
} from "lucide-react";

interface FestivalOperationsTabProps {
  onRefreshRuns?: () => void;
}

export default function FestivalOperationsTab({ onRefreshRuns }: FestivalOperationsTabProps) {
  // Announcement states
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementMessage, setAnnouncementMessage] = useState(
    "Welcome to Lanka FinTechVerse! Compete for official Sri Lanka FinTech Festival passes."
  );
  const [announcementType, setAnnouncementType] = useState<"info" | "warning" | "celebration" | "urgent">("info");
  const [announcementLoading, setAnnouncementLoading] = useState(false);

  // Tournament operational states
  const [tournamentStatus, setTournamentStatus] = useState<"open" | "paused" | "ended">("open");
  const [tournamentDeadline, setTournamentDeadline] = useState("2026-10-31T23:59:59+05:30");
  const [pausedMessage, setPausedMessage] = useState(
    "Arena is temporarily paused for live festival stage ceremonies. Resuming shortly!"
  );
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Booth quick search & reset
  const [boothSearch, setBoothSearch] = useState("");
  const [boothSearchResults, setBoothSearchResults] = useState<any[]>([]);
  const [searchingBooth, setSearchingBooth] = useState(false);
  const [boothResetLoading, setBoothResetLoading] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Load existing settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          const ann = data.settings?.announcement;
          if (ann) {
            setAnnouncementEnabled(Boolean(ann.enabled));
            setAnnouncementMessage(ann.message || "");
            setAnnouncementType(ann.type || "info");
          }

          const tourney = data.settings?.tournament_state;
          if (tourney) {
            setTournamentStatus(tourney.status || "open");
            setTournamentDeadline(tourney.deadline || "2026-10-31T23:59:59+05:30");
            setPausedMessage(tourney.paused_message || "");
          }
        }
      } catch (e) {
        console.error("Failed to load settings:", e);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveAnnouncement = async () => {
    setAnnouncementLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "announcement",
          value: {
            enabled: announcementEnabled,
            message: announcementMessage,
            type: announcementType,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update announcement");

      setFeedback({ text: "Live festival broadcast updated successfully!", type: "success" });
    } catch (err: any) {
      setFeedback({ text: err.message || "Failed to update announcement", type: "error" });
    } finally {
      setAnnouncementLoading(false);
    }
  };

  const handleSaveTournamentState = async () => {
    setSettingsLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "tournament_state",
          value: {
            status: tournamentStatus,
            deadline: tournamentDeadline,
            paused_message: pausedMessage,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update tournament state");

      setFeedback({ text: "Tournament operational state updated!", type: "success" });
    } catch (err: any) {
      setFeedback({ text: err.message || "Failed to update tournament state", type: "error" });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleBoothSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boothSearch.trim()) return;

    setSearchingBooth(true);
    try {
      const res = await fetch(`/api/admin/runs?search=${encodeURIComponent(boothSearch.trim())}&limit=10`);
      const data = await res.json();
      setBoothSearchResults(data.runs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingBooth(false);
    }
  };

  const handleQuickReset = async (run: any) => {
    const confirmed = window.confirm(
      `Issue free retry / reset attempt for booth visitor "${run.displayName}"?`
    );
    if (!confirmed) return;

    setBoothResetLoading(run.id);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/runs/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: run.playerId, runId: run.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset run");

      setFeedback({ text: `Reset run for ${run.displayName}. They can now play again.`, type: "success" });
      setBoothSearchResults((prev) => prev.filter((r) => r.id !== run.id));
      if (onRefreshRuns) onRefreshRuns();
    } catch (err: any) {
      setFeedback({ text: err.message || "Failed to reset run", type: "error" });
    } finally {
      setBoothResetLoading(null);
    }
  };

  const bannerTypeStyles = {
    info: "bg-teal-500/15 border-teal-500/40 text-teal-300",
    warning: "bg-orange-500/15 border-orange-500/40 text-orange-300",
    celebration: "bg-[#fec01f]/15 border-[#fec01f]/40 text-[#fec01f]",
    urgent: "bg-rose-500/15 border-rose-500/40 text-rose-300",
  };

  return (
    <div className="space-y-8">
      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-mono flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="underline text-[10px]">
            Dismiss
          </button>
        </div>
      )}

      {/* Grid: Broadcast Controller & Tournament Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Module 1: Live Broadcast & Announcement Banner */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone size={18} className="text-[#fec01f]" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Live Festival Broadcast Banner
              </h3>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={announcementEnabled}
                onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#fec01f]" />
              <span className="ml-2 text-xs font-mono text-white/70">
                {announcementEnabled ? "ACTIVE" : "OFF"}
              </span>
            </label>
          </div>

          <p className="text-xs text-white/60 leading-relaxed">
            Broadcast urgent tournament news, booth announcements, or stage ceremony updates live across the entire application header.
          </p>

          <div>
            <label className="block text-xs font-mono uppercase text-white/70 mb-2">
              Broadcast Message
            </label>
            <textarea
              rows={3}
              value={announcementMessage}
              onChange={(e) => setAnnouncementMessage(e.target.value)}
              placeholder="Enter announcement text..."
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#fec01f]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-white/60">Badge Accent:</span>
            {(["info", "celebration", "warning", "urgent"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setAnnouncementType(t)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider capitalize transition-all border ${
                  announcementType === t
                    ? `${bannerTypeStyles[t]} font-bold shadow-sm`
                    : "bg-white/5 border-white/10 text-white/50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Live Preview Card */}
          <div className="p-3.5 rounded-xl border border-white/10 bg-black/40">
            <span className="text-[10px] font-mono text-white/40 uppercase block mb-1.5">
              Live Preview
            </span>
            <div className={`p-2.5 rounded-lg border text-xs font-mono flex items-center gap-2 ${bannerTypeStyles[announcementType]}`}>
              <Radio size={14} className="animate-pulse shrink-0" />
              <span className="truncate">{announcementMessage || "No message set"}</span>
            </div>
          </div>

          <button
            onClick={handleSaveAnnouncement}
            disabled={announcementLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#fec01f] hover:bg-[#e5ac1b] text-black font-bold text-xs uppercase font-mono tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
          >
            <Send size={14} />
            <span>{announcementLoading ? "Publishing..." : "Publish Broadcast"}</span>
          </button>
        </div>

        {/* Module 2: Tournament Operational Mode */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-5">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#fec01f]" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Tournament Operational Mode
            </h3>
          </div>

          <p className="text-xs text-white/60 leading-relaxed">
            Control the live status of the Arena tournament. Pause during stage ceremonies or lock submissions when official snapshot time arrives.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "open", label: "Open Play", icon: PlayCircle, color: "text-emerald-400" },
              { id: "paused", label: "Intermission", icon: PauseCircle, color: "text-amber-400" },
              { id: "ended", label: "Snapshot Locked", icon: StopCircle, color: "text-rose-400" },
            ].map((st) => {
              const Icon = st.icon;
              const isSel = tournamentStatus === st.id;

              return (
                <button
                  key={st.id}
                  onClick={() => setTournamentStatus(st.id as any)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isSel
                      ? "bg-[#fec01f]/15 border-[#fec01f] font-bold text-white"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                  }`}
                >
                  <Icon size={18} className={`mx-auto mb-1 ${st.color}`} />
                  <span className="text-[11px] font-mono uppercase block">{st.label}</span>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-white/70 mb-2">
              Tournament Deadline (Snapshot Timestamp)
            </label>
            <input
              type="text"
              value={tournamentDeadline}
              onChange={(e) => setTournamentDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#fec01f]"
            />
          </div>

          {tournamentStatus === "paused" && (
            <div>
              <label className="block text-xs font-mono uppercase text-amber-300 mb-2">
                Intermission Banner Notice
              </label>
              <textarea
                rows={2}
                value={pausedMessage}
                onChange={(e) => setPausedMessage(e.target.value)}
                className="w-full px-3.5 py-2 bg-white/5 border border-white/15 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#fec01f]"
              />
            </div>
          )}

          <button
            onClick={handleSaveTournamentState}
            disabled={settingsLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase font-mono tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-white/15"
          >
            <CheckCircle2 size={14} className="text-[#fec01f]" />
            <span>{settingsLoading ? "Saving..." : "Save Tournament Operational Mode"}</span>
          </button>
        </div>
      </div>

      {/* Module 3: Festival Booth Instant Player Support & Re-entry Tool */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={18} className="text-[#fec01f]" />
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
            Festival Booth Quick-Support Tool
          </h3>
        </div>
        <p className="text-xs text-white/60 mb-5 max-w-xl">
          Instantly look up attendees playing at festival physical booths and reset their attempt if they experienced a mobile network interruption or device drop.
        </p>

        <form onSubmit={handleBoothSearch} className="flex items-center gap-3 max-w-lg mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              value={boothSearch}
              onChange={(e) => setBoothSearch(e.target.value)}
              placeholder="Search by player display name or run ID..."
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#fec01f]"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          </div>

          <button
            type="submit"
            disabled={searchingBooth}
            className="py-2.5 px-4 rounded-xl bg-[#fec01f] text-black font-bold text-xs font-mono uppercase tracking-wider hover:bg-[#e5ac1b] transition-all disabled:opacity-50 shrink-0"
          >
            {searchingBooth ? "Searching..." : "Find Player"}
          </button>
        </form>

        {boothSearchResults.length > 0 && (
          <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
            {boothSearchResults.map((run) => (
              <div
                key={run.id}
                className="p-3.5 bg-white/[0.01] hover:bg-white/[0.03] flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <span className="font-bold text-white text-sm block font-sans">
                    {run.displayName}
                  </span>
                  <span className="text-white/50 text-[11px]">
                    Status: <strong className="text-[#fec01f] uppercase">{run.status}</strong> · Score: {run.playerScore} · Square {run.playerPosition}
                  </span>
                </div>

                <button
                  onClick={() => handleQuickReset(run)}
                  disabled={boothResetLoading === run.id}
                  className="py-1.5 px-3 rounded-lg bg-[#fec01f] hover:bg-[#e5ac1b] text-black font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <RotateCcw size={12} />
                  <span>{boothResetLoading === run.id ? "Resetting..." : "Issue Free Re-entry"}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
