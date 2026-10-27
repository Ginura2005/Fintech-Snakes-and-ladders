export type PuzzleId =
  | "queens"
  | "tango"
  | "pinpoint"
  | "crossclimb"
  | "zip"
  | "mini-sudoku";

export interface PuzzleMeta {
  id: PuzzleId;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  tagline: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Adaptive";
  estimatedTime: string;
  color: string;
}

// ================= Queens =================
export interface QueensLevel {
  id: number;
  name: string;
  size: number;
  regions: number[][]; // size x size, values 0..size-1
  solution: number[]; // col index for each row 0..size-1
}

// ================= Tango =================
export type TangoSymbol = "S" | "M" | null;
export type TangoConstraint = "=" | "x" | null;

export interface TangoLevel {
  id: number;
  name: string;
  size: 6;
  givens: TangoSymbol[][]; // 6x6
  hEdges: TangoConstraint[][]; // 6 x 5 (between (r, c) and (r, c+1))
  vEdges: TangoConstraint[][]; // 5 x 6 (between (r, c) and (r+1, c))
  solution: ("S" | "M")[][];
}

// ================= Pinpoint =================
export interface PinpointPack {
  id: number;
  topic: string;
  category: string;
  acceptedAnswers: string[];
  clues: string[]; // 5 clues, broad to specific
  explanation: string;
}

// ================= Crossclimb =================
export interface CrossclimbLadderWord {
  id: string;
  word: string;
  clue: string;
}

export interface CrossclimbLevel {
  id: number;
  name: string;
  wordLength: number;
  topWord: CrossclimbLadderWord;
  bottomWord: CrossclimbLadderWord;
  ladderWords: CrossclimbLadderWord[]; // in correct chain order
}

// ================= Zip =================
export interface ZipWaypoint {
  step: number; // 1..K
  row: number;
  col: number;
}

export interface ZipLevel {
  id: number;
  name: string;
  rows: number;
  cols: number;
  waypoints: ZipWaypoint[];
  solutionPath: [number, number][]; // complete Hamiltonian path
}

// ================= Mini Sudoku =================
export interface MiniSudokuLevel {
  id: number;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  givens: number[][]; // 6x6, 0 for empty, 1..6
  solution: number[][]; // 6x6, values 1..6
}

// User puzzle save progress
export interface PuzzleStats {
  completedPuzzles: Record<string, boolean>; // e.g. "queens-1": true
  bestTimes: Record<string, number>; // in seconds
  totalWins: number;
  currentStreak: number;
}
