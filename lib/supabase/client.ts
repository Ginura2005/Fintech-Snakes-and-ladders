import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://vqzyogpdecdqithvnarg.supabase.co";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_s5SduLYiklyi0zbHAY9qdA_DSv7ZOK2";

  return createBrowserClient(url, anonKey);
}
