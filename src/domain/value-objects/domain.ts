/**
 * Domain - Value Object
 * Represents a company domain (e.g., "acme.com")
 */

import { ValueObject } from '../shared/value-object';
import { InvalidValueError } from '../shared/domain-error';

export class Domain extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }

  protected validate(value: string): string {
    const trimmed = value.trim().toLowerCase();
    
    if (!trimmed) {
      throw new InvalidValueError('Domain cannot be empty');
    }

    // Basic domain validation regex
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    
    if (!domainRegex.test(trimmed)) {
      throw new InvalidValueError(`Invalid domain format: ${trimmed}`);
    }

    return trimmed;
  }

  get baseDomain(): string {
    const parts = this._value.split('.');
    if (parts.length >= 2) {
      return parts.slice(-2).join('.');
    }
    return this._value;
  }

  get subdomain(): string | null {
    const parts = this._value.split('.');
    if (parts.length > 2) {
      return parts.slice(0, -2).join('.');
    }
    return null;
  }
}

