"use client";

import { useState, useEffect } from "react";
import { Eye, HelpCircle, Send, CheckCircle, XCircle, Sparkles, Lightbulb, Volume2, VolumeX, Shuffle } from "lucide-react";
import {
  PINPOINT_KNOWLEDGE_BASE,
  PinpointExpandedPack,
  checkPinpointMatch,
  getDailyPinpointPack,
  getRandomPinpointPack,
  getPinpointHint,
} from "@/lib/puzzles/pinpoint-engine";
import { recordPuzzleWin, getPuzzleStats, toggleGlobalPuzzleMute } from "@/lib/puzzles/puzzle-storage";
import { sounds } from "@/lib/audio/sound-effects";
import { PUZZLES_META } from "./puzzleData";
import PuzzleHeader from "./PuzzleHeader";
import PuzzleWinModal from "./PuzzleWinModal";

export default function PinpointGame({ onBackToHub }: { onBackToHub: () => void }) {
  const meta = PUZZLES_META.find((p) => p.id === "pinpoint")!;
  const [packIndex, setPackIndex] = useState(0);
  const currentPack: PinpointExpandedPack = PINPOINT_KNOWLEDGE_BASE[packIndex];

  // Game state
  const [revealedCount, setRevealedCount] = useState(1);
  const [userGuess, setUserGuess] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const [hintShown, setHintShown] = useState(false);

  const [isMuted, setIsMuted] = useState(() => getPuzzleStats().soundMuted);
  const [isNewBestTime, setIsNewBestTime] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);

  // Reset on pack change
  useEffect(() => {
    setRevealedCount(1);
    setUserGuess("");
    setGuesses([]);
    setIsWon(false);
    setShowWinModal(false);
    setSecondsElapsed(0);
    setHasStarted(false);
    setHintShown(false);
    setIsNewBestTime(false);
  }, [packIndex]);

  // Timer
  useEffect(() => {
    if (!hasStarted || isWon) return;
    const interval = setInterval(() => {
      setSecondsElapsed((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isWon]);

  const handleSubmitGuess = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userGuess.trim() || isWon) return;
    if (!hasStarted) setHasStarted(true);

    const guess = userGuess.trim();
    setUserGuess("");

    if (checkPinpointMatch(guess, currentPack.acceptedAnswers)) {
      setIsWon(true);
      setShowWinModal(true);
      if (!isMuted) sounds.playVictory();

      const { isNewBestTime: isBest, newStreak } = recordPuzzleWin(
        "pinpoint",
        currentPack.topic,
        secondsElapsed
      );
      setIsNewBestTime(isBest);
      setCurrentStreak(newStreak);
    } else {
      // Wrong guess
      if (!isMuted) sounds.playSnakeSlide();
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
      if (!isMuted) sounds.playClick();
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
    setHintShown(false);
  };

  const handleNewPuzzle = () => {
    const nextIdx = (packIndex + 1) % PINPOINT_KNOWLEDGE_BASE.length;
    setPackIndex(nextIdx);
  };

  const handleToggleSound = () => {
    const muted = toggleGlobalPuzzleMute();
    setIsMuted(muted);
  };

  const hintInfo = getPinpointHint(currentPack.category);

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
      <p className="text-xs text-white/60 flex items-center gap-1.5 pt-1">
        <Lightbulb size={13} className="text-[#fec01f] shrink-0" />
        <span><strong>Tip:</strong> Exact capitalization and punctuation are not required (e.g. &apos;payment methods&apos; or &apos;digital payments&apos; will both be accepted!).</span>
      </p>
    </>
  );

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <PuzzleHeader
        meta={meta}
        levelNames={PINPOINT_KNOWLEDGE_BASE.map((p) => p.topic)}
        currentLevelIndex={packIndex}
        onSelectLevel={setPackIndex}
        secondsElapsed={secondsElapsed}
        movesCount={guesses.length}
        mistakesCount={guesses.length}
        onReset={handleReset}
        onNewPuzzle={handleNewPuzzle}
        isSoundMuted={isMuted}
        onToggleSound={handleToggleSound}
        onBackToHub={onBackToHub}
        rulesContent={rulesContent}
      />

      {/* Clues Card Container */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-white/50 px-1">
          <span>Revealed Clues ({revealedCount} / 5)</span>
          <span className="text-[#fec01f] font-bold">
            {revealedCount === 1 ? "Top 5-Star Rank" : `${6 - revealedCount}-Star Rating`}
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
                    ? "bg-white/[0.05] border-[#fec01f]/40 shadow-sm animate-slideDown"
                    : "bg-white/[0.02] border-white/5 opacity-40 select-none"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                      isRevealed
                        ? "bg-[#fec01f] text-black shadow-[0_0_8px_rgba(254,192,31,0.5)]"
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

          {/* Reveal Next Clue & Hints bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {revealedCount < 5 && (
              <button
                type="button"
                onClick={handleRevealClue}
                className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white/60 hover:text-[#fec01f] transition-colors py-1.5 px-3 rounded-lg border border-white/10 hover:border-[#fec01f]/30"
              >
                <Eye size={13} />
                <span>Reveal Clue #{revealedCount + 1}</span>
              </button>
            )}

            {!hintShown ? (
              <button
                type="button"
                onClick={() => setHintShown(true)}
                className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber-300 hover:text-amber-200 transition-colors py-1.5 px-3 rounded-lg border border-amber-500/30 bg-amber-500/10"
              >
                <Lightbulb size={13} />
                <span>Need a Hint?</span>
              </button>
            ) : (
              <div className="text-xs font-mono text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30 flex items-center gap-2">
                <span>Starts with: <strong>{hintInfo.firstLetter}</strong></span>
                <span>•</span>
                <span>{hintInfo.wordCount} words ({hintInfo.letterCount} letters)</span>
              </div>
            )}
          </div>

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
          isNewBestTime={isNewBestTime}
          currentStreak={currentStreak}
          educationalFact={currentPack.educationalFact}
          hasNextLevel={packIndex < PINPOINT_KNOWLEDGE_BASE.length - 1}
          onNextLevel={() => setPackIndex((p) => p + 1)}
          onReplay={handleReset}
          onBackToHub={onBackToHub}
          onClose={() => setShowWinModal(false)}
        />
      )}
    </div>
  );
}
