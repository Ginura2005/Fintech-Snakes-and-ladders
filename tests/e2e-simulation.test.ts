/**
 * End-to-end integration test: Full simulation of 100 games
 * with procedural board configs, verifying rules, turns, scores, and terminal states.
 */

import { describe, it, expect } from "vitest";
import { generateDynamicBoard, getDailySeed } from "../lib/game-engine/procedural-generator";
import { processTurn, createInitialGameState, isTerminal, rollDice } from "../lib/game-engine/engine";
import { BOARD_CONFIG, validateBoardConfig } from "../lib/game-engine/board-config";

describe("Procedural Game Engine — Full End-to-End Simulation", () => {
  it("simulates 100 complete games on 100 different procedural seeds without infinite loops", () => {
    const seeds = Array.from({ length: 100 }, (_, i) => i * 1337 + 7);

    for (const seed of seeds) {
      const { config } = generateDynamicBoard(seed);
      expect(() => validateBoardConfig(config)).not.toThrow();

      let state = createInitialGameState(`sim-${seed}`, `pilot-${seed}`);
      let turns = 0;
      const MAX_TURNS = 300;

      while (!isTerminal(state) && turns < MAX_TURNS) {
        turns++;
        const dice = rollDice();
        const result = processTurn(state, dice, undefined, config);
        state = result.newState;

        // Invariants during every step of the game:
        expect(state.playerHearts).toBeGreaterThanOrEqual(0);
        expect(state.computerHearts).toBeGreaterThanOrEqual(0);
        expect(state.playerHearts).toBeLessThanOrEqual(3);
        expect(state.computerHearts).toBeLessThanOrEqual(3);
        expect(state.playerScore).toBeGreaterThanOrEqual(0);
        expect(state.computerScore).toBeGreaterThanOrEqual(0);
        expect(state.playerPosition).toBeGreaterThanOrEqual(1);
        expect(state.playerPosition).toBeLessThanOrEqual(25);
        expect(state.computerPosition).toBeGreaterThanOrEqual(1);
        expect(state.computerPosition).toBeLessThanOrEqual(25);
      }

      // Must terminate within 300 turns
      expect(turns).toBeLessThan(MAX_TURNS);
      expect(isTerminal(state)).toBe(true);
      expect(["player_won", "computer_won", "player_eliminated"]).toContain(state.status);
    }
  });

  it("today's daily seed produces a valid, playable board", () => {
    const seed = getDailySeed();
    const { config } = generateDynamicBoard(seed);
    expect(() => validateBoardConfig(config)).not.toThrow();

    let state = createInitialGameState("daily-sim", "daily-pilot");
    let turns = 0;
    while (!isTerminal(state) && turns < 200) {
      turns++;
      const result = processTurn(state, rollDice(), undefined, config);
      state = result.newState;
    }
    expect(isTerminal(state)).toBe(true);
  });
});
