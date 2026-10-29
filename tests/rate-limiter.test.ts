import { describe, it, expect, beforeEach } from "vitest";
import {
  checkRateLimit,
  checkTurnCooldown,
  acquireActionLock,
  releaseActionLock,
  getClientIp,
  resetRateLimitsForTesting,
} from "../lib/security/rate-limiter";

describe("Security & Rate Limiting Engine", () => {
  beforeEach(() => {
    resetRateLimitsForTesting();
  });

  describe("checkRateLimit", () => {
    it("allows requests under the window limit", async () => {
      const res1 = await checkRateLimit("user-test-1", { limit: 3, windowSeconds: 60 });
      expect(res1.success).toBe(true);
      expect(res1.remaining).toBe(2);

      const res2 = await checkRateLimit("user-test-1", { limit: 3, windowSeconds: 60 });
      expect(res2.success).toBe(true);
      expect(res2.remaining).toBe(1);

      const res3 = await checkRateLimit("user-test-1", { limit: 3, windowSeconds: 60 });
      expect(res3.success).toBe(true);
      expect(res3.remaining).toBe(0);
    });

    it("blocks requests that exceed the limit", async () => {
      const opts = { limit: 2, windowSeconds: 30 };
      await checkRateLimit("user-test-2", opts);
      await checkRateLimit("user-test-2", opts);

      const blocked = await checkRateLimit("user-test-2", opts);
      expect(blocked.success).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.retryAfter).toBeGreaterThan(0);
    });

    it("tracks different identifiers independently", async () => {
      const opts = { limit: 1, windowSeconds: 60 };
      const resA = await checkRateLimit("user-A", opts);
      const resB = await checkRateLimit("user-B", opts);

      expect(resA.success).toBe(true);
      expect(resB.success).toBe(true);

      const resABlocked = await checkRateLimit("user-A", opts);
      expect(resABlocked.success).toBe(false);
    });
  });

  describe("checkTurnCooldown (Anti-Speed-Hacking)", () => {
    it("allows initial roll immediately", () => {
      const result = checkTurnCooldown("player-cd-1", 1000);
      expect(result.allowed).toBe(true);
      expect(result.remainingMs).toBe(0);
    });

    it("rejects rolls attempted faster than cooldown window", () => {
      checkTurnCooldown("player-cd-2", 1000);
      const fastAttempt = checkTurnCooldown("player-cd-2", 1000);
      expect(fastAttempt.allowed).toBe(false);
      expect(fastAttempt.remainingMs).toBeGreaterThan(0);
      expect(fastAttempt.remainingMs).toBeLessThanOrEqual(1000);
    });

    it("allows roll after cooldown period expires", async () => {
      checkTurnCooldown("player-cd-3", 50); // 50ms cooldown for test
      await new Promise((r) => setTimeout(r, 60));
      const secondAttempt = checkTurnCooldown("player-cd-3", 50);
      expect(secondAttempt.allowed).toBe(true);
    });
  });

  describe("acquireActionLock & releaseActionLock", () => {
    it("acquires lock and blocks duplicate acquisition", () => {
      const lockKey = "roll:player-lock-1";
      expect(acquireActionLock(lockKey, 5000)).toBe(true);
      expect(acquireActionLock(lockKey, 5000)).toBe(false); // Locked
    });

    it("allows re-acquisition after release", () => {
      const lockKey = "roll:player-lock-2";
      expect(acquireActionLock(lockKey, 5000)).toBe(true);
      releaseActionLock(lockKey);
      expect(acquireActionLock(lockKey, 5000)).toBe(true);
    });

    it("auto-expires stale lock after ttl", async () => {
      const lockKey = "roll:player-lock-3";
      expect(acquireActionLock(lockKey, 40)).toBe(true);
      await new Promise((r) => setTimeout(r, 50));
      expect(acquireActionLock(lockKey, 40)).toBe(true);
    });
  });

  describe("getClientIp", () => {
    it("extracts from x-forwarded-for header", () => {
      const req = new Request("http://localhost/test", {
        headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
      });
      expect(getClientIp(req)).toBe("203.0.113.195");
    });

    it("extracts from cf-connecting-ip", () => {
      const req = new Request("http://localhost/test", {
        headers: { "cf-connecting-ip": "198.51.100.44" },
      });
      expect(getClientIp(req)).toBe("198.51.100.44");
    });

    it("falls back to 127.0.0.1 when no headers present", () => {
      const req = new Request("http://localhost/test");
      expect(getClientIp(req)).toBe("127.0.0.1");
    });
  });
});
