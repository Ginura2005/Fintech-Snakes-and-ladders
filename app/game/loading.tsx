import FestivalLoadingScreen from "@/components/ui/FestivalLoadingScreen";

export default function GameLoading() {
  return (
    <FestivalLoadingScreen
      label="Connecting to Arena Host…"
      sublabel="Preparing 25 Squares & Match Physics"
    />
  );
}
