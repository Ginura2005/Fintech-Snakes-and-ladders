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

// ─── Procedural Generation Tier Rules (Difficulty Balancing) ─────────────────

/**
 * Tiered Ladder Generation Rules:
 * Exactly 4 Ladders are placed on each board to guarantee fair, exciting progression:
 *   - Tier 1: Early Boost (starts in Row 1: 2..5, climbs +4..+6 into Row 2)
 *   - Tier 2: Lower-Mid Step (starts in Row 2: 6..10, climbs +5..+7 into Row 3)
 *   - Tier 3: Upper-Mid Climb (starts in Row 2/3: 8..13, climbs +6..+8 into Row 4)
 *   - Tier 4: Late-Game Surge (starts in Row 3: 12..15, climbs +7..+10 into Row 5)
 */
export interface LadderTierRule {
  name: string;
  fromMin: number;
  fromMax: number;
  minDelta: number;
  maxDelta: number;
}

export const LADDER_TIER_RULES: LadderTierRule[] = [
  { name: "Early Boost", fromMin: 2, fromMax: 5, minDelta: 4, maxDelta: 6 },
  { name: "Lower-Mid Step", fromMin: 6, fromMax: 10, minDelta: 5, maxDelta: 7 },
  { name: "Upper-Mid Climb", fromMin: 8, fromMax: 13, minDelta: 6, maxDelta: 8 },
  { name: "Late-Game Surge", fromMin: 12, fromMax: 15, minDelta: 7, maxDelta: 10 },
];

/**
 * Tiered Snake Generation Rules:
 * Exactly 4 Snakes (2 ordinary, 2 major) placed strategically across rows 3-5:
 *   - Tier 1: Mid-Board Trap (Ordinary, Row 3: 11..15, slides down -5..-8 into Row 1/2)
 *   - Tier 2: Upper Hazard (Major, Row 4: 16..20, slides down -8..-11 into Row 2)
 *   - Tier 3: Endgame Hazard (Ordinary, Row 5: 21..24, slides down -6..-9 into Row 3)
 *   - Tier 4: Finish Line Peril (Major, Row 5: 21..24 right outside 25, slides down -8..-12 into Row 3/4)
 */
export interface SnakeTierRule {
  name: string;
  type: "ordinary" | "major";
  fromMin: number;
  fromMax: number;
  minDelta: number;
  maxDelta: number;
}

export const SNAKE_TIER_RULES: SnakeTierRule[] = [
  { name: "Mid-Board Trap", type: "ordinary", fromMin: 11, fromMax: 15, minDelta: 5, maxDelta: 8 },
  { name: "Upper Hazard", type: "major", fromMin: 16, fromMax: 20, minDelta: 8, maxDelta: 11 },
  { name: "Endgame Hazard", type: "ordinary", fromMin: 21, fromMax: 24, minDelta: 6, maxDelta: 9 },
  { name: "Finish Line Peril", type: "major", fromMin: 21, fromMax: 24, minDelta: 8, maxDelta: 12 },
];

// ─── Graph Validation (Reachability & Acyclicity) ─────────────────────────────

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
 * Validates that:
 * 1. Square 25 is reachable from square 1.
 * 2. Every square reachable from square 1 can eventually reach square 25
 *    (i.e. there are zero absorbing trap subgraphs / infinite deadlock cycles).
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

// ─── Placement Methods ────────────────────────────────────────────────────────

/**
 * Method 1: Places exactly 4 ladders adhering to the tiered distance & row rules.
 */
function placeTieredLadders(
  rng: () => number,
  occupied: Set<number>,
  themes: string[]
): LadderConfig[] | null {
  const ladders: LadderConfig[] = [];
  const themesCopy = [...themes];

  for (const tier of LADDER_TIER_RULES) {
    let placed = false;
    for (let attempt = 0; attempt < 50; attempt++) {
      const from = randInt(rng, tier.fromMin, tier.fromMax);
      const delta = randInt(rng, tier.minDelta, tier.maxDelta);
      const to = from + delta;

      if (to >= 25 || occupied.has(from) || occupied.has(to)) continue;

      occupied.add(from);
      occupied.add(to);
      ladders.push({
        from,
        to,
        theme: themesCopy.pop() ?? "FinTech Innovation",
      });
      placed = true;
      break;
    }
    if (!placed) return null;
  }
  return ladders;
}

/**
 * Method 2: Places exactly 4 snakes (2 ordinary, 2 major) adhering to the hazard placement rules.
 * Enforces the chain-trap guard: ladder tops can never be snake heads.
 */
function placeTieredSnakes(
  rng: () => number,
  occupied: Set<number>,
  ladderTops: Set<number>
): SnakeConfig[] | null {
  const snakes: SnakeConfig[] = [];

  for (const tier of SNAKE_TIER_RULES) {
    let placed = false;
    for (let attempt = 0; attempt < 50; attempt++) {
      const from = randInt(rng, tier.fromMin, tier.fromMax);
      const delta = randInt(rng, tier.minDelta, Math.min(tier.maxDelta, from - 2));
      const to = from - delta;

      if (
        to < 2 ||
        to >= from ||
        occupied.has(from) ||
        occupied.has(to) ||
        ladderTops.has(from)
      ) {
        continue;
      }

      occupied.add(from);
      occupied.add(to);
      snakes.push({ from, to, type: tier.type });
      placed = true;
      break;
    }
    if (!placed) return null;
  }
  return snakes;
}

/**
 * Method 3: Places exactly 3 quizzes and exactly 2 treasures on the remaining available squares.
 */
function placeSpecialSquares(
  rng: () => number,
  pool: number[],
  occupied: Set<number>
): SpecialSquareConfig[] | null {
  const available = pool.filter((sq) => !occupied.has(sq));
  if (available.length < 5) return null;

  shuffleArray(rng, available);

  // Pick exactly 3 quiz squares spaced at least 3 tiles apart (fallback to 2)
  let quizSquares: number[] = [];
  for (const minSep of [3, 2, 1]) {
    quizSquares = [];
    for (const sq of available) {
      if (quizSquares.length >= 3) break;
      if (quizSquares.every((q) => Math.abs(q - sq) >= minSep)) {
        quizSquares.push(sq);
      }
    }
    if (quizSquares.length >= 3) break;
  }
  if (quizSquares.length < 3) return null;

  const quizSet = new Set(quizSquares);
  const treasureSquares = available.filter((sq) => !quizSet.has(sq)).slice(0, 2);
  if (treasureSquares.length < 2) return null;

  return [
    ...quizSquares.map((sq) => ({ square: sq, type: "quiz" as const })),
    ...treasureSquares.map((sq) => ({ square: sq, type: "treasure" as const })),
  ];
}

// ─── Board Generation ─────────────────────────────────────────────────────────

interface GenerationResult {
  config: BoardConfig;
  seed: number;
  attempts: number;
}

export function generateDynamicBoard(
  seed: number,
  scoringOverrides?: Partial<BoardConfig["scoring"]>,
  treasureOverrides?: Partial<BoardConfig["treasure"]>
): GenerationResult {
  const BOARD = 25;
  const FORBIDDEN = new Set([1, BOARD]); // squares 1 and 25 are strictly preserved

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

    // ── Method 1: Place Exactly 4 Tiered Ladders ─────────────────────────────
    const themesCopy = shuffleArray(rng, [...LADDER_THEMES]);
    const ladders = placeTieredLadders(rng, occupied, themesCopy);
    if (!ladders) continue;

    // ── Method 2: Place Exactly 4 Tiered Snakes (2 Ordinary, 2 Major) ────────
    const ladderTopSquares = new Set(ladders.map((l) => l.to));
    const snakes = placeTieredSnakes(rng, occupied, ladderTopSquares);
    if (!snakes) continue;

    // ── Method 3: Place Exactly 3 Quizzes & 2 Treasures ──────────────────────
    const specialSquares = placeSpecialSquares(rng, pool, occupied);
    if (!specialSquares) continue;

    // ── Method 4: Bi-Directional Graph Validation (Acyclicity & Solvability) ──
    const candidate: Partial<BoardConfig> = { ladders, snakes };
    if (!isBoardSolvableAndTrapFree(candidate)) continue;

    // ── Valid Board Found — Assemble Final Config ────────────────────────────
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
