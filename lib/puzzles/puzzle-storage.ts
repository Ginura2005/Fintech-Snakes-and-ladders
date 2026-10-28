/**
 * Local storage manager for LinkedIn Puzzles statistics, streaks, settings, and points.
 */

export interface PuzzleStatsData {
  totalWins: number;
  currentStreak: number;
  lastPlayedDate: string | null; // YYYY-MM-DD
  bestTimes: Record<string, number>; // key: `${puzzleId}-${levelOrDiff}`, value: seconds
  completedLevels: Record<string, boolean>; // key: `${puzzleId}-${levelOrDiff}`
  soundMuted: boolean;
  totalPuzzlePoints: number; // accumulated puzzle points
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
  };
  totalPoints: number;
  arenaBonusPoints: number;
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
      totalPuzzlePoints: 0,
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
        totalPuzzlePoints: 0,
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
      totalPuzzlePoints: parsed.totalPuzzlePoints || 0,
    };
  } catch {
    return {
      totalWins: 0,
      currentStreak: 0,
      lastPlayedDate: null,
      bestTimes: {},
      completedLevels: {},
      soundMuted: false,
      totalPuzzlePoints: 0,
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
 * Calculates challenge points for a puzzle clear based on difficulty.
 * - Easy: Base 15 pts (+5 speed, +5 clean, +5 streak) -> max 30 pts
 * - Medium: Base 25 pts (+10 speed, +5 clean, +5 streak) -> max 45 pts
 * - Hard / Expert: Base 40 pts (+15 speed, +10 clean, +5 streak) -> max 70 pts
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
 * Differentiates by difficulty: Easy (+5), Medium (+10), Hard (+15).
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

  // Maximum cap of 50 points (equivalent to 1 FinTech quiz answer)
  return Math.min(50, Math.max(difficultyBonus, typeBonus, winsBonus));
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

  // Update streak based on day
  const today = new Date().toISOString().split("T")[0];
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

  stats.totalPuzzlePoints = (stats.totalPuzzlePoints || 0) + pointsEarned;
  savePuzzleStats(stats);

  const arenaBonusPoints = getArenaPuzzleBonus(stats);

  return {
    isNewBestTime,
    newStreak: stats.currentStreak,
    pointsEarned,
    breakdown,
    totalPoints: stats.totalPuzzlePoints,
    arenaBonusPoints,
  };
}

export function toggleGlobalPuzzleMute(): boolean {
  const stats = getPuzzleStats();
  stats.soundMuted = !stats.soundMuted;
  savePuzzleStats(stats);
  return stats.soundMuted;
}
