import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/audit-logs
 * Retrieves immutable chronological logs of administrative actions.
 */
export async function GET(request: NextRequest) {
  const { isAdmin } = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json(
      { error: "Unauthorized: Administrator privileges required" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);

  const db = createServiceClient();

  try {
    const { data, error } = await db
      .from("admin_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ logs: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load audit logs" },
      { status: 500 }
    );
  }
}
