/**
 * LANKA FINTECHVERSE — Pure Game Engine
 * All game-state transitions. No I/O, no database, no HTTP.
 * Fully testable in isolation.
 */

import {
  BOARD_CONFIG,
  getLadder,
  getSnake,
  getSpecialSquare,
  BoardConfig,
} from "./board-config";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Actor = "player" | "computer";

export type GameStatus =
  | "not_started"
  | "in_progress"
  | "player_won"
  | "computer_won"
  | "player_eliminated"
  | "completed";

export type EventType =
  | "normal_move"
  | "ladder"
  | "snake_ordinary"
  | "snake_major"
  | "quiz_triggered"
  | "treasure_collected"
  | "finish"
  | "overshoot"
  | "heart_lost"
  | "eliminated"
  | "shield_consumed"
  | "quiz_already_seen";

export interface GameState {
  id: string;
  playerId: string;
  configVersion: string;
  status: GameStatus;
  currentTurn: Actor;
  turnSequence: number;

  playerPosition: number;
  computerPosition: number;
  playerHearts: number;
  computerHearts: number;
  playerShields: number;
  computerShields: number;
  playerScore: number;
  computerScore: number;
  playerQuizCorrect: number;

  /** Set of squares where treasures have been collected {playerSquare, computerSquare} */
  playerTreasuresCollected: number[];
  computerTreasuresCollected: number[];

  /** Quiz square numbers already encountered by the player in this run */
  playerQuizEncountered: number[];

  startedAt: string;
  completedAt: string | null;
}

export interface TurnResult {
  diceValue: number;
  actor: Actor;
  fromPosition: number;
  toPosition: number;
  events: TurnEvent[];
  scoreDeltas: ScoreDelta[];
  newState: GameState;
}

export interface TurnEvent {
  type: EventType;
  description: string;
  fromSquare?: number;
  toSquare?: number;
}

export interface ScoreDelta {
  actor: Actor;
  event: string;
  delta: number;
}

// ─── Dice ────────────────────────────────────────────────────────────────────

/** Server-side cryptographically random dice roll (1-6) */
export function rollDice(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return (array[0] % 6) + 1;
}

// ─── Movement ────────────────────────────────────────────────────────────────

export function computeNewPosition(
  currentPosition: number,
  diceValue: number,
  boardConfig: BoardConfig = BOARD_CONFIG
): { position: number; overshot: boolean } {
  const rawPosition = currentPosition + diceValue;
  if (rawPosition > boardConfig.boardSize) {
    // Must land exactly; overshoot stays in place
    return { position: currentPosition, overshot: true };
  }
  return { position: rawPosition, overshot: false };
}

// ─── Core Turn Processor ─────────────────────────────────────────────────────

/**
 * Process one complete turn for the given actor.
 * Returns a TurnResult with new state and all events.
 * PURE — no side effects, no I/O.
 *
 * @param state       Current game state
 * @param diceValue   Result of the dice roll (1-6)
 * @param quizAnswer  Optional quiz answer from the player
 * @param boardConfig Optional dynamic board config (defaults to BOARD_CONFIG /
 *                    classic board). Pass the generated config for procedural
 *                    Practice Mode or daily-seed ranked matches.
 */
export function processTurn(
  state: GameState,
  diceValue: number,
  quizAnswer?: { questionId: string; selectedOption: number; isCorrect: boolean },
  boardConfig: BoardConfig = BOARD_CONFIG
): TurnResult {
  if (state.status !== "in_progress") {
    throw new Error(`Cannot process turn for status: ${state.status}`);
  }

  const actor = state.currentTurn;
  const events: TurnEvent[] = [];
  const scoreDeltas: ScoreDelta[] = [];

  // Clone mutable parts
  let newState: GameState = { ...state };

  const fromPos = actor === "player" ? state.playerPosition : state.computerPosition;

  // 1. Movement
  const { position: rawPos, overshot } = computeNewPosition(fromPos, diceValue, boardConfig);

  if (overshot) {
    events.push({
      type: "overshoot",
      description: `Rolled ${diceValue} but needs exact roll to reach finish. Staying at ${fromPos}.`,
    });
    // Pass turn to opponent
    newState.currentTurn = actor === "player" ? "computer" : "player";
    newState.turnSequence += 1;
    return {
      diceValue,
      actor,
      fromPosition: fromPos,
      toPosition: fromPos,
      events,
      scoreDeltas,
      newState,
    };
  }

  // Award movement points for forward dice movement
  const movementScore = diceValue * boardConfig.scoring.forwardMovementPerSquare;
  scoreDeltas.push({ actor, event: "forward_movement", delta: movementScore });

  let finalPos = rawPos;

  // 2. Check for finish
  if (rawPos === boardConfig.boardSize) {
    events.push({ type: "finish", description: "Reached the finish!" });
    finalPos = rawPos;
    // Apply position
    if (actor === "player") {
      newState.playerPosition = finalPos;
    } else {
      newState.computerPosition = finalPos;
    }
    // Score events
    applyScoreDeltas(newState, scoreDeltas);
    newState = applyEndOfGame(newState, actor, events, scoreDeltas, boardConfig);
    newState.completedAt = new Date().toISOString();
    newState.turnSequence += 1;
    return {
      diceValue,
      actor,
      fromPosition: fromPos,
      toPosition: finalPos,
      events,
      scoreDeltas,
      newState,
    };
  }

  // 3. Check for snake
  const snake = getSnake(rawPos, boardConfig);
  if (snake) {
    finalPos = snake.to;
    const isMajor = snake.type === "major";
    events.push({
      type: isMajor ? "snake_major" : "snake_ordinary",
      description: isMajor
        ? `⚠️ Major risk snake! Slide from ${rawPos} to ${snake.to}.`
        : `Snake! Slide from ${rawPos} to ${snake.to}.`,
      fromSquare: rawPos,
      toSquare: snake.to,
    });

    const snakeScore = isMajor
      ? boardConfig.scoring.majorSnake
      : boardConfig.scoring.ordinarySnake;
    scoreDeltas.push({ actor, event: isMajor ? "major_snake" : "ordinary_snake", delta: snakeScore });

    // Check shield on all snakes (ordinary and major)
    const actorShields = actor === "player" ? newState.playerShields : newState.computerShields;
      if (actorShields > 0) {
        // Consume shield
        if (actor === "player") newState.playerShields -= 1;
        else newState.computerShields -= 1;
        events.push({
          type: "shield_consumed",
          description: "🛡️ Shield absorbed the heart loss!",
        });
      } else {
        // Lose a heart
        if (actor === "player") {
          newState.playerHearts = Math.max(0, newState.playerHearts - 1);
          events.push({ type: "heart_lost", description: "💔 Lost a heart!" });
          if (newState.playerHearts === 0) {
            events.push({ type: "eliminated", description: "Player eliminated!" });
            if (actor === "player") newState.playerPosition = finalPos;
            else newState.computerPosition = finalPos;
            applyScoreDeltas(newState, scoreDeltas);
            newState.status = "player_eliminated";
            newState.completedAt = new Date().toISOString();
            newState.turnSequence += 1;
            return {
              diceValue,
              actor,
              fromPosition: fromPos,
              toPosition: finalPos,
              events,
              scoreDeltas,
              newState,
            };
          }
        } else {
          newState.computerHearts = Math.max(0, newState.computerHearts - 1);
          events.push({ type: "heart_lost", description: "💔 Computer lost a heart!" });
          if (newState.computerHearts === 0) {
            events.push({ type: "eliminated", description: "Computer eliminated! Player wins!" });
            newState.computerPosition = finalPos;
            applyScoreDeltas(newState, scoreDeltas);
            newState = applyEndOfGame(newState, "player", events, scoreDeltas, boardConfig);
            newState.status = "player_won";
            newState.completedAt = new Date().toISOString();
            newState.turnSequence += 1;
            return {
              diceValue,
              actor,
              fromPosition: fromPos,
              toPosition: finalPos,
              events,
              scoreDeltas,
              newState,
            };
          }
        }
      }
    }

  // 4. Check for ladder
  const ladder = getLadder(rawPos === fromPos ? -1 : rawPos, boardConfig); // don't apply if we didn't move there
  const ladderCheck = getSnake(rawPos, boardConfig) ? null : getLadder(rawPos, boardConfig);
  if (ladderCheck && !snake) {
    const lad = ladderCheck;
    finalPos = lad.to;
    events.push({
      type: "ladder",
      description: `🪜 ${lad.theme} ladder! Climb from ${rawPos} to ${lad.to}.`,
      fromSquare: rawPos,
      toSquare: lad.to,
    });
    scoreDeltas.push({ actor, event: "ladder", delta: boardConfig.scoring.ladder });
  }

  // 5. Check special squares (only at final position, not on snake/ladder squares)
  const specialSquare = getSpecialSquare(finalPos, boardConfig);
  if (specialSquare) {
    if (specialSquare.type === "treasure") {
      const alreadyCollected =
        actor === "player"
          ? newState.playerTreasuresCollected.includes(finalPos)
          : newState.computerTreasuresCollected.includes(finalPos);

      if (!alreadyCollected) {
        scoreDeltas.push({ actor, event: "treasure", delta: boardConfig.treasure.points });
        events.push({
          type: "treasure_collected",
          description: `💰 Treasure! +${boardConfig.treasure.points} points!`,
        });

        if (boardConfig.treasure.shieldAwarded) {
          const currentShields = actor === "player" ? newState.playerShields : newState.computerShields;
          if (currentShields < boardConfig.treasure.maxShields) {
            if (actor === "player") newState.playerShields += 1;
            else newState.computerShields += 1;
            events.push({ type: "normal_move", description: "🛡️ Shield awarded!" });
          }
        }

        // Mark as collected
        if (actor === "player") {
          newState.playerTreasuresCollected = [...newState.playerTreasuresCollected, finalPos];
        } else {
          newState.computerTreasuresCollected = [...newState.computerTreasuresCollected, finalPos];
        }
      }
    } else if (specialSquare.type === "quiz" && actor === "player") {
      const alreadySeen = newState.playerQuizEncountered.includes(finalPos);
      if (alreadySeen) {
        events.push({
          type: "quiz_already_seen",
          description: "Quiz already answered for this square.",
        });
      } else {
        // Quiz will be triggered — handled by the caller
        // We mark the encounter so the client shows the quiz
        newState.playerQuizEncountered = [...newState.playerQuizEncountered, finalPos];
        events.push({
          type: "quiz_triggered",
          description: `📝 FinTech Quiz! Answer correctly for +${boardConfig.scoring.quizCorrect} points!`,
        });
      }
    }
  }

  // Apply quiz answer if provided
  if (quizAnswer && quizAnswer.isCorrect && actor === "player") {
    scoreDeltas.push({ actor: "player", event: "quiz_correct", delta: boardConfig.scoring.quizCorrect });
    newState.playerQuizCorrect += 1;
  }

  // 6. Update position
  if (actor === "player") {
    newState.playerPosition = finalPos;
  } else {
    newState.computerPosition = finalPos;
  }

  // 7. Apply scores
  applyScoreDeltas(newState, scoreDeltas);

  // 8. Pass turn
  newState.currentTurn = actor === "player" ? "computer" : "player";
  newState.turnSequence += 1;

  return {
    diceValue,
    actor,
    fromPosition: fromPos,
    toPosition: finalPos,
    events,
    scoreDeltas,
    newState,
  };
}

// ─── Score Helpers ────────────────────────────────────────────────────────────

function applyScoreDeltas(state: GameState, deltas: ScoreDelta[]): void {
  for (const delta of deltas) {
    if (delta.actor === "player") {
      state.playerScore = Math.max(0, state.playerScore + delta.delta);
    } else {
      state.computerScore = Math.max(0, state.computerScore + delta.delta);
    }
  }
}

function applyEndOfGame(
  state: GameState,
  winner: Actor,
  events: TurnEvent[],
  scoreDeltas: ScoreDelta[],
  boardConfig: BoardConfig = BOARD_CONFIG
): GameState {
  // Hearts remaining bonus — for player only
  const heartBonus = state.playerHearts * boardConfig.scoring.heartRemaining;
  if (heartBonus > 0) {
    scoreDeltas.push({ actor: "player", event: "hearts_remaining", delta: heartBonus });
    state.playerScore = Math.max(0, state.playerScore + heartBonus);
  }

  if (winner === "player") {
    const finishBonus = boardConfig.scoring.reachingFinish;
    const victoryBonus = boardConfig.scoring.defeatingComputer;
    scoreDeltas.push({ actor: "player", event: "reaching_finish", delta: finishBonus });
    scoreDeltas.push({ actor: "player", event: "defeating_computer", delta: victoryBonus });
    state.playerScore = Math.max(0, state.playerScore + finishBonus + victoryBonus);
    state.status = "player_won";
    events.push({ type: "finish", description: "🎉 Player wins!" });
  } else {
    const finishBonus = boardConfig.scoring.reachingFinish;
    scoreDeltas.push({ actor: "computer", event: "reaching_finish", delta: finishBonus });
    state.computerScore = Math.max(0, state.computerScore + finishBonus);
    state.status = "computer_won";
    events.push({ type: "finish", description: "🤖 Computer wins!" });
  }

  return state;
}

// ─── Initial State ────────────────────────────────────────────────────────────

export function createInitialGameState(
  id: string,
  playerId: string
): GameState {
  return {
    id,
    playerId,
    configVersion: BOARD_CONFIG.version,
    status: "in_progress",
    currentTurn: "player",
    turnSequence: 0,
    playerPosition: 1,
    computerPosition: 1,
    playerHearts: BOARD_CONFIG.startHearts,
    computerHearts: BOARD_CONFIG.startHearts,
    playerShields: 0,
    computerShields: 0,
    playerScore: 0,
    computerScore: 0,
    playerQuizCorrect: 0,
    playerTreasuresCollected: [],
    computerTreasuresCollected: [],
    playerQuizEncountered: [],
    startedAt: new Date().toISOString(),
    completedAt: null,
  };
}

/** Check if a game is in a terminal state */
export function isTerminal(state: GameState): boolean {
  return (
    state.status === "player_won" ||
    state.status === "computer_won" ||
    state.status === "player_eliminated" ||
    state.status === "completed"
  );
}
