"use client";

import { useState } from "react";
import {
  BookOpen,
  X,
  Lock,
  Sparkles,
  ShieldCheck,
  Zap,
  Landmark,
  Coins,
  QrCode,
  Globe,
  Share2,
  Binary,
  Layers,
  ArrowRightLeft,
  LineChart,
  Brain,
  Smartphone,
  Radio,
  FileCheck,
  Fingerprint,
  Leaf,
  DollarSign,
  Cpu,
  Store,
  Compass,
  Box,
} from "lucide-react";
import {
  FINTECH_CODEX_CARDS,
  CodexCard,
  CodexCategory,
} from "@/lib/puzzles/fintech-codex";

interface FintechCodexDrawerProps {
  unlockedIds: string[];
  onClose: () => void;
}

const CATEGORY_LABELS: Record<CodexCategory | "all", string> = {
  all: "All Intelligence",
  "sri-lanka-fintech": "Sri Lanka FinTech",
  "payment-rails": "Payment Rails",
  "central-banking": "Central Banking",
  "security-crypto": "Security & Cryptography",
  "defi-markets": "DeFi & Markets",
};

// Icon map helper
function renderCodexIcon(name: string, size = 20) {
  switch (name) {
    case "QrCode": return <QrCode size={size} />;
    case "Landmark": return <Landmark size={size} />;
    case "Zap": return <Zap size={size} />;
    case "Coins": return <Coins size={size} />;
    case "ShieldCheck": return <ShieldCheck size={size} />;
    case "Binary": return <Binary size={size} />;
    case "ArrowRightLeft": return <ArrowRightLeft size={size} />;
    case "LineChart": return <LineChart size={size} />;
    case "Globe": return <Globe size={size} />;
    case "Box": return <Box size={size} />;
    case "Share2": return <Share2 size={size} />;
    case "Brain": return <Brain size={size} />;
    case "Smartphone": return <Smartphone size={size} />;
    case "Lock": return <Lock size={size} />;
    case "Layers": return <Layers size={size} />;
    case "Radio": return <Radio size={size} />;
    case "FileCheck": return <FileCheck size={size} />;
    case "Fingerprint": return <Fingerprint size={size} />;
    case "Leaf": return <Leaf size={size} />;
    case "DollarSign": return <DollarSign size={size} />;
    case "Cpu": return <Cpu size={size} />;
    case "Store": return <Store size={size} />;
    case "Compass": return <Compass size={size} />;
    default: return <Sparkles size={size} />;
  }
}

export default function FintechCodexDrawer({
  unlockedIds,
  onClose,
}: FintechCodexDrawerProps) {
  const [selectedCategory, setSelectedCategory] = useState<CodexCategory | "all">("all");
  const [selectedCard, setSelectedCard] = useState<CodexCard | null>(null);

  const unlockedSet = new Set(unlockedIds || []);
  const totalCards = FINTECH_CODEX_CARDS.length;
  const unlockedCount = unlockedSet.size;

  const filteredCards = FINTECH_CODEX_CARDS.filter((card) => {
    if (selectedCategory === "all") return true;
    return card.category === selectedCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="festival-panel max-w-4xl w-full max-h-[92vh] flex flex-col p-4 sm:p-6 space-y-4 border border-[#fec01f]/40 shadow-[0_0_60px_rgba(254,192,31,0.2)] relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fec01f]/15 border border-[#fec01f]/40 flex items-center justify-center text-[#fec01f] shadow-inner">
              <BookOpen size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-white text-lg">
                  FinTech Codex &amp; Intel Archive
                </h3>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#fec01f]/20 text-[#fec01f] border border-[#fec01f]/40">
                  {unlockedCount} / {totalCards} Decrypted
                </span>
              </div>
              <p className="text-xs text-white/60">
                Unlock real-world Sri Lankan &amp; global digital finance knowledge cards by solving daily puzzles.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white p-1.5 rounded-md hover:bg-white/10"
            aria-label="Close Codex"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
          {(["all", "sri-lanka-fintech", "payment-rails", "central-banking", "security-crypto", "defi-markets"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider shrink-0 transition-colors ${
                selectedCategory === cat
                  ? "bg-[#fec01f] text-black font-bold shadow-md shadow-[#fec01f]/20"
                  : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="overflow-y-auto space-y-3 pr-1 flex-1 max-h-[56vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredCards.map((card) => {
              const isUnlocked = unlockedSet.has(card.id);

              return (
                <div
                  key={card.id}
                  onClick={() => isUnlocked && setSelectedCard(card)}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all relative ${
                    isUnlocked
                      ? "bg-white/[0.03] hover:bg-white/[0.08] border-white/15 hover:border-[#fec01f]/60 cursor-pointer shadow-md group"
                      : "bg-white/[0.01] border-white/5 opacity-50 cursor-not-allowed select-none"
                  }`}
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                          isUnlocked
                            ? card.rarity === "legendary"
                              ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                              : card.rarity === "rare"
                              ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                              : "bg-[#fec01f]/20 text-[#fec01f] border-[#fec01f]/40"
                            : "bg-white/5 text-white/30 border-white/10"
                        }`}
                      >
                        {isUnlocked ? renderCodexIcon(card.icon, 18) : <Lock size={15} />}
                      </div>

                      <span
                        className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                          isUnlocked
                            ? card.rarity === "legendary"
                              ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                              : card.rarity === "rare"
                              ? "bg-teal-500/10 text-teal-300 border-teal-500/30"
                              : "bg-[#fec01f]/10 text-[#fec01f] border-[#fec01f]/30"
                            : "bg-white/5 text-white/30 border-white/10"
                        }`}
                      >
                        {isUnlocked ? card.rarity : "Encrypted"}
                      </span>
                    </div>

                    {/* Card Title & Subtitle */}
                    <h4 className="font-heading font-bold text-white text-sm group-hover:text-[#fec01f] transition-colors line-clamp-1">
                      {isUnlocked ? card.title : "Classified Knowledge Card"}
                    </h4>
                    <p className="text-[11px] font-mono text-white/50 mb-2 line-clamp-1">
                      {isUnlocked ? card.subtitle : "Solve puzzles to decrypt this intel"}
                    </p>

                    {/* Summary */}
                    <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                      {isUnlocked ? card.summary : "Encrypted cryptographic data block from the Lanka FinTechverse archives."}
                    </p>
                  </div>

                  {isUnlocked && (
                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[#00f0ff]">
                      <span>Read Deep Dive</span>
                      <span>→</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Single Card Detail Inspector Modal */}
        {selectedCard && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="festival-panel max-w-lg w-full p-6 space-y-4 border border-[#fec01f]/50 shadow-2xl relative">
              <div className="flex items-start justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#fec01f]/20 border border-[#fec01f]/50 flex items-center justify-center text-[#fec01f] shadow-inner">
                    {renderCodexIcon(selectedCard.icon, 24)}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#fec01f]/20 text-[#fec01f] border border-[#fec01f]/40">
                      {selectedCard.rarity} · {CATEGORY_LABELS[selectedCard.category]}
                    </span>
                    <h3 className="font-heading font-bold text-white text-lg mt-1">
                      {selectedCard.title}
                    </h3>
                    <p className="text-xs font-mono text-[#00f0ff]">
                      {selectedCard.subtitle}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="text-white/50 hover:text-white p-1 rounded-md hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-white/80">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-white/50 block mb-1">
                    Executive Summary
                  </span>
                  <p className="text-white/90 font-medium">
                    {selectedCard.summary}
                  </p>
                </div>

                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-white/50 block mb-1">
                    Technical &amp; Economic Architecture
                  </span>
                  <p className="text-white/70">
                    {selectedCard.detail}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/30">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-teal-300 font-bold block mb-1 flex items-center gap-1.5">
                    <Sparkles size={12} /> Festival Context (Sri Lanka 2026)
                  </span>
                  <p className="text-white/80">
                    {selectedCard.festivalRelevance}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedCard(null)}
                  className="interactive-btn interactive-btn--primary text-xs uppercase tracking-wider py-2 px-5"
                >
                  Close Intel Card
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
