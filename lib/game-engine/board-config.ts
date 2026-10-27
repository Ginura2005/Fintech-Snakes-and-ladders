/**
 * LANKA FINTECHVERSE — Central Board Configuration
 * This is the single source of truth for all board rules.
 * All game logic references this file.
 */

export const CONFIG_VERSION = "1.0.0";

export interface LadderConfig {
  from: number;
  to: number;
  theme: string;
}

export interface SnakeConfig {
  from: number;
  to: number;
  type: "ordinary" | "major";
}

export interface SpecialSquareConfig {
  square: number;
  type: "quiz" | "treasure";
}

export interface ScoringConfig {
  forwardMovementPerSquare: number;
  quizCorrect: number;
  treasure: number;
  ladder: number;
  ordinarySnake: number;
  majorSnake: number;
  heartRemaining: number;
  reachingFinish: number;
  defeatingComputer: number;
}

export interface TreasureConfig {
  points: number;
  shieldAwarded: boolean;
  maxShields: number;
}

export interface BoardConfig {
  version: string;
  boardSize: number;
  startHearts: number;
  ladders: LadderConfig[];
  snakes: SnakeConfig[];
  specialSquares: SpecialSquareConfig[];
  scoring: ScoringConfig;
  treasure: TreasureConfig;
}

export const BOARD_CONFIG: BoardConfig = {
  version: CONFIG_VERSION,
  boardSize: 25,
  startHearts: 3,

  ladders: [
    { from: 3, to: 8, theme: "Digital payments" },
    { from: 6, to: 11, theme: "Financial inclusion" },
    { from: 10, to: 17, theme: "Innovation" },
    { from: 14, to: 22, theme: "Entrepreneurship" },
  ],

  snakes: [
    { from: 12, to: 5, type: "ordinary" },
    { from: 19, to: 9, type: "major" },
    { from: 21, to: 13, type: "ordinary" },
    { from: 24, to: 16, type: "major" },
  ],

  specialSquares: [
    { square: 4, type: "quiz" },
    { square: 7, type: "treasure" },
    { square: 15, type: "quiz" },
    { square: 18, type: "quiz" },
    { square: 20, type: "treasure" },
  ],

  scoring: {
    forwardMovementPerSquare: 10,
    quizCorrect: 50,
    treasure: 50,
    ladder: 25,
    ordinarySnake: -10,
    majorSnake: -25,
    heartRemaining: 100,
    reachingFinish: 300,
    defeatingComputer: 200,
  },

  treasure: {
    points: 50,
    shieldAwarded: true,
    maxShields: 2,
  },
};

/** Validate the board config at startup. Throws if invalid. */
export function validateBoardConfig(config: BoardConfig): void {
  const { boardSize, ladders, snakes, specialSquares } = config;

  // Collect all "from" positions
  const allFromPositions = new Set<number>();

  for (const ladder of ladders) {
    if (ladder.from < 1 || ladder.from > boardSize) {
      throw new Error(`Ladder from=${ladder.from} out of range`);
    }
    if (ladder.to < 1 || ladder.to > boardSize) {
      throw new Error(`Ladder to=${ladder.to} out of range`);
    }
    if (ladder.to <= ladder.from) {
      throw new Error(`Ladder must go forward: from=${ladder.from} to=${ladder.to}`);
    }
    if (allFromPositions.has(ladder.from)) {
      throw new Error(`Duplicate ladder/snake start at ${ladder.from}`);
    }
    allFromPositions.add(ladder.from);
  }

  for (const snake of snakes) {
    if (snake.from < 1 || snake.from > boardSize) {
      throw new Error(`Snake from=${snake.from} out of range`);
    }
    if (snake.to < 1 || snake.to > boardSize) {
      throw new Error(`Snake to=${snake.to} out of range`);
    }
    if (snake.to >= snake.from) {
      throw new Error(`Snake must go backward: from=${snake.from} to=${snake.to}`);
    }
    if (allFromPositions.has(snake.from)) {
      throw new Error(`Duplicate ladder/snake start at ${snake.from}`);
    }
    allFromPositions.add(snake.from);
  }

  // Validate special squares don't overlap with snake/ladder starts
  const specialPositions = new Set<number>();
  for (const sq of specialSquares) {
    if (sq.square < 1 || sq.square > boardSize) {
      throw new Error(`Special square ${sq.square} out of range`);
    }
    if (specialPositions.has(sq.square)) {
      throw new Error(`Duplicate special square at ${sq.square}`);
    }
    specialPositions.add(sq.square);
  }

  // Finish square must not be a snake or special square start
  if (allFromPositions.has(boardSize)) {
    throw new Error(`Finish square ${boardSize} cannot be a snake/ladder start`);
  }
}

// Validate on module load
validateBoardConfig(BOARD_CONFIG);

// Lookup helpers
export function getLadder(position: number): LadderConfig | undefined {
  return BOARD_CONFIG.ladders.find((l) => l.from === position);
}

export function getSnake(position: number): SnakeConfig | undefined {
  return BOARD_CONFIG.snakes.find((s) => s.from === position);
}

export function getSpecialSquare(position: number): SpecialSquareConfig | undefined {
  return BOARD_CONFIG.specialSquares.find((sq) => sq.square === position);
}
