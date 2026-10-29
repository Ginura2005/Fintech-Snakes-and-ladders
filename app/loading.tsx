import Image from "next/image";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-background text-white flex flex-col items-center justify-center p-6">
      <div className="relative flex flex-col items-center max-w-sm text-center space-y-6">
        <div className="relative w-48 h-12">
          <Image
            src="/long-logo-removebg-preview.png"
            alt="Sri Lanka FinTech Festival"
            fill
            className="object-contain"
            priority
          />
        </div>

        <LoadingSpinner size="lg" label="Loading Lanka FinTechverse…" />

        <p className="text-xs font-mono text-white/50 tracking-wider">
          Sri Lanka FinTech Festival 2026
        </p>
      </div>
    </div>
  );
}
