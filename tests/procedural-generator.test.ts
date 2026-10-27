/**
 * Tests for the Procedural Board Generator
 *
 * Validates:
 *   - PRNG determinism
 *   - Hard invariants on every generated board
 *   - BFS solvability
 *   - Cycle-freedom
 *   - Monte Carlo playability (avg turns within bounds)
 *   - Daily seed utility
 */

import { describe, it, expect } from "vitest";
import {
  mulberry32,
  generateDynamicBoard,
  getDailySeed,
  getTodaysDailyBoard,
  monteCarloSimulate,
} from "../lib/game-engine/procedural-generator";
import { validateBoardConfig } from "../lib/game-engine/board-config";

// ─── PRNG Tests ───────────────────────────────────────────────────────────────

describe("mulberry32 PRNG", () => {
  it("produces values in [0, 1)", () => {
    const rng = mulberry32(12345);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("is deterministic — same seed produces same sequence", () => {
    const rng1 = mulberry32(0xdeadbeef);
    const rng2 = mulberry32(0xdeadbeef);
    for (let i = 0; i < 50; i++) {
      expect(rng1()).toBe(rng2());
    }
  });

  it("different seeds produce different sequences", () => {
    const rng1 = mulberry32(1);
    const rng2 = mulberry32(2);
    const seq1 = Array.from({ length: 20 }, () => rng1());
    const seq2 = Array.from({ length: 20 }, () => rng2());
    expect(seq1).not.toEqual(seq2);
  });
});

// ─── Board Generation Invariants ─────────────────────────────────────────────

describe("generateDynamicBoard — hard invariants", () => {
  /**
   * Run 50 boards with different seeds and verify every invariant.
   * This is a Monte Carlo sanity sweep — if any board violates a rule
   * the generator has a bug.
   */
  const SEEDS_TO_TEST = Array.from({ length: 50 }, (_, i) => i * 0x9e3779b9 + 42);

  for (const seed of SEEDS_TO_TEST) {
    it(`seed ${seed}: passes validateBoardConfig`, () => {
      const { config } = generateDynamicBoard(seed);
      expect(() => validateBoardConfig(config)).not.toThrow();
    });
  }

  it("generates a board in ≤ 10 attempts for most seeds", () => {
    let totalAttempts = 0;
    for (const seed of SEEDS_TO_TEST) {
      const { attempts } = generateDynamicBoard(seed);
      totalAttempts += attempts;
    }
    const avgAttempts = totalAttempts / SEEDS_TO_TEST.length;
    // Average attempts should be well under 5
    expect(avgAttempts).toBeLessThan(5);
  });
});

describe("generateDynamicBoard — boundary protections", () => {
  const SEEDS = [2026, 42, 0xdeadbeef, 1, 999999];

  for (const seed of SEEDS) {
    it(`seed ${seed}: square 1 and 25 are unoccupied`, () => {
      const { config } = generateDynamicBoard(seed);
      const all = [
        ...config.ladders.map((l) => l.from),
        ...config.ladders.map((l) => l.to),
        ...config.snakes.map((s) => s.from),
        ...config.snakes.map((s) => s.to),
        ...config.specialSquares.map((sq) => sq.square),
      ];
      expect(all).not.toContain(1);
      expect(all).not.toContain(25);
    });

    it(`seed ${seed}: all endpoints are pairwise disjoint`, () => {
      const { config } = generateDynamicBoard(seed);
      const all = [
        ...config.ladders.map((l) => l.from),
        ...config.ladders.map((l) => l.to),
        ...config.snakes.map((s) => s.from),
        ...config.snakes.map((s) => s.to),
      ];
      const unique = new Set(all);
      expect(unique.size).toBe(all.length); // no duplicates
    });

    it(`seed ${seed}: no ladder-top is a snake-head (chain-trap guard)`, () => {
      const { config } = generateDynamicBoard(seed);
      const ladderTops = new Set(config.ladders.map((l) => l.to));
      const snakeHeads = new Set(config.snakes.map((s) => s.from));
      for (const top of ladderTops) {
        expect(snakeHeads.has(top)).toBe(false);
      }
    });

    it(`seed ${seed}: ladders advance ≥ 4 squares`, () => {
      const { config } = generateDynamicBoard(seed);
      for (const ladder of config.ladders) {
        expect(ladder.to - ladder.from).toBeGreaterThanOrEqual(4);
      }
    });

    it(`seed ${seed}: snakes retreat ≥ 3 squares`, () => {
      const { config } = generateDynamicBoard(seed);
      for (const snake of config.snakes) {
        expect(snake.from - snake.to).toBeGreaterThanOrEqual(3);
      }
    });

    it(`seed ${seed}: has 2 treasures`, () => {
      const { config } = generateDynamicBoard(seed);
      const treasures = config.specialSquares.filter((sq) => sq.type === "treasure");
      expect(treasures).toHaveLength(2);
    });

    it(`seed ${seed}: has 3-4 quizzes spaced ≥ 3 apart`, () => {
      const { config } = generateDynamicBoard(seed);
      const quizzes = config.specialSquares
        .filter((sq) => sq.type === "quiz")
        .map((sq) => sq.square)
        .sort((a, b) => a - b);
      expect(quizzes.length).toBeGreaterThanOrEqual(3);
      expect(quizzes.length).toBeLessThanOrEqual(4);
      for (let i = 1; i < quizzes.length; i++) {
        expect(quizzes[i] - quizzes[i - 1]).toBeGreaterThanOrEqual(3);
      }
    });
  }
});

// ─── Solvability & Playability ────────────────────────────────────────────────

describe("generateDynamicBoard — solvability", () => {
  it("all 50 boards are Monte-Carlo finishable (100% completion rate)", () => {
    const seeds = Array.from({ length: 50 }, (_, i) => i + 1000);
    for (const seed of seeds) {
      const { config } = generateDynamicBoard(seed);
      const stats = monteCarloSimulate(config, 200);
      expect(stats.allFinished).toBe(true);
    }
  });

  it("average game length is within reasonable bounds (5–60 turns)", () => {
    const seeds = [2026, 42, 1, 9999, 20261027];
    for (const seed of seeds) {
      const { config } = generateDynamicBoard(seed);
      const stats = monteCarloSimulate(config, 300);
      expect(stats.avgTurns).toBeGreaterThan(4);
      expect(stats.avgTurns).toBeLessThan(60);
    }
  });
});

// ─── Determinism Tests ────────────────────────────────────────────────────────

describe("generateDynamicBoard — determinism", () => {
  it("same seed always produces the same board", () => {
    const seed = 20261027;
    const { config: c1 } = generateDynamicBoard(seed);
    const { config: c2 } = generateDynamicBoard(seed);
    expect(c1.ladders).toEqual(c2.ladders);
    expect(c1.snakes).toEqual(c2.snakes);
    expect(c1.specialSquares).toEqual(c2.specialSquares);
  });

  it("different seeds produce different boards (with very high probability)", () => {
    const { config: c1 } = generateDynamicBoard(1);
    const { config: c2 } = generateDynamicBoard(999999);
    // At minimum the ladders or snakes should differ
    const same =
      JSON.stringify(c1.ladders) === JSON.stringify(c2.ladders) &&
      JSON.stringify(c1.snakes) === JSON.stringify(c2.snakes);
    expect(same).toBe(false);
  });
});

// ─── Daily Seed ───────────────────────────────────────────────────────────────

describe("getDailySeed", () => {
  it("returns a positive integer", () => {
    const seed = getDailySeed();
    expect(seed).toBeGreaterThan(0);
    expect(Number.isInteger(seed)).toBe(true);
  });

  it("returns the same value for the same date", () => {
    const d = new Date("2026-10-27T00:00:00Z");
    expect(getDailySeed(d)).toBe(getDailySeed(d));
  });

  it("returns different values for different dates", () => {
    const d1 = new Date("2026-10-27T00:00:00Z");
    const d2 = new Date("2026-10-28T00:00:00Z");
    expect(getDailySeed(d1)).not.toBe(getDailySeed(d2));
  });

  it("20261027 produces a valid, solvable board", () => {
    const seed = getDailySeed(new Date("2026-10-27T00:00:00Z"));
    expect(seed).toBe(20261027);
    const { config } = generateDynamicBoard(seed);
    expect(() => validateBoardConfig(config)).not.toThrow();
    const stats = monteCarloSimulate(config, 100);
    expect(stats.allFinished).toBe(true);
  });
});

describe("getTodaysDailyBoard", () => {
  it("returns a valid board without throwing", () => {
    const { config } = getTodaysDailyBoard();
    expect(() => validateBoardConfig(config)).not.toThrow();
  });
});
