import { describe, it, expect } from "vitest";
import {
  QUEENS_LEVELS,
  TANGO_LEVELS,
  PINPOINT_PACKS,
  CROSSCLIMB_LEVELS,
  ZIP_LEVELS,
  MINI_SUDOKU_LEVELS,
} from "@/components/puzzles/puzzleData";

import {
  generateQueensLevel,
  countQueensSolutions,
} from "@/lib/puzzles/queens-engine";
import {
  generateTangoLevel,
  countTangoSolutions,
} from "@/lib/puzzles/tango-engine";
import {
  getDailyPinpointPack,
  checkPinpointGuess,
  PINPOINT_KNOWLEDGE_BASE,
} from "@/lib/puzzles/pinpoint-engine";
import { generateCrossclimbLevel } from "@/lib/puzzles/crossclimb-engine";
import { generateZipLevel } from "@/lib/puzzles/zip-engine";
import {
  generateMiniSudokuLevel,
  countMiniSudokuSolutions,
} from "@/lib/puzzles/mini-sudoku-engine";
import {
  calculatePuzzlePoints,
  getArenaPuzzleBonus,
  getSpeedTier,
  createChallengeUrl,
  getDailyProgress,
} from "@/lib/puzzles/puzzle-storage";
import {
  FINTECH_CODEX_CARDS,
  unlockRandomCodexCard,
} from "@/lib/puzzles/fintech-codex";

function getHammingDistance(w1: string, w2: string) {
  if (w1.length !== w2.length) return 99;
  let diff = 0;
  for (let i = 0; i < w1.length; i++) {
    if (w1[i] !== w2[i]) diff++;
  }
  return diff;
}

/* =====================================================================
   1. QUEENS TESTS (Static + Procedural Engine)
   ===================================================================== */
describe("Queens Puzzles Verification", () => {
  it("all static Queens levels should have valid non-touching solutions", () => {
    for (const level of QUEENS_LEVELS) {
      const { size, solution, regions } = level;
      expect(solution.length).toBe(size);

      const colSet = new Set<number>();
      const regSet = new Set<number>();

      for (let r = 0; r < size; r++) {
        const c = solution[r];
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThan(size);
        colSet.add(c);

        const reg = regions[r][c];
        regSet.add(reg);
      }

      // 1 queen per col and per region
      expect(colSet.size).toBe(size);
      expect(regSet.size).toBe(size);

      // Queens must not touch horizontally, vertically, or diagonally
      for (let r1 = 0; r1 < size; r1++) {
        for (let r2 = r1 + 1; r2 < size; r2++) {
          const c1 = solution[r1];
          const c2 = solution[r2];
          const dr = Math.abs(r1 - r2);
          const dc = Math.abs(c1 - c2);
          expect(Math.max(dr, dc)).toBeGreaterThan(1);
        }
      }
    }
  });

  it("procedural Queens engine generates unique, valid non-touching boards across all sizes", () => {
    // Check static base templates
    for (const lvl of QUEENS_LEVELS) {
      const c = countQueensSolutions(lvl.size, lvl.regions);
      expect(c).toBe(1);
    }

    const sizes: Array<6 | 7 | 8 | 9> = [6, 7, 8, 9];
    for (const size of sizes) {
      const level = generateQueensLevel(size, 42 + size);
      expect(level.size).toBe(size);
      expect(level.solution.length).toBe(size);

      // Verify Chebyshev non-touching constraint
      for (let r1 = 0; r1 < size; r1++) {
        for (let r2 = r1 + 1; r2 < size; r2++) {
          const c1 = level.solution[r1];
          const c2 = level.solution[r2];
          const dr = Math.abs(r1 - r2);
          const dc = Math.abs(c1 - c2);
          expect(Math.max(dr, dc)).toBeGreaterThan(1);
        }
      }

      const solCount = countQueensSolutions(level.size, level.regions);
      expect(solCount).toBe(1);
    }
  });
});

/* =====================================================================
   2. TANGO TESTS (Static + Procedural Engine)
   ===================================================================== */
describe("Tango Puzzles Verification", () => {
  it("all static Tango solutions should satisfy binary rules and edge constraints", () => {
    for (const level of TANGO_LEVELS) {
      const { size, solution, hEdges, vEdges } = level;

      // Rows check
      for (let r = 0; r < size; r++) {
        let sCount = 0;
        let mCount = 0;
        for (let c = 0; c < size; c++) {
          if (solution[r][c] === "S") sCount++;
          if (solution[r][c] === "M") mCount++;
        }
        expect(sCount).toBe(3);
        expect(mCount).toBe(3);

        // No triples
        for (let c = 0; c <= size - 3; c++) {
          const v0 = solution[r][c];
          const v1 = solution[r][c + 1];
          const v2 = solution[r][c + 2];
          expect(v0 === v1 && v1 === v2).toBe(false);
        }
      }

      // Cols check
      for (let c = 0; c < size; c++) {
        let sCount = 0;
        let mCount = 0;
        for (let r = 0; r < size; r++) {
          if (solution[r][c] === "S") sCount++;
          if (solution[r][c] === "M") mCount++;
        }
        expect(sCount).toBe(3);
        expect(mCount).toBe(3);

        // No triples
        for (let r = 0; r <= size - 3; r++) {
          const v0 = solution[r][c];
          const v1 = solution[r + 1][c];
          const v2 = solution[r + 2][c];
          expect(v0 === v1 && v1 === v2).toBe(false);
        }
      }

      // Horizontal edge clues check
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size - 1; c++) {
          const edge = hEdges[r][c];
          if (!edge) continue;
          const v1 = solution[r][c];
          const v2 = solution[r][c + 1];
          if (edge === "=") expect(v1).toBe(v2);
          if (edge === "x") expect(v1).not.toBe(v2);
        }
      }

      // Vertical edge clues check
      for (let r = 0; r < size - 1; r++) {
        for (let c = 0; c < size; c++) {
          const edge = vEdges[r][c];
          if (!edge) continue;
          const v1 = solution[r][c];
          const v2 = solution[r + 1][c];
          if (edge === "=") expect(v1).toBe(v2);
          if (edge === "x") expect(v1).not.toBe(v2);
        }
      }
    }
  });

  it("procedural Tango engine generates valid boards with unique solution and valid edge clues", () => {
    for (const seed of [1234, 5678, 9999]) {
      const level = generateTangoLevel("Medium", seed);
      expect(level.size).toBe(6);

      // Verify solution has 3 'S' and 3 'M' per row and col
      for (let r = 0; r < 6; r++) {
        let s = 0;
        let m = 0;
        for (let c = 0; c < 6; c++) {
          if (level.solution[r][c] === "S") s++;
          if (level.solution[r][c] === "M") m++;
        }
        expect(s).toBe(3);
        expect(m).toBe(3);
      }

      // Verify no triples
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 4; c++) {
          expect(
            level.solution[r][c] === level.solution[r][c + 1] &&
              level.solution[r][c + 1] === level.solution[r][c + 2]
          ).toBe(false);
          expect(
            level.solution[c][r] === level.solution[c + 1][r] &&
              level.solution[c + 1][r] === level.solution[c + 2][r]
          ).toBe(false);
        }
      }

      // Verify uniqueness via solver
      const solCount = countTangoSolutions(
        level.givens,
        level.hEdges,
        level.vEdges
      );
      expect(solCount).toBe(1);
    }
  });
});

/* =====================================================================
   3. PINPOINT TESTS (Curated Database + Daily Engine)
   ===================================================================== */
describe("Pinpoint Puzzles Verification", () => {
  it("all static Pinpoint packs should have 5 clues and accepted answers", () => {
    for (const pack of PINPOINT_PACKS) {
      expect(pack.clues.length).toBe(5);
      expect(pack.acceptedAnswers.length).toBeGreaterThan(0);

      const catClean = pack.category.toLowerCase().replace(/[^a-z0-9 ]/g, "");
      const matches = pack.acceptedAnswers.some((ans) =>
        catClean.includes(ans.toLowerCase().replace(/[^a-z0-9 ]/g, ""))
      );
      expect(matches).toBe(true);
    }
  });

  it("expanded Pinpoint database has rich packs with takeaways and fuzzy matching", () => {
    expect(PINPOINT_KNOWLEDGE_BASE.length).toBeGreaterThanOrEqual(8);

    for (const item of PINPOINT_KNOWLEDGE_BASE) {
      expect(item.clues.length).toBe(5);
      expect(item.acceptedAnswers.length).toBeGreaterThanOrEqual(1);
      expect(item.educationalFact.length).toBeGreaterThan(10);
    }

    // Daily pack selector with difficulty
    const easyPack = getDailyPinpointPack("Easy");
    expect(easyPack.difficulty).toBe("Easy");
    expect(easyPack.clues.length).toBe(5);

    const hardPack = getDailyPinpointPack("Hard");
    expect(hardPack.difficulty).toBe("Hard");
    expect(hardPack.clues.length).toBe(5);

    // Fuzzy matching test
    const testPack = PINPOINT_KNOWLEDGE_BASE[0];
    const target = testPack.acceptedAnswers[0];
    expect(checkPinpointGuess(target, testPack.acceptedAnswers)).toBe(true);
    expect(checkPinpointGuess(`  ${target.toUpperCase()}  `, testPack.acceptedAnswers)).toBe(true);
    expect(checkPinpointGuess("totally wrong answer xyz", testPack.acceptedAnswers)).toBe(false);
  });
});

/* =====================================================================
   4. CROSSCLIMB TESTS (Static + Procedural Engine)
   ===================================================================== */
describe("Crossclimb Puzzles Verification", () => {
  it("all static Crossclimb levels should form a valid 1-letter ladder transition", () => {
    for (const level of CROSSCLIMB_LEVELS) {
      const { ladderWords, topWord, bottomWord, wordLength } = level;

      // Top word to first ladder word
      expect(getHammingDistance(topWord.word, ladderWords[0].word)).toBe(1);

      // Each ladder rung to next
      for (let i = 0; i < ladderWords.length - 1; i++) {
        const w1 = ladderWords[i].word;
        const w2 = ladderWords[i + 1].word;
        expect(w1.length).toBe(wordLength);
        expect(w2.length).toBe(wordLength);
        expect(getHammingDistance(w1, w2)).toBe(1);
      }

      // Last ladder word to bottom word
      const last = ladderWords[ladderWords.length - 1].word;
      expect(getHammingDistance(last, bottomWord.word)).toBe(1);
    }
  });

  it("procedural Crossclimb engine generates ladders with verified Hamming distance = 1", () => {
    for (const diff of ["Easy", "Medium", "Hard"] as const) {
      const level = generateCrossclimbLevel(diff, 12345);
      if (diff === "Easy") expect(level.ladderWords.length).toBe(4);
      if (diff === "Medium") expect(level.ladderWords.length).toBe(5);
      if (diff === "Hard") expect(level.ladderWords.length).toBeGreaterThanOrEqual(6);

      // Summit top word to first rung
      expect(getHammingDistance(level.topWord.word, level.ladderWords[0].word)).toBe(1);

      // Consecutive ladder rungs
      for (let i = 0; i < level.ladderWords.length - 1; i++) {
        const d = getHammingDistance(
          level.ladderWords[i].word,
          level.ladderWords[i + 1].word
        );
        expect(d).toBe(1);
      }

      // Last rung to bottom word
      const lastWord = level.ladderWords[level.ladderWords.length - 1].word;
      expect(getHammingDistance(lastWord, level.bottomWord.word)).toBe(1);
    }
  });
});

/* =====================================================================
   5. ZIP TESTS (Static + Procedural Engine)
   ===================================================================== */
describe("Zip Puzzles Verification", () => {
  it("all static Zip levels should be valid continuous Hamiltonian paths hitting waypoints", () => {
    for (const level of ZIP_LEVELS) {
      const { rows, cols, waypoints, solutionPath } = level;
      const totalCells = rows * cols;

      expect(solutionPath.length).toBe(totalCells);

      // Path must be continuous orthogonal
      for (let i = 0; i < solutionPath.length - 1; i++) {
        const [r1, c1] = solutionPath[i];
        const [r2, c2] = solutionPath[i + 1];
        const dist = Math.abs(r1 - r2) + Math.abs(c1 - c2);
        expect(dist).toBe(1);
      }

      // Path must cover every single unique cell
      const visited = new Set(solutionPath.map(([r, c]) => `${r},${c}`));
      expect(visited.size).toBe(totalCells);

      // Waypoints must appear in sequential order along the path
      let lastWpIndex = -1;
      const sortedWaypoints = [...waypoints].sort((a, b) => a.step - b.step);
      for (const wp of sortedWaypoints) {
        const idx = solutionPath.findIndex(
          ([r, c]) => r === wp.row && c === wp.col
        );
        expect(idx).toBeGreaterThan(lastWpIndex);
        lastWpIndex = idx;
      }
    }
  });

  it("procedural Zip engine generates complete Hamiltonian paths on 5x5, 6x6, and 7x7 grids", () => {
    const sizes: Array<5 | 6 | 7> = [5, 6, 7];

    for (const size of sizes) {
      const level = generateZipLevel(size, 777 + size);
      const totalCells = size * size;

      expect(level.solutionPath.length).toBe(totalCells);

      // Continuity
      for (let i = 0; i < level.solutionPath.length - 1; i++) {
        const [r1, c1] = level.solutionPath[i];
        const [r2, c2] = level.solutionPath[i + 1];
        expect(Math.abs(r1 - r2) + Math.abs(c1 - c2)).toBe(1);
      }

      // Full coverage
      const set = new Set(level.solutionPath.map(([r, c]) => `${r},${c}`));
      expect(set.size).toBe(totalCells);

      // Waypoints order
      let lastStep = 0;
      for (const wp of level.waypoints) {
        expect(wp.step).toBeGreaterThan(lastStep);
        lastStep = wp.step;
      }
    }
  });
});

/* =====================================================================
   6. MINI SUDOKU TESTS (Static + Procedural Engine)
   ===================================================================== */
describe("Mini Sudoku Puzzles Verification", () => {
  it("all static Mini Sudoku solutions should satisfy 6x6 rules", () => {
    for (const level of MINI_SUDOKU_LEVELS) {
      const { solution, givens } = level;

      // Check givens are subset of solution
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          if (givens[r][c] !== 0) {
            expect(givens[r][c]).toBe(solution[r][c]);
          }
        }
      }

      // Rows check: 1..6
      for (let r = 0; r < 6; r++) {
        const set = new Set(solution[r]);
        expect(set.size).toBe(6);
        for (let v = 1; v <= 6; v++) expect(set.has(v)).toBe(true);
      }

      // Cols check: 1..6
      for (let c = 0; c < 6; c++) {
        const set = new Set<number>();
        for (let r = 0; r < 6; r++) set.add(solution[r][c]);
        expect(set.size).toBe(6);
        for (let v = 1; v <= 6; v++) expect(set.has(v)).toBe(true);
      }

      // 2x3 blocks check
      for (let br = 0; br < 6; br += 2) {
        for (let bc = 0; bc < 6; bc += 3) {
          const set = new Set<number>();
          for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 3; c++) {
              set.add(solution[br + r][bc + c]);
            }
          }
          expect(set.size).toBe(6);
          for (let v = 1; v <= 6; v++) expect(set.has(v)).toBe(true);
        }
      }
    }
  });

  it("procedural Mini Sudoku engine generates unique boards for Easy, Medium, and Hard", () => {
    for (const diff of ["Easy", "Medium", "Hard"] as const) {
      const level = generateMiniSudokuLevel(diff, 12345);

      // Verify solution satisfies 6x6 Sudoku with 2x3 blocks
      for (let r = 0; r < 6; r++) {
        const rowSet = new Set(level.solution[r]);
        expect(rowSet.size).toBe(6);
      }
      for (let c = 0; c < 6; c++) {
        const colSet = new Set<number>();
        for (let r = 0; r < 6; r++) colSet.add(level.solution[r][c]);
        expect(colSet.size).toBe(6);
      }
      for (let br = 0; br < 6; br += 2) {
        for (let bc = 0; bc < 6; bc += 3) {
          const blockSet = new Set<number>();
          for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 3; c++) {
              blockSet.add(level.solution[br + r][bc + c]);
            }
          }
          expect(blockSet.size).toBe(6);
        }
      }

      // Verify givens match solution
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          if (level.givens[r][c] !== 0) {
            expect(level.givens[r][c]).toBe(level.solution[r][c]);
          }
        }
      }

      // Verify uniqueness via backtracking solver
      const solCount = countMiniSudokuSolutions(level.givens);
      expect(solCount).toBe(1);
    }
  });
});

/* =====================================================================
   7. CHALLENGE POINTS & ARENA SCORE CONTRIBUTION
   ===================================================================== */
describe("Puzzle Challenge Points & Arena Score Contribution", () => {
  it("calculates modest challenge points based on difficulty, speed, accuracy, and streak", () => {
    // Easy difficulty with no bonuses
    const p1 = calculatePuzzlePoints("Easy", 150, 2, 1);
    expect(p1.pointsEarned).toBe(15);
    expect(p1.breakdown.basePoints).toBe(15);
    expect(p1.breakdown.speedBonus).toBe(0);
    expect(p1.breakdown.cleanBonus).toBe(0);
    expect(p1.breakdown.streakBonus).toBe(0);

    // Medium difficulty with speed bonus (<120s) and streak bonus (>1)
    const pMed = calculatePuzzlePoints("Medium", 80, 1, 3);
    expect(pMed.pointsEarned).toBe(40); // 25 base + 10 speed + 5 streak
    expect(pMed.breakdown.basePoints).toBe(25);
    expect(pMed.breakdown.speedBonus).toBe(10);
    expect(pMed.breakdown.streakBonus).toBe(5);

    // Hard difficulty with full bonuses (<150s, 0 mistakes, streak > 1)
    const p2 = calculatePuzzlePoints("Hard", 85, 0, 5);
    expect(p2.pointsEarned).toBe(70); // 40 base + 15 speed + 10 clean + 5 streak
    expect(p2.breakdown.basePoints).toBe(40);
    expect(p2.breakdown.speedBonus).toBe(15);
    expect(p2.breakdown.cleanBonus).toBe(10);
    expect(p2.breakdown.streakBonus).toBe(5);

    // Medium grid size (7x7 Queens) with clean bonus only
    const p3 = calculatePuzzlePoints(7, 180, 0, 1);
    expect(p3.pointsEarned).toBe(30); // 25 base + 5 clean
    expect(p3.breakdown.basePoints).toBe(25);
    expect(p3.breakdown.cleanBonus).toBe(5);
  });

  it("scales Arena match score contribution modestly and strictly caps at +50 pts", () => {
    // Empty stats: 0 points
    expect(
      getArenaPuzzleBonus({
        totalWins: 0,
        currentStreak: 0,
        lastPlayedDate: null,
        completedLevels: {},
        bestTimes: {},
        soundMuted: false,
        totalPuzzlePoints: 0,
      })
    ).toBe(0);

    // 2 unique game types solved: +20 points
    expect(
      getArenaPuzzleBonus({
        totalWins: 2,
        currentStreak: 2,
        lastPlayedDate: "2026-10-28",
        completedLevels: {
          "queens-6": true,
          "tango-Easy": true,
        },
        bestTimes: {},
        soundMuted: false,
        totalPuzzlePoints: 45,
      })
    ).toBe(20);

    // 2 hard clears: +30 points
    expect(
      getArenaPuzzleBonus({
        totalWins: 2,
        currentStreak: 2,
        lastPlayedDate: "2026-10-28",
        completedLevels: {
          "queens-Hard": true,
          "tango-Hard": true,
        },
        bestTimes: {},
        soundMuted: false,
        totalPuzzlePoints: 120,
      })
    ).toBe(30);

    // 4 unique game types: +40 points
    expect(
      getArenaPuzzleBonus({
        totalWins: 4,
        currentStreak: 4,
        lastPlayedDate: "2026-10-28",
        completedLevels: {
          "queens-6": true,
          "tango-Easy": true,
          "pinpoint-Easy": true,
          "crossclimb-Easy": true,
        },
        bestTimes: {},
        soundMuted: false,
        totalPuzzlePoints: 95,
      })
    ).toBe(40);

    // All 6 unique game types solved: strictly capped at +50 points
    expect(
      getArenaPuzzleBonus({
        totalWins: 6,
        currentStreak: 6,
        lastPlayedDate: "2026-10-28",
        completedLevels: {
          "queens-6": true,
          "tango-Easy": true,
          "pinpoint-Easy": true,
          "crossclimb-Easy": true,
          "zip-Easy": true,
          "mini-sudoku-Easy": true,
        },
        bestTimes: {},
        soundMuted: false,
        totalPuzzlePoints: 160,
      })
    ).toBe(50);

    // 50 total wins in the same game: capped strictly at 50 points ("not too much")
    expect(
      getArenaPuzzleBonus({
        totalWins: 50,
        currentStreak: 10,
        lastPlayedDate: "2026-10-28",
        completedLevels: {
          "queens-6": true,
        },
        bestTimes: {},
        soundMuted: false,
        totalPuzzlePoints: 1000,
      })
    ).toBe(50);
  });

  /* =====================================================================
     8. ADVANCED FEATURES: SPEED TIERS, 1v1 CHALLENGES, DAILY PROGRESS & CODEX
     ===================================================================== */
  it("calculates FinTech Speed Tiers accurately across difficulties", () => {
    // Easy clear under 35s -> Top 5% Digital Architect
    const fastEasy = getSpeedTier("queens", "Easy", 30);
    expect(fastEasy.tier).toBe("architect");
    expect(fastEasy.percentile).toBe(95);
    expect(fastEasy.rankTitle).toBe("Digital Architect");

    // Medium clear in 75s -> Top 20% Senior Quant
    const medQuant = getSpeedTier("tango", "Medium", 75);
    expect(medQuant.tier).toBe("quant");
    expect(medQuant.percentile).toBe(80);

    // Hard clear in 180s -> Top 50% FinTech Analyst
    const hardAnalyst = getSpeedTier("crossclimb", "Hard", 180);
    expect(hardAnalyst.tier).toBe("analyst");
    expect(hardAnalyst.percentile).toBe(50);

    // Slow clear over 220s on Hard -> FinTech Strategist
    const slowHard = getSpeedTier("zip", "Hard", 300);
    expect(slowHard.tier).toBe("strategist");
    expect(slowHard.percentile).toBe(25);
  });

  it("generates valid 1v1 challenge duel links", () => {
    const link = createChallengeUrl({
      puzzleId: "queens",
      seed: 20261029,
      difficulty: "Hard",
      seconds: 48,
      challengerName: "Kasun",
    });

    expect(link).toContain("game=queens");
    expect(link).toContain("seed=20261029");
    expect(link).toContain("challenge=1");
    expect(link).toContain("target=48");
    expect(link).toContain("diff=Hard");
    expect(link).toContain("from=Kasun");
  });

  it("tracks Daily Trifecta (3/6) and Grand Slam (6/6) progress with bonuses", () => {
    // 0 solved
    const p0 = getDailyProgress("2026-10-29", {
      totalWins: 0,
      currentStreak: 0,
      lastPlayedDate: null,
      bestTimes: {},
      completedLevels: {},
      soundMuted: false,
      totalPuzzlePoints: 0,
      dailySolves: { "2026-10-29": [] },
    });
    expect(p0.solvedCount).toBe(0);
    expect(p0.isTrifecta).toBe(false);
    expect(p0.isGrandSlam).toBe(false);
    expect(p0.bonusPoints).toBe(0);

    // 3 solved -> Trifecta (+15)
    const p3 = getDailyProgress("2026-10-29", {
      totalWins: 3,
      currentStreak: 1,
      lastPlayedDate: "2026-10-29",
      bestTimes: {},
      completedLevels: {},
      soundMuted: false,
      totalPuzzlePoints: 75,
      dailySolves: { "2026-10-29": ["queens", "tango", "zip"] },
    });
    expect(p3.solvedCount).toBe(3);
    expect(p3.isTrifecta).toBe(true);
    expect(p3.isGrandSlam).toBe(false);
    expect(p3.bonusPoints).toBe(15);

    // 6 solved -> Grand Slam (+35)
    const p6 = getDailyProgress("2026-10-29", {
      totalWins: 6,
      currentStreak: 1,
      lastPlayedDate: "2026-10-29",
      bestTimes: {},
      completedLevels: {},
      soundMuted: false,
      totalPuzzlePoints: 180,
      dailySolves: {
        "2026-10-29": ["queens", "tango", "zip", "crossclimb", "pinpoint", "mini-sudoku"],
      },
    });
    expect(p6.solvedCount).toBe(6);
    expect(p6.isTrifecta).toBe(true);
    expect(p6.isGrandSlam).toBe(true);
    expect(p6.bonusPoints).toBe(35);
  });

  it("contains 24 FinTech Codex cards and supports random card unlock", () => {
    expect(FINTECH_CODEX_CARDS.length).toBe(24);

    // Verify all cards have non-empty titles, summaries, and categories
    for (const card of FINTECH_CODEX_CARDS) {
      expect(card.id).toBeTruthy();
      expect(card.title).toBeTruthy();
      expect(card.summary).toBeTruthy();
      expect(card.detail).toBeTruthy();
      expect(card.festivalRelevance).toBeTruthy();
    }

    // Unlocking when none are unlocked
    const firstUnlocked = unlockRandomCodexCard([]);
    expect(firstUnlocked).not.toBeNull();
    expect(FINTECH_CODEX_CARDS.some((c) => c.id === firstUnlocked?.id)).toBe(true);

    // Unlocking when all 24 are unlocked
    const allIds = FINTECH_CODEX_CARDS.map((c) => c.id);
    const nothingLeft = unlockRandomCodexCard(allIds);
    expect(nothingLeft).toBeNull();
  });
});
