import { describe, it, expect } from "vitest";
import {
  QUEENS_LEVELS,
  TANGO_LEVELS,
  PINPOINT_PACKS,
  CROSSCLIMB_LEVELS,
  ZIP_LEVELS,
  MINI_SUDOKU_LEVELS,
} from "@/components/puzzles/puzzleData";

describe("Queens Puzzles Verification", () => {
  it("all Queens levels should have valid non-touching solutions", () => {
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
});

describe("Tango Puzzles Verification", () => {
  it("all Tango solutions should satisfy binary rules and edge constraints", () => {
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
});

describe("Pinpoint Puzzles Verification", () => {
  it("all Pinpoint packs should have 5 clues and accepted answers", () => {
    for (const pack of PINPOINT_PACKS) {
      expect(pack.clues.length).toBe(5);
      expect(pack.acceptedAnswers.length).toBeGreaterThan(0);

      // Verify category matches accepted answers
      const catClean = pack.category.toLowerCase().replace(/[^a-z0-9 ]/g, "");
      const matches = pack.acceptedAnswers.some((ans) =>
        catClean.includes(ans.toLowerCase().replace(/[^a-z0-9 ]/g, ""))
      );
      expect(matches).toBe(true);
    }
  });
});

describe("Crossclimb Puzzles Verification", () => {
  function getHammingDistance(w1: string, w2: string) {
    if (w1.length !== w2.length) return 99;
    let diff = 0;
    for (let i = 0; i < w1.length; i++) {
      if (w1[i] !== w2[i]) diff++;
    }
    return diff;
  }

  it("all Crossclimb levels should form a valid 1-letter ladder transition", () => {
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
});

describe("Zip Puzzles Verification", () => {
  it("all Zip levels should be valid continuous Hamiltonian paths hitting waypoints", () => {
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
});

describe("Mini Sudoku Puzzles Verification", () => {
  it("all Mini Sudoku solutions should satisfy 6x6 rules", () => {
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
});
