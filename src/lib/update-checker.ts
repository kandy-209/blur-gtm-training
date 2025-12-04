/**
 * Update Checker
 * 
 * Checks for app updates and notifies users when new versions are available.
 * Uses version comparison and optional update notifications.
 */

export interface UpdateInfo {
  version: string;
  releaseDate: string;
  changelog?: string[];
  critical?: boolean;
  downloadUrl?: string;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion?: string;
  updateInfo?: UpdateInfo;
  lastChecked?: Date;
}

class UpdateChecker {
  private currentVersion: string;
  private checkInterval: number = 60 * 60 * 1000; // 1 hour default
  private lastCheck: Date | null = null;
  private updateInfo: UpdateInfo | null = null;
  private listeners: Array<(result: UpdateCheckResult) => void> = [];

  constructor() {
    // Get version from package.json or environment variable
    this.currentVersion = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0';
  }

  /**
   * Check for updates
   */
  async checkForUpdates(force: boolean = false): Promise<UpdateCheckResult> {
    // Don't check too frequently unless forced
    if (!force && this.lastCheck) {
      const timeSinceLastCheck = Date.now() - this.lastCheck.getTime();
      if (timeSinceLastCheck < this.checkInterval) {
        return {
          hasUpdate: false,
          currentVersion: this.currentVersion,
          lastChecked: this.lastCheck,
        };
      }
    }

    try {
      // In production, this would check against your API/CDN
      // For now, we'll check against a version endpoint or use a simple comparison
      const response = await fetch('/api/version', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const latestVersion = data.version || this.currentVersion;
        const hasUpdate = this.compareVersions(this.currentVersion, latestVersion) < 0;

        this.lastCheck = new Date();
        this.updateInfo = data.updateInfo || null;

        const result: UpdateCheckResult = {
          hasUpdate,
          currentVersion: this.currentVersion,
          latestVersion,
          updateInfo: this.updateInfo || undefined,
          lastChecked: this.lastCheck,
        };

        // Notify listeners
        this.notifyListeners(result);

        return result;
      }
    } catch (error) {
      console.warn('Failed to check for updates:', error);
    }

    return {
      hasUpdate: false,
      currentVersion: this.currentVersion,
      lastChecked: this.lastCheck || undefined,
    };
  }

  /**
   * Compare two version strings (semver-like)
   * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    const maxLength = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < maxLength; i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }

    return 0;
  }

  /**
   * Subscribe to update notifications
   */
  onUpdate(callback: (result: UpdateCheckResult) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(result: UpdateCheckResult): void {
    this.listeners.forEach(listener => {
      try {
        listener(result);
      } catch (error) {
        console.error('Error in update listener:', error);
      }
    });
  }

  /**
   * Get current version
   */
  getCurrentVersion(): string {
    return this.currentVersion;
  }

  /**
   * Set check interval (in milliseconds)
   */
  setCheckInterval(interval: number): void {
    this.checkInterval = interval;
  }

  /**
   * Get last check time
   */
  getLastCheck(): Date | null {
    return this.lastCheck;
  }
}

// Singleton instance
export const updateChecker = new UpdateChecker();

