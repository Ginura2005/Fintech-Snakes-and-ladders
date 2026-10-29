/** Deadline: October 31, 2026 23:59:59 Sri Lanka Time (UTC+05:30) */
export const TOURNAMENT_DEADLINE_ISO = "2026-10-31T23:59:59+05:30";
export const TOURNAMENT_DEADLINE_MS = new Date(TOURNAMENT_DEADLINE_ISO).getTime();

/** True while the festival challenge window is still open. */
export function isTournamentOpen(now = Date.now()): boolean {
  return now < TOURNAMENT_DEADLINE_MS;
}

/**
 * Leaderboard outcome badge while the challenge is live vs after close.
 * Use "Winning" until Oct 31 close; "Won" after.
 */
export function getOutcomeBadgeLabel(now = Date.now()): "Winning" | "Won" {
  return isTournamentOpen(now) ? "Winning" : "Won";
}
