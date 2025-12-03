'use client';

// Service Worker registration and management
export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean;

  constructor() {
    this.isSupported = 'serviceWorker' in navigator;
  }

  async register(path = '/sw.js'): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported) {
      console.warn('Service Workers are not supported in this browser');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register(path, {
        scope: '/',
      });

      console.log('Service Worker registered:', this.registration.scope);

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('New service worker available');
              this.notifyUpdateAvailable();
            }
          });
        }
      });

      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const unregistered = await this.registration.unregister();
      this.registration = null;
      return unregistered;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  async update(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
    } catch (error) {
      console.error('Service Worker update failed:', error);
    }
  }

  private notifyUpdateAvailable(): void {
    // Dispatch custom event for UI to handle
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  isServiceWorkerSupported(): boolean {
    return this.isSupported;
  }
}

export const serviceWorkerManager = new ServiceWorkerManager();

// Background sync manager
export class BackgroundSyncManager {
  private syncQueue: Array<{
    id: string;
    action: string;
    data: unknown;
    timestamp: number;
  }> = [];

  constructor() {
    this.loadQueue();
  }

  async sync(action: string, data: unknown): Promise<void> {
    const syncItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      data,
      timestamp: Date.now(),
    };

    this.syncQueue.push(syncItem);
    this.saveQueue();

    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register(syncItem.id);
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }

  async processQueue(): Promise<void> {
    const items = [...this.syncQueue];
    this.syncQueue = [];

    for (const item of items) {
      try {
        await this.processSyncItem(item);
      } catch (error) {
        console.error(`Failed to process sync item ${item.id}:`, error);
        // Re-add to queue for retry
        this.syncQueue.push(item);
      }
    }

    this.saveQueue();
  }

  private async processSyncItem(item: {
    id: string;
    action: string;
    data: unknown;
  }): Promise<void> {
    // Process sync item based on action
    switch (item.action) {
      case 'save_response':
        await fetch('/api/responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        });
        break;
      case 'save_feedback':
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        });
        break;
      default:
        console.warn(`Unknown sync action: ${item.action}`);
    }
  }

  private loadQueue(): void {
    try {
      const stored = localStorage.getItem('background_sync_queue');
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem('background_sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  getQueueLength(): number {
    return this.syncQueue.length;
  }
}

export const backgroundSyncManager = new BackgroundSyncManager();

