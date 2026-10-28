/**
 * Tango Procedural Engine & Solver
 *
 * Implements:
 *   - Binary grid constraint solver (no triples, equal tallies, = and x clues)
 *   - Procedural level generator with difficulty scaling:
 *       Easy: 7-8 givens + 6 edge clues
 *       Medium: 5-6 givens + 6 edge clues
 *       Hard: 4-5 givens + 5 edge clues
 */

import { mulberry32, shuffle, randomInt } from "./prng";
import { TangoLevel, TangoSymbol, TangoConstraint } from "@/components/puzzles/puzzleTypes";

export function countTangoSolutions(
  givens: TangoSymbol[][],
  hEdges: TangoConstraint[][],
  vEdges: TangoConstraint[][]
): number {
  const n = 6;
  let count = 0;
  const board = givens.map((r) => [...r]);

  function isValid(r: number, c: number, val: "S" | "M"): boolean {
    // Row count
    let sc = 0, mc = 0;
    for (let j = 0; j < n; j++) {
      const v = j === c ? val : board[r][j];
      if (v === "S") sc++;
      if (v === "M") mc++;
    }
    if (sc > 3 || mc > 3) return false;

    // Col count
    sc = 0; mc = 0;
    for (let i = 0; i < n; i++) {
      const v = i === r ? val : board[i][c];
      if (v === "S") sc++;
      if (v === "M") mc++;
    }
    if (sc > 3 || mc > 3) return false;

    // Row consecutive 3
    for (let j = 0; j <= n - 3; j++) {
      const v0 = j === c ? val : board[r][j];
      const v1 = j + 1 === c ? val : board[r][j + 1];
      const v2 = j + 2 === c ? val : board[r][j + 2];
      if (v0 && v0 === v1 && v1 === v2) return false;
    }

    // Col consecutive 3
    for (let i = 0; i <= n - 3; i++) {
      const v0 = i === r ? val : board[i][c];
      const v1 = i + 1 === r ? val : board[i + 1][c];
      const v2 = i + 2 === r ? val : board[i + 2][c];
      if (v0 && v0 === v1 && v1 === v2) return false;
    }

    // Horizontal edges
    if (c > 0 && hEdges[r][c - 1] && board[r][c - 1]) {
      const edge = hEdges[r][c - 1];
      if (edge === "=" && board[r][c - 1] !== val) return false;
      if (edge === "x" && board[r][c - 1] === val) return false;
    }
    if (c < n - 1 && hEdges[r][c] && board[r][c + 1]) {
      const edge = hEdges[r][c];
      if (edge === "=" && board[r][c + 1] !== val) return false;
      if (edge === "x" && board[r][c + 1] === val) return false;
    }

    // Vertical edges
    if (r > 0 && vEdges[r - 1][c] && board[r - 1][c]) {
      const edge = vEdges[r - 1][c];
      if (edge === "=" && board[r - 1][c] !== val) return false;
      if (edge === "x" && board[r - 1][c] === val) return false;
    }
    if (r < n - 1 && vEdges[r][c] && board[r + 1][c]) {
      const edge = vEdges[r][c];
      if (edge === "=" && board[r + 1][c] !== val) return false;
      if (edge === "x" && board[r + 1][c] === val) return false;
    }

    return true;
  }

  function bt(idx: number) {
    if (idx === n * n) {
      count++;
      return;
    }
    const r = Math.floor(idx / n);
    const c = idx % n;
    if (board[r][c] !== null) {
      bt(idx + 1);
      return;
    }

    for (const val of ["S" as const, "M" as const]) {
      if (isValid(r, c, val)) {
        board[r][c] = val;
        bt(idx + 1);
        board[r][c] = null;
        if (count > 1) return;
      }
    }
  }

  bt(0);
  return count;
}

// Base verified boards
const BASE_TANGO_SOLUTIONS: Array<("S" | "M")[][]> = [
  [
    ["S", "S", "M", "M", "S", "M"],
    ["M", "M", "S", "S", "M", "S"],
    ["S", "M", "S", "M", "M", "S"],
    ["M", "S", "M", "S", "S", "M"],
    ["S", "S", "M", "S", "M", "M"],
    ["M", "M", "S", "M", "S", "S"],
  ],
  [
    ["S", "S", "M", "M", "S", "M"],
    ["M", "S", "M", "M", "S", "S"],
    ["M", "M", "S", "S", "M", "S"],
    ["S", "S", "M", "S", "M", "M"],
    ["M", "M", "S", "M", "S", "S"],
    ["S", "M", "S", "S", "M", "M"],
  ],
  [
    ["M", "S", "M", "S", "S", "M"],
    ["S", "M", "S", "M", "M", "S"],
    ["M", "S", "S", "M", "S", "M"],
    ["S", "M", "M", "S", "M", "S"],
    ["M", "S", "M", "S", "S", "M"],
    ["S", "M", "S", "M", "M", "S"],
  ],
];

export function generateTangoLevel(
  difficulty: "Easy" | "Medium" | "Hard" = "Medium",
  seed = Date.now()
): TangoLevel {
  const rng = mulberry32(seed);
  const baseSol = BASE_TANGO_SOLUTIONS[Math.floor(rng() * BASE_TANGO_SOLUTIONS.length)];

  // Random rotation (0, 90, 180, 270)
  const rot = Math.floor(rng() * 4);
  let sol = baseSol.map((r) => [...r]);
  for (let k = 0; k < rot; k++) {
    const nextSol: ("S" | "M")[][] = Array.from({ length: 6 }, () =>
      Array(6).fill("S")
    );
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        nextSol[c][5 - r] = sol[r][c];
      }
    }
    sol = nextSol;
  }

  // Symbol inversion (flip S and M)
  if (rng() > 0.5) {
    sol = sol.map((r) => r.map((v) => (v === "S" ? "M" : "S")));
  }

  // Target number of givens & edges
  const targetGivens = difficulty === "Easy" ? 8 : difficulty === "Medium" ? 6 : 4;
  const targetEdges = difficulty === "Easy" ? 7 : difficulty === "Medium" ? 6 : 5;

  const givens: TangoSymbol[][] = Array.from({ length: 6 }, () =>
    Array(6).fill(null)
  );
  const hEdges: TangoConstraint[][] = Array.from({ length: 6 }, () =>
    Array(5).fill(null)
  );
  const vEdges: TangoConstraint[][] = Array.from({ length: 5 }, () =>
    Array(6).fill(null)
  );

  // Collect potential candidate edges
  const hCandidates: Array<[number, number, TangoConstraint]> = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 5; c++) {
      const type: TangoConstraint = sol[r][c] === sol[r][c + 1] ? "=" : "x";
      hCandidates.push([r, c, type]);
    }
  }

  const vCandidates: Array<[number, number, TangoConstraint]> = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 6; c++) {
      const type: TangoConstraint = sol[r][c] === sol[r + 1][c] ? "=" : "x";
      vCandidates.push([r, c, type]);
    }
  }

  const shuffledHEdges = shuffle(rng, hCandidates);
  const shuffledVEdges = shuffle(rng, vCandidates);

  // Add random edge constraints
  const edgeCount = Math.floor(targetEdges / 2);
  for (let i = 0; i < edgeCount && i < shuffledHEdges.length; i++) {
    const [r, c, type] = shuffledHEdges[i];
    hEdges[r][c] = type;
  }
  for (let i = 0; i < edgeCount && i < shuffledVEdges.length; i++) {
    const [r, c, type] = shuffledVEdges[i];
    vEdges[r][c] = type;
  }

  // Add givens until uniquely solvable
  const allCoords: Array<[number, number]> = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) allCoords.push([r, c]);
  }
  const shuffledCoords = shuffle(rng, allCoords);

  let placed = 0;
  for (const [r, c] of shuffledCoords) {
    if (placed >= targetGivens) break;
    givens[r][c] = sol[r][c];
    placed++;
  }

  // If not yet unique, add disambiguating givens
  for (const [r, c] of shuffledCoords) {
    if (countTangoSolutions(givens, hEdges, vEdges) === 1) break;
    if (givens[r][c] === null) {
      givens[r][c] = sol[r][c];
    }
  }

  return {
    id: seed,
    name: `Tango (${difficulty})`,
    size: 6,
    givens,
    hEdges,
    vEdges,
    solution: sol,
  };
}
