/**
 * Mini Sudoku (6x6 with 2x3 blocks) Engine & Solver
 *
 * Implements:
 *   - Fast 6x6 Sudoku backtracking solver with uniqueness verification
 *   - Procedural board generation + hole digging
 *   - Difficulty scaling (Easy, Medium, Hard, Expert)
 */

import { mulberry32, shuffle } from "./prng";
import { MiniSudokuLevel } from "@/components/puzzles/puzzleTypes";

export function countMiniSudokuSolutions(
  givens: number[][],
  maxSolutions = 2
): number {
  const board = givens.map((r) => [...r]);
  let count = 0;

  function isValid(r: number, c: number, val: number): boolean {
    // Row
    for (let j = 0; j < 6; j++) if (board[r][j] === val) return false;
    // Col
    for (let i = 0; i < 6; i++) if (board[i][c] === val) return false;
    // 2x3 block
    const br = Math.floor(r / 2) * 2;
    const bc = Math.floor(c / 3) * 3;
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[br + i][bc + j] === val) return false;
      }
    }
    return true;
  }

  function bt(idx: number) {
    if (idx === 36) {
      count++;
      return;
    }
    const r = Math.floor(idx / 6);
    const c = idx % 6;
    if (board[r][c] !== 0) {
      bt(idx + 1);
      return;
    }

    for (let val = 1; val <= 6; val++) {
      if (isValid(r, c, val)) {
        board[r][c] = val;
        bt(idx + 1);
        board[r][c] = 0;
        if (count >= maxSolutions) return;
      }
    }
  }

  bt(0);
  return count;
}

// Base verified full 6x6 boards
const BASE_6X6_SOLUTIONS: number[][][] = [
  [
    [1, 2, 3, 4, 5, 6],
    [4, 5, 6, 1, 2, 3],
    [2, 3, 1, 5, 6, 4],
    [5, 6, 4, 2, 3, 1],
    [3, 1, 2, 6, 4, 5],
    [6, 4, 5, 3, 1, 2],
  ],
  [
    [2, 4, 6, 1, 3, 5],
    [1, 3, 5, 2, 4, 6],
    [4, 6, 2, 3, 5, 1],
    [3, 5, 1, 4, 6, 2],
    [6, 2, 4, 5, 1, 3],
    [5, 1, 3, 6, 2, 4],
  ],
  [
    [3, 1, 5, 2, 6, 4],
    [2, 6, 4, 3, 1, 5],
    [1, 5, 3, 6, 4, 2],
    [6, 4, 2, 1, 5, 3],
    [5, 3, 1, 4, 2, 6],
    [4, 2, 6, 5, 3, 1],
  ],
];

export function generateMiniSudokuLevel(
  difficulty: "Easy" | "Medium" | "Hard" = "Medium",
  seed = Date.now()
): MiniSudokuLevel {
  const rng = mulberry32(seed);

  // Pick base solution
  const base = BASE_6X6_SOLUTIONS[Math.floor(rng() * BASE_6X6_SOLUTIONS.length)];

  // Permute digits 1..6 deterministically
  const digitMap = shuffle(rng, [1, 2, 3, 4, 5, 6]);
  const sol = base.map((row) => row.map((v) => digitMap[v - 1]));

  // Target givens based on difficulty
  const targetGivens =
    difficulty === "Easy"
      ? 16
      : difficulty === "Medium"
      ? 13
      : 10;

  const puzzle = sol.map((row) => [...row]);

  // Generate candidate positions to remove
  const positions: [number, number][] = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) positions.push([r, c]);
  }
  const shuffledPositions = shuffle(rng, positions);

  let remaining = 36;
  for (const [r, c] of shuffledPositions) {
    if (remaining <= targetGivens) break;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;

    // Check if solution remains unique
    if (countMiniSudokuSolutions(puzzle) !== 1) {
      puzzle[r][c] = backup; // revert
    } else {
      remaining--;
    }
  }

  return {
    id: seed,
    name: `Mini Sudoku (${difficulty})`,
    difficulty,
    givens: puzzle,
    solution: sol,
  };
}
