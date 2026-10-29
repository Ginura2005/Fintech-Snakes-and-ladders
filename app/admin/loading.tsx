import FestivalLoadingScreen from "@/components/ui/FestivalLoadingScreen";

export default function AdminLoading() {
  return (
    <FestivalLoadingScreen
      label="Authenticating Control Deck…"
      sublabel="Verifying Official Administrator Privileges"
    />
  );
}
