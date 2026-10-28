/**
 * Local storage manager for LinkedIn Puzzles statistics, streaks, and settings.
 */

export interface PuzzleStatsData {
  totalWins: number;
  currentStreak: number;
  lastPlayedDate: string | null; // YYYY-MM-DD
  bestTimes: Record<string, number>; // key: `${puzzleId}-${levelOrDiff}`, value: seconds
  completedLevels: Record<string, boolean>; // key: `${puzzleId}-${levelOrDiff}`
  soundMuted: boolean;
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
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      totalWins: 0,
      currentStreak: 0,
      lastPlayedDate: null,
      bestTimes: {},
      completedLevels: {},
      soundMuted: false,
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

export function recordPuzzleWin(
  puzzleId: string,
  difficultyOrLevel: string,
  secondsElapsed: number
): { isNewBestTime: boolean; newStreak: number } {
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

  savePuzzleStats(stats);
  return { isNewBestTime, newStreak: stats.currentStreak };
}

export function toggleGlobalPuzzleMute(): boolean {
  const stats = getPuzzleStats();
  stats.soundMuted = !stats.soundMuted;
  savePuzzleStats(stats);
  return stats.soundMuted;
}
