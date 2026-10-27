import { describe, it, expect } from "vitest";
import {
  BOARD_CONFIG,
  validateBoardConfig,
  getLadder,
  getSnake,
  getSpecialSquare,
} from "../lib/game-engine/board-config";
import {
  processTurn,
  computeNewPosition,
  createInitialGameState,
  isTerminal,
  GameState,
} from "../lib/game-engine/engine";
import { QUIZ_BANK, getQuizQuestion, getRandomQuestion } from "../lib/game-engine/quiz-bank";

describe("Board Configuration Validation", () => {
  it("has exactly 25 squares and 3 start hearts", () => {
    expect(BOARD_CONFIG.boardSize).toBe(25);
    expect(BOARD_CONFIG.startHearts).toBe(3);
  });

  it("validates board configuration without throwing", () => {
    expect(() => validateBoardConfig(BOARD_CONFIG)).not.toThrow();
  });

  it("has the exact 4 ladders configured forward", () => {
    expect(BOARD_CONFIG.ladders).toEqual([
      { from: 3, to: 8, theme: "Digital payments" },
      { from: 6, to: 11, theme: "Financial inclusion" },
      { from: 10, to: 17, theme: "Innovation" },
      { from: 14, to: 22, theme: "Entrepreneurship" },
    ]);
    for (const ladder of BOARD_CONFIG.ladders) {
      expect(ladder.to).toBeGreaterThan(ladder.from);
    }
  });

  it("has the exact 4 snakes configured backward with correct risk types", () => {
    expect(BOARD_CONFIG.snakes).toEqual([
      { from: 12, to: 5, type: "ordinary" },
      { from: 19, to: 9, type: "major" },
      { from: 21, to: 13, type: "ordinary" },
      { from: 24, to: 16, type: "major" },
    ]);
    for (const snake of BOARD_CONFIG.snakes) {
      expect(snake.to).toBeLessThan(snake.from);
    }
  });

  it("has the 5 special squares with correct types", () => {
    expect(BOARD_CONFIG.specialSquares).toEqual([
      { square: 4, type: "quiz" },
      { square: 7, type: "treasure" },
      { square: 15, type: "quiz" },
      { square: 18, type: "quiz" },
      { square: 20, type: "treasure" },
    ]);
  });
});

describe("Movement and Turn Transitions", () => {
  it("moves participant forward by dice roll", () => {
    const res = computeNewPosition(1, 4);
    expect(res.position).toBe(5);
    expect(res.overshot).toBe(false);
  });

  it("requires exact roll to land on square 25; overshoot stays in place", () => {
    const exact = computeNewPosition(23, 2);
    expect(exact.position).toBe(25);
    expect(exact.overshot).toBe(false);

    const overshoot = computeNewPosition(23, 3);
    expect(overshoot.position).toBe(23);
    expect(overshoot.overshot).toBe(true);
  });

  it("applies ladder climb and awards ladder bonus", () => {
    const state = createInitialGameState("run-1", "player-1");
    // Start at 1, roll 2 -> square 3 -> climb to 8
    const result = processTurn(state, 2);
    expect(result.toPosition).toBe(8);
    expect(result.newState.playerPosition).toBe(8);
    // Movement score: 2 * 10 = 20, ladder bonus = 25 -> total 45
    expect(result.newState.playerScore).toBe(45);
    expect(result.events.some((e) => e.type === "ladder")).toBe(true);
    // Turn passes to computer
    expect(result.newState.currentTurn).toBe("computer");
  });

  it("applies ordinary snake penalty, slides backward and deducts one heart when no shield available", () => {
    const state: GameState = {
      ...createInitialGameState("run-1", "player-1"),
      playerPosition: 10,
    };
    // Roll 2 -> square 12 -> slides to 5
    const result = processTurn(state, 2);
    expect(result.toPosition).toBe(5);
    expect(result.newState.playerPosition).toBe(5);
    // Ordinary snake penalty (-10) + dice movement (2*10=20) = 10 pts
    expect(result.newState.playerScore).toBe(10);
    expect(result.newState.playerHearts).toBe(2); // Deducts 1 heart unless shielded
    expect(result.events.some((e) => e.type === "heart_lost")).toBe(true);
    expect(result.events.some((e) => e.type === "snake_ordinary")).toBe(true);
  });

  it("applies major-risk snake and deducts one heart when no shield available", () => {
    const state: GameState = {
      ...createInitialGameState("run-1", "player-1"),
      playerPosition: 15,
      playerScore: 100,
    };
    // Roll 4 -> square 19 -> slides to 9
    const result = processTurn(state, 4);
    expect(result.toPosition).toBe(9);
    expect(result.newState.playerPosition).toBe(9);
    expect(result.newState.playerHearts).toBe(2); // Lost 1 heart
    expect(result.events.some((e) => e.type === "heart_lost")).toBe(true);
    expect(result.events.some((e) => e.type === "snake_major")).toBe(true);
  });

  it("consumes shield on major-risk snake to protect heart", () => {
    const state: GameState = {
      ...createInitialGameState("run-1", "player-1"),
      playerPosition: 15,
      playerShields: 1,
      playerScore: 100,
    };
    // Roll 4 -> square 19 -> slides to 9
    const result = processTurn(state, 4);
    expect(result.toPosition).toBe(9);
    expect(result.newState.playerHearts).toBe(3); // Protected by shield
    expect(result.newState.playerShields).toBe(0); // Shield consumed
    expect(result.events.some((e) => e.type === "shield_consumed")).toBe(true);
  });

  it("eliminates player when hearts drop to 0", () => {
    const state: GameState = {
      ...createInitialGameState("run-1", "player-1"),
      playerPosition: 15,
      playerHearts: 1,
      playerShields: 0,
    };
    // Roll 4 -> square 19 (major snake) -> hearts become 0
    const result = processTurn(state, 4);
    expect(result.newState.playerHearts).toBe(0);
    expect(result.newState.status).toBe("player_eliminated");
    expect(isTerminal(result.newState)).toBe(true);
  });

  it("wins when player reaches square 25 with finish & victory bonuses applied", () => {
    const state: GameState = {
      ...createInitialGameState("run-1", "player-1"),
      playerPosition: 23,
      playerHearts: 3,
      playerScore: 100,
    };
    // Roll 2 -> lands on 25
    const result = processTurn(state, 2);
    expect(result.toPosition).toBe(25);
    expect(result.newState.status).toBe("player_won");
    expect(isTerminal(result.newState)).toBe(true);
    // Score calculation:
    // Original: 100
    // Movement: 2 * 10 = 20
    // Reaching finish: +300
    // Defeating computer: +200
    // Remaining hearts: 3 * 100 = +300
    // Total = 100 + 20 + 300 + 200 + 300 = 920
    expect(result.newState.playerScore).toBe(920);
  });

  it("awards treasure points and shield only once per run", () => {
    const state: GameState = {
      ...createInitialGameState("run-1", "player-1"),
      playerPosition: 5,
    };
    // Roll 2 -> square 7 (treasure)
    const result1 = processTurn(state, 2);
    expect(result1.toPosition).toBe(7);
    expect(result1.newState.playerShields).toBe(1);
    expect(result1.newState.playerTreasuresCollected).toContain(7);

    // If player somehow lands on 7 again (after being snaked back)
    const stateAgain: GameState = {
      ...result1.newState,
      currentTurn: "player",
      playerPosition: 5,
    };
    const result2 = processTurn(stateAgain, 2);
    expect(result2.toPosition).toBe(7);
    // Shield should NOT increase again
    expect(result2.newState.playerShields).toBe(1);
    expect(result2.events.some((e) => e.type === "treasure_collected")).toBe(false);
  });
});

describe("FinTech Quiz Bank", () => {
  it("contains at least 20 reviewed questions", () => {
    expect(QUIZ_BANK.length).toBeGreaterThanOrEqual(20);
  });

  it("every question has unique ID, 3-4 options, a valid correct index, and an explanation", () => {
    const ids = new Set<string>();
    for (const q of QUIZ_BANK) {
      expect(ids.has(q.id)).toBe(false);
      ids.add(q.id);
      expect(q.options.length).toBeGreaterThanOrEqual(3);
      expect(q.options.length).toBeLessThanOrEqual(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);
      expect(q.explanation.length).toBeGreaterThan(10);
      expect(q.question.length).toBeGreaterThan(10);
      expect(q.category).toBeTruthy();
    }
  });

  it("can retrieve a question by id", () => {
    const q = getQuizQuestion("q001");
    expect(q).toBeDefined();
    expect(q?.options[q.correctIndex]).toBe("Quick Response");
  });
});
