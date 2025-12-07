/**
 * Date utility functions for safe date handling
 */

/**
 * Safely converts a value to a Date object
 * Returns current date if conversion fails
 */
export function safeDate(value: Date | string | number | null | undefined): Date {
  if (!value) return new Date();
  
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? new Date() : value;
  }
  
  const date = new Date(value);
  return isNaN(date.getTime()) ? new Date() : date;
}

/**
 * Safely converts a Date to ISO string
 * Returns current date ISO string if date is invalid
 */
export function safeToISOString(date: Date | string | null | undefined): string {
  const validDate = safeDate(date);
  return validDate.toISOString();
}

/**
 * Checks if a date is valid
 */
export function isValidDate(date: Date | string | number | null | undefined): boolean {
  if (!date) return false;
  
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }
  
  const d = new Date(date);
  return !isNaN(d.getTime());
}

