"use client";

import { useState, useEffect } from "react";
import { Eye, HelpCircle, Send, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { PinpointPack } from "./puzzleTypes";
import { PINPOINT_PACKS, PUZZLES_META } from "./puzzleData";
import PuzzleHeader from "./PuzzleHeader";
import PuzzleWinModal from "./PuzzleWinModal";

export default function PinpointGame({ onBackToHub }: { onBackToHub: () => void }) {
  const meta = PUZZLES_META.find((p) => p.id === "pinpoint")!;
  const [packIndex, setPackIndex] = useState(0);
  const currentPack: PinpointPack = PINPOINT_PACKS[packIndex];

  // Game state
  const [revealedCount, setRevealedCount] = useState(1);
  const [userGuess, setUserGuess] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [errorShake, setErrorShake] = useState(false);

  // Reset on pack change
  useEffect(() => {
    setRevealedCount(1);
    setUserGuess("");
    setGuesses([]);
    setIsWon(false);
    setShowWinModal(false);
    setSecondsElapsed(0);
    setHasStarted(false);
  }, [packIndex]);

  // Timer
  useEffect(() => {
    if (!hasStarted || isWon) return;
    const interval = setInterval(() => {
      setSecondsElapsed((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isWon]);

  // Fuzzy answer checking
  const checkAnswerMatch = (guess: string) => {
    const cleanGuess = guess
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 ]/g, "");

    return currentPack.acceptedAnswers.some((accepted) => {
      const cleanAccepted = accepted
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 ]/g, "");
      return cleanGuess === cleanAccepted || cleanGuess.includes(cleanAccepted);
    });
  };

  const handleSubmitGuess = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userGuess.trim() || isWon) return;
    if (!hasStarted) setHasStarted(true);

    const guess = userGuess.trim();
    setUserGuess("");

    if (checkAnswerMatch(guess)) {
      setIsWon(true);
      setShowWinModal(true);
    } else {
      // Wrong guess
      setGuesses((prev) => [...prev, guess]);
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);

      // Reveal next clue if available
      if (revealedCount < 5) {
        setRevealedCount((c) => c + 1);
      }
    }
  };

  const handleRevealClue = () => {
    if (revealedCount < 5 && !isWon) {
      if (!hasStarted) setHasStarted(true);
      setRevealedCount((c) => c + 1);
    }
  };

  const handleReset = () => {
    setRevealedCount(1);
    setUserGuess("");
    setGuesses([]);
    setIsWon(false);
    setShowWinModal(false);
    setSecondsElapsed(0);
    setHasStarted(false);
  };

  const rulesContent = (
    <>
      <p>
        <strong>Pinpoint</strong> is LinkedIn&apos;s daily word association and mystery category game:
      </p>
      <ul className="list-disc pl-5 space-y-1.5 text-white/70">
        <li>You are shown 5 progressive clues, starting broad and getting more specific.</li>
        <li>Your goal is to guess the <strong>common theme or secret category</strong> connecting all clues.</li>
        <li>Every incorrect guess unlocks the next clue.</li>
        <li>Guess in fewer clues to earn a higher rating (1 clue = 5 Stars!).</li>
      </ul>
      <p className="text-xs text-white/60">
        💡 <strong>Tip:</strong> You don&apos;t need exact punctuation. E.g. &apos;payment methods&apos; or &apos;digital payments&apos; will both be accepted!
      </p>
    </>
  );

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <PuzzleHeader
        meta={meta}
        levelNames={PINPOINT_PACKS.map((p) => p.topic)}
        currentLevelIndex={packIndex}
        onSelectLevel={setPackIndex}
        secondsElapsed={secondsElapsed}
        movesCount={guesses.length}
        mistakesCount={guesses.length}
        onReset={handleReset}
        onBackToHub={onBackToHub}
        rulesContent={rulesContent}
      />

      {/* Clues Card Container */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-white/50 px-1">
          <span>Revealed Clues ({revealedCount} / 5)</span>
          <span className="text-[#fec01f]">
            {revealedCount === 1 ? "5★ Potential" : `${6 - revealedCount}★ Rank`}
          </span>
        </div>

        <div className="space-y-2.5">
          {currentPack.clues.map((clue, idx) => {
            const isRevealed = idx < revealedCount;
            return (
              <div
                key={idx}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                  isRevealed
                    ? "bg-white/[0.05] border-[#fec01f]/40 shadow-sm"
                    : "bg-white/[0.02] border-white/5 opacity-40 select-none"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                      isRevealed
                        ? "bg-[#fec01f] text-black"
                        : "bg-white/10 text-white/40"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span
                    className={`font-heading text-sm sm:text-base font-semibold ${
                      isRevealed ? "text-white" : "text-white/30 blur-[2px]"
                    }`}
                  >
                    {isRevealed ? clue : "••••••••••••••••••••"}
                  </span>
                </div>
                {!isRevealed && (
                  <span className="text-xs font-mono uppercase text-white/30">
                    Locked
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Input or Solved state */}
      {!isWon ? (
        <div className="space-y-3">
          <form
            onSubmit={handleSubmitGuess}
            className={`flex items-center gap-2 p-1.5 rounded-xl border bg-white/[0.04] transition-all ${
              errorShake ? "border-rose-500 animate-shake" : "border-white/15 focus-within:border-[#fec01f]"
            }`}
          >
            <input
              type="text"
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value)}
              placeholder="What is the common category / theme?"
              className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-white/40 outline-none font-sans"
              autoFocus
            />
            <button
              type="submit"
              disabled={!userGuess.trim()}
              className="interactive-btn interactive-btn--primary text-xs uppercase tracking-wider py-2.5 px-4 disabled:opacity-40"
            >
              <span>Guess</span>
              <Send size={13} />
            </button>
          </form>

          {/* Reveal Next Clue button */}
          {revealedCount < 5 && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleRevealClue}
                className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white/60 hover:text-[#fec01f] transition-colors py-1 px-3 rounded-lg border border-white/10 hover:border-[#fec01f]/30"
              >
                <Eye size={13} />
                <span>Reveal Clue #{revealedCount + 1} without guessing</span>
              </button>
            </div>
          )}

          {/* Wrong Guesses chips */}
          {guesses.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                Previous Guesses:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {guesses.map((g, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-xs line-through"
                  >
                    <XCircle size={12} />
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-teal-900/30 border border-teal-500/40 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-teal-300 font-bold font-heading">
            <CheckCircle size={18} />
            <span>Category: {currentPack.category}</span>
          </div>
          <p className="text-xs text-white/70">{currentPack.explanation}</p>
        </div>
      )}

      {/* Win Modal */}
      {showWinModal && (
        <PuzzleWinModal
          meta={meta}
          levelName={currentPack.topic}
          secondsElapsed={secondsElapsed}
          movesCount={revealedCount}
          mistakesCount={guesses.length}
          hasNextLevel={packIndex < PINPOINT_PACKS.length - 1}
          onNextLevel={() => setPackIndex((p) => p + 1)}
          onReplay={handleReset}
          onBackToHub={onBackToHub}
          onClose={() => setShowWinModal(false)}
        />
      )}
    </div>
  );
}
