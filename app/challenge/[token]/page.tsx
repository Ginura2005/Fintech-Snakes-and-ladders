import type { Metadata } from "next";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import ChallengeClient from "./ChallengeClient";

export const dynamic = "force-dynamic";

interface ChallengePageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({
  params,
}: ChallengePageProps): Promise<Metadata> {
  const { token } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://verse.fintechfestival.lk";

  const defaultMeta: Metadata = {
    title: "Arena Challenge | Lanka FinTechverse",
    description: "Can you beat this score in Lanka FinTechverse? Race against autonomous AI at the Sri Lanka FinTech Festival 2026.",
    openGraph: {
      title: "Arena Challenge | Lanka FinTechverse",
      description: "Can you beat this score in Lanka FinTechverse? Race against autonomous AI at the Sri Lanka FinTech Festival 2026.",
      url: `${baseUrl}/challenge/${token}`,
      images: [
        {
          url: `${baseUrl}/api/og/challenge?token=${token}`,
          width: 1200,
          height: 630,
          alt: "Lanka FinTechverse Challenge Scorecard",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Arena Challenge | Lanka FinTechverse",
      description: "Can you beat this score in Lanka FinTechverse? Race against autonomous AI at the Sri Lanka FinTech Festival 2026.",
      images: [`${baseUrl}/api/og/challenge?token=${token}`],
    },
  };

  try {
    const hasServiceKey = Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY !== process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY !== process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );
    const serviceClient = createServiceClient();
    const supabase = await createClient();
    const db = hasServiceKey ? serviceClient : supabase;

    const { data: link } = await db
      .from("challenge_links")
      .select("run_id")
      .eq("token", token)
      .maybeSingle();

    if (!link?.run_id) return defaultMeta;

    const { data: run } = await db
      .from("game_runs")
      .select(
        `player_score, player_profiles!inner(display_name, leaderboard_opt_in)`
      )
      .eq("id", link.run_id)
      .maybeSingle();

    if (!run) return defaultMeta;

    const profile = (run as any).player_profiles;
    const name = profile?.display_name || "A challenger";
    const score = (run.player_score ?? 0).toLocaleString();

    const title = `${name} scored ${score} pts in Lanka FinTechverse!`;
    const description = `Can you beat ${name}'s score? Step into the official arena at the Sri Lanka FinTech Festival 2026.`;
    const ogImageUrl = `${baseUrl}/api/og/challenge?token=${token}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${baseUrl}/challenge/${token}`,
        siteName: "Sri Lanka FinTech Festival 2026",
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${name}'s Arena Scorecard`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImageUrl],
      },
    };
  } catch (err) {
    console.error("Error generating challenge metadata:", err);
    return defaultMeta;
  }
}

export default async function ChallengePage({ params }: ChallengePageProps) {
  const { token } = await params;
  return <ChallengeClient token={token} />;
}
