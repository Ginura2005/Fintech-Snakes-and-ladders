import React from "react";
import Skeleton from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-[#06061f] text-white flex flex-col">
      {/* Header Skeleton */}
      <div className="h-16 border-b border-white/10 px-4 sm:px-8 flex items-center justify-between">
        <Skeleton className="w-44 h-8" />
        <Skeleton className="w-28 h-9 rounded-xl" />
      </div>

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2"
            >
              <Skeleton className="w-24 h-3.5" />
              <Skeleton className="w-16 h-8" />
              <Skeleton className="w-20 h-3" />
            </div>
          ))}
        </div>

        {/* Tab Bar Skeleton */}
        <div className="flex gap-2 border-b border-white/10 pb-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="w-28 h-10 rounded-xl" />
          ))}
        </div>

        {/* Content Box Skeleton */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 h-96 flex items-center justify-center">
          <Skeleton className="w-48 h-6" />
        </div>
      </main>
    </div>
  );
}
