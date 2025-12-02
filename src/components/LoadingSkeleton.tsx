'use client';

export function CardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-xl p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-xl p-6 animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-16"></div>
    </div>
  );
}

export function ResponseSkeleton() {
  return (
    <div className="border border-gray-200 rounded-xl p-5 animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="flex gap-4 pt-2 border-t border-gray-100">
        <div className="h-3 bg-gray-200 rounded w-16"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );
}

