import React from "react";
import Skeleton from "@/components/ui/Skeleton";

export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen bg-[#06061f] text-white flex flex-col">
      {/* Header Skeleton */}
      <div className="h-16 border-b border-white/10 px-4 sm:px-8 flex items-center justify-between">
        <Skeleton className="w-36 h-8" />
        <div className="flex items-center gap-3">
          <Skeleton className="w-20 h-8 rounded-lg hidden sm:block" />
          <Skeleton className="w-24 h-9 rounded-xl" />
        </div>
      </div>

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-8">
        {/* Title & Banner Skeleton */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <Skeleton className="w-32 h-6 rounded-full mx-auto" />
          <Skeleton className="w-64 h-9 mx-auto" />
          <Skeleton className="w-80 h-4 mx-auto" />
        </div>

        {/* Podium Skeleton (Top 3) */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto items-end pt-8">
          {/* Rank 2 */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center space-y-3 h-48 justify-end">
            <Skeleton className="w-12 h-12 rounded-full" />
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-16 h-6" />
          </div>
          {/* Rank 1 */}
          <div className="p-5 rounded-2xl bg-white/[0.05] border border-[#fec01f]/30 flex flex-col items-center space-y-3 h-56 justify-end">
            <Skeleton className="w-14 h-14 rounded-full" />
            <Skeleton className="w-24 h-5" />
            <Skeleton className="w-20 h-7" />
          </div>
          {/* Rank 3 */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center space-y-3 h-44 justify-end">
            <Skeleton className="w-12 h-12 rounded-full" />
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-16 h-6" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="w-32 h-4" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-4" />
                <Skeleton className="w-16 h-5 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
