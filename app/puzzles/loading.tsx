import React from "react";
import Skeleton from "@/components/ui/Skeleton";

export default function PuzzlesLoading() {
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

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Banner Skeleton */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
          <Skeleton className="w-32 h-6 rounded-full" />
          <Skeleton className="w-80 h-9" />
          <Skeleton className="w-full max-w-md h-4" />
        </div>

        {/* 6 Puzzle Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="w-20 h-5 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-36 h-6" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-4/5 h-4" />
              </div>
              <div className="pt-2 flex items-center justify-between">
                <Skeleton className="w-16 h-4" />
                <Skeleton className="w-24 h-9 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
