-- Migration: 002_add_board_seed.sql
-- Lanka FinTechVerse: Procedural Board Generator Seed Support
-- Adds deterministic board seed to game_runs for daily tournament & ranked challenges

ALTER TABLE game_runs
ADD COLUMN IF NOT EXISTS board_seed BIGINT DEFAULT 2026;

COMMENT ON COLUMN game_runs.board_seed IS 'Integer seed used by Mulberry32 PRNG to generate the deterministic board layout for this run';
