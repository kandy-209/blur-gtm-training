/**
 * Discovery Call Page
 * Active discovery call practice session
 */

import { DiscoveryCall } from '@/components/CodeAwareDiscovery/DiscoveryCall';

interface PageProps {
  params: Promise<{
    callId: string;
  }>;
}

export default async function DiscoveryCallPage({ params }: PageProps) {
  // Await params (Next.js 15+)
  const { callId } = await params;

  // In real implementation, would fetch call data
  const companyId = 'stub_company_id';
  const personaId = 'stub_persona_id';

  return (
    <DiscoveryCall
      callId={callId}
      companyId={companyId}
      personaId={personaId}
    />
  );
}

