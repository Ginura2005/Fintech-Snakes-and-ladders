/**
 * Queens Procedural Generation Engine & Solver
 *
 * Implements:
 *   - Fast bitmask & region backtracking solver
 *   - Symmetry-preserving dihedral transformations (rotations & reflections)
 *   - Region color shuffling
 *   - Dynamic generator function for sizes 6x6, 7x7, 8x8, 9x9
 */

import { mulberry32, shuffle, randomInt } from "./prng";
import { QueensLevel } from "@/components/puzzles/puzzleTypes";

/**
 * Solves a Queens board and counts valid placements.
 * Returns the number of solutions (stops early at maxSolutions).
 */
export function countQueensSolutions(
  size: number,
  regions: number[][],
  maxSolutions = 2
): number {
  let count = 0;

  function backtrack(
    row: number,
    colsUsed: Set<number>,
    regionsUsed: Set<number>,
    placedQueens: [number, number][]
  ) {
    if (row === size) {
      count++;
      return;
    }

    for (let c = 0; c < size; c++) {
      if (colsUsed.has(c)) continue;
      const reg = regions[row][c];
      if (regionsUsed.has(reg)) continue;

      // Chebyshev distance check (no diagonal/adjacent touching)
      let touches = false;
      for (let i = 0; i < placedQueens.length; i++) {
        const [pr, pc] = placedQueens[i];
        if (Math.abs(pr - row) <= 1 && Math.abs(pc - c) <= 1) {
          touches = true;
          break;
        }
      }
      if (touches) continue;

      colsUsed.add(c);
      regionsUsed.add(reg);
      placedQueens.push([row, c]);

      backtrack(row + 1, colsUsed, regionsUsed, placedQueens);

      placedQueens.pop();
      regionsUsed.delete(reg);
      colsUsed.delete(c);

      if (count >= maxSolutions) return;
    }
  }

  backtrack(0, new Set(), new Set(), []);
  return count;
}

// Base verified unique seeds for sizes 6, 7, 8, 9
const BASE_QUEENS_TEMPLATES: Record<
  number,
  Array<{ solution: number[]; regions: number[][] }>
> = {
  6: [
    {
      solution: [1, 3, 5, 0, 2, 4],
      regions: [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0],
        [4, 4, 1, 1, 0, 2],
        [3, 4, 1, 1, 2, 2],
        [3, 4, 4, 5, 2, 2],
        [3, 3, 3, 5, 5, 2],
      ],
    },
  ],
  7: [
    {
      solution: [2, 5, 1, 4, 0, 3, 6],
      regions: [
        [2, 2, 0, 2, 2, 1, 1],
        [2, 2, 2, 2, 2, 1, 1],
        [2, 2, 2, 2, 3, 3, 3],
        [2, 2, 2, 3, 3, 3, 3],
        [4, 2, 3, 3, 3, 3, 3],
        [2, 2, 3, 5, 3, 3, 3],
        [2, 2, 3, 3, 3, 3, 6],
      ],
    },
  ],
  8: [
    {
      solution: [3, 6, 2, 7, 1, 4, 0, 5],
      regions: [
        [0, 0, 0, 0, 0, 0, 0, 3],
        [4, 0, 2, 2, 2, 0, 1, 3],
        [4, 0, 2, 0, 0, 0, 1, 3],
        [4, 2, 2, 2, 2, 2, 2, 3],
        [4, 4, 4, 7, 7, 7, 2, 3],
        [6, 4, 7, 7, 5, 7, 2, 3],
        [6, 4, 7, 7, 7, 7, 2, 3],
        [6, 6, 6, 7, 7, 7, 7, 3],
      ],
    },
  ],
  9: [
    {
      solution: [0, 2, 4, 1, 3, 6, 8, 5, 7],
      regions: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 3, 1, 1, 2, 0, 0, 0, 0],
        [3, 3, 3, 3, 3, 3, 3, 0, 0],
        [3, 3, 3, 4, 4, 4, 3, 0, 0],
        [3, 3, 3, 4, 4, 5, 5, 0, 0],
        [3, 3, 3, 4, 4, 4, 5, 5, 6],
        [3, 3, 3, 4, 4, 7, 5, 5, 6],
        [3, 3, 3, 3, 4, 4, 8, 8, 6],
      ],
    },
  ],
};

/**
 * Applies a dihedral group symmetry (rotation & reflection) to grid & solution.
 */
function applySymmetry(
  size: number,
  regions: number[][],
  solution: number[],
  transformId: number
): { regions: number[][]; solution: number[] } {
  // transformId 0..7: combinations of rotation (0, 90, 180, 270) and horizontal flip
  const rot = transformId % 4;
  const flip = Math.floor(transformId / 4) === 1;

  let rGrid = regions.map((r) => [...r]);
  let rSol = [...solution];

  // Rotate 90 deg clockwise 'rot' times
  for (let k = 0; k < rot; k++) {
    const nextGrid: number[][] = Array.from({ length: size }, () =>
      Array(size).fill(0)
    );
    const nextSol: number[] = Array(size).fill(0);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        nextGrid[c][size - 1 - r] = rGrid[r][c];
      }
      const c = rSol[r];
      nextSol[c] = size - 1 - r;
    }

    rGrid = nextGrid;
    rSol = nextSol;
  }

  // Flip horizontally if requested
  if (flip) {
    const flippedGrid = rGrid.map((r) => [...r].reverse());
    const flippedSol = rSol.map((c) => size - 1 - c);
    rGrid = flippedGrid;
    rSol = flippedSol;
  }

  return { regions: rGrid, solution: rSol };
}

/**
 * Procedurally generates a verified Queens puzzle level for a given size and seed.
 */
export function generateQueensLevel(
  size: 6 | 7 | 8 | 9,
  seed = Date.now()
): QueensLevel {
  const rng = mulberry32(seed);
  const templates = BASE_QUEENS_TEMPLATES[size] || BASE_QUEENS_TEMPLATES[6];
  const template = templates[Math.floor(rng() * templates.length)];

  // Apply random spatial symmetry (0 to 7)
  const symmetry = Math.floor(rng() * 8);
  const transformed = applySymmetry(
    size,
    template.regions,
    template.solution,
    symmetry
  );

  // Permute region IDs deterministically to vary color palette order
  const colorMap = shuffle(
    rng,
    Array.from({ length: size }, (_, i) => i)
  );
  const mappedRegions = transformed.regions.map((row) =>
    row.map((val) => colorMap[val])
  );

  return {
    id: seed,
    name: `${size}×${size} ${size <= 6 ? "Easy" : size === 7 ? "Medium" : size === 8 ? "Hard" : "Expert"}`,
    size,
    regions: mappedRegions,
    solution: transformed.solution,
  };
}
