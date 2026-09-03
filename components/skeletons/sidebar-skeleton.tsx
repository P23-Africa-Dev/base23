import React from "react";

interface SidebarSkeletonProps {
  className?: string;
  showMobileHeader?: boolean;
}

export function SidebarSkeleton({
  className = "",
  showMobileHeader = true,
}: SidebarSkeletonProps) {
  return (
    <div className={className}>
      {/* ─── Mobile Top Bar Skeleton ────────────────────────────────────── */}
      {showMobileHeader && (
        <div className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-[#0B1727] px-5 lg:hidden animate-pulse">
          <div className="h-6 w-28 rounded-md bg-white/15" />
          <div className="h-10 w-10 rounded-xl bg-white/10" />
        </div>
      )}

      {/* ─── Desktop Aside Skeleton ─────────────────────────────────────── */}
      <aside className="sticky top-0 left-0 z-2 no-scrollbar hidden h-screen w-56 overflow-hidden text-white select-none lg:block bg-linear-to-b from-[#031C5B] via-[#0B1727] to-[#031C5B] animate-pulse">
        <div className="flex h-full flex-col justify-between">
          <div>
            {/* Logo placeholder */}
            <div className="px-5 pt-14">
              <div className="h-9 w-36 rounded-lg bg-white/15" />
            </div>

            {/* Navigation List Skeleton */}
            <nav className="mt-8 pl-5 space-y-2">
              {[
                { width: "w-24", active: true },
                { width: "w-20", active: false },
                { width: "w-24", active: false },
                { width: "w-22", active: false },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="relative flex items-center py-2.5 pl-3 pr-4"
                >
                  {item.active && (
                    <span className="absolute inset-y-0 left-0 right-0 rounded-l-full bg-white/10" />
                  )}
                  <div className="relative z-1 flex items-center gap-3 w-full">
                    <div className="h-9 w-9 rounded-full bg-white/10 shrink-0" />
                    <div className={`h-3.5 ${item.width} rounded bg-white/10`} />
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* User Account Section Skeleton */}
          <div className="relative px-5 pb-6 space-y-4">
            {/* Account Type Label */}
            <div className="h-3 w-28 rounded bg-white/10 opacity-70" />

            {/* User Profile Info */}
            <div className="flex items-center space-x-2.5">
              <div className="h-10 w-10 rounded-full bg-white/15 shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-3.5 w-24 rounded bg-white/15" />
                <div className="h-2.5 w-32 rounded bg-white/10" />
              </div>
            </div>

            {/* Account Action Items (Notifications, Help) */}
            <div className="space-y-3 pt-2 pl-2">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full bg-white/10 shrink-0" />
                <div className="h-3 w-22 rounded bg-white/10" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full bg-white/10 shrink-0" />
                <div className="h-3 w-16 rounded bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default SidebarSkeleton;
