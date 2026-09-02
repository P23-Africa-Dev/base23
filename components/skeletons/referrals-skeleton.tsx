import React from "react";

export function ReferralsSkeleton() {
  return (
    <div className="w-full h-full animate-pulse p-4 lg:p-8 space-y-6 max-w-[1200px] mx-auto">
      {/* Header & Search Bar Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-44 sm:w-56 rounded-lg bg-gray-200/80 dark:bg-gray-800" />
          <div className="h-4 w-60 sm:w-80 rounded-md bg-gray-200/60 dark:bg-gray-800/60" />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="h-10 w-full sm:w-64 rounded-full bg-gray-200/80 dark:bg-gray-800" />
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
        </div>
      </div>

      {/* Featured Smart Matches Slider Skeleton */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="h-5 w-36 rounded bg-gray-200/80 dark:bg-gray-800" />
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>

        {/* 3 Slider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 p-5 space-y-4 shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-gray-200 dark:bg-gray-800 shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-3 w-20 rounded bg-gray-200/70 dark:bg-gray-800/70" />
                  </div>
                </div>
                <div className="h-8 w-14 rounded-full bg-[#27E6A7]/20" />
              </div>

              <div className="space-y-2 py-2">
                <div className="h-3 w-full rounded bg-gray-200/60 dark:bg-gray-800/60" />
                <div className="h-3 w-4/5 rounded bg-gray-200/60 dark:bg-gray-800/60" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/60">
                <div className="h-6 w-24 rounded-full bg-gray-200/60 dark:bg-gray-800/60" />
                <div className="h-9 w-24 rounded-xl bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area: Left match history & Right candidate list skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Left Column: Stats & Smart Match Graph Skeleton */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 p-5 space-y-4">
            <div className="h-5 w-36 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-44 w-full rounded-2xl bg-gray-200/60 dark:bg-gray-800/60" />
            <div className="space-y-2 pt-2">
              <div className="h-3 w-full rounded bg-gray-200/60 dark:bg-gray-800/60" />
              <div className="h-3 w-3/4 rounded bg-gray-200/60 dark:bg-gray-800/60" />
            </div>
          </div>
        </div>

        {/* Right Column: Connection Match Cards Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-3 w-48 rounded bg-gray-200/60 dark:bg-gray-800/60" />
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <div className="h-8 w-20 rounded-lg bg-gray-200/80 dark:bg-gray-800" />
                <div className="h-8 w-24 rounded-lg bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReferralsSkeleton;
