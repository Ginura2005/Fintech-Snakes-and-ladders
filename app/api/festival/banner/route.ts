import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/festival/banner
 * Publicly accessible endpoint returning the active live festival announcement
 * banner and current tournament operational state.
 */
export async function GET() {
  try {
    const db = createServiceClient();
    const { data } = await db.from("festival_settings").select("key, value");

    const settingsMap: Record<string, any> = {};
    (data || []).forEach((row: any) => {
      settingsMap[row.key] = row.value;
    });

    return NextResponse.json({
      announcement: settingsMap.announcement || { enabled: false },
      tournamentState: settingsMap.tournament_state || { status: "open" },
    });
  } catch (err) {
    return NextResponse.json({
      announcement: { enabled: false },
      tournamentState: { status: "open" },
    });
  }
}
