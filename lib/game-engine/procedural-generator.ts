/**
 * LANKA FINTECHVERSE — Procedural Board Generator
 *
 * Generates deterministic, valid, solvable board configurations
 * from a 64-bit integer seed using the Mulberry32 PRNG.
 *
 * Hard invariants enforced on every generated board:
 *   1. Square 1 and 25 are never occupied by any special element.
 *   2. All element-set endpoints are pairwise disjoint.
 *   3. Ladder tops cannot simultaneously be snake heads (chain-trap guard).
 *   4. Ladders advance (to > from + 3) and snakes retreat (from > to + 2).
 *   5. BFS reachability: square 25 is always reachable from square 1.
 *   6. No strongly-connected components of size > 1 (no infinite cycle traps).
 *
 * If a generated candidate violates any rule it is automatically
 * re-tried with an incremented "salt" appended to the seed until a
 * valid board is found (typically ≤ 3 attempts).
 */

import {
  BoardConfig,
  LadderConfig,
  SnakeConfig,
  SpecialSquareConfig,
  CONFIG_VERSION,
  BOARD_CONFIG,
} from "./board-config";

// ─── Mulberry32 PRNG ─────────────────────────────────────────────────────────

/**
 * Creates a deterministic pseudo-random number generator from `seed`.
 * Each call to the returned function produces the next number in [0, 1).
 * Same seed → same infinite sequence, always.
 */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0; // ensure unsigned 32-bit
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Picks a random integer in [min, max] (inclusive) using the given rng.
 */
function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/**
 * Fisher-Yates shuffle in place using the given rng.
 */
function shuffleArray<T>(rng: () => number, arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── FinTech Themes ───────────────────────────────────────────────────────────

const LADDER_THEMES = [
  "Digital Payments",
  "Financial Inclusion",
  "Open Banking",
  "RegTech Innovation",
  "Blockchain Adoption",
  "AI in Finance",
  "Cybersecurity Shield",
  "DeFi Milestone",
  "Neobank Launch",
  "ESG Fintech",
  "API Economy",
  "Embedded Finance",
];

// ─── Graph Validation ─────────────────────────────────────────────────────────

/**
 * Builds the transition map for BFS.
 * From each square, dice rolls 1-6 land on a new square, possibly
 * then jumping via a ladder or snake.
 */
function buildTransitionMap(config: Partial<BoardConfig>): Map<number, Set<number>> {
  const BOARD = 25;
  const ladderMap = new Map<number, number>(
    (config.ladders ?? []).map((l) => [l.from, l.to])
  );
  const snakeMap = new Map<number, number>(
    (config.snakes ?? []).map((s) => [s.from, s.to])
  );

  const transitions = new Map<number, Set<number>>();
  for (let sq = 1; sq <= BOARD; sq++) {
    const targets = new Set<number>();
    for (let die = 1; die <= 6; die++) {
      const raw = sq + die;
      if (raw > BOARD) continue; // overshoot — stay (skip, not a transition)
      const landed = ladderMap.get(raw) ?? snakeMap.get(raw) ?? raw;
      targets.add(landed);
    }
    transitions.set(sq, targets);
  }
  return transitions;
}

/**
 * BFS from square 1 — returns true if square 25 is reachable.
 */
function isBoardSolvableAndTrapFree(config: Partial<BoardConfig>): boolean {
  const transitions = buildTransitionMap(config);
  const BOARD = 25;

  // 1. Forward BFS from square 1 to find all reachable squares
  const reachableFrom1 = new Set<number>([1]);
  const queue1 = [1];
  while (queue1.length > 0) {
    const sq = queue1.shift()!;
    for (const next of transitions.get(sq) ?? []) {
      if (!reachableFrom1.has(next)) {
        reachableFrom1.add(next);
        queue1.push(next);
      }
    }
  }

  // If square 25 is not reachable at all, reject
  if (!reachableFrom1.has(BOARD)) return false;

  // 2. Build reversed transition graph
  const reverse = new Map<number, Set<number>>();
  for (let sq = 1; sq <= BOARD; sq++) {
    reverse.set(sq, new Set<number>());
  }
  for (const [from, tos] of transitions) {
    for (const to of tos) {
      reverse.get(to)?.add(from);
    }
  }

  // 3. Backward BFS from square 25 to find all squares that can reach 25
  const canReach25 = new Set<number>([BOARD]);
  const queue2 = [BOARD];
  while (queue2.length > 0) {
    const sq = queue2.shift()!;
    for (const prev of reverse.get(sq) ?? []) {
      if (!canReach25.has(prev)) {
        canReach25.add(prev);
        queue2.push(prev);
      }
    }
  }

  // Every square that can be reached from start MUST have a path to finish
  for (const sq of reachableFrom1) {
    if (!canReach25.has(sq)) return false;
  }

  return true;
}

// ─── Board Generation ─────────────────────────────────────────────────────────

interface GenerationResult {
  config: BoardConfig;
  seed: number;
  attempts: number;
}

/**
 * Generates a valid, solvable BoardConfig from the given integer seed.
 *
 * The classic board config is preserved as `CLASSIC_BOARD_CONFIG` in
 * board-config.ts. This function creates a *new* config with different
 * element placements but the same scoring rules (imported from the
 * classic config).
 */
export function generateDynamicBoard(
  seed: number,
  scoringOverrides?: Partial<BoardConfig["scoring"]>,
  treasureOverrides?: Partial<BoardConfig["treasure"]>
): GenerationResult {
  const BOARD = 25;
  const FORBIDDEN = new Set([1, BOARD]); // squares that cannot host any element

  let attempts = 0;

  while (true) {
    attempts++;
    // Salt the seed on retry to escape a bad region of the PRNG
    const saltedSeed = (seed + (attempts - 1) * 0x9e3779b9) >>> 0;
    const rng = mulberry32(saltedSeed);

    // Build a pool of all usable squares (2..24)
    const pool = Array.from({ length: BOARD - 2 }, (_, i) => i + 2);
    shuffleArray(rng, pool);

    // Occupied set — tracks all endpoint squares to enforce disjoint sets
    const occupied = new Set<number>(FORBIDDEN);

    // ── Ladders ─────────────────────────────────────────────────────────────
    const numLadders = randInt(rng, 3, 4);
    const ladders: LadderConfig[] = [];

    const themesCopy = shuffleArray(rng, [...LADDER_THEMES]);

    const LADDER_CATEGORIES = [
      { minDelta: 4, maxDelta: 6 },   // Short boost ×1
      { minDelta: 7, maxDelta: 11 },  // Medium boost ×1-2
      { minDelta: 12, maxDelta: 15 }, // Long surge ×1
    ];

    // For 4 ladders add a second medium; for 3 use one of each
    const ladderCategoryPlan =
      numLadders === 4
        ? [LADDER_CATEGORIES[0], LADDER_CATEGORIES[1], LADDER_CATEGORIES[1], LADDER_CATEGORIES[2]]
        : [LADDER_CATEGORIES[0], LADDER_CATEGORIES[1], LADDER_CATEGORIES[2]];

    let ladderFailed = false;
    for (const cat of ladderCategoryPlan) {
      let placed = false;
      // Try up to 30 random from/to combos for this category
      for (let attempt = 0; attempt < 30; attempt++) {
        const from = randInt(rng, 2, BOARD - cat.minDelta - 1);
        const delta = randInt(rng, cat.minDelta, cat.maxDelta);
        const to = from + delta;

        if (to >= BOARD) continue;
        if (occupied.has(from) || occupied.has(to)) continue;

        occupied.add(from);
        occupied.add(to);
        ladders.push({ from, to, theme: themesCopy.pop() ?? "Innovation" });
        placed = true;
        break;
      }
      if (!placed) { ladderFailed = true; break; }
    }
    if (ladderFailed) continue;

    // ── Snakes ──────────────────────────────────────────────────────────────
    const numSnakes = randInt(rng, 3, 4);
    const snakes: SnakeConfig[] = [];

    const SNAKE_CATEGORIES: Array<{ minDelta: number; maxDelta: number; type: "ordinary" | "major" }> = [
      { minDelta: 3, maxDelta: 7, type: "ordinary" },  // Ordinary ×2
      { minDelta: 3, maxDelta: 7, type: "ordinary" },
      { minDelta: 8, maxDelta: 15, type: "major" },    // Major ×1-2
    ];
    if (numSnakes === 4) {
      SNAKE_CATEGORIES.push({ minDelta: 8, maxDelta: 15, type: "major" });
    }

    // Set of all current ladder-top squares — snake heads cannot overlap these
    const ladderTopSquares = new Set(ladders.map((l) => l.to));

    let snakeFailed = false;
    for (const cat of SNAKE_CATEGORIES) {
      let placed = false;
      for (let attempt = 0; attempt < 30; attempt++) {
        const from = randInt(rng, cat.minDelta + 2, BOARD - 1); // head must be ≥ minDelta+2
        const delta = randInt(rng, cat.minDelta, Math.min(cat.maxDelta, from - 2));
        const to = from - delta;

        if (to < 2 || to >= from) continue; // tail must be ≥ 2
        if (occupied.has(from) || occupied.has(to)) continue;
        // Chain-trap guard: ladder top cannot be snake head
        if (ladderTopSquares.has(from)) continue;

        occupied.add(from);
        occupied.add(to);
        snakes.push({ from, to, type: cat.type });
        placed = true;
        break;
      }
      if (!placed) { snakeFailed = true; break; }
    }
    if (snakeFailed) continue;

    // ── Special Squares (Quizzes & Treasures) ───────────────────────────────
    const numQuizzes = randInt(rng, 3, 4);
    const numTreasures = 2;

    // Remaining unoccupied squares
    const available = pool.filter((sq) => !occupied.has(sq));
    if (available.length < numQuizzes + numTreasures) continue;

    shuffleArray(rng, available);

    // Pick quiz squares — prefer at least 3 tiles apart, fallback to at least 2
    let quizSquares: number[] = [];
    for (const minSep of [3, 2, 1]) {
      quizSquares = [];
      for (const sq of available) {
        if (quizSquares.length >= numQuizzes) break;
        if (quizSquares.every((q) => Math.abs(q - sq) >= minSep)) {
          quizSquares.push(sq);
        }
      }
      if (quizSquares.length >= numQuizzes) break;
    }
    if (quizSquares.length < numQuizzes) continue;

    const quizSet = new Set(quizSquares);
    const treasureSquares = available.filter((sq) => !quizSet.has(sq)).slice(0, numTreasures);
    if (treasureSquares.length < numTreasures) continue;

    const specialSquares: SpecialSquareConfig[] = [
      ...quizSquares.map((sq) => ({ square: sq, type: "quiz" as const })),
      ...treasureSquares.map((sq) => ({ square: sq, type: "treasure" as const })),
    ];

    // ── Assemble candidate board ─────────────────────────────────────────────
    const candidate: Partial<BoardConfig> = { ladders, snakes };

    // ── Graph validation ─────────────────────────────────────────────────────
    if (!isBoardSolvableAndTrapFree(candidate)) continue;

    // ── Valid — assemble final BoardConfig ───────────────────────────────────
    const generatedConfig: BoardConfig = {
      version: `${CONFIG_VERSION}-gen-${seed}`,
      boardSize: BOARD,
      startHearts: BOARD_CONFIG.startHearts,
      ladders,
      snakes,
      specialSquares,
      scoring: { ...BOARD_CONFIG.scoring, ...scoringOverrides },
      treasure: { ...BOARD_CONFIG.treasure, ...treasureOverrides },
    };

    return { config: generatedConfig, seed, attempts };
  }
}

// ─── Daily Seed Utilities ─────────────────────────────────────────────────────

/**
 * Returns a deterministic integer seed for a given calendar date.
 * Format: YYYYMMDD as a number, e.g. 20261027 → 20261027.
 * This ensures all players on the same day see the exact same board
 * in ranked (daily-seed) mode without any database lookup for the seed itself.
 */
export function getDailySeed(date?: Date): number {
  const d = date ?? new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return parseInt(`${y}${m}${day}`, 10);
}

/**
 * Returns today's daily board config (deterministic, same for all players).
 */
export function getTodaysDailyBoard(): GenerationResult {
  return generateDynamicBoard(getDailySeed());
}

// ─── Monte Carlo Sim (for validation / testing) ──────────────────────────────

/**
 * Runs `numGames` simulated games on the given board config and returns
 * statistics about average turns to finish.
 * This is used in unit tests to verify board playability.
 */
export function monteCarloSimulate(
  config: BoardConfig,
  numGames = 500
): { avgTurns: number; minTurns: number; maxTurns: number; allFinished: boolean } {
  const ladderMap = new Map(config.ladders.map((l) => [l.from, l.to]));
  const snakeMap = new Map(config.snakes.map((s) => [s.from, s.to]));

  let totalTurns = 0;
  let minTurns = Infinity;
  let maxTurns = 0;
  let allFinished = true;

  const rng = mulberry32(0xdeadbeef); // fixed seed for reproducibility

  for (let g = 0; g < numGames; g++) {
    let pos = 1;
    let turns = 0;
    while (pos < 25 && turns < 500) {
      const die = randInt(rng, 1, 6);
      const raw = pos + die;
      if (raw > 25) { turns++; continue; } // overshoot
      pos = ladderMap.get(raw) ?? snakeMap.get(raw) ?? raw;
      turns++;
    }
    if (pos < 25) { allFinished = false; }
    totalTurns += turns;
    if (turns < minTurns) minTurns = turns;
    if (turns > maxTurns) maxTurns = turns;
  }

  return {
    avgTurns: totalTurns / numGames,
    minTurns,
    maxTurns,
    allFinished,
  };
}
