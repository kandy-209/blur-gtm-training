'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect old admin/scenarios route to new scenario-builder route
export default function AdminScenariosRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/scenario-builder');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Redirecting to Scenario Builder...</p>
    </div>
  );
}
