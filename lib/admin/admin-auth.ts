import { NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export interface AdminVerificationResult {
  isAdmin: boolean;
  email: string | null;
  role: string | null;
  userId: string | null;
}

/**
 * Checks whether an email has administrative privileges by querying
 * the `admin_users` table in the database.
 * NOTE: Absolutely no hardcoded emails — privilege is fully database-driven.
 */
export async function isUserAdminByEmail(
  email: string | null | undefined
): Promise<{ isAdmin: boolean; role: string | null }> {
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
      return { isAdmin: true, role: data.role || "admin" };
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
  request?: NextRequest
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

    return {
      isAdmin,
      email: user.email,
      role,
      userId: user.id,
    };
  } catch (err: any) {
    // Expected in standalone unit tests without Next.js request context
    return {
      isAdmin: false,
      email: null,
      role: null,
      userId: null,
    };
  }
}
