/**
 * Generate Persona Command
 * CQRS Command for generating a prospect persona
 */

import { CompanyId } from '@/domain/value-objects/company-id';

export interface GeneratePersonaCommand {
  companyId: string;
  settings: {
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    personality: 'friendly' | 'professional' | 'skeptical' | 'abrasive' | 'hostile';
    role?: 'CTO' | 'VP Engineering' | 'Staff Engineer' | 'Engineering Manager';
  };
}

