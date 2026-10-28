import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { isAdmin } = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized: Administrator privileges required" }, { status: 403 });
  }

  const puzzles = [
    {
      id: "queens",
      name: "Queens",
      theme: "FinTech Governance & Risk Separation",
      description: "Place one crown per colored zone, row, and column without crowns touching, even diagonally.",
      difficultyLevels: ["Normal (6x6)", "Medium (7x7)", "Hard (8x8)"],
      basePoints: "15 - 25 pts",
      averageDuration: "~90s",
      mechanicType: "Constraint Satisfaction Grid",
    },
    {
      id: "tango",
      name: "Tango",
      theme: "Asset & Liability Balance",
      description: "Fill the grid with Sun and Moon symbols. No 3 consecutive same symbols. Equal symbols per row/col.",
      difficultyLevels: ["Easy (6x6)", "Medium (6x6 with constraints)"],
      basePoints: "15 - 20 pts",
      averageDuration: "~75s",
      mechanicType: "Binary Grid Deductions",
    },
    {
      id: "pinpoint",
      name: "Pinpoint",
      theme: "FinTech Vocabulary & Domain Logic",
      description: "Guess the hidden FinTech category from 5 progressive clue words with minimal reveals.",
      difficultyLevels: ["Daily Set (5 clues)"],
      basePoints: "20 pts (+ bonus per hidden clue)",
      averageDuration: "~45s",
      mechanicType: "Knowledge & Categorical Deduction",
    },
    {
      id: "crossclimb",
      name: "Crossclimb",
      theme: "LankaPay & Payment Rails Ascents",
      description: "Solve trivia clues to form words that differ by one letter, then reorder them into a chain.",
      difficultyLevels: ["5-Rung Climb"],
      basePoints: "25 pts",
      averageDuration: "~110s",
      mechanicType: "Word Ladder Trivia Climb",
    },
    {
      id: "zip",
      name: "Zip",
      theme: "Digital Transaction Rails Routing",
      description: "Connect numbered checkpoints by dragging a continuous non-intersecting path that fills every square.",
      difficultyLevels: ["5x5 Rails", "6x6 Rails"],
      basePoints: "20 pts",
      averageDuration: "~60s",
      mechanicType: "Hamiltonian Path Routing",
    },
    {
      id: "mini-sudoku",
      name: "Mini Sudoku",
      theme: "Cryptographic Hash Matrix",
      description: "Fill the 4x4 or 6x6 grid with numbers 1-N such that no row, column, or block repeats.",
      difficultyLevels: ["4x4 Beginner", "6x6 Challenge"],
      basePoints: "15 - 25 pts",
      averageDuration: "~80s",
      mechanicType: "Latin Square Logic",
    },
  ];

  const scoringRules = {
    basePoints: "15 to 25 depending on puzzle difficulty",
    speedBonus: "+5 points if solved in under 120 seconds",
    cleanBonus: "+5 points for 0 mistakes or hints",
    streakBonus: "+5 points for consecutive daily play",
    arenaIntegration: "Accumulated puzzle points feed into Arena prestige rank and optional start shields",
  };

  return NextResponse.json({
    totalPuzzles: puzzles.length,
    puzzles,
    scoringRules,
  });
}
