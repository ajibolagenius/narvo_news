import React from 'react';

const Skeleton = ({ className = '', lines = 1, circle = false }) => {
  if (circle) {
    return <div className={`bg-[rgb(var(--color-surface))]/30 animate-pulse ${className}`} />;
  }
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-[rgb(var(--color-surface))]/30 animate-pulse"
          style={{ width: i === lines - 1 && lines > 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
};

export const NewsCardSkeleton = () => (
  <div className="narvo-border p-4 space-y-3" data-testid="news-skeleton">
    <div className="flex items-center gap-2">
      <div className="h-3 w-16 bg-[rgb(var(--color-surface))]/30 animate-pulse" />
      <div className="h-3 w-24 bg-[rgb(var(--color-surface))]/20 animate-pulse" />
    </div>
    <Skeleton lines={2} />
    <Skeleton className="w-3/4" />
    <div className="flex items-center gap-3 pt-1">
      <div className="h-3 w-20 bg-[rgb(var(--color-surface))]/20 animate-pulse" />
      <div className="h-3 w-12 bg-[rgb(var(--color-surface))]/20 animate-pulse" />
    </div>
  </div>
);

export const FeaturedSkeleton = () => (
  <div className="narvo-border p-5 md:p-8 space-y-4" data-testid="featured-skeleton">
    <div className="flex items-center gap-2 mb-2">
      <div className="h-4 w-20 bg-[rgb(var(--color-primary))]/20 animate-pulse" />
      <div className="h-3 w-32 bg-[rgb(var(--color-surface))]/20 animate-pulse" />
    </div>
    <div className="h-6 w-full bg-[rgb(var(--color-surface))]/30 animate-pulse" />
    <div className="h-6 w-3/4 bg-[rgb(var(--color-surface))]/30 animate-pulse" />
    <Skeleton lines={3} />
    <div className="flex items-center gap-4 pt-2">
      <div className="h-8 w-24 bg-[rgb(var(--color-primary))]/20 animate-pulse" />
      <div className="h-8 w-20 bg-[rgb(var(--color-surface))]/20 animate-pulse" />
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-4 p-4 md:p-8" data-testid="dashboard-skeleton">
    <FeaturedSkeleton />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default Skeleton;
