/**
 * Mulberry32 Seedable PRNG
 * High-speed, deterministic 32-bit pseudo-random number generator.
 */
export function mulberry32(seed: number): () => number {
  let s = Math.floor(seed) >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates an integer daily seed for the given date (defaults to today).
 * Format: YYYYMMDD as an integer (e.g. 20261028).
 */
export function getDailyPuzzleSeed(date = new Date()): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return y * 10000 + m * 100 + d;
}

/**
 * Returns a random integer in [min, max] inclusive.
 */
export function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/**
 * Picks a random item from an array using the given PRNG.
 */
export function randomChoice<T>(rng: () => number, array: T[]): T {
  return array[Math.floor(rng() * array.length)];
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm and the given PRNG.
 */
export function shuffle<T>(rng: () => number, array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}
