import { describe, it, expect, vi } from "vitest";
import { isUserAdminByEmail, verifyAdminRequest } from "@/lib/admin/admin-auth";
import { NextRequest } from "next/server";

describe("Database-Driven Admin Authorization Engine", () => {
  it("rejects empty or null emails", async () => {
    const res1 = await isUserAdminByEmail(null);
    expect(res1.isAdmin).toBe(false);

    const res2 = await isUserAdminByEmail("");
    expect(res2.isAdmin).toBe(false);

    const res3 = await isUserAdminByEmail(undefined);
    expect(res3.isAdmin).toBe(false);
  });

  it("rejects unauthenticated requests by default", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/check");
    const result = await verifyAdminRequest(req);
    expect(result.isAdmin).toBe(false);
    expect(result.email).toBeNull();
  });

  it("authorizes service role bearer token for automated internal operations", async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key-123";
    const req = new NextRequest("http://localhost:3000/api/admin/check", {
      headers: { authorization: "Bearer test-service-key-123" },
    });
    const result = await verifyAdminRequest(req);
    expect(result.isAdmin).toBe(true);
    expect(result.role).toBe("superadmin");
  });

  it("ensures no hardcoded admin emails exist in lib/admin/admin-auth.ts", async () => {
    const fs = await import("fs");
    const code = fs.readFileSync("lib/admin/admin-auth.ts", "utf-8");
    expect(code).not.toContain("ginurabuddila@gmail.com");
    expect(code).not.toContain("buddilaginura@gmail.com");
    expect(code).not.toContain("admin@thegenerationalpha.com");
  });
});
