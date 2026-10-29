"use client";

import { useState } from "react";
import {
  HelpCircle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  BrainCircuit,
  BookOpen,
} from "lucide-react";

interface QuizQuestionItem {
  id: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  stats: {
    totalAttempts: number;
    correctCount: number;
    wrongCount: number;
    accuracyRate: number | null;
  };
}

interface QuizBankTabProps {
  questions: QuizQuestionItem[];
  categories: Record<string, number>;
  loading: boolean;
}

export default function QuizBankTab({
  questions,
  categories,
  loading,
}: QuizBankTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredQuestions = questions.filter((q) => {
    if (selectedCategory !== "all" && q.category !== selectedCategory) return false;
    if (selectedDifficulty !== "all" && q.difficulty !== selectedDifficulty) return false;
    if (searchTerm.trim().length > 0) {
      const query = searchTerm.toLowerCase();
      return (
        q.question.toLowerCase().includes(query) ||
        q.id.toLowerCase().includes(query) ||
        q.explanation.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Category Pills Header */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-colors ${
            selectedCategory === "all"
              ? "bg-[#fec01f] text-black font-bold"
              : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          All Categories ({questions.length})
        </button>
        {Object.entries(categories).map(([cat, count]) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? "bg-[#fec01f] text-black font-bold"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            {cat} ({count})
          </button>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions or keywords..."
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#fec01f] font-mono"
          />
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
          />
        </div>

        <div className="flex items-center gap-2">
          {["all", "easy", "medium", "hard"].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono uppercase tracking-wider transition-colors capitalize ${
                selectedDifficulty === diff
                  ? "bg-white/20 text-white font-bold"
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Questions Grid */}
      {loading ? (
        <div className="py-16 text-center text-white/50 text-xs font-mono">
          Loading quiz knowledge bank...
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="py-12 text-center text-white/40 italic text-xs">
          No questions match your filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuestions.map((q) => {
            const hasAttempts = q.stats.totalAttempts > 0;

            return (
              <div
                key={q.id}
                className="bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-2xl p-5 flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Meta Bar */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#fec01f]">
                        {q.id.toUpperCase()}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/70">
                        {q.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                          q.difficulty === "easy"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : q.difficulty === "medium"
                            ? "bg-[#fec01f]/15 text-[#fec01f]"
                            : "bg-rose-500/15 text-rose-400"
                        }`}
                      >
                        {q.difficulty}
                      </span>

                      {hasAttempts && (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            (q.stats.accuracyRate ?? 0) >= 70
                              ? "bg-emerald-500/20 text-emerald-400"
                              : (q.stats.accuracyRate ?? 0) >= 40
                              ? "bg-[#fec01f]/20 text-[#fec01f]"
                              : "bg-rose-500/20 text-rose-400"
                          }`}
                        >
                          {q.stats.accuracyRate}% pass ({q.stats.totalAttempts} played)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Statement */}
                  <h4 className="text-sm font-semibold text-white mb-4 leading-snug">
                    {q.question}
                  </h4>

                  {/* Options List */}
                  <div className="space-y-1.5 mb-4 font-mono text-xs">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === q.correctIndex;

                      return (
                        <div
                          key={optIdx}
                          className={`p-2 rounded-xl flex items-center justify-between text-xs ${
                            isCorrect
                              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold"
                              : "bg-white/[0.02] border border-white/5 text-white/70"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-white/5 flex items-center justify-center text-[10px] shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </span>

                          {isCorrect && (
                            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation */}
                <div className="pt-3 border-t border-white/5 text-[11px] text-white/50 flex items-start gap-1.5">
                  <BookOpen size={13} className="shrink-0 mt-0.5 text-white/40" />
                  <p className="leading-relaxed">{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
