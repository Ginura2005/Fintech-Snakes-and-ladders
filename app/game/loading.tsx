import React from "react";
import Skeleton from "@/components/ui/Skeleton";

export default function GameLoading() {
  return (
    <div className="min-h-screen bg-[#06061f] text-white flex flex-col">
      {/* Header Skeleton */}
      <div className="h-16 border-b border-white/10 px-4 sm:px-8 flex items-center justify-between">
        <Skeleton className="w-36 h-8" />
        <div className="flex items-center gap-3">
          <Skeleton className="w-16 h-8 rounded-lg hidden sm:block" />
          <Skeleton className="w-20 h-8 rounded-lg hidden sm:block" />
          <Skeleton className="w-24 h-9 rounded-xl" />
        </div>
      </div>

      <main className="flex-1 py-4 sm:py-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-4">
        {/* Match Header (Player vs Ava) Skeleton */}
        <div className="max-w-2xl mx-auto p-2 sm:p-3 rounded-2xl bg-white/[0.03] border border-white/10 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/[0.04]">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="w-16 h-3" />
              <Skeleton className="w-10 h-4" />
            </div>
          </div>
          <Skeleton className="w-12 h-6 rounded-full" />
          <div className="flex items-center justify-end gap-2 p-1.5 rounded-xl bg-white/[0.04]">
            <div className="space-y-1.5 text-right flex-1 flex flex-col items-end">
              <Skeleton className="w-14 h-3" />
              <Skeleton className="w-10 h-4" />
            </div>
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* Left Column: Board + Dice */}
          <div className="flex flex-col items-center space-y-4">
            {/* 5x5 Board Skeleton */}
            <div className="w-full max-w-[500px] aspect-square p-2.5 rounded-3xl bg-[#070720] border-2 border-white/15 shadow-2xl grid grid-cols-5 gap-1.5 sm:gap-2">
              {Array.from({ length: 25 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-white/[0.03] border border-white/5 flex flex-col justify-between p-1.5"
                >
                  <Skeleton className="w-3.5 h-3.5 rounded" />
                  <div className="flex justify-center">
                    <Skeleton className="w-4 h-4 rounded-full opacity-40" />
                  </div>
                </div>
              ))}
            </div>

            {/* Dice Panel Skeleton */}
            <div className="w-full max-w-sm p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="w-20 h-3" />
                <Skeleton className="w-16 h-5" />
              </div>
              <Skeleton className="w-28 h-11 rounded-xl" />
            </div>

            {/* Field Legend Pills Skeleton */}
            <div className="flex items-center justify-center gap-2">
              <Skeleton className="w-20 h-5 rounded-full" />
              <Skeleton className="w-24 h-5 rounded-full" />
              <Skeleton className="w-18 h-5 rounded-full" />
              <Skeleton className="w-24 h-5 rounded-full" />
            </div>
          </div>

          {/* Right Column: Event Log & Field Guide */}
          <div className="hidden lg:block space-y-4">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <Skeleton className="w-32 h-4" />
              <div className="space-y-2">
                <Skeleton className="w-full h-8 rounded-lg" />
                <Skeleton className="w-full h-8 rounded-lg" />
                <Skeleton className="w-full h-8 rounded-lg" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <Skeleton className="w-24 h-3.5" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-full h-4" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
