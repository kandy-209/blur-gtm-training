/**
 * API Key Validator
 * Validates API keys against their configuration rules
 */

import { ApiKeyConfig, API_KEY_CONFIGS } from './config';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

/**
 * Validate a single API key
 */
export function validateApiKey(config: ApiKeyConfig, value: string | undefined): ValidationResult {
  // Check if value exists
  if (!value || value.trim() === '') {
    if (config.required) {
      return {
        valid: false,
        error: `${config.name} is required but not set`,
      };
    }
    return {
      valid: true,
      warnings: [`${config.name} is optional but not set`],
    };
  }

  const trimmed = value.trim();
  const warnings: string[] = [];

  // Validate minimum length
  if (config.validation?.minLength && trimmed.length < config.validation.minLength) {
    return {
      valid: false,
      error: `${config.name} is too short (minimum ${config.validation.minLength} characters)`,
    };
  }

  // Validate starts with
  if (config.validation?.startsWith) {
    const matches = config.validation.startsWith.some(prefix => trimmed.startsWith(prefix));
    if (!matches) {
      return {
        valid: false,
        error: `${config.name} should start with one of: ${config.validation.startsWith.join(', ')}`,
      };
    }
  }

  // Validate pattern
  if (config.validation?.pattern) {
    if (!config.validation.pattern.test(trimmed)) {
      return {
        valid: false,
        error: `${config.name} format is invalid`,
      };
    }
  }

  // Validate URL
  if (config.validation?.url) {
    try {
      new URL(trimmed);
    } catch {
      return {
        valid: false,
        error: `${config.name} must be a valid URL`,
      };
    }
  }

  // Check if value looks like a placeholder
  if (trimmed.includes('your_') || trimmed.includes('YOUR_') || trimmed === '...') {
    warnings.push(`${config.name} appears to be a placeholder value`);
  }

  return {
    valid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Validate all API keys from environment
 */
export function validateAllApiKeys(): {
  valid: boolean;
  results: Record<string, ValidationResult>;
  summary: {
    total: number;
    valid: number;
    invalid: number;
    missing: number;
    warnings: number;
  };
} {
  const results: Record<string, ValidationResult> = {};
  let validCount = 0;
  let invalidCount = 0;
  let missingCount = 0;
  let warningCount = 0;

  for (const config of API_KEY_CONFIGS) {
    const value = process.env[config.envVar];
    const result = validateApiKey(config, value);

    results[config.envVar] = result;

    if (!result.valid) {
      invalidCount++;
      if (!value) {
        missingCount++;
      }
    } else {
      validCount++;
      if (result.warnings && result.warnings.length > 0) {
        warningCount++;
      }
    }
  }

  return {
    valid: invalidCount === 0,
    results,
    summary: {
      total: API_KEY_CONFIGS.length,
      valid: validCount,
      invalid: invalidCount,
      missing: missingCount,
      warnings: warningCount,
    },
  };
}

/**
 * Get API key status (without exposing values)
 */
export function getApiKeyStatus(): {
  [key: string]: {
    name: string;
    category: string;
    required: boolean;
    set: boolean;
    valid: boolean;
    error?: string;
  };
} {
  const validation = validateAllApiKeys();
  const status: Record<string, any> = {};

  for (const config of API_KEY_CONFIGS) {
    const result = validation.results[config.envVar];
    const value = process.env[config.envVar];

    status[config.envVar] = {
      name: config.name,
      category: config.category,
      required: config.required,
      set: !!value && value.trim() !== '',
      valid: result.valid,
      error: result.error,
    };
  }

  return status;
}

