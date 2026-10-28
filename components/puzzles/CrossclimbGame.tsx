"use client";

import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, Check, Lock, Unlock, Link2, Sparkles, HelpCircle, Shuffle } from "lucide-react";
import { CrossclimbLevel, CrossclimbLadderWord } from "./puzzleTypes";
import {
  CROSSCLIMB_TEMPLATES,
  getHammingDistance,
  generateCrossclimbLevel,
} from "@/lib/puzzles/crossclimb-engine";
import { getDailyPuzzleSeed } from "@/lib/puzzles/prng";
import { recordPuzzleWin, getPuzzleStats, toggleGlobalPuzzleMute } from "@/lib/puzzles/puzzle-storage";
import { sounds } from "@/lib/audio/sound-effects";
import { PUZZLES_META } from "./puzzleData";
import PuzzleHeader from "./PuzzleHeader";
import PuzzleWinModal from "./PuzzleWinModal";

const CLIMB_DIFFICULTIES: Array<"Easy" | "Medium" | "Hard"> = [
  "Easy",
  "Medium",
  "Hard",
];

export default function CrossclimbGame({ onBackToHub }: { onBackToHub: () => void }) {
  const meta = PUZZLES_META.find((p) => p.id === "crossclimb")!;
  const [diffIndex, setDiffIndex] = useState(0);
  const difficulty = CLIMB_DIFFICULTIES[diffIndex];

  const [levelSeed, setLevelSeed] = useState(() => getDailyPuzzleSeed());
  const [currentLevel, setCurrentLevel] = useState<CrossclimbLevel>(() =>
    generateCrossclimbLevel(difficulty, getDailyPuzzleSeed())
  );

  // Scramble ladder words initially
  const [ladder, setLadder] = useState<CrossclimbLadderWord[]>(() => {
    return [...currentLevel.ladderWords].reverse();
  });

  // User input answers for each ladder word ID
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [topAnswer, setTopAnswer] = useState("");
  const [bottomAnswer, setBottomAnswer] = useState("");

  const [isMuted, setIsMuted] = useState(() => getPuzzleStats().soundMuted);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [isNewBestTime, setIsNewBestTime] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);

  // Reset on level change
  useEffect(() => {
    const level = generateCrossclimbLevel(difficulty, levelSeed);
    setCurrentLevel(level);

    // Shuffle deterministically
    const shuffled = [...level.ladderWords];
    if (shuffled.length >= 4) {
      const temp0 = shuffled[0]; shuffled[0] = shuffled[2]; shuffled[2] = temp0;
      const temp1 = shuffled[1]; shuffled[1] = shuffled[shuffled.length - 1]; shuffled[shuffled.length - 1] = temp1;
    }
    setLadder(shuffled);
    setAnswers({});
    setTopAnswer("");
    setBottomAnswer("");
    setSecondsElapsed(0);
    setHasStarted(false);
    setIsWon(false);
    setShowWinModal(false);
    setIsNewBestTime(false);
  }, [difficulty, levelSeed]);

  // Timer
  useEffect(() => {
    if (!hasStarted || isWon) return;
    const interval = setInterval(() => setSecondsElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isWon]);

  // Check if all ladder words are correctly solved
  const allLadderWordsSolved = ladder.every(
    (w) => (answers[w.id] || "").toUpperCase() === w.word
  );

  // Check which rungs have valid 1-letter transitions
  const rungLinks: boolean[] = [];
  for (let i = 0; i < ladder.length - 1; i++) {
    const w1 = answers[ladder[i].id]?.toUpperCase() || "";
    const w2 = answers[ladder[i + 1].id]?.toUpperCase() || "";
    const isSolved = w1 === ladder[i].word && w2 === ladder[i + 1].word;
    const isOneLetter = getHammingDistance(w1, w2) === 1;
    rungLinks.push(isSolved && isOneLetter);
  }

  // Entire ladder is connected if all rung links are true
  const isLadderFullyConnected =
    allLadderWordsSolved && rungLinks.length > 0 && rungLinks.every((link) => link);

  // Check Top and Bottom connections
  const isTopSolved = topAnswer.trim().toUpperCase() === currentLevel.topWord.word;
  const isBottomSolved = bottomAnswer.trim().toUpperCase() === currentLevel.bottomWord.word;

  // Win condition: ladder fully connected AND top and bottom solved!
  useEffect(() => {
    if (isLadderFullyConnected && isTopSolved && isBottomSolved && !isWon) {
      setIsWon(true);
      setShowWinModal(true);
      if (!isMuted) sounds.playVictory();

      const { isNewBestTime: isBest, newStreak } = recordPuzzleWin(
        "crossclimb",
        difficulty,
        secondsElapsed
      );
      setIsNewBestTime(isBest);
      setCurrentStreak(newStreak);
    }
  }, [isLadderFullyConnected, isTopSolved, isBottomSolved, isWon, difficulty, secondsElapsed, isMuted]);

  // Reordering ladder rungs
  const moveRung = (index: number, direction: "up" | "down") => {
    if (isWon) return;
    if (!hasStarted) setHasStarted(true);

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= ladder.length) return;

    const newLadder = [...ladder];
    const temp = newLadder[index];
    newLadder[index] = newLadder[targetIndex];
    newLadder[targetIndex] = temp;
    setLadder(newLadder);

    if (!isMuted) sounds.playClick();
  };

  const handleAnswerChange = (wordId: string, val: string) => {
    if (!hasStarted) setHasStarted(true);
    setAnswers((prev) => ({
      ...prev,
      [wordId]: val.toUpperCase().slice(0, currentLevel.wordLength),
    }));
  };

  const handleHint = () => {
    if (!allLadderWordsSolved) {
      for (const w of ladder) {
        if ((answers[w.id] || "").toUpperCase() !== w.word) {
          handleAnswerChange(w.id, w.word);
          if (!isMuted) sounds.playMoveSuccess();
          return;
        }
      }
    } else if (!isLadderFullyConnected) {
      setLadder([...currentLevel.ladderWords]);
      if (!isMuted) sounds.playMoveSuccess();
    } else if (!isTopSolved) {
      setTopAnswer(currentLevel.topWord.word);
    } else if (!isBottomSolved) {
      setBottomAnswer(currentLevel.bottomWord.word);
    }
  };

  const handleReset = () => {
    const shuffled = [...currentLevel.ladderWords].reverse();
    setLadder(shuffled);
    setAnswers({});
    setTopAnswer("");
    setBottomAnswer("");
    setSecondsElapsed(0);
    setHasStarted(false);
    setIsWon(false);
    setShowWinModal(false);
  };

  const handleNewPuzzle = () => {
    setLevelSeed(Math.floor(Math.random() * 1000000) + 1);
  };

  const handleToggleSound = () => {
    const muted = toggleGlobalPuzzleMute();
    setIsMuted(muted);
  };

  const rulesContent = (
    <>
      <p>
        <strong>Crossclimb</strong> is LinkedIn&apos;s word-ladder trivia climb:
      </p>
      <ul className="list-disc pl-5 space-y-1.5 text-white/70">
        <li>Solve the trivia clues to discover each {currentLevel.wordLength}-letter word on the rungs.</li>
        <li>
          Rearrange the rungs up and down until they form a <strong>word ladder</strong> where each step changes <strong>exactly 1 letter</strong>.
        </li>
        <li>
          Connecting the ladder unlocks the mystery <strong className="text-[#fec01f]">Top Word</strong> and <strong className="text-[#fec01f]">Bottom Word</strong>!
        </li>
        <li>Solve the Top and Bottom words to reach the summit and complete the climb!</li>
      </ul>
    </>
  );

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <PuzzleHeader
        meta={meta}
        levelNames={CLIMB_DIFFICULTIES}
        currentLevelIndex={diffIndex}
        onSelectLevel={setDiffIndex}
        secondsElapsed={secondsElapsed}
        onReset={handleReset}
        onHint={handleHint}
        canHint={!isWon}
        onNewPuzzle={handleNewPuzzle}
        isSoundMuted={isMuted}
        onToggleSound={handleToggleSound}
        onBackToHub={onBackToHub}
        rulesContent={rulesContent}
      />

      {/* Climb status indicator */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono">
        <span className="text-white/60">
          Ladder State:{" "}
          <strong
            className={
              isLadderFullyConnected ? "text-teal-300 font-bold inline-flex items-center gap-1" : "text-amber-400"
            }
          >
            {isLadderFullyConnected ? (
              <>
                <Sparkles size={13} className="text-teal-300 shrink-0" />
                <span>Ladder Complete! Top &amp; Bottom Unlocked</span>
              </>
            ) : (
              "Arrange words so each differs by 1 letter"
            )}
          </strong>
        </span>
        <span className="text-white/40">
          {currentLevel.wordLength} Letters per Rung
        </span>
      </div>

      {/* The Cyber Ladder Visual Structure */}
      <div className="relative px-4 py-2 border-l-2 border-r-2 border-white/10 rounded-2xl bg-[#070720]">
        {/* TOP WORD (Summit) */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            isLadderFullyConnected
              ? "bg-[#fec01f]/10 border-[#fec01f]/50 shadow-[0_0_15px_rgba(254,192,31,0.2)] animate-pulse"
              : "bg-white/[0.02] border-white/10 opacity-50 select-none"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#fec01f] font-bold">
              {isLadderFullyConnected ? <Unlock size={13} /> : <Lock size={13} />}
              Top Mystery Word (Summit)
            </span>
            {isTopSolved && (
              <span className="text-teal-400 flex items-center gap-1 text-xs font-mono">
                <Check size={13} /> Solved
              </span>
            )}
          </div>
          <p className="text-xs text-white/70 mb-2">{currentLevel.topWord.clue}</p>
          <input
            type="text"
            disabled={!isLadderFullyConnected}
            value={topAnswer}
            onChange={(e) => setTopAnswer(e.target.value.toUpperCase())}
            placeholder={isLadderFullyConnected ? "Type summit word..." : "Locked until ladder is ordered"}
            maxLength={currentLevel.wordLength}
            className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 font-mono text-center tracking-widest text-base font-bold text-white uppercase outline-none focus:border-[#fec01f]"
          />
        </div>

        {/* LADDER RUNGS */}
        <div className="space-y-2 py-3">
          {ladder.map((item, index) => {
            const currentVal = answers[item.id] || "";
            const isCorrect = currentVal.toUpperCase() === item.word;
            const hasLinkDown = index < rungLinks.length && rungLinks[index];

            return (
              <div key={item.id} className="relative">
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                    isCorrect
                      ? "bg-white/[0.04] border-white/15"
                      : "bg-white/[0.02] border-white/10"
                  }`}
                >
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveRung(index, "up")}
                      disabled={index === 0 || isLadderFullyConnected}
                      title="Move up"
                      className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-20 text-white/70"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      onClick={() => moveRung(index, "down")}
                      disabled={index === ladder.length - 1 || isLadderFullyConnected}
                      title="Move down"
                      className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-20 text-white/70"
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>

                  {/* Word Clue & Input */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/80 line-clamp-2 mb-1.5">
                      {item.clue}
                    </p>
                    <input
                      type="text"
                      value={currentVal}
                      onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                      placeholder={`${currentLevel.wordLength} letters`}
                      maxLength={currentLevel.wordLength}
                      className={`w-32 bg-black/30 border rounded-lg px-2.5 py-1.5 font-mono text-center tracking-widest text-sm font-bold uppercase outline-none transition-colors ${
                        isCorrect
                          ? "border-teal-500/60 text-teal-300"
                          : "border-white/20 text-white focus:border-[#fec01f]"
                      }`}
                    />
                  </div>

                  {/* Step status */}
                  <div className="shrink-0 text-right">
                    {isCorrect && (
                      <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center">
                        <Check size={14} />
                      </span>
                    )}
                  </div>
                </div>

                {/* Ladder bridge connector indicator between adjacent rungs */}
                {index < ladder.length - 1 && (
                  <div className="flex items-center justify-center py-1">
                    <div
                      className={`h-5 w-1 rounded-full transition-all ${
                        hasLinkDown
                          ? "bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.9)]"
                          : "bg-white/15"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* BOTTOM WORD */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            isLadderFullyConnected
              ? "bg-[#fec01f]/10 border-[#fec01f]/50 shadow-[0_0_15px_rgba(254,192,31,0.2)] animate-pulse"
              : "bg-white/[0.02] border-white/10 opacity-50 select-none"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#fec01f] font-bold">
              {isLadderFullyConnected ? <Unlock size={13} /> : <Lock size={13} />}
              Bottom Mystery Word (Base)
            </span>
            {isBottomSolved && (
              <span className="text-teal-400 flex items-center gap-1 text-xs font-mono">
                <Check size={13} /> Solved
              </span>
            )}
          </div>
          <p className="text-xs text-white/70 mb-2">{currentLevel.bottomWord.clue}</p>
          <input
            type="text"
            disabled={!isLadderFullyConnected}
            value={bottomAnswer}
            onChange={(e) => setBottomAnswer(e.target.value.toUpperCase())}
            placeholder={isLadderFullyConnected ? "Type base word..." : "Locked until ladder is ordered"}
            maxLength={currentLevel.wordLength}
            className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 font-mono text-center tracking-widest text-base font-bold text-white uppercase outline-none focus:border-[#fec01f]"
          />
        </div>
      </div>

      {/* Win Modal */}
      {showWinModal && (
        <PuzzleWinModal
          meta={meta}
          levelName={currentLevel.name}
          secondsElapsed={secondsElapsed}
          isNewBestTime={isNewBestTime}
          currentStreak={currentStreak}
          hasNextLevel={diffIndex < CLIMB_DIFFICULTIES.length - 1}
          onNextLevel={() => setDiffIndex((p) => p + 1)}
          onReplay={handleReset}
          onBackToHub={onBackToHub}
          onClose={() => setShowWinModal(false)}
        />
      )}
    </div>
  );
}
