import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin/admin-auth";
import { QUIZ_BANK } from "@/lib/game-engine/quiz-bank";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { isAdmin } = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized: Administrator privileges required" }, { status: 403 });
  }

  const db = createServiceClient();

  try {
    // Fetch all quiz attempts from Supabase
    const { data: attempts, error } = await db
      .from("quiz_attempts")
      .select("question_id, is_correct, selected_option");

    // Aggregate attempts by question_id
    const attemptsMap = new Map<string, { total: number; correct: number }>();

    if (attempts && !error) {
      for (const a of attempts) {
        const qid = a.question_id;
        const current = attemptsMap.get(qid) || { total: 0, correct: 0 };
        current.total += 1;
        if (a.is_correct) current.correct += 1;
        attemptsMap.set(qid, current);
      }
    }

    // Enrich QUIZ_BANK
    const enrichedQuestions = QUIZ_BANK.map((q) => {
      const stats = attemptsMap.get(q.id) || { total: 0, correct: 0 };
      const accuracyRate =
        stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;

      return {
        ...q,
        stats: {
          totalAttempts: stats.total,
          correctCount: stats.correct,
          wrongCount: stats.total - stats.correct,
          accuracyRate,
        },
      };
    });

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    for (const q of QUIZ_BANK) {
      categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
    }

    return NextResponse.json({
      totalQuestions: QUIZ_BANK.length,
      categories: categoryCounts,
      questions: enrichedQuestions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load quiz analytics" },
      { status: 500 }
    );
  }
}
