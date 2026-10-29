"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { generateResultCardBlob } from "@/lib/utils/card-generator";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  X,
  Download,
  Copy,
  Share2,
  Check,
  Camera,
  Upload,
  User as UserIcon,
  Sparkles,
  RotateCcw,
  Smartphone,
  Square,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export interface ShareCardCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFormat?: "post" | "story";
  finalScore: number;
  rank: number | null;
  outcome: "player_won" | "computer_won" | "player_eliminated";
  heartsRemaining: number;
  quizCorrect: number;
  treasuresCollected: number;
  challengeUrl: string;
  festivalDates?: string;
  defaultDisplayName: string;
  defaultAvatarUrl: string | null;
  googleAvatarUrl: string | null;
  onProfileUpdated?: (name: string, avatarUrl: string | null) => void;
}

export default function ShareCardCustomizerModal({
  isOpen,
  onClose,
  initialFormat = "post",
  finalScore,
  rank,
  outcome,
  heartsRemaining,
  quizCorrect,
  treasuresCollected,
  challengeUrl,
  festivalDates = "2–3 November 2026",
  defaultDisplayName,
  defaultAvatarUrl,
  googleAvatarUrl,
  onProfileUpdated,
}: ShareCardCustomizerModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [format, setFormat] = useState<"post" | "story">(initialFormat);
  const [displayName, setDisplayName] = useState(defaultDisplayName || "Festival Player");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(defaultAvatarUrl || googleAvatarUrl || null);
  const [saveToProfile, setSaveToProfile] = useState(true);

  // Live card generation state
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Sync initial props when opened
  useEffect(() => {
    if (isOpen) {
      setFormat(initialFormat);
      setDisplayName(defaultDisplayName || "Festival Player");
      setAvatarUrl(defaultAvatarUrl || googleAvatarUrl || null);
      setCopied(false);
      setStatusMsg(null);
    }
  }, [isOpen, initialFormat, defaultDisplayName, defaultAvatarUrl, googleAvatarUrl]);

  // Generate live card blob (debounced)
  const renderCard = useCallback(async () => {
    setGenerating(true);
    try {
      const blob = await generateResultCardBlob({
        format,
        displayName: displayName.trim() || "Festival Player",
        avatarUrl,
        finalScore,
        rank,
        outcome,
        heartsRemaining,
        quizCorrect,
        treasuresCollected,
        challengeUrl,
        festivalDates,
      });

      setPreviewBlob(blob);
      const url = URL.createObjectURL(blob);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch (err) {
      console.error("Failed to render card preview:", err);
    } finally {
      setGenerating(false);
    }
  }, [
    format,
    displayName,
    avatarUrl,
    finalScore,
    rank,
    outcome,
    heartsRemaining,
    quizCorrect,
    treasuresCollected,
    challengeUrl,
    festivalDates,
  ]);

  // Re-generate preview on parameter changes with light debounce
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      renderCard();
    }, 180);
    return () => clearTimeout(timer);
  }, [isOpen, renderCard]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  // Handle custom photo upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatusMsg("Please choose a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
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
        const dataUrl = canvas.toDataURL("image/webp", 0.9);
        setAvatarUrl(dataUrl);
        setStatusMsg("Custom photo applied to card!");
        setTimeout(() => setStatusMsg(null), 3000);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Persist name & avatar to profile if toggle is enabled
  const syncProfileIfRequested = async () => {
    if (!saveToProfile) return;
    try {
      const cleanName = displayName.trim();
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: cleanName,
          avatarUrl: avatarUrl,
        }),
      });
      if (onProfileUpdated) {
        onProfileUpdated(cleanName, avatarUrl);
      }
    } catch (e) {
      console.warn("Could not auto-save profile:", e);
    }
  };

  // Download Card Action
  const handleDownload = async () => {
    if (!previewBlob) return;
    setDownloading(true);
    try {
      await syncProfileIfRequested();
      const url = URL.createObjectURL(previewBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fintechverse-${format}-${finalScore}pts.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatusMsg("Card downloaded successfully!");
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  // Copy Image Action
  const handleCopyImage = async () => {
    if (!previewBlob) return;
    try {
      await syncProfileIfRequested();
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": previewBlob,
          }),
        ]);
        setCopied(true);
        setStatusMsg("Card image copied to clipboard!");
        setTimeout(() => {
          setCopied(false);
          setStatusMsg(null);
        }, 3500);
      } else {
        await handleDownload();
      }
    } catch (err) {
      console.error("Copy failed:", err);
      await handleDownload();
    }
  };

  // Share Action (Mobile Web Share API Level 2)
  const handleShare = async () => {
    if (!previewBlob) return;
    setSharing(true);
    try {
      await syncProfileIfRequested();
      const file = new File([previewBlob], `fintechverse-${format}-${finalScore}pts.png`, {
        type: "image/png",
      });

      const text = `I scored ${finalScore.toLocaleString()} points in LANKA FINTECHVERSE at the Sri Lanka FinTech Festival 2026! Can you beat my score?\n\nStep into the arena here: ${challengeUrl}`;

      if (typeof navigator !== "undefined" && "canShare" in navigator && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "LANKA FINTECHVERSE Victory Card",
          text,
        });
      } else {
        // Fallback: copy link & download
        await navigator.clipboard.writeText(challengeUrl);
        await handleDownload();
        setStatusMsg("Challenge link copied and card downloaded!");
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Sharing failed:", err);
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-gradient-to-b from-[#1c040d] via-[#100308] to-[#080205] border border-[#fec01f]/35 shadow-2xl overflow-hidden my-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#fec01f]/15 border border-[#fec01f]/40 flex items-center justify-center text-[#fec01f]">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Customize & Preview Share Card</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#fec01f]/20 text-[#fec01f] border border-[#fec01f]/30">
                  Official Asset
                </span>
              </h2>
              <p className="text-xs text-white/55 hidden sm:block">
                Verify your name and profile picture before downloading or sharing to social media.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 text-white/70 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Status Toast */}
        {statusMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-[#1ca085]/20 border border-[#1ca085]/50 text-[#5eead4] flex items-center gap-2.5 text-xs animate-slide-up shrink-0">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Modal Body: Split 2 Columns */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 Cols): Live Card Visual Preview */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono uppercase text-[#fec01f] tracking-wider">
                Live Card Preview
              </span>
              {generating && (
                <span className="text-[11px] font-mono text-white/50 inline-flex items-center gap-1.5">
                  <LoadingSpinner size="sm" />
                  <span>Updating...</span>
                </span>
              )}
            </div>

            {/* Canvas Preview Container */}
            <div
              className={`relative w-full rounded-2xl overflow-hidden border border-[#fec01f]/30 bg-black/60 shadow-2xl flex items-center justify-center transition-all ${
                format === "post" ? "aspect-[4/5] max-h-[380px]" : "aspect-[9/16] max-h-[460px]"
              }`}
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Share Card Live Preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
                  <LoadingSpinner size="md" />
                  <span className="text-xs text-white/50 font-mono">Generating official card...</span>
                </div>
              )}
            </div>

            <div className="text-[11px] font-mono text-white/40 mt-2 text-center">
              Dynamic QR points to your personal challenge arena link.
            </div>
          </div>

          {/* Right Column (7 Cols): Customization Controls */}
          <div className="md:col-span-7 space-y-5">
            {/* 1. Format Switcher */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-white/70 block">
                Card Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat("post")}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                    format === "post"
                      ? "border-[#fec01f] bg-[#fec01f]/15 shadow-sm"
                      : "border-white/10 bg-white/5 hover:border-white/20 text-white/70 hover:text-white"
                  }`}
                >
                  <Square size={16} className={format === "post" ? "text-[#fec01f]" : ""} />
                  <div>
                    <div className="text-xs font-bold text-white">4:5 Feed Post</div>
                    <div className="text-[10px] text-white/50">WhatsApp, LinkedIn, X</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat("story")}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                    format === "story"
                      ? "border-[#fec01f] bg-[#fec01f]/15 shadow-sm"
                      : "border-white/10 bg-white/5 hover:border-white/20 text-white/70 hover:text-white"
                  }`}
                >
                  <Smartphone size={16} className={format === "story" ? "text-[#fec01f]" : ""} />
                  <div>
                    <div className="text-xs font-bold text-white">9:16 Vertical Story</div>
                    <div className="text-[10px] text-white/50">Instagram, Status, Stories</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Display Name Verification */}
            <div className="space-y-1.5">
              <label
                htmlFor="modalDisplayName"
                className="text-xs font-mono uppercase tracking-wider text-white/70 flex items-center justify-between"
              >
                <span>Name on Scorecard</span>
                <span className="text-[11px] text-white/40">{displayName.length}/24</span>
              </label>
              <input
                id="modalDisplayName"
                type="text"
                value={displayName}
                maxLength={24}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/20 focus:border-[#fec01f] focus:outline-none focus:ring-1 focus:ring-[#fec01f] text-white text-sm font-semibold tracking-wide transition-all"
              />
            </div>

            {/* 3. Profile Picture Selection */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-white/70 block">
                Profile Picture on Score Badge
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Option A: Google Account Photo */}
                <button
                  type="button"
                  onClick={() => {
                    if (googleAvatarUrl) setAvatarUrl(googleAvatarUrl);
                  }}
                  disabled={!googleAvatarUrl}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                    avatarUrl === googleAvatarUrl && googleAvatarUrl
                      ? "border-[#fec01f] bg-[#fec01f]/15"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]"
                  } ${!googleAvatarUrl ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 border border-white/20 shrink-0">
                    {googleAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={googleAvatarUrl} alt="Google Photo" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={16} className="m-2 text-white/40" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate flex items-center justify-between">
                      <span>Google Photo</span>
                      {avatarUrl === googleAvatarUrl && googleAvatarUrl && (
                        <Check size={13} className="text-[#fec01f]" />
                      )}
                    </div>
                    <div className="text-[10px] text-white/50 truncate">From Google Login</div>
                  </div>
                </button>

                {/* Option B: Custom Upload */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                    avatarUrl && avatarUrl !== googleAvatarUrl
                      ? "border-[#fec01f] bg-[#fec01f]/15"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#1ca085]/20 border border-[#1ca085]/40 flex items-center justify-center shrink-0 text-[#1ca085]">
                    <Upload size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate flex items-center justify-between">
                      <span>Upload Photo</span>
                      {avatarUrl && avatarUrl !== googleAvatarUrl && (
                        <Check size={13} className="text-[#fec01f]" />
                      )}
                    </div>
                    <div className="text-[10px] text-white/50 truncate">Device image</div>
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

              {/* Option C: Initials / Reset */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-white/50">
                <span>Or use default golden initials:</span>
                <button
                  type="button"
                  onClick={() => setAvatarUrl(null)}
                  className={`px-2 py-0.5 rounded border transition-colors ${
                    !avatarUrl
                      ? "border-[#fec01f] text-[#fec01f] bg-[#fec01f]/10"
                      : "border-white/10 hover:border-white/20 text-white/60"
                  }`}
                >
                  Golden Initials
                </button>
              </div>
            </div>

            {/* 4. Save Preference Checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-2.5 text-xs text-white/70 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={saveToProfile}
                  onChange={(e) => setSaveToProfile(e.target.checked)}
                  className="h-4 w-4 rounded border-white/30 bg-black/50 text-[#fec01f] focus:ring-[#fec01f] focus:ring-offset-0 cursor-pointer accent-[#fec01f]"
                />
                <span>Save this name and photo to my profile permanently</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-7 py-4 border-t border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/75 hover:text-white text-xs font-mono uppercase tracking-wider transition-colors"
          >
            Cancel
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopyImage}
              disabled={!previewBlob || generating}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 hover:border-[#fec01f] text-white text-xs font-bold tracking-wide uppercase inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
            >
              {copied ? <Check size={14} className="text-[#fec01f]" /> : <Copy size={14} />}
              <span>{copied ? "Copied!" : "Copy Image"}</span>
            </button>

            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={!previewBlob || generating || downloading}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#fec01f] hover:bg-[#e5ac1b] text-black text-xs font-bold tracking-wide uppercase inline-flex items-center justify-center gap-1.5 shadow-lg shadow-[#fec01f]/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Download PNG</span>
                </>
              )}
            </button>

            {/* Native Share Button */}
            <button
              type="button"
              onClick={handleShare}
              disabled={!previewBlob || generating || sharing}
              className="px-4 py-2.5 rounded-xl bg-[#1ca085] hover:bg-[#168a72] text-white text-xs font-bold tracking-wide uppercase inline-flex items-center justify-center gap-1.5 shadow-lg shadow-[#1ca085]/20 transition-all active:scale-95 disabled:opacity-50"
              title="Share to WhatsApp, Instagram, LinkedIn, etc."
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
