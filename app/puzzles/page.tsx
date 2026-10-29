import PuzzlesClient, { type PuzzlesQuery } from "./puzzles-client";
import type { PuzzleId } from "@/components/puzzles/puzzleTypes";

const PUZZLE_IDS = new Set<PuzzleId>([
  "queens",
  "tango",
  "pinpoint",
  "crossclimb",
  "zip",
  "mini-sudoku",
]);

function first(
  value: string | string[] | undefined
): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function PuzzlesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const gameRaw = first(params.game);
  const game =
    gameRaw && PUZZLE_IDS.has(gameRaw as PuzzleId)
      ? (gameRaw as PuzzleId)
      : null;

  const query: PuzzlesQuery = {
    game,
    seed: first(params.seed),
    challenge: first(params.challenge) === "1",
    target: first(params.target),
    from: first(params.from),
    diff: first(params.diff),
    date: first(params.date),
  };

  return <PuzzlesClient query={query} />;
}
