import React from "react";

export function DashboardSkeleton() {
  return (
    <div className="w-full h-full animate-pulse p-4 lg:p-8 space-y-6 max-w-[1200px] mx-auto">
      {/* Top Greeting Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 sm:w-64 rounded-lg bg-gray-200/80 dark:bg-gray-800" />
          <div className="h-4 w-32 sm:w-44 rounded-md bg-gray-200/60 dark:bg-gray-800/60" />
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>

      {/* Top Cards Row Skeleton (Chart, Matching Status, Quick Stats) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Spline Area Chart placeholder */}
        <div className="h-40 rounded-2xl bg-gray-200/80 dark:bg-gray-800/80 p-4 flex flex-col justify-between">
          <div className="h-4 w-24 rounded bg-gray-300 dark:bg-gray-700" />
          <div className="h-20 w-full rounded-lg bg-gray-300/60 dark:bg-gray-700/60" />
          <div className="flex justify-between">
            <div className="h-3 w-16 rounded bg-gray-300 dark:bg-gray-700" />
            <div className="h-3 w-12 rounded bg-gray-300 dark:bg-gray-700" />
          </div>
        </div>

        {/* Card 2: Matching Status placeholder */}
        <div className="h-40 rounded-2xl bg-gray-200/80 dark:bg-gray-800/80 p-4 flex flex-col justify-between">
          <div className="h-4 w-32 rounded bg-gray-300 dark:bg-gray-700" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-gray-300/70 dark:bg-gray-700/70" />
            <div className="h-3 w-4/5 rounded bg-gray-300/70 dark:bg-gray-700/70" />
          </div>
          <div className="h-8 w-28 rounded-full bg-gray-300 dark:bg-gray-700" />
        </div>

        {/* Card 3: Referral / Performance metric */}
        <div className="h-40 rounded-2xl bg-gray-200/80 dark:bg-gray-800/80 p-4 hidden lg:flex flex-col justify-between">
          <div className="h-4 w-28 rounded bg-gray-300 dark:bg-gray-700" />
          <div className="h-12 w-24 rounded bg-gray-300/80 dark:bg-gray-700/80" />
          <div className="h-3 w-36 rounded bg-gray-300 dark:bg-gray-700" />
        </div>
      </div>

      {/* Tabs / Filter Row Skeleton */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="h-9 w-24 rounded-full bg-gray-200/60 dark:bg-gray-800/60" />
          <div className="h-9 w-24 rounded-full bg-gray-200/60 dark:bg-gray-800/60" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-gray-200/80 dark:bg-gray-800 hidden sm:block" />
      </div>

      {/* Slider / Smart Match Cards Row Skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-40 rounded bg-gray-200/80 dark:bg-gray-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/50 p-5 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-3 w-1/2 rounded bg-gray-200/70 dark:bg-gray-800/70" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-gray-200/60 dark:bg-gray-800/60" />
                <div className="h-3 w-5/6 rounded bg-gray-200/60 dark:bg-gray-800/60" />
              </div>
              <div className="flex gap-2 pt-1">
                <div className="h-6 w-16 rounded-full bg-gray-200/80 dark:bg-gray-800" />
                <div className="h-6 w-20 rounded-full bg-gray-200/80 dark:bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;
