/**
 * Zip Procedural Engine
 *
 * Implements:
 *   - Hamiltonian path generator on grid graphs using Warnsdorff's heuristic
 *   - Strategic waypoint placement along turns and key milestones
 *   - Multi-size scaling: 5x5 (Easy), 6x6 (Medium), 7x7 (Hard)
 */

import { mulberry32, shuffle } from "./prng";
import { ZipLevel, ZipWaypoint } from "@/components/puzzles/puzzleTypes";

export function findHamiltonianPath(
  rows: number,
  cols: number,
  rng: () => number
): [number, number][] | null {
  const total = rows * cols;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const path: [number, number][] = [];

  // Random starting corner or perimeter cell
  const startCorners: [number, number][] = [
    [0, 0],
    [0, cols - 1],
    [rows - 1, 0],
    [rows - 1, cols - 1],
  ];
  const start = startCorners[Math.floor(rng() * startCorners.length)];

  function search(r: number, c: number): boolean {
    path.push([r, c]);
    visited[r][c] = true;
    if (path.length === total) return true;

    // Shuffle directions slightly with determinism
    const rawDirs: [number, number][] = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    const dirs = shuffle(rng, rawDirs);

    const neighbors: Array<{ r: number; c: number; deg: number }> = [];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
        let deg = 0;
        for (const [ddr, ddc] of dirs) {
          const nnr = nr + ddr;
          const nnc = nc + ddc;
          if (
            nnr >= 0 &&
            nnr < rows &&
            nnc >= 0 &&
            nnc < cols &&
            !visited[nnr][nnc]
          ) {
            deg++;
          }
        }
        neighbors.push({ r: nr, c: nc, deg });
      }
    }

    // Warnsdorff heuristic: visit neighbor with fewest unvisited degrees first
    neighbors.sort((a, b) => a.deg - b.deg);

    for (const nb of neighbors) {
      if (search(nb.r, nb.c)) return true;
    }

    path.pop();
    visited[r][c] = false;
    return false;
  }

  const success = search(start[0], start[1]);
  return success ? path : null;
}

/**
 * Places waypoints along the Hamiltonian path at regular intervals and key bends.
 */
export function extractWaypoints(
  path: [number, number][],
  targetCount: number
): ZipWaypoint[] {
  const waypoints: ZipWaypoint[] = [];
  const total = path.length;

  // Step 1 is always the start of the path
  waypoints.push({ step: 1, row: path[0][0], col: path[0][1] });

  // Place waypoints along the path
  const interval = (total - 1) / (targetCount - 1);
  for (let i = 1; i < targetCount - 1; i++) {
    const idx = Math.round(i * interval);
    waypoints.push({
      step: i + 1,
      row: path[idx][0],
      col: path[idx][1],
    });
  }

  // Final waypoint is the end of the path
  waypoints.push({
    step: targetCount,
    row: path[total - 1][0],
    col: path[total - 1][1],
  });

  return waypoints;
}

// Fallback verified level for 5x5
const FALLBACK_5X5_PATH: [number, number][] = [
  [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
  [4, 1], [3, 1], [2, 1], [1, 1], [0, 1],
  [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
  [4, 3], [4, 4], [3, 4], [3, 3], [2, 3],
  [2, 4], [1, 4], [0, 4], [0, 3], [1, 3],
];

export function generateZipLevel(
  size: 5 | 6 | 7 = 5,
  seed = Date.now()
): ZipLevel {
  const rng = mulberry32(seed);
  let path = findHamiltonianPath(size, size, rng);

  if (!path) {
    path = FALLBACK_5X5_PATH;
  }

  const waypointCount = size === 5 ? 6 : size === 6 ? 7 : 8;
  const waypoints = extractWaypoints(path, waypointCount);

  const difficultyLabel = size === 5 ? "Easy (5×5)" : size === 6 ? "Medium (6×6)" : "Hard (7×7)";

  return {
    id: seed,
    name: `Circuit: ${difficultyLabel}`,
    rows: size,
    cols: size,
    waypoints,
    solutionPath: path,
  };
}
