/**
 * LoadingSkeleton - Skeleton loader for content placeholders
 */

interface LoadingSkeletonProps {
  rows?: number;
  columns?: number;
  type?: 'table' | 'card' | 'list';
}

export function LoadingSkeleton({ rows = 5, columns = 4, type = 'table' }: LoadingSkeletonProps) {
  if (type === 'table') {
    return (
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="flex-1 h-8 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="space-y-4">
        <div className="h-40 bg-gray-200 rounded-lg animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  // list
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
