import Image from "next/image";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[#06061f] text-white flex flex-col items-center justify-center p-4">
      {/* Round Glowing Portal Card */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full border-2 border-[#fec01f]/60 bg-gradient-to-b from-[#12163a]/95 via-[#0a0c28]/98 to-[#06061f] shadow-[0_0_60px_rgba(254,192,31,0.35),inset_0_0_45px_rgba(18,22,58,0.85)] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {/* Animated concentric rings */}
        <div className="absolute inset-3 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute inset-6 rounded-full border border-[#fec01f]/20 pointer-events-none" />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#fec01f] border-r-teal-400 animate-spin pointer-events-none"
          style={{ animationDuration: "3.5s" }}
        />

        <div className="relative w-36 h-10 mb-2 z-10">
          <Image
            src="/long-logo-removebg-preview.png"
            alt="Sri Lanka FinTech Festival"
            fill
            className="object-contain"
            priority
          />
        </div>

        <LoadingSpinner size="md" label="Loading Lanka FinTechverse…" className="z-10" />

        <p className="text-[10px] font-mono text-white/50 tracking-widest uppercase mt-3 z-10">
          Sri Lanka FinTech Festival 2026
        </p>
      </div>
    </div>
  );
}
