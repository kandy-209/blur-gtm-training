/**
 * Domain Error - Domain-Driven Design Pattern
 * Custom errors for domain violations
 */

export abstract class DomainError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidValueError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_VALUE');
  }
}

export class BusinessRuleViolationError extends DomainError {
  constructor(message: string) {
    super(message, 'BUSINESS_RULE_VIOLATION');
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entityName: string, id: string) {
    super(`${entityName} with id ${id} not found`, 'ENTITY_NOT_FOUND');
  }
}

