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

      // Verify solver finds exactly 1 unique solution
      const solCount = countQueensSolutions(level.size, level.regions);
      console.log(`Queens size ${size} solCount: ${solCount}`);
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

    // Daily pack selector
    const dailyPack = getDailyPinpointPack();
    expect(dailyPack.clues.length).toBe(5);

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
    for (const seed of [101, 202, 303, 404]) {
      const level = generateCrossclimbLevel("Medium", seed);
      expect(level.ladderWords.length).toBeGreaterThanOrEqual(3);

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

      // Last rung to summit bottom word
      const last = level.ladderWords[level.ladderWords.length - 1].word;
      expect(getHammingDistance(last, level.bottomWord.word)).toBe(1);
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
