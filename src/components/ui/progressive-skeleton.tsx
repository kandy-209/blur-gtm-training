'use client';

import { useEffect, useState } from 'react';
import { Skeleton, SkeletonProps } from './skeleton';
import { cn } from '@/lib/utils';

interface ProgressiveSkeletonProps extends SkeletonProps {
  delay?: number;
  stagger?: number;
  children?: React.ReactNode;
}

export function ProgressiveSkeleton({
  delay = 0,
  stagger = 0,
  className,
  children,
  ...props
}: ProgressiveSkeletonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn('animate-in fade-in', className)}
      style={{
        animationDelay: `${stagger}ms`,
      }}
    >
      {children || <Skeleton {...props} />}
    </div>
  );
}

interface ProgressiveSkeletonGroupProps {
  count: number;
  delay?: number;
  stagger?: number;
  renderItem?: (index: number) => React.ReactNode;
  className?: string;
}

export function ProgressiveSkeletonGroup({
  count,
  delay = 0,
  stagger = 50,
  renderItem,
  className,
}: ProgressiveSkeletonGroupProps) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <ProgressiveSkeleton
          key={index}
          delay={delay + index * stagger}
          stagger={stagger}
        >
          {renderItem ? renderItem(index) : <Skeleton variant="rounded" height={60} />}
        </ProgressiveSkeleton>
      ))}
    </div>
  );
}
