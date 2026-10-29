/**
 * Prevent open redirects: only allow same-origin relative paths.
 */
export function getSafeNextPath(
  raw: string | null | undefined,
  fallback = "/game"
): string {
  if (!raw) return fallback;
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return fallback;
  }

  if (!decoded.startsWith("/") || decoded.startsWith("//") || decoded.includes("://")) {
    return fallback;
  }

  // Block auth callback loops
  if (decoded.startsWith("/auth/")) {
    return fallback;
  }

  return decoded;
}
