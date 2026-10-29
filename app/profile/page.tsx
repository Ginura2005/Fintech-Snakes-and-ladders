"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import FestivalHeader from "@/components/layout/FestivalHeader";
import FestivalFooter from "@/components/layout/FestivalFooter";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  User as UserIcon,
  Camera,
  Upload,
  Check,
  Trophy,
  Shield,
  RotateCcw,
  Save,
  ArrowLeft,
  Mail,
  Calendar,
  Gamepad2,
  AlertCircle,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { isGoogleAvatarUrl } from "@/lib/auth/google-avatar";

interface ProfileData {
  id: string;
  display_name: string;
  avatar_url: string | null;
  leaderboard_opt_in: boolean;
  created_at: string;
  google_avatar_url: string | null;
  google_name: string | null;
  email: string | null;
  provider: string;
}

interface ProfileStats {
  highScore: number;
  totalRuns: number;
  wins: number;
  rank: number | null;
}

const FESTIVAL_PRESETS = [
  {
    id: "gold_lion",
    name: "Festival Innovator",
    badge: "Champion",
    bg: "radial-gradient(circle, #fec01f 0%, #a87900 100%)",
    initials: "FI",
    textColor: "#000000",
  },
  {
    id: "cyber_shield",
    name: "Cyber Guardian",
    badge: "Security",
    bg: "radial-gradient(circle, #1ca085 0%, #0d5244 100%)",
    initials: "CG",
    textColor: "#ffffff",
  },
  {
    id: "quantum_node",
    name: "Quantum Analyst",
    badge: "DPI Hub",
    bg: "radial-gradient(circle, #6366f1 0%, #312e81 100%)",
    initials: "QA",
    textColor: "#ffffff",
  },
  {
    id: "fintech_titan",
    name: "FinTech Titan",
    badge: "Banking",
    bg: "radial-gradient(circle, #f57222 0%, #993300 100%)",
    initials: "FT",
    textColor: "#ffffff",
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(false);
  const [stats, setStats] = useState<ProfileStats>({
    highScore: 0,
    totalRuns: 0,
    wins: 0,
    rank: null,
  });
  const [profileMeta, setProfileMeta] = useState<ProfileData | null>(null);

  // Avatar source selection
  const [avatarSource, setAvatarSource] = useState<"google" | "custom" | "preset" | "none">("google");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push("/?error=auth_required");
        return;
      }

      setUser(authUser);

      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.profile) {
            setProfileMeta(data.profile);
            setDisplayName(data.profile.display_name || "");
            setAvatarUrl(data.profile.avatar_url || null);
            setLeaderboardOptIn(data.profile.leaderboard_opt_in ?? false);
            if (data.stats) setStats(data.stats);

            // Determine initial avatar source
            if (isGoogleAvatarUrl(data.profile.avatar_url) || (
              data.profile.avatar_url &&
              data.profile.google_avatar_url &&
              data.profile.avatar_url === data.profile.google_avatar_url
            )) {
              setAvatarSource("google");
            } else if (data.profile.avatar_url?.startsWith("data:image/")) {
              setAvatarSource("custom");
            } else if (data.profile.avatar_url?.startsWith("preset:")) {
              setAvatarSource("preset");
            } else if (data.profile.avatar_url) {
              setAvatarSource("custom");
            } else {
              setAvatarSource("none");
            }
          }
        }
      } catch (err) {
        console.error("Failed to load profile details:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [router, supabase.auth]);

  // Handle local image file upload & client-side compression to square WebP/PNG
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please choose an image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg("File size must be under 8MB.");
      return;
    }

    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const img = new window.Image();
      img.onload = () => {
        // Crop into square 256x256 canvas
        const canvas = document.createElement("canvas");
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

        // Convert to data URL
        const dataUrl = canvas.toDataURL("image/webp", 0.9);
        setAvatarUrl(dataUrl);
        setAvatarSource("custom");
      };
      img.src = uploadEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Switch to Google Avatar
  const handleSelectGoogleAvatar = () => {
    if (profileMeta?.google_avatar_url) {
      setAvatarUrl(profileMeta.google_avatar_url);
      setAvatarSource("google");
    }
  };

  // Switch to Preset Avatar
  const handleSelectPreset = (preset: (typeof FESTIVAL_PRESETS)[0]) => {
    // Generate clean SVG data URL for the preset
    const svg = `
      <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="pGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#1ca085" />
            <stop offset="100%" stop-color="#0b2628" />
          </radialGradient>
        </defs>
        <rect width="256" height="256" fill="url(#pGrad)" />
        <circle cx="128" cy="128" r="110" fill="#082b2d" stroke="#FEC01F" stroke-width="6" />
        <text x="128" y="152" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="80" fill="#FEC01F">${preset.initials}</text>
      </svg>
    `;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    setAvatarUrl(dataUrl);
    setAvatarSource("preset");
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = displayName.trim();
    if (cleanName.length < 2 || cleanName.length > 24) {
      setErrorMsg("Display name must be between 2 and 24 characters.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: cleanName,
          avatarUrl: avatarUrl,
          leaderboardOptIn: leaderboardOptIn,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to update profile.");
      } else {
        setSuccessMsg("Profile updated successfully!");
        setProfileMeta((prev) =>
          prev ? { ...prev, display_name: cleanName, avatar_url: avatarUrl, leaderboard_opt_in: leaderboardOptIn } : null
        );
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error("Save profile error:", err);
      setErrorMsg("Connection error while updating profile.");
    } finally {
      setSaving(false);
    }
  };

  const winRate =
    stats.totalRuns > 0 ? Math.round((stats.wins / stats.totalRuns) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#06061f] text-white flex flex-col font-sans">
      <FestivalHeader user={user} activePath="/profile" />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Top Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Link
              href="/game"
              className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-[#fec01f] font-mono uppercase tracking-wider mb-2 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Game Arena</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Player Profile & Identity</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#fec01f]/15 border border-[#fec01f]/40 text-[#fec01f] font-mono uppercase">
                Official Arena
              </span>
            </h1>
            <p className="text-sm text-white/65 mt-1">
              Customize your festival handle, avatar, and share card settings for Sri Lanka FinTech Festival 2026.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/leaderboard"
              className="px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-mono uppercase tracking-wider inline-flex items-center gap-1.5 transition-all"
            >
              <Trophy size={14} className="text-[#fec01f]" />
              <span>View Leaderboard</span>
            </Link>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-[#8d1739]/30 border border-[#f43f5e]/50 text-[#fca5a5] flex items-center gap-3 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-[#1ca085]/20 border border-[#1ca085]/50 text-[#5eead4] flex items-center gap-3 text-sm">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner size="lg" />
            <span className="text-sm text-white/60 font-mono">Loading player dossier...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 7 Columns: Profile Configuration */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Avatar Selection Hub */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/15 shadow-xl">
                <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                  <Camera size={18} className="text-[#fec01f]" />
                  <span>Profile Avatar</span>
                </h2>

                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/10">
                  {/* Current Avatar Frame with Gold Rim and Crown motif */}
                  <div className="relative group shrink-0">
                    <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-[#fec01f] via-[#e5ac1b] to-[#8d1739] shadow-lg shadow-[#fec01f]/20">
                      <div className="w-full h-full rounded-full overflow-hidden bg-[#0a2628] flex items-center justify-center relative">
                        {avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={avatarUrl}
                            alt="Player Avatar"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="text-2xl font-black text-[#fec01f] tracking-wider">
                            {displayName.slice(0, 2).toUpperCase() || "FP"}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Crown badge indicator */}
                    <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-[#fec01f] text-black text-[10px] font-black uppercase shadow-md">
                      Pawn
                    </div>
                  </div>

                  <div className="space-y-1.5 text-center sm:text-left">
                    <div className="text-xs font-mono uppercase text-[#fec01f] tracking-wider">
                      Active Share Card Visual
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {avatarSource === "google"
                        ? "Official Google Profile Picture"
                        : avatarSource === "custom"
                        ? "Custom Uploaded Photo"
                        : avatarSource === "preset"
                        ? "Festival Character Preset"
                        : "Default Golden Initials"}
                    </div>
                    <p className="text-xs text-white/55">
                      This picture appears on your official downloadable scorecard and when you challenge rivals on WhatsApp, LinkedIn, and Stories.
                    </p>
                  </div>
                </div>

                {/* Avatar Source Selector Buttons */}
                <div className="mt-5 space-y-3">
                  <div className="text-xs font-mono uppercase text-white/60 tracking-wider">
                    Choose Picture Source
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Source 1: Google Account Photo */}
                    <button
                      type="button"
                      onClick={handleSelectGoogleAvatar}
                      disabled={!profileMeta?.google_avatar_url}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                        avatarSource === "google"
                          ? "border-[#fec01f] bg-[#fec01f]/10 shadow-sm"
                          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]"
                      } ${!profileMeta?.google_avatar_url ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 shrink-0 border border-white/20">
                        {profileMeta?.google_avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={profileMeta.google_avatar_url}
                            alt="Google Avatar"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <UserIcon size={20} className="m-2.5 text-white/50" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white flex items-center justify-between">
                          <span>Google Photo</span>
                          {avatarSource === "google" && (
                            <Check size={14} className="text-[#fec01f]" />
                          )}
                        </div>
                        <div className="text-[11px] text-white/50 truncate">
                          Synced with Google Login
                        </div>
                      </div>
                    </button>

                    {/* Source 2: Custom Upload */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                        avatarSource === "custom"
                          ? "border-[#fec01f] bg-[#fec01f]/10 shadow-sm"
                          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#1ca085]/20 border border-[#1ca085]/40 flex items-center justify-center shrink-0 text-[#1ca085]">
                        <Upload size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white flex items-center justify-between">
                          <span>Upload Photo</span>
                          {avatarSource === "custom" && (
                            <Check size={14} className="text-[#fec01f]" />
                          )}
                        </div>
                        <div className="text-[11px] text-white/50 truncate">
                          PNG, JPG or WebP
                        </div>
                      </div>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>

                  {/* Preset Avatars Row */}
                  <div className="pt-2">
                    <div className="text-[11px] font-mono uppercase text-white/50 mb-2">
                      Or Select Festival Character Preset
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {FESTIVAL_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectPreset(p)}
                          className="p-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:border-[#fec01f]/50 hover:bg-white/[0.07] flex flex-col items-center gap-1.5 transition-all text-center group"
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-md"
                            style={{ background: p.bg, color: p.textColor }}
                          >
                            {p.initials}
                          </div>
                          <span className="text-[11px] font-semibold text-white/80 group-hover:text-white truncate w-full">
                            {p.badge}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reset to Initials Option */}
                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarUrl(null);
                        setAvatarSource("none");
                      }}
                      className="text-xs text-white/50 hover:text-white/80 inline-flex items-center gap-1 font-mono transition-colors"
                    >
                      <RotateCcw size={12} />
                      <span>Reset to Plain Initials</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Display Name & Identity */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/15 shadow-xl space-y-5">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <UserIcon size={18} className="text-[#fec01f]" />
                  <span>Arena Identity</span>
                </h2>

                <div className="space-y-1.5">
                  <label
                    htmlFor="displayName"
                    className="block text-xs font-mono uppercase tracking-wider text-white/70"
                  >
                    Display Name / Handle
                  </label>
                  <div className="relative">
                    <input
                      id="displayName"
                      type="text"
                      value={displayName}
                      maxLength={24}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Kasun Silva"
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/20 focus:border-[#fec01f] focus:outline-none focus:ring-1 focus:ring-[#fec01f] text-white text-sm font-semibold tracking-wide transition-all"
                    />
                    <div className="absolute right-3 top-3 text-xs font-mono text-white/40">
                      {displayName.length}/24
                    </div>
                  </div>
                  <p className="text-xs text-white/50">
                    Displayed on your official share cards, challenge links, and tournament leaderboards.
                  </p>
                </div>

                {/* 3. Leaderboard Opt-In Switch */}
                <div className="pt-3 border-t border-white/10">
                  <label className="flex items-start gap-3.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={leaderboardOptIn}
                      onChange={(e) => setLeaderboardOptIn(e.target.checked)}
                      className="mt-1 h-5 w-5 rounded border-white/30 bg-black/50 text-[#fec01f] focus:ring-[#fec01f] focus:ring-offset-0 cursor-pointer accent-[#fec01f]"
                    />
                    <div className="space-y-1 flex-1">
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Show My Score on Public Arena Leaderboard</span>
                        <Trophy size={14} className="text-[#fec01f]" />
                      </div>
                      <p className="text-xs text-white/55 leading-relaxed">
                        Qualifies you for the official Sri Lanka FinTech Festival 2026 leaderboard awards and LKR 10,000 Grand Prize passes. You can toggle this off anytime.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* 4. Save Button */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-white/40 font-mono">
                  Changes take effect immediately on new share cards.
                </span>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-[#fec01f] hover:bg-[#e5ac1b] text-black font-bold text-sm tracking-wide uppercase inline-flex items-center gap-2 shadow-lg shadow-[#fec01f]/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right 5 Columns: Account Dossier & Career Record */}
            <div className="lg:col-span-5 space-y-6">
              {/* Career Arena Dossier */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#125252]/25 to-black/60 border border-[#1ca085]/40 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#1ca085] flex items-center gap-1.5">
                    <Shield size={14} />
                    <span>Arena Record</span>
                  </h3>
                  {stats.rank && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#fec01f]/20 border border-[#fec01f]/50 text-[#fec01f] text-xs font-mono font-bold">
                      Rank #{stats.rank}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                    <div className="text-[11px] font-mono uppercase text-white/50">High Score</div>
                    <div className="text-2xl font-black text-[#fec01f] mt-1">
                      {stats.highScore.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-white/40 font-mono mt-0.5">Points Recorded</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                    <div className="text-[11px] font-mono uppercase text-white/50">Win Rate vs AI</div>
                    <div className="text-2xl font-black text-white mt-1">
                      {winRate}%
                    </div>
                    <div className="text-[10px] text-white/40 font-mono mt-0.5">
                      {stats.wins} Wins / {stats.totalRuns} Runs
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-xs text-white/60 flex items-center justify-between border-t border-white/10">
                  <span className="flex items-center gap-1">
                    <Gamepad2 size={13} className="text-[#fec01f]" />
                    <span>Total Matches:</span>
                  </span>
                  <span className="font-mono font-bold text-white">{stats.totalRuns}</span>
                </div>
              </div>

              {/* Account Security & Google Metadata (Read-Only) */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 shadow-lg space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-white/60">
                  Authentication Details
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-white/50 flex items-center gap-1.5">
                      <Mail size={13} />
                      <span>Email</span>
                    </span>
                    <span className="font-mono text-white/90 truncate max-w-[200px]">
                      {profileMeta?.email || user?.email || "Unknown"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-white/50 flex items-center gap-1.5">
                      <Mail size={13} />
                      <span>Provider</span>
                    </span>
                    <span className="font-mono text-white/90 uppercase">
                      Google OAuth 2.0
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-white/50 flex items-center gap-1.5">
                      <Calendar size={13} />
                      <span>Enrolled</span>
                    </span>
                    <span className="font-mono text-white/70">
                      {profileMeta?.created_at
                        ? new Date(profileMeta.created_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "2026 Season"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Share Card Appearance Preview Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#4a061a]/40 to-black/80 border border-[#fec01f]/30 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-[#fec01f] tracking-wider flex items-center gap-1.5">
                    <Eye size={13} />
                    <span>Card Name Tag Preview</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#fec01f]/20 text-[#fec01f] font-mono">
                    Official
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full border-2 border-[#fec01f] overflow-hidden bg-[#042a2d] shrink-0 flex items-center justify-center">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-xs font-black text-[#fec01f]">
                          {displayName.slice(0, 2).toUpperCase() || "FP"}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono text-[#fec01f] uppercase tracking-wider">
                        PLAYER BADGE
                      </div>
                      <div className="text-sm font-black text-white truncate uppercase tracking-wide">
                        {displayName.trim() || "CHALLENGER"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-mono text-white/50 uppercase">ARENA SCORE</div>
                    <div className="text-base font-black text-[#fed136]">
                      {stats.highScore > 0 ? stats.highScore.toLocaleString() : "0"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <FestivalFooter />
    </div>
  );
}
