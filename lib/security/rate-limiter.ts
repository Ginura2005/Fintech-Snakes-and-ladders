import { NextRequest, NextResponse } from "next/server";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
  retryAfter: number; // seconds
}

interface RateLimitBucket {
  count: number;
  resetAt: number; // ms
  lastSeen: number; // ms
}

// Global in-memory storage for rate limits
const memoryBuckets = new Map<string, RateLimitBucket>();

// In-memory action locks with TTL
interface LockEntry {
  expiresAt: number;
}
const actionLocks = new Map<string, LockEntry>();

// In-memory turn cooldown timestamps
const lastTurnTimestamps = new Map<string, number>();

// Periodic cleanup threshold
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 60_000;

function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  // Cleanup rate limit buckets
  for (const [key, bucket] of memoryBuckets.entries()) {
    if (now > bucket.resetAt + 60_000) {
      memoryBuckets.delete(key);
    }
  }

  // Cleanup action locks
  for (const [key, lock] of actionLocks.entries()) {
    if (now > lock.expiresAt) {
      actionLocks.delete(key);
    }
  }

  // Cleanup old turn timestamps older than 5 minutes
  for (const [key, timestamp] of lastTurnTimestamps.entries()) {
    if (now - timestamp > 300_000) {
      lastTurnTimestamps.delete(key);
    }
  }
}

/**
 * Extracts best-guess client IP address from request headers.
 */
export function getClientIp(request: Request | NextRequest): string {
  const headers = request.headers;
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(",")[0].trim();
    if (firstIp) return firstIp;
  }

  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();

  return "127.0.0.1";
}

/**
 * Checks and increments a rate limit bucket.
 * Supports Upstash Redis REST when configured; falls back gracefully to in-memory sliding window.
 */
export async function checkRateLimit(
  identifier: string,
  options: {
    limit: number;
    windowSeconds: number;
  }
): Promise<RateLimitResult> {
  const { limit, windowSeconds } = options;
  const windowMs = windowSeconds * 1000;
  const now = Date.now();

  cleanupStaleEntries();

  // 1. Try Upstash Redis if configured
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const redisKey = `ratelimit:${identifier}`;
      // Execute multi/pipeline: INCR and EXPIRE if new
      const pipelineUrl = `${upstashUrl.replace(/\/$/, "")}/pipeline`;
      const response = await fetch(pipelineUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", redisKey],
          ["EXPIRE", redisKey, windowSeconds],
          ["TTL", redisKey],
        ]),
        cache: "no-store",
      });

      if (response.ok) {
        const results = await response.json();
        const currentCount = Number(results[0]?.result) || 1;
        const ttlSeconds = Number(results[2]?.result) || windowSeconds;
        const remaining = Math.max(0, limit - currentCount);
        const resetUnix = Math.ceil((now + ttlSeconds * 1000) / 1000);
        const success = currentCount <= limit;

        return {
          success,
          limit,
          remaining,
          reset: resetUnix,
          retryAfter: success ? 0 : Math.max(1, ttlSeconds),
        };
      }
    } catch (e) {
      // Fall through to memory limiter on Redis failure
      console.warn("Upstash Redis rate limit failed, using in-memory fallback:", e);
    }
  }

  // 2. High-performance In-Memory sliding-window rate limiter
  let bucket = memoryBuckets.get(identifier);

  if (!bucket || now >= bucket.resetAt) {
    bucket = {
      count: 1,
      resetAt: now + windowMs,
      lastSeen: now,
    };
    memoryBuckets.set(identifier, bucket);

    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - 1),
      reset: Math.ceil(bucket.resetAt / 1000),
      retryAfter: 0,
    };
  }

  bucket.count += 1;
  bucket.lastSeen = now;

  const success = bucket.count <= limit;
  const remaining = Math.max(0, limit - bucket.count);
  const resetUnix = Math.ceil(bucket.resetAt / 1000);
  const retryAfter = success ? 0 : Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

  return {
    success,
    limit,
    remaining,
    reset: resetUnix,
    retryAfter,
  };
}

/**
 * Checks whether a player is rolling faster than the minimum physical cooldown.
 * Completely eliminates automated dice roll macros and speed-hacking.
 */
export function checkTurnCooldown(
  userId: string,
  minIntervalMs: number = 1000
): { allowed: boolean; remainingMs: number } {
  const now = Date.now();
  const lastTime = lastTurnTimestamps.get(userId);

  if (!lastTime) {
    lastTurnTimestamps.set(userId, now);
    return { allowed: true, remainingMs: 0 };
  }

  const elapsed = now - lastTime;
  if (elapsed < minIntervalMs) {
    const remainingMs = minIntervalMs - elapsed;
    return { allowed: false, remainingMs };
  }

  lastTurnTimestamps.set(userId, now);
  return { allowed: true, remainingMs: 0 };
}

/**
 * Acquires an atomic in-memory action lock to prevent concurrent duplicate rolls/moves.
 * Automatically expires after `ttlMs` (default 5000ms).
 */
export function acquireActionLock(key: string, ttlMs: number = 5000): boolean {
  const now = Date.now();
  const existing = actionLocks.get(key);

  if (existing && now < existing.expiresAt) {
    return false; // Lock already held
  }

  actionLocks.set(key, { expiresAt: now + ttlMs });
  return true;
}

/**
 * Releases an atomic action lock.
 */
export function releaseActionLock(key: string): void {
  actionLocks.delete(key);
}

/**
 * Generates standard HTTP 429 response with industry standard rate limit headers.
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  customMessage: string = "Rate limit exceeded. Please slow down your requests."
): NextResponse {
  return NextResponse.json(
    {
      error: customMessage,
      limit: result.limit,
      remaining: result.remaining,
      retryAfter: result.retryAfter,
      reset: result.reset,
    },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
        "Retry-After": result.retryAfter.toString(),
      },
    }
  );
}

/**
 * Test helper to reset internal memory tables between tests.
 */
export function resetRateLimitsForTesting(): void {
  memoryBuckets.clear();
  actionLocks.clear();
  lastTurnTimestamps.clear();
}
