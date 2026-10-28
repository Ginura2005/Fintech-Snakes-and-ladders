import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin/admin-auth";
import {
  generateDynamicBoard,
  getDailySeed,
  monteCarloSimulate,
} from "@/lib/game-engine/procedural-generator";
import { BOARD_CONFIG } from "@/lib/game-engine/board-config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { isAdmin } = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized: Administrator privileges required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const rawSeed = searchParams.get("seed");
  const useClassic = searchParams.get("classic") === "true";

  try {
    let boardConfig;
    let seedUsed = 0;
    let attemptsNeeded = 1;

    if (useClassic) {
      boardConfig = BOARD_CONFIG;
      seedUsed = 0;
    } else {
      seedUsed = rawSeed ? parseInt(rawSeed, 10) || getDailySeed() : getDailySeed();
      const result = generateDynamicBoard(seedUsed);
      boardConfig = result.config;
      attemptsNeeded = result.attempts;
    }

    // Run Monte Carlo simulation for 300 games to measure difficulty
    const sim = monteCarloSimulate(boardConfig, 300);

    return NextResponse.json({
      seed: seedUsed,
      attemptsNeeded,
      isClassic: useClassic,
      config: boardConfig,
      simulation: {
        avgTurns: Math.round(sim.avgTurns * 10) / 10,
        minTurns: sim.minTurns,
        maxTurns: sim.maxTurns,
        solvable: sim.allFinished,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to simulate board" },
      { status: 500 }
    );
  }
}
