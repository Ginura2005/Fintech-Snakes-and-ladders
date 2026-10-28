import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    // Optional query overrides (for testing or direct embedding)
    const queryName = searchParams.get("name");
    const queryScore = searchParams.get("score");
    const queryRank = searchParams.get("rank");
    const queryWon = searchParams.get("won");

    let displayName = queryName || "Festival Innovator";
    let finalScore = queryScore ? parseInt(queryScore, 10) : 1250;
    let rank: number | null = queryRank ? parseInt(queryRank, 10) : null;
    let playerWon = queryWon === "true";
    let hearts = 3;
    let quizCorrect = 3;
    let treasures = 1;

    // If token is provided, fetch actual run data from database
    if (token) {
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

      if (link?.run_id) {
        const { data: run } = await db
          .from("game_runs")
          .select(
            `id, status, player_score, player_won, player_quiz_correct, player_hearts,
             player_treasures_collected, player_profiles!inner(display_name, leaderboard_opt_in)`
          )
          .eq("id", link.run_id)
          .maybeSingle();

        if (run) {
          const profile = (run as any).player_profiles;
          displayName = profile?.display_name || "Festival Innovator";
          finalScore = run.player_score ?? 0;
          playerWon = run.player_won ?? false;
          hearts = run.player_hearts ?? 0;
          quizCorrect = run.player_quiz_correct ?? 0;
          treasures = (run.player_treasures_collected || []).length;

          if (profile?.leaderboard_opt_in) {
            const { count } = await db
              .from("leaderboard_entries")
              .select("id", { count: "exact" })
              .gt("final_score", run.player_score);
            rank = (count ?? 0) + 1;
          }
        }
      }
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "48px 56px",
            backgroundColor: "#06061f",
            backgroundImage: "radial-gradient(circle at 85% 15%, rgba(254, 192, 31, 0.18) 0%, transparent 45%), radial-gradient(circle at 15% 85%, rgba(18, 82, 82, 0.35) 0%, transparent 50%), linear-gradient(135deg, #06061f 0%, #0a0a2c 50%, #050518 100%)",
            color: "#ffffff",
            fontFamily: "system-ui, -apple-system, sans-serif",
            border: "8px solid #0d0d35",
            position: "relative",
          }}
        >
          {/* Decorative Corner Borders */}
          <div
            style={{
              position: "absolute",
              top: 24,
              left: 24,
              width: 32,
              height: 32,
              borderTop: "4px solid #fec01f",
              borderLeft: "4px solid #fec01f",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              width: 32,
              height: 32,
              borderTop: "4px solid #fec01f",
              borderRight: "4px solid #fec01f",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 24,
              left: 24,
              width: 32,
              height: 32,
              borderBottom: "4px solid #fec01f",
              borderLeft: "4px solid #fec01f",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 24,
              right: 24,
              width: 32,
              height: 32,
              borderBottom: "4px solid #fec01f",
              borderRight: "4px solid #fec01f",
            }}
          />

          {/* Top Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#fec01f",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                }}
              >
                SRI LANKA FINTECH FESTIVAL 2026
              </span>
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: "#ffffff",
                  letterSpacing: "0.05em",
                }}
              >
                LANKA FINTECHVERSE ARENA
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "rgba(254, 192, 31, 0.15)",
                border: "1.5px solid rgba(254, 192, 31, 0.4)",
                padding: "8px 18px",
                borderRadius: 999,
                color: "#fec01f",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              OFFICIAL ARENA SCORECARD
            </div>
          </div>

          {/* Middle Body: Player Name & Giant Golden Score */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              margin: "20px 0",
              backgroundColor: "rgba(10, 10, 40, 0.75)",
              border: "1.5px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 24,
              padding: "28px 36px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", maxWidth: 600 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgba(255, 255, 255, 0.55)",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                PLAYER HANDLE
              </span>
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  color: "#ffffff",
                  letterSpacing: "-0.02em",
                }}
              >
                {displayName}
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                <span
                  style={{
                    backgroundColor: playerWon ? "rgba(45, 212, 191, 0.2)" : "rgba(245, 114, 34, 0.2)",
                    border: playerWon ? "1px solid #2dd4bf" : "1px solid #f57222",
                    color: playerWon ? "#2dd4bf" : "#f57222",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 12px",
                    borderRadius: 8,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {playerWon ? "Arena Champion" : "Match Concluded"}
                </span>

                {rank !== null && (
                  <span
                    style={{
                      backgroundColor: "rgba(254, 192, 31, 0.2)",
                      border: "1px solid #fec01f",
                      color: "#fec01f",
                      fontSize: 12,
                      fontWeight: 800,
                      padding: "4px 12px",
                      borderRadius: 8,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Rank #{rank} on Leaderboard
                  </span>
                )}
              </div>
            </div>

            {/* Score Display */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                textAlign: "right",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "rgba(254, 192, 31, 0.8)",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                FINAL SCORE
              </span>
              <span
                style={{
                  fontSize: 68,
                  fontWeight: 900,
                  color: "#fec01f",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  textShadow: "0 0 35px rgba(254, 192, 31, 0.4)",
                }}
              >
                {finalScore.toLocaleString()}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: "rgba(255, 255, 255, 0.5)",
                  letterSpacing: "0.1em",
                  marginTop: 6,
                }}
              >
                TOURNAMENT POINTS
              </span>
            </div>
          </div>

          {/* Bottom Telemetry Metrics + Venue Details */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", gap: 14 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  padding: "8px 16px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgba(255, 255, 255, 0.85)",
                }}
              >
                ❤️ {hearts}/3 Hearts Left
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  padding: "8px 16px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgba(255, 255, 255, 0.85)",
                }}
              >
                ⭐ {quizCorrect} Quizzes Correct
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  padding: "8px 16px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgba(255, 255, 255, 0.85)",
                }}
              >
                💎 {treasures} Treasures
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                textAlign: "right",
                fontSize: 12,
                color: "rgba(255, 255, 255, 0.55)",
              }}
            >
              <span style={{ fontWeight: 700, color: "rgba(254, 192, 31, 0.9)" }}>
                Shangri-La Colombo · 2–3 November 2026
              </span>
              <span>Can you beat this score? Challenge at verse.fintechfestival.lk</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600",
        },
      }
    );
  } catch (err) {
    console.error("OpenGraph image generation failed:", err);
    return new Response("Failed to generate card image", { status: 500 });
  }
}
