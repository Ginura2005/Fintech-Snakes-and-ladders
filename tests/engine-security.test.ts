import { describe, it, expect } from "vitest";
import {
  processTurn,
  computeNewPosition,
  createInitialGameState,
  isTerminal,
  GameState,
} from "../lib/game-engine/engine";
import { BOARD_CONFIG } from "../lib/game-engine/board-config";

describe("Computer Opponent & Game Rules Parity", () => {
  it("computer follows identical movement and ladder rules", () => {
    const state: GameState = {
      ...createInitialGameState("run-c1", "player-1"),
      currentTurn: "computer",
      computerPosition: 1,
    };

    // Computer rolls 2 -> lands on 3 -> climbs ladder to 8
    const result = processTurn(state, 2);
    expect(result.actor).toBe("computer");
    expect(result.toPosition).toBe(8);
    expect(result.newState.computerPosition).toBe(8);
    // Computer gets ladder score (+25) + movement (20) = 45
    expect(result.newState.computerScore).toBe(45);
    // Turn passes back to player
    expect(result.newState.currentTurn).toBe("player");
  });

  it("computer loses heart on major-risk snake", () => {
    const state: GameState = {
      ...createInitialGameState("run-c2", "player-1"),
      currentTurn: "computer",
      computerPosition: 15,
      computerHearts: 3,
      computerShields: 0,
    };

    // Roll 4 -> square 19 -> slides to 9
    const result = processTurn(state, 4);
    expect(result.actor).toBe("computer");
    expect(result.toPosition).toBe(9);
    expect(result.newState.computerHearts).toBe(2);
  });

  it("computer uses shield to prevent heart loss on major-risk snake", () => {
    const state: GameState = {
      ...createInitialGameState("run-c3", "player-1"),
      currentTurn: "computer",
      computerPosition: 15,
      computerHearts: 3,
      computerShields: 1,
    };

    // Roll 4 -> square 19 -> slides to 9
    const result = processTurn(state, 4);
    expect(result.actor).toBe("computer");
    expect(result.newState.computerHearts).toBe(3);
    expect(result.newState.computerShields).toBe(0);
    expect(result.events.some((e) => e.type === "shield_consumed")).toBe(true);
  });

  it("human player wins if computer is eliminated (hearts reach 0)", () => {
    const state: GameState = {
      ...createInitialGameState("run-c4", "player-1"),
      currentTurn: "computer",
      computerPosition: 15,
      computerHearts: 1,
      computerShields: 0,
    };

    // Roll 4 -> square 19 -> hearts become 0 -> computer eliminated, player wins
    const result = processTurn(state, 4);
    expect(result.newState.computerHearts).toBe(0);
    expect(result.newState.status).toBe("player_won");
    expect(isTerminal(result.newState)).toBe(true);
  });

  it("computer wins if computer reaches square 25 before player", () => {
    const state: GameState = {
      ...createInitialGameState("run-c5", "player-1"),
      currentTurn: "computer",
      computerPosition: 23,
      computerHearts: 3,
    };

    // Roll 2 -> lands on 25
    const result = processTurn(state, 2);
    expect(result.toPosition).toBe(25);
    expect(result.newState.status).toBe("computer_won");
    expect(isTerminal(result.newState)).toBe(true);
  });
});

describe("State Immutability & Terminal Protection", () => {
  it("rejects turn processing on already completed game", () => {
    const completedState: GameState = {
      ...createInitialGameState("run-t1", "player-1"),
      status: "player_won",
    };

    expect(() => processTurn(completedState, 3)).toThrow(
      "Cannot process turn for status: player_won"
    );
  });

  it("rejects turn processing on eliminated player", () => {
    const eliminatedState: GameState = {
      ...createInitialGameState("run-t2", "player-1"),
      status: "player_eliminated",
    };

    expect(() => processTurn(eliminatedState, 3)).toThrow(
      "Cannot process turn for status: player_eliminated"
    );
  });

  it("player score never falls below zero", () => {
    const lowScoreState: GameState = {
      ...createInitialGameState("run-t3", "player-1"),
      playerPosition: 10,
      playerScore: 0,
    };

    // Ordinary snake is -10. With 2 movement pts (+20), it would be 10.
    // Let's test a major snake with zero score starting:
    const majorState: GameState = {
      ...createInitialGameState("run-t4", "player-1"),
      playerPosition: 18, // Roll 1 -> 19 (major snake -25). Movement = +10. Net delta = -15.
      playerScore: 5,
    };
    const result = processTurn(majorState, 1);
    expect(result.newState.playerScore).toBeGreaterThanOrEqual(0);
  });
});
