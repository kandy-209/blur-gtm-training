/**
 * GitHub Repository - Value Object
 * Represents a GitHub repository URL or identifier
 */

import { ValueObject } from '../shared/value-object';
import { InvalidValueError } from '../shared/domain-error';

export class GitHubRepo extends ValueObject<string> {
  private readonly _owner: string;
  private readonly _name: string;
  private readonly _fullName: string;

  constructor(value: string) {
    super(value);
    const parsed = this.parse(value);
    this._owner = parsed.owner;
    this._name = parsed.name;
    this._fullName = `${parsed.owner}/${parsed.name}`;
  }

  protected validate(value: string): string {
    const trimmed = value.trim();
    
    if (!trimmed) {
      throw new InvalidValueError('GitHub repository cannot be empty');
    }

    // Validate format: owner/repo or https://github.com/owner/repo
    const urlPattern = /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/.*)?$/;
    const shortPattern = /^([^\/]+)\/([^\/]+)$/;

    if (!urlPattern.test(trimmed) && !shortPattern.test(trimmed)) {
      throw new InvalidValueError(`Invalid GitHub repository format: ${trimmed}`);
    }

    return trimmed;
  }

  private parse(value: string): { owner: string; name: string } {
    const urlMatch = value.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    const shortMatch = value.match(/^([^\/]+)\/([^\/]+)$/);

    if (urlMatch) {
      return { owner: urlMatch[1], name: urlMatch[2] };
    }

    if (shortMatch) {
      return { owner: shortMatch[1], name: shortMatch[2] };
    }

    throw new InvalidValueError(`Cannot parse GitHub repository: ${value}`);
  }

  get owner(): string {
    return this._owner;
  }

  get name(): string {
    return this._name;
  }

  get fullName(): string {
    return this._fullName;
  }

  get url(): string {
    return `https://github.com/${this._owner}/${this._name}`;
  }
}

