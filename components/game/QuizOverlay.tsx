"use client";

import { useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  category: string;
  difficulty: string;
  squareNumber: number;
}

interface QuizOverlayProps {
  question: QuizQuestion;
  onAnswer: (questionId: string, squareNumber: number, selectedOption: number) => void;
}

export default function QuizOverlay({ question, onAnswer }: QuizOverlayProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (index: number) => {
    if (submitted) return;
    setSelected(index);
  };

  const handleSubmit = () => {
    if (selected === null || submitted) return;
    setSubmitted(true);
    setTimeout(() => {
      onAnswer(question.id, question.squareNumber, selected);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#06061f]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-slide-up">
      <div className="festival-panel max-w-lg w-full max-h-[88dvh] overflow-y-auto p-4 sm:p-7 bg-[#0a0a28]/95 border-2 border-[#fec01f]/40 shadow-[0_0_60px_rgba(0,0,0,0.8)] pb-safe">
        {/* Header Badges */}
        <div className="flex items-start justify-between mb-4 pb-3 border-b border-white/10">
          <div>
            <span className="section-badge section-badge-primary text-[10px] sm:text-[11px] mb-1.5">
              FinTech Challenge · Square {question.squareNumber}
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
              <span className="px-2 py-0.5 rounded font-mono text-[9px] sm:text-[10px] uppercase tracking-wider bg-white/5 border border-white/10 text-white/70">
                {question.category}
              </span>
              <span
                className={`px-2 py-0.5 rounded font-mono text-[9px] sm:text-[10px] uppercase tracking-wider ${
                  question.difficulty === "easy"
                    ? "bg-teal-950/60 border border-teal-500/40 text-teal-300"
                    : question.difficulty === "medium"
                    ? "bg-amber-950/60 border border-amber-500/40 text-amber-300"
                    : "bg-rose-950/60 border border-rose-500/40 text-rose-300"
                }`}
              >
                {question.difficulty}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-[11px] sm:text-xs font-bold text-[#fec01f] bg-[#fec01f]/10 border border-[#fec01f]/30 px-2 py-1 rounded shrink-0">
              +50 PTS
            </span>
          </div>
        </div>

        {/* Question Text */}
        <p className="font-heading text-base sm:text-lg font-bold text-white leading-relaxed mb-4 sm:mb-5">
          {question.question}
        </p>

        {/* Options */}
        <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
          {question.options.map((option, idx) => {
            const isSelected = selected === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(idx)}
                disabled={submitted}
                className={`
                  w-full text-left min-h-[44px] p-3 sm:p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-between touch-manipulation
                  ${
                    isSelected
                      ? "bg-[#fec01f]/15 border-[#fec01f] text-[#fec01f] shadow-[0_0_15px_rgba(254,192,31,0.2)]"
                      : "bg-white/[0.03] border-white/10 text-white/80 hover:bg-white/[0.06] hover:border-white/25 active:bg-white/[0.08]"
                  }
                  ${submitted ? "cursor-default" : "cursor-pointer"}
                `}
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <span
                    className={`
                      w-5 h-5 sm:w-6 sm:h-6 rounded-full font-mono text-[11px] sm:text-xs font-bold flex items-center justify-center border shrink-0
                      ${
                        isSelected
                          ? "bg-[#fec01f] text-black border-[#fec01f]"
                          : "border-white/20 text-white/50"
                      }
                    `}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-snug">{option}</span>
                </div>
                {isSelected && (
                  <CheckCircle2 size={16} className="text-[#fec01f] shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={selected === null || submitted}
          className={`
            w-full min-h-[48px] py-3 sm:py-3.5 rounded-xl font-heading font-bold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation
            ${
              selected === null || submitted
                ? "bg-white/10 text-white/40 border border-white/10 cursor-not-allowed"
                : "interactive-btn interactive-btn--primary shadow-[0_0_20px_rgba(254,192,31,0.35)]"
            }
          `}
        >
          {submitted ? (
            <>
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Verifying Answer…</span>
            </>
          ) : (
            <span>Lock In Answer</span>
          )}
        </button>
      </div>
    </div>
  );
}
