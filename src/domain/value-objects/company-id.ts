/**
 * Company ID - Value Object
 * Branded type for type safety
 */

import { ValueObject } from '../shared/value-object';

export class CompanyId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }

  protected validate(value: string): string {
    if (!value || value.trim().length === 0) {
      throw new Error('Company ID cannot be empty');
    }
    if (value.length > 255) {
      throw new Error('Company ID cannot exceed 255 characters');
    }
    return value.trim();
  }

  static generate(): CompanyId {
    return new CompanyId(
      `comp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    );
  }
}

