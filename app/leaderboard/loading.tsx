import FestivalLoadingScreen from "@/components/ui/FestivalLoadingScreen";

export default function LeaderboardLoading() {
  return (
    <FestivalLoadingScreen
      label="Loading Festival Leaderboard…"
      sublabel="Retrieving Verified Competitor Standings"
    />
  );
}
