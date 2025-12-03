/**
 * Discovery Call Repository Interface
 * Repository pattern for DiscoveryCall aggregate
 */

import { DiscoveryCall } from '@/domain/entities/discovery-call';

export interface DiscoveryCallRepository {
  findById(id: string): Promise<DiscoveryCall | null>;
  save(call: DiscoveryCall): Promise<void>;
  findByUserId(userId: string, limit?: number, offset?: number): Promise<DiscoveryCall[]>;
  findActiveByUserId(userId: string): Promise<DiscoveryCall[]>;
}

