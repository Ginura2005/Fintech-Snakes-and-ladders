import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminRequest,
  logAdminAction,
  AdminRole,
} from "@/lib/admin/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/roles
 * Fetches the active list of administrators from `admin_users`
 * and recent player profiles to facilitate promoting users.
 */
export async function GET(request: NextRequest) {
  const { isAdmin, role, email } = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json(
      { error: "Unauthorized: Administrator privileges required" },
      { status: 403 }
    );
  }

  const db = createServiceClient();

  try {
    // 1. Fetch all admin users
    const { data: adminUsers, error: adminError } = await db
      .from("admin_users")
      .select("id, email, role, created_at")
      .order("created_at", { ascending: true });

    if (adminError) {
      return NextResponse.json({ error: adminError.message }, { status: 500 });
    }

    // 2. Fetch recent player profiles for candidate selection
    const { data: players } = await db
      .from("player_profiles")
      .select("id, display_name, created_at")
      .order("created_at", { ascending: false })
      .limit(30);

    return NextResponse.json({
      adminUsers: adminUsers || [],
      recentPlayers: players || [],
      currentUser: { email, role },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load roles" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/roles
 * Adds a new user or updates an existing user's role in `admin_users`.
 * Requires at least 'admin' privilege; changing or granting 'superadmin' requires 'superadmin'.
 */
export async function POST(request: NextRequest) {
  const { isAdmin, role: currentRole, email: actorEmail } = await verifyAdminRequest(request);
  if (!isAdmin || !actorEmail) {
    return NextResponse.json(
      { error: "Unauthorized: Administrator privileges required" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { email: rawEmail, role: targetRole } = body;

    if (!rawEmail || typeof rawEmail !== "string") {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase();
    const validRoles: AdminRole[] = ["superadmin", "admin", "arbiter", "booth_staff"];

    if (!validRoles.includes(targetRole)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    // Only superadmin can assign superadmin role
    if (targetRole === "superadmin" && currentRole !== "superadmin") {
      return NextResponse.json(
        { error: "Only a Superadmin can assign or transfer the Superadmin role" },
        { status: 403 }
      );
    }

    const db = createServiceClient();

    // Check if user already exists
    const { data: existing } = await db
      .from("admin_users")
      .select("id, email, role")
      .ilike("email", email)
      .maybeSingle();

    if (existing) {
      // Update role
      const { error: updateError } = await db
        .from("admin_users")
        .update({ role: targetRole })
        .eq("id", existing.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      await logAdminAction(actorEmail, "update_role", "role", email, {
        previousRole: existing.role,
        newRole: targetRole,
      });

      return NextResponse.json({
        success: true,
        message: `Updated role for ${email} to ${targetRole}`,
      });
    } else {
      // Insert new admin user
      const { error: insertError } = await db
        .from("admin_users")
        .insert({ email, role: targetRole });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      await logAdminAction(actorEmail, "add_admin", "user", email, {
        assignedRole: targetRole,
      });

      return NextResponse.json({
        success: true,
        message: `Added ${email} with role ${targetRole}`,
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update user role" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/roles
 * Revokes administrative access for a user.
 * Requires 'superadmin' role. Cannot delete self if last superadmin.
 */
export async function DELETE(request: NextRequest) {
  const { isAdmin, role: currentRole, email: actorEmail } = await verifyAdminRequest(request);
  if (!isAdmin || currentRole !== "superadmin" || !actorEmail) {
    return NextResponse.json(
      { error: "Forbidden: Superadmin privilege required to revoke admin access" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const targetEmail = searchParams.get("email")?.trim().toLowerCase();

  if (!targetEmail) {
    return NextResponse.json({ error: "Missing email parameter" }, { status: 400 });
  }

  if (targetEmail === actorEmail.toLowerCase()) {
    return NextResponse.json(
      { error: "You cannot revoke your own administrator account" },
      { status: 400 }
    );
  }

  const db = createServiceClient();

  try {
    const { error } = await db
      .from("admin_users")
      .delete()
      .ilike("email", targetEmail);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAdminAction(actorEmail, "revoke_admin", "user", targetEmail);

    return NextResponse.json({
      success: true,
      message: `Revoked administrative access for ${targetEmail}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to revoke admin user" },
      { status: 500 }
    );
  }
}
