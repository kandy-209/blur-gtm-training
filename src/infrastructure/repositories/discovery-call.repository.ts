/**
 * Discovery Call Repository Implementation
 * In-memory implementation (will be replaced with database)
 */

import { DiscoveryCall } from '@/domain/entities/discovery-call';
import { DiscoveryCallRepository as IDiscoveryCallRepository } from '@/application/repositories/discovery-call.repository';

export class DiscoveryCallRepository implements IDiscoveryCallRepository {
  private calls: Map<string, DiscoveryCall> = new Map();
  private userCalls: Map<string, string[]> = new Map(); // userId -> callIds

  async findById(id: string): Promise<DiscoveryCall | null> {
    return this.calls.get(id) || null;
  }

  async save(call: DiscoveryCall): Promise<void> {
    this.calls.set(call.id, call);
    // In real implementation, would track userId
  }

  async findByUserId(userId: string, limit: number = 100, offset: number = 0): Promise<DiscoveryCall[]> {
    const callIds = this.userCalls.get(userId) || [];
    const calls: DiscoveryCall[] = [];
    for (const id of callIds.slice(offset, offset + limit)) {
      const call = this.calls.get(id);
      if (call) {
        calls.push(call);
      }
    }
    return calls;
  }

  async findActiveByUserId(userId: string): Promise<DiscoveryCall[]> {
    const callIds = this.userCalls.get(userId) || [];
    const calls: DiscoveryCall[] = [];
    for (const id of callIds) {
      const call = this.calls.get(id);
      if (call && call.isActive) {
        calls.push(call);
      }
    }
    return calls;
  }
}

