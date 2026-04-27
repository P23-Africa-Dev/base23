'use client';

export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6 px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-40 rounded-md bg-gray-200" />
        <div className="h-8 w-24 rounded-md bg-gray-200" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-gray-200"
          />
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart / main panel */}
        <div className="lg:col-span-2 space-y-4 rounded-xl bg-white p-4">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-48 w-full rounded-lg bg-gray-200" />
        </div>

        {/* Side panel */}
        <div className="space-y-4 rounded-xl bg-white p-4">
          <div className="h-4 w-28 rounded bg-gray-200" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-10 rounded bg-gray-200"
            />
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white p-4 space-y-3">
        <div className="h-4 w-40 rounded bg-gray-200" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-full rounded bg-gray-200"
          />
        ))}
      </div>
    </div>
  );
}
