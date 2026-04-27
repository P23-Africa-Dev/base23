import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonLoadersProps {
  className?: string;
}

// Text line skeleton with shimmer effect
export function SkeletonText({ className = "" }: SkeletonLoadersProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

// Multiple text lines skeleton
export function SkeletonTextLines({ lines = 3, className = "" }: SkeletonLoadersProps & { lines?: number }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${
            i === lines - 1 ? 'w-2/3' : i === 0 ? 'w-full' : 'w-5/6'
          }`} 
        />
      ))}
    </div>
  );
}

// Avatar skeleton
export function SkeletonAvatar({ size = "md", className = "" }: SkeletonLoadersProps & { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-16 w-16"
  };
  
  return (
    <Skeleton className={`${sizeClasses[size]} rounded-full ${className}`} />
  );
}

// Card skeleton
export function SkeletonCard({ className = "" }: SkeletonLoadersProps) {
  return (
    <div className={`p-4 border rounded-lg space-y-3 ${className}`}>
      <div className="flex items-center space-x-3">
        <SkeletonAvatar />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonTextLines lines={2} />
    </div>
  );
}

// User card skeleton (for dashboard/directory)
export function SkeletonUserCard({ className = "" }: SkeletonLoadersProps) {
  return (
    <div className={`p-4 bg-white rounded-lg shadow space-y-3 ${className}`}>
      <div className="flex items-center space-x-3">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
}

// Chat/Message skeleton
export function SkeletonChatItem({ className = "" }: SkeletonLoadersProps) {
  return (
    <div className={`flex items-center space-x-3 p-3 ${className}`}>
      <SkeletonAvatar size="md" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

// Chart skeleton
export function SkeletonChart({ className = "" }: SkeletonLoadersProps) {
  return (
    <div className={`p-4 space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
  );
}

// Stats box skeleton
export function SkeletonStatsBox({ className = "" }: SkeletonLoadersProps) {
  return (
    <div className={`p-4 bg-white rounded-lg shadow space-y-3 ${className}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-6 w-6 rounded" />
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-4" />
      </div>
    </div>
  );
}

// Message bubble skeleton
export function SkeletonMessage({ isOwner = false, className = "" }: SkeletonLoadersProps & { isOwner?: boolean }) {
  return (
    <div className={`flex ${isOwner ? 'justify-end' : 'justify-start'} ${className}`}>
      <div className={`max-w-xs space-y-2 ${isOwner ? 'items-end' : 'items-start'} flex flex-col`}>
        <Skeleton className={`h-8 ${isOwner ? 'w-32' : 'w-40'} rounded-full`} />
        {Math.random() > 0.5 && (
          <Skeleton className={`h-6 ${isOwner ? 'w-24' : 'w-28'} rounded-full`} />
        )}
      </div>
    </div>
  );
}

// Search bar skeleton
export function SkeletonSearchBar({ className = "" }: SkeletonLoadersProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="flex-1">
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
  );
}

// Directory page specific skeleton
export function SkeletonDirectoryGrid({ count = 6, className = "" }: SkeletonLoadersProps & { count?: number }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonUserCard key={i} />
      ))}
    </div>
  );
}

// Dashboard stats section skeleton
export function SkeletonDashboardStats({ className = "" }: SkeletonLoadersProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      <SkeletonStatsBox />
      <SkeletonStatsBox />
      <SkeletonChart />
    </div>
  );
}