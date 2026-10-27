-- LANKA FINTECHVERSE — Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Apply this in the Supabase SQL editor or via supabase db push

-- ─── Enable UUID extension ────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Enums ────────────────────────────────────────────────────────────────────
CREATE TYPE game_status AS ENUM (
  'not_started',
  'in_progress',
  'player_won',
  'computer_won',
  'player_eliminated',
  'completed'
);

CREATE TYPE actor_type AS ENUM ('player', 'computer');

-- ─── player_profiles ─────────────────────────────────────────────────────────
CREATE TABLE player_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  leaderboard_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT display_name_length CHECK (char_length(display_name) BETWEEN 2 AND 30),
  CONSTRAINT display_name_chars CHECK (display_name ~ '^[a-zA-Z0-9][a-zA-Z0-9 _\-]*[a-zA-Z0-9]$' OR char_length(display_name) = 1)
);

-- ─── game_runs ────────────────────────────────────────────────────────────────
CREATE TABLE game_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  config_version TEXT NOT NULL DEFAULT '1.0.0',
  status game_status NOT NULL DEFAULT 'in_progress',
  current_turn actor_type NOT NULL DEFAULT 'player',
  turn_sequence INTEGER NOT NULL DEFAULT 0,

  -- Positions (1–25)
  player_position SMALLINT NOT NULL DEFAULT 1 CHECK (player_position BETWEEN 1 AND 25),
  computer_position SMALLINT NOT NULL DEFAULT 1 CHECK (computer_position BETWEEN 1 AND 25),

  -- Hearts (0–3)
  player_hearts SMALLINT NOT NULL DEFAULT 3 CHECK (player_hearts BETWEEN 0 AND 3),
  computer_hearts SMALLINT NOT NULL DEFAULT 3 CHECK (computer_hearts BETWEEN 0 AND 3),

  -- Shields
  player_shields SMALLINT NOT NULL DEFAULT 0 CHECK (player_shields >= 0),
  computer_shields SMALLINT NOT NULL DEFAULT 0 CHECK (computer_shields >= 0),

  -- Scores
  player_score INTEGER NOT NULL DEFAULT 0 CHECK (player_score >= 0),
  computer_score INTEGER NOT NULL DEFAULT 0 CHECK (computer_score >= 0),

  -- Quiz tracking
  player_quiz_correct SMALLINT NOT NULL DEFAULT 0,

  -- JSON arrays of square numbers
  player_treasures_collected JSONB NOT NULL DEFAULT '[]',
  computer_treasures_collected JSONB NOT NULL DEFAULT '[]',
  player_quiz_encountered JSONB NOT NULL DEFAULT '[]',

  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Each player can only have ONE official run
  CONSTRAINT one_run_per_player UNIQUE (player_id)
);

-- ─── game_moves ───────────────────────────────────────────────────────────────
CREATE TABLE game_moves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES game_runs(id) ON DELETE CASCADE,
  turn_sequence INTEGER NOT NULL,
  actor actor_type NOT NULL,
  dice_result SMALLINT NOT NULL CHECK (dice_result BETWEEN 1 AND 6),
  from_position SMALLINT NOT NULL,
  to_position SMALLINT NOT NULL,
  events JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Idempotency: one record per turn per run
  CONSTRAINT unique_turn UNIQUE (run_id, turn_sequence)
);

-- ─── score_ledger ─────────────────────────────────────────────────────────────
CREATE TABLE score_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES game_runs(id) ON DELETE CASCADE,
  turn_sequence INTEGER NOT NULL,
  actor actor_type NOT NULL,
  event TEXT NOT NULL,
  delta INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── leaderboard_entries ──────────────────────────────────────────────────────
CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES game_runs(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  final_score INTEGER NOT NULL DEFAULT 0,
  player_won BOOLEAN NOT NULL DEFAULT FALSE,
  quiz_correct SMALLINT NOT NULL DEFAULT 0,
  hearts_remaining SMALLINT NOT NULL DEFAULT 0,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Each run can only have one leaderboard entry
  CONSTRAINT unique_run_entry UNIQUE (run_id),
  -- Each player can only have one leaderboard entry
  CONSTRAINT unique_player_entry UNIQUE (player_id)
);

-- ─── challenge_links ─────────────────────────────────────────────────────────
CREATE TABLE challenge_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT NOT NULL UNIQUE,
  run_id UUID NOT NULL REFERENCES game_runs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '90 days')
);

-- ─── quiz_attempts ────────────────────────────────────────────────────────────
-- Tracks quiz answer per run+square to prevent duplicates
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES game_runs(id) ON DELETE CASCADE,
  square_number SMALLINT NOT NULL,
  question_id TEXT NOT NULL,
  selected_option SMALLINT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_quiz_per_square UNIQUE (run_id, square_number)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_game_runs_player ON game_runs(player_id);
CREATE INDEX idx_game_runs_status ON game_runs(status);
CREATE INDEX idx_game_moves_run ON game_moves(run_id, turn_sequence);
CREATE INDEX idx_score_ledger_run ON score_ledger(run_id);
CREATE INDEX idx_leaderboard_score ON leaderboard_entries(final_score DESC, player_won DESC, quiz_correct DESC, hearts_remaining DESC, duration_seconds ASC NULLS LAST);
CREATE INDEX idx_challenge_token ON challenge_links(token);

-- ─── Updated_at trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER player_profiles_updated_at
  BEFORE UPDATE ON player_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────

-- player_profiles: users can read all (for display names), but only modify their own
ALTER TABLE player_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read display names"
  ON player_profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "Users insert own profile"
  ON player_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON player_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- game_runs: users can only see and modify their own run
ALTER TABLE game_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own run"
  ON game_runs FOR SELECT
  USING (auth.uid() = player_id);

CREATE POLICY "Users insert own run"
  ON game_runs FOR INSERT
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users update own run"
  ON game_runs FOR UPDATE
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

-- game_moves: users can only see their own moves
ALTER TABLE game_moves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own moves"
  ON game_moves FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM game_runs
      WHERE game_runs.id = game_moves.run_id
        AND game_runs.player_id = auth.uid()
    )
  );

-- score_ledger: users can only see their own ledger
ALTER TABLE score_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own ledger"
  ON score_ledger FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM game_runs
      WHERE game_runs.id = score_ledger.run_id
        AND game_runs.player_id = auth.uid()
    )
  );

-- leaderboard_entries: public read for opted-in players
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read leaderboard"
  ON leaderboard_entries FOR SELECT
  USING (TRUE);

-- challenge_links: public read by token
ALTER TABLE challenge_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read challenge links"
  ON challenge_links FOR SELECT
  USING (TRUE);

-- quiz_attempts: users can only see their own
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own quiz attempts"
  ON quiz_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM game_runs
      WHERE game_runs.id = quiz_attempts.run_id
        AND game_runs.player_id = auth.uid()
    )
  );

-- ─── Leaderboard view (public, anonymised) ────────────────────────────────────
CREATE OR REPLACE VIEW public_leaderboard AS
SELECT
  le.id,
  le.display_name,
  le.final_score,
  le.player_won,
  le.quiz_correct,
  le.hearts_remaining,
  le.duration_seconds,
  le.created_at,
  ROW_NUMBER() OVER (
    ORDER BY
      le.final_score DESC,
      le.player_won DESC,
      le.quiz_correct DESC,
      le.hearts_remaining DESC,
      le.duration_seconds ASC NULLS LAST
  ) AS rank
FROM leaderboard_entries le
JOIN player_profiles pp ON pp.id = le.player_id
WHERE pp.leaderboard_opt_in = TRUE
ORDER BY rank;
