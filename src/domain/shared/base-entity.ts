/**
 * Base Entity - Domain-Driven Design Foundation
 * All domain entities extend this base class
 */

export abstract class BaseEntity<TId> {
  protected readonly _id: TId;
  protected readonly _createdAt: Date;
  protected _updatedAt: Date;
  private _domainEvents: DomainEvent[] = [];

  constructor(id: TId, createdAt?: Date) {
    this._id = id;
    this._createdAt = createdAt || new Date();
    this._updatedAt = this._createdAt;
  }

  get id(): TId {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  protected markAsUpdated(): void {
    this._updatedAt = new Date();
  }

  // Domain Events
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  get domainEvents(): readonly DomainEvent[] {
    return this._domainEvents;
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  equals(other: BaseEntity<TId>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this.constructor !== other.constructor) {
      return false;
    }
    return this._id === other._id;
  }
}

export interface DomainEvent {
  readonly type: string;
  readonly aggregateId: string;
  readonly occurredOn: Date;
  readonly payload: unknown;
}

