/**
 * Create Discovery Call Command
 * CQRS Command for creating a discovery call
 */

export interface CreateDiscoveryCallCommand {
  companyId: string;
  personaId: string;
  settings: {
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    personality: 'friendly' | 'professional' | 'skeptical' | 'abrasive' | 'hostile';
    salesMethodology?: 'GAP' | 'SPIN' | 'MEDDIC' | 'BANT' | null;
  };
}

