import { NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";

export type AdminRole = "superadmin" | "admin" | "arbiter" | "booth_staff";

export interface AdminVerificationResult {
  isAdmin: boolean;
  email: string | null;
  role: AdminRole | null;
  userId: string | null;
}

/**
 * Checks whether an email has administrative privileges by querying
 * the `admin_users` table in the database.
 * NOTE: Absolutely no hardcoded emails — privilege is fully database-driven.
 */
export async function isUserAdminByEmail(
  email: string | null | undefined
): Promise<{ isAdmin: boolean; role: AdminRole | null }> {
  if (!email || typeof email !== "string") {
    return { isAdmin: false, role: null };
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const db = createServiceClient();
    const { data, error } = await db
      .from("admin_users")
      .select("email, role")
      .ilike("email", cleanEmail)
      .maybeSingle();

    if (error) {
      console.error("Database query error checking admin_users:", error.message);
      return { isAdmin: false, role: null };
    }

    if (data && data.email) {
      return { isAdmin: true, role: (data.role as AdminRole) || "admin" };
    }

    return { isAdmin: false, role: null };
  } catch (err: any) {
    console.error("Exception checking admin_users table:", err?.message || err);
    return { isAdmin: false, role: null };
  }
}

/**
 * Verifies whether the incoming HTTP request belongs to an authenticated
 * administrator whose account exists in the `admin_users` database table.
 */
export async function verifyAdminRequest(
  request?: NextRequest,
  requiredRole?: AdminRole
): Promise<AdminVerificationResult> {
  // 1. Check service-role Authorization header (for internal automation / testing)
  if (request) {
    const authHeader = request.headers.get("authorization");
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (
      serviceKey &&
      authHeader &&
      authHeader === `Bearer ${serviceKey}`
    ) {
      return {
        isAdmin: true,
        email: "service_role@system.internal",
        role: "superadmin",
        userId: "service_role",
      };
    }
  }

  // 2. Check Supabase authenticated user session
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
      return {
        isAdmin: false,
        email: null,
        role: null,
        userId: null,
      };
    }

    // Verify privilege against the database table
    const { isAdmin, role } = await isUserAdminByEmail(user.email);

    if (!isAdmin || !role) {
      return {
        isAdmin: false,
        email: user.email,
        role: null,
        userId: user.id,
      };
    }

    // Rate Limiting: Max 80 admin operations per 60s per admin user
    if (request) {
      const clientIp = getClientIp(request);
      const rateLimit = await checkRateLimit(`admin:${user.id}:${clientIp}`, {
        limit: 80,
        windowSeconds: 60,
      });
      if (!rateLimit.success) {
        return {
          isAdmin: false,
          email: user.email,
          role: null,
          userId: user.id,
        };
      }
    }

    // If a specific minimum role is required:
    if (requiredRole && !hasSufficientRole(role, requiredRole)) {
      return {
        isAdmin: false,
        email: user.email,
        role,
        userId: user.id,
      };
    }

    return {
      isAdmin: true,
      email: user.email,
      role,
      userId: user.id,
    };
  } catch (err: any) {
    return {
      isAdmin: false,
      email: null,
      role: null,
      userId: null,
    };
  }
}

/**
 * Role hierarchy:
 * superadmin > admin > arbiter > booth_staff
 */
export function hasSufficientRole(currentRole: AdminRole, requiredRole: AdminRole): boolean {
  const levels: Record<AdminRole, number> = {
    superadmin: 4,
    admin: 3,
    arbiter: 2,
    booth_staff: 1,
  };

  return (levels[currentRole] || 0) >= (levels[requiredRole] || 0);
}

/**
 * Logs an administrative action into the `admin_audit_logs` database table.
 */
export async function logAdminAction(
  actorEmail: string,
  action: string,
  targetType: "run" | "user" | "role" | "announcement" | "settings" | "leaderboard",
  targetId?: string,
  details: Record<string, any> = {}
): Promise<void> {
  try {
    const db = createServiceClient();
    await db.from("admin_audit_logs").insert({
      actor_email: actorEmail,
      action,
      target_type: targetType,
      target_id: targetId || null,
      details,
    });
  } catch (err) {
    console.error("Failed to write to admin_audit_logs:", err);
  }
}
