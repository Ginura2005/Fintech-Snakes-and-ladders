import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin/admin-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/check
 * Returns whether the currently signed-in user has admin privileges
 * stored in the `admin_users` database table.
 */
export async function GET(request: NextRequest) {
  const result = await verifyAdminRequest(request);

  return NextResponse.json({
    isAdmin: result.isAdmin,
    email: result.email,
    role: result.role,
  });
}
