/**
 * Performance utilities for monitoring and optimization
 */

export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();

  static mark(name: string): void {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
      this.marks.set(name, Date.now());
    }
  }

  static measure(name: string, startMark: string, endMark: string): number | null {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        return measure?.duration || null;
      } catch {
        const start = this.marks.get(startMark);
        const end = this.marks.get(endMark);
        if (start && end) {
          return end - start;
        }
      }
    }
    return null;
  }

  static clearMarks(): void {
    if (typeof performance !== 'undefined' && performance.clearMarks) {
      performance.clearMarks();
    }
    this.marks.clear();
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy load images
 */
export function lazyLoadImage(img: HTMLImageElement, src: string): void {
  if ('loading' in img) {
    (img as any).loading = 'lazy';
  }
  img.src = src;
}

