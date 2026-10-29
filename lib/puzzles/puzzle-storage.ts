/**
 * Local storage manager for LinkedIn Puzzles statistics, streaks, settings, and points.
 * Extended with FinTech Codex, Speed Tiers, 1v1 Challenge links, and Daily Grand Slam tracking.
 */

import { CodexCard, unlockRandomCodexCard } from "./fintech-codex";
import { SoundProfile, sounds } from "@/lib/audio/sound-effects";

export interface PuzzleStatsData {
  totalWins: number;
  currentStreak: number;
  lastPlayedDate: string | null; // YYYY-MM-DD
  bestTimes: Record<string, number>; // key: `${puzzleId}-${levelOrDiff}`, value: seconds
  completedLevels: Record<string, boolean>; // key: `${puzzleId}-${levelOrDiff}`
  soundMuted: boolean;
  soundProfile?: SoundProfile;
  totalPuzzlePoints: number; // accumulated puzzle points
  unlockedCodexCards?: string[]; // IDs of collected FinTech Codex cards
  dailySolves?: Record<string, string[]>; // YYYY-MM-DD -> array of puzzleIds completed
}

export interface SpeedTierInfo {
  tier: "architect" | "quant" | "analyst" | "strategist";
  badge: string;
  percentile: number;
  rankTitle: string;
  colorClass: string;
  shareBadge: string;
  description: string;
}

export interface DailyProgressInfo {
  date: string;
  solvedCount: number;
  solvedPuzzles: string[];
  isTrifecta: boolean; // >= 3
  isGrandSlam: boolean; // == 6
  bonusPoints: number; // +15 for Trifecta, +35 for Grand Slam
}

export interface PuzzleWinResult {
  isNewBestTime: boolean;
  newStreak: number;
  pointsEarned: number;
  breakdown: {
    basePoints: number;
    speedBonus: number;
    cleanBonus: number;
    streakBonus: number;
    dailyBonus?: number;
  };
  totalPoints: number;
  arenaBonusPoints: number;
  speedTier: SpeedTierInfo;
  newCodexCard: CodexCard | null;
  dailyProgress: DailyProgressInfo;
}

const STORAGE_KEY = "fintechverse_puzzles_stats_v2";

export function getPuzzleStats(): PuzzleStatsData {
  if (typeof window === "undefined") {
    return {
      totalWins: 0,
      currentStreak: 0,
      lastPlayedDate: null,
      bestTimes: {},
      completedLevels: {},
      soundMuted: false,
      soundProfile: "arcade",
      totalPuzzlePoints: 0,
      unlockedCodexCards: [],
      dailySolves: {},
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        totalWins: 0,
        currentStreak: 0,
        lastPlayedDate: null,
        bestTimes: {},
        completedLevels: {},
        soundMuted: false,
        soundProfile: "arcade",
        totalPuzzlePoints: 0,
        unlockedCodexCards: [],
        dailySolves: {},
      };
    }
    const parsed = JSON.parse(raw);
    return {
      totalWins: parsed.totalWins || 0,
      currentStreak: parsed.currentStreak || 0,
      lastPlayedDate: parsed.lastPlayedDate || null,
      bestTimes: parsed.bestTimes || {},
      completedLevels: parsed.completedLevels || {},
      soundMuted: Boolean(parsed.soundMuted),
      soundProfile: parsed.soundProfile || (parsed.soundMuted ? "muted" : "arcade"),
      totalPuzzlePoints: parsed.totalPuzzlePoints || 0,
      unlockedCodexCards: Array.isArray(parsed.unlockedCodexCards) ? parsed.unlockedCodexCards : [],
      dailySolves: parsed.dailySolves || {},
    };
  } catch {
    return {
      totalWins: 0,
      currentStreak: 0,
      lastPlayedDate: null,
      bestTimes: {},
      completedLevels: {},
      soundMuted: false,
      soundProfile: "arcade",
      totalPuzzlePoints: 0,
      unlockedCodexCards: [],
      dailySolves: {},
    };
  }
}

export function savePuzzleStats(stats: PuzzleStatsData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error("Failed to save puzzle stats to localStorage", e);
  }
}

/**
 * Calculates FinTech Speed Tier & percentile ranking for a clear.
 */
export function getSpeedTier(
  _puzzleId: string,
  difficultyOrLevel: string | number,
  seconds: number
): SpeedTierInfo {
  const diffStr = String(difficultyOrLevel ?? "").toLowerCase();
  const isHard =
    diffStr.includes("hard") ||
    diffStr.includes("expert") ||
    diffStr.includes("8") ||
    diffStr.includes("9");
  const isMedium = diffStr.includes("medium") || diffStr.includes("7");

  // Thresholds: [Architect (Top 5%), Quant (Top 20%), Analyst (Top 50%)]
  const thresholds = isHard
    ? [80, 140, 220]
    : isMedium
    ? [50, 95, 150]
    : [35, 65, 110];

  if (seconds <= thresholds[0]) {
    return {
      tier: "architect",
      badge: "⚡ TOP 5%",
      percentile: 95,
      rankTitle: "Digital Architect",
      colorClass: "from-[#fec01f] to-amber-400 text-black border-[#fec01f]",
      shareBadge: "⚡ Speed: Digital Architect (Top 5%)",
      description: "Sub-second analytical reflexes. Executed with institutional speed.",
    };
  } else if (seconds <= thresholds[1]) {
    return {
      tier: "quant",
      badge: "🚀 TOP 20%",
      percentile: 80,
      rankTitle: "Senior Quant",
      colorClass: "from-[#00f0ff] to-cyan-400 text-black border-[#00f0ff]",
      shareBadge: "🚀 Speed: Senior Quant (Top 20%)",
      description: "Fast, disciplined algorithmic execution with minimal hesitation.",
    };
  } else if (seconds <= thresholds[2]) {
    return {
      tier: "analyst",
      badge: "🎯 TOP 50%",
      percentile: 50,
      rankTitle: "FinTech Analyst",
      colorClass: "from-emerald-400 to-teal-400 text-black border-emerald-400",
      shareBadge: "🎯 Speed: FinTech Analyst (Top 50%)",
      description: "Solid strategic patience. Solved well within standard coffee-break time.",
    };
  } else {
    return {
      tier: "strategist",
      badge: "💼 STRATEGIST",
      percentile: 25,
      rankTitle: "FinTech Strategist",
      colorClass: "from-purple-400 to-indigo-400 text-white border-purple-400",
      shareBadge: "💼 Speed: FinTech Strategist",
      description: "Methodical, deliberate calculation. Focused on precision over rush.",
    };
  }
}

/**
 * Calculates challenge points for a puzzle clear based on difficulty.
 */
export function calculatePuzzlePoints(
  difficultyOrLevel: string | number,
  secondsElapsed: number,
  mistakesCount?: number,
  streak = 1
): {
  pointsEarned: number;
  breakdown: {
    basePoints: number;
    speedBonus: number;
    cleanBonus: number;
    streakBonus: number;
  };
} {
  const diffStr = String(difficultyOrLevel ?? "").toLowerCase();
  let basePoints = 15;
  let maxSpeedBonus = 5;
  let speedThreshold = 120;
  let maxCleanBonus = 5;

  if (
    diffStr.includes("expert") ||
    diffStr.includes("hard") ||
    diffStr.includes("9") ||
    diffStr.includes("8")
  ) {
    basePoints = 40;
    maxSpeedBonus = 15;
    speedThreshold = 150;
    maxCleanBonus = 10;
  } else if (
    diffStr.includes("medium") ||
    diffStr.includes("7")
  ) {
    basePoints = 25;
    maxSpeedBonus = 10;
    speedThreshold = 120;
    maxCleanBonus = 5;
  } else {
    basePoints = 15;
    maxSpeedBonus = 5;
    speedThreshold = 120;
    maxCleanBonus = 5;
  }

  // Speed bonus
  const speedBonus = secondsElapsed > 0 && secondsElapsed <= speedThreshold ? maxSpeedBonus : 0;

  // Clean run bonus
  const cleanBonus = typeof mistakesCount === "number" && mistakesCount === 0 ? maxCleanBonus : 0;

  // Streak loyalty bonus: +5 pts if streak > 1
  const streakBonus = streak > 1 ? 5 : 0;

  const pointsEarned = basePoints + speedBonus + cleanBonus + streakBonus;

  return {
    pointsEarned,
    breakdown: { basePoints, speedBonus, cleanBonus, streakBonus },
  };
}

/**
 * Calculates the modest Arena Game bonus contributed by puzzle challenges.
 * Capped strictly at +50 points max ("just a bit. Not too much.")
 */
export function getArenaPuzzleBonus(providedStats?: PuzzleStatsData): number {
  const stats = providedStats || getPuzzleStats();
  const completedKeys = Object.keys(stats.completedLevels || {});

  let difficultyBonus = 0;
  for (const key of completedKeys) {
    const lower = key.toLowerCase();
    if (
      lower.includes("hard") ||
      lower.includes("expert") ||
      lower.endsWith("-8") ||
      lower.endsWith("-9")
    ) {
      difficultyBonus += 15;
    } else if (
      lower.includes("medium") ||
      lower.endsWith("-7") ||
      lower.endsWith("-6")
    ) {
      difficultyBonus += 10;
    } else {
      difficultyBonus += 5;
    }
  }

  const uniqueTypes = new Set(completedKeys.map((k) => k.split("-")[0]));
  const typeBonus = uniqueTypes.size * 10;
  const winsBonus = Math.min(50, (stats.totalWins || 0) * 5);

  return Math.min(50, Math.max(difficultyBonus, typeBonus, winsBonus));
}

/**
 * Returns progress toward today's Daily Trifecta (3) & Grand Slam (6).
 */
export function getDailyProgress(dateStr?: string, providedStats?: PuzzleStatsData): DailyProgressInfo {
  const stats = providedStats || getPuzzleStats();
  const today = dateStr || new Date().toISOString().split("T")[0];
  const list = stats.dailySolves?.[today] || [];
  const uniqueList = Array.from(new Set(list));
  const count = uniqueList.length;

  const isTrifecta = count >= 3;
  const isGrandSlam = count >= 6;
  let bonusPoints = 0;
  if (isGrandSlam) bonusPoints = 35;
  else if (isTrifecta) bonusPoints = 15;

  return {
    date: today,
    solvedCount: count,
    solvedPuzzles: uniqueList,
    isTrifecta,
    isGrandSlam,
    bonusPoints,
  };
}

/**
 * Creates a 1v1 Challenge link with URL search params.
 */
export function createChallengeUrl(options: {
  puzzleId: string;
  seed: number;
  difficulty?: string;
  seconds: number;
  challengerName?: string;
}): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://fintechfestival.lk";
  const params = new URLSearchParams({
    game: options.puzzleId,
    seed: String(options.seed),
    challenge: "1",
    target: String(options.seconds),
  });
  if (options.difficulty) params.set("diff", options.difficulty);
  if (options.challengerName) params.set("from", options.challengerName);
  return `${origin}/puzzles?${params.toString()}`;
}

export function recordPuzzleWin(
  puzzleId: string,
  difficultyOrLevel: string,
  secondsElapsed: number,
  mistakesCount?: number
): PuzzleWinResult {
  const stats = getPuzzleStats();
  const key = `${puzzleId}-${difficultyOrLevel}`;

  // Record completion
  stats.completedLevels[key] = true;
  stats.totalWins += 1;

  // Check best time
  let isNewBestTime = false;
  if (!stats.bestTimes[key] || secondsElapsed < stats.bestTimes[key]) {
    stats.bestTimes[key] = secondsElapsed;
    isNewBestTime = true;
  }

  // Update daily solves
  const today = new Date().toISOString().split("T")[0];
  if (!stats.dailySolves) stats.dailySolves = {};
  if (!stats.dailySolves[today]) stats.dailySolves[today] = [];
  if (!stats.dailySolves[today].includes(puzzleId)) {
    stats.dailySolves[today].push(puzzleId);
  }

  // Update streak based on day
  if (stats.lastPlayedDate === today) {
    // Already played today, streak remains
  } else if (stats.lastPlayedDate) {
    const lastDate = new Date(stats.lastPlayedDate);
    const currDate = new Date(today);
    const diffDays = Math.round(
      (currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24)
    );
    if (diffDays === 1) {
      stats.currentStreak += 1;
    } else {
      stats.currentStreak = 1;
    }
  } else {
    stats.currentStreak = 1;
  }
  stats.lastPlayedDate = today;

  // Calculate points earned for this solve
  const { pointsEarned, breakdown } = calculatePuzzlePoints(
    difficultyOrLevel,
    secondsElapsed,
    mistakesCount,
    stats.currentStreak
  );

  // Check for newly unlocked Codex knowledge card
  if (!stats.unlockedCodexCards) stats.unlockedCodexCards = [];
  const newCodexCard = unlockRandomCodexCard(stats.unlockedCodexCards);
  if (newCodexCard) {
    stats.unlockedCodexCards.push(newCodexCard.id);
  }

  stats.totalPuzzlePoints = (stats.totalPuzzlePoints || 0) + pointsEarned;
  savePuzzleStats(stats);

  const arenaBonusPoints = getArenaPuzzleBonus(stats);
  const speedTier = getSpeedTier(puzzleId, difficultyOrLevel, secondsElapsed);
  const dailyProgress = getDailyProgress(today, stats);

  return {
    isNewBestTime,
    newStreak: stats.currentStreak,
    pointsEarned,
    breakdown,
    totalPoints: stats.totalPuzzlePoints,
    arenaBonusPoints,
    speedTier,
    newCodexCard,
    dailyProgress,
  };
}

export function setGlobalSoundProfile(profile: SoundProfile): void {
  const stats = getPuzzleStats();
  stats.soundProfile = profile;
  stats.soundMuted = profile === "muted";
  savePuzzleStats(stats);
  sounds.setProfile(profile);
}

export function getGlobalSoundProfile(): SoundProfile {
  const stats = getPuzzleStats();
  return stats.soundProfile || (stats.soundMuted ? "muted" : "arcade");
}

export function toggleGlobalPuzzleMute(): boolean {
  const stats = getPuzzleStats();
  const current = stats.soundProfile || (stats.soundMuted ? "muted" : "arcade");
  const next: SoundProfile = current === "muted" ? "arcade" : "muted";
  setGlobalSoundProfile(next);
  return next === "muted";
}
