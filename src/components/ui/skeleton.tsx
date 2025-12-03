import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className,
  style,
  ...props
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-800';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };

  const combinedStyle = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    ...style,
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={combinedStyle}
      aria-label="Loading..."
      aria-live="polite"
      {...props}
    />
  );
}

// Pre-built skeleton components for common patterns
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('border border-gray-200 rounded-lg p-6 space-y-4', className)}>
      <Skeleton variant="rounded" height={24} width="60%" />
      <Skeleton variant="text" height={16} width="100%" />
      <Skeleton variant="text" height={16} width="80%" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-4 gap-4 pb-2">
        <Skeleton variant="rounded" height={20} />
        <Skeleton variant="rounded" height={20} />
        <Skeleton variant="rounded" height={20} />
        <Skeleton variant="rounded" height={20} />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-4">
          <Skeleton variant="rounded" height={16} />
          <Skeleton variant="rounded" height={16} />
          <Skeleton variant="rounded" height={16} />
          <Skeleton variant="rounded" height={16} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="rounded" height={16} width="60%" />
            <Skeleton variant="text" height={12} width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-2">
          <Skeleton variant="text" height={12} width="60%" />
          <Skeleton variant="rounded" height={32} width="40%" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ height = 300 }: { height?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton variant="rounded" height={24} width="40%" />
        <Skeleton variant="rounded" height={20} width="20%" />
      </div>
      <Skeleton variant="rounded" height={height} width="100%" />
    </div>
  );
}

