/**
 * New Code-Aware Discovery Call Page
 * Start a new discovery call practice session
 */

import { CompanyAnalyzer } from '@/components/CodeAwareDiscovery/CompanyAnalyzer';

export default function NewDiscoveryCallPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <CompanyAnalyzer />
      </div>
    </div>
  );
}

