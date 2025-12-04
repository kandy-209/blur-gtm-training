import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges class names deterministically to prevent hydration mismatches
 * Ensures consistent output on both server and client
 */
export function cn(...inputs: ClassValue[]): string {
  // Filter out undefined/null/empty values first for consistency
  const filtered = inputs.filter(Boolean)
  if (filtered.length === 0) return ''
  
  // Use clsx to combine classes, then twMerge to deduplicate
  // This ensures deterministic output
  const combined = clsx(filtered)
  return twMerge(combined) || ''
}

