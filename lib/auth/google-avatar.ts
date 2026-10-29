import type { User } from "@supabase/supabase-js";

/**
 * Normalize Google profile photo URLs to a usable size.
 * Google often returns =s96-c; bump for clearer UI avatars.
 */
export function normalizeGoogleAvatarUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("googleusercontent.com")) return url;
    // Strip existing size suffix then request 256px
    const base = url.replace(/=s\d+(-c)?$/i, "");
    return `${base}=s256-c`;
  } catch {
    return url;
  }
}

/**
 * Decode a Google ID token payload (no verification — display claims only).
 */
export function decodeGoogleIdTokenPicture(credential: string): string | null {
  try {
    const payloadPart = credential.split(".")[1];
    if (!payloadPart) return null;
    const json = atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as { picture?: unknown };
    if (typeof payload.picture === "string" && /^https?:\/\//i.test(payload.picture)) {
      return normalizeGoogleAvatarUrl(payload.picture);
    }
  } catch {
    // ignore malformed tokens
  }
  return null;
}

function firstHttpUrl(candidates: unknown[]): string | null {
  for (const value of candidates) {
    if (typeof value === "string" && /^https?:\/\//i.test(value.trim())) {
      return normalizeGoogleAvatarUrl(value.trim());
    }
  }
  return null;
}

/**
 * Pull Google profile photo from Supabase user metadata / identity payloads.
 * Covers OAuth redirect and GIS signInWithIdToken shapes.
 */
export function getGoogleAvatarUrl(user: User | null | undefined): string | null {
  if (!user) return null;

  const meta = user.user_metadata ?? {};
  const fromMeta = firstHttpUrl([
    meta.avatar_url,
    meta.picture,
    meta.avatar,
    meta.photoURL,
    meta.photo_url,
  ]);
  if (fromMeta) return fromMeta;

  const fromIdentities = firstHttpUrl(
    (user.identities ?? []).flatMap((identity) => {
      const data = (identity.identity_data ?? {}) as Record<string, unknown>;
      return [data.avatar_url, data.picture, data.photo, data.avatar];
    })
  );
  if (fromIdentities) return fromIdentities;

  return null;
}

export function getGoogleDisplayName(user: User | null | undefined): string | null {
  if (!user) return null;
  const meta = user.user_metadata ?? {};
  const name =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    (typeof meta.preferred_username === "string" && meta.preferred_username) ||
    null;
  return name;
}

/** True when a stored avatar URL is a Google profile photo (size suffix ignored). */
export function isGoogleAvatarUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    return new URL(url).hostname.includes("googleusercontent.com");
  } catch {
    return false;
  }
}
