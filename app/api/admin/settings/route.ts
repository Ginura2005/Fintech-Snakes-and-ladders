import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, logAdminAction } from "@/lib/admin/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/settings
 * Retrieves live festival settings (announcement banner & tournament state).
 */
export async function GET(request: NextRequest) {
  const { isAdmin } = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json(
      { error: "Unauthorized: Administrator privileges required" },
      { status: 403 }
    );
  }

  const db = createServiceClient();

  try {
    const { data, error } = await db.from("festival_settings").select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const settingsMap: Record<string, any> = {};
    (data || []).forEach((row: any) => {
      settingsMap[row.key] = row.value;
    });

    return NextResponse.json({ settings: settingsMap });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load settings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/settings
 * Updates announcement banner or tournament operational parameters.
 */
export async function POST(request: NextRequest) {
  const { isAdmin, email: actorEmail } = await verifyAdminRequest(request);
  if (!isAdmin || !actorEmail) {
    return NextResponse.json(
      { error: "Unauthorized: Administrator privileges required" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { key, value } = body;

    if (!key || typeof key !== "string" || value === undefined) {
      return NextResponse.json(
        { error: "Both key and value are required" },
        { status: 400 }
      );
    }

    const db = createServiceClient();

    const { error } = await db.from("festival_settings").upsert(
      {
        key,
        value,
        updated_by: actorEmail,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAdminAction(actorEmail, "update_settings", "settings", key, { value });

    return NextResponse.json({
      success: true,
      message: `Updated festival setting: ${key}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update setting" },
      { status: 500 }
    );
  }
}
