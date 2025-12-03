/**
 * Aggregate Root - Domain-Driven Design Pattern
 * Represents the root entity of an aggregate
 */

import { BaseEntity, DomainEvent } from './base-entity';

export abstract class AggregateRoot<TId> extends BaseEntity<TId> {
  private _version: number = 0;

  get version(): number {
    return this._version;
  }

  protected incrementVersion(): void {
    this._version++;
  }

  protected addDomainEvent(event: DomainEvent): void {
    super.addDomainEvent(event);
    this.incrementVersion();
  }
}

