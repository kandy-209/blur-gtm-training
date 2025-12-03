'use client';

import { io, Socket } from 'socket.io-client';

export interface CollaborationMessage {
  type: 'update' | 'delete' | 'create' | 'sync';
  component: string;
  data: unknown;
  userId: string;
  timestamp: number;
  version: number;
}

export interface ConflictResolution {
  strategy: 'last-write-wins' | 'merge' | 'manual' | 'version-vector';
  resolve: (local: unknown, remote: unknown) => unknown;
}

export class RealtimeCollaboration {
  private socket: Socket | null = null;
  private connected: boolean = false;
  private messageQueue: CollaborationMessage[] = [];
  private conflictResolver: ConflictResolution;
  private versionVectors: Map<string, number> = new Map();

  constructor(
    serverUrl: string,
    conflictResolver: ConflictResolution = {
      strategy: 'last-write-wins',
      resolve: (local, remote) => remote,
    }
  ) {
    this.conflictResolver = conflictResolver;
    this.connect(serverUrl);
  }

  private connect(serverUrl: string): void {
    try {
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        this.connected = true;
        this.flushQueue();
        console.log('Collaboration connected');
      });

      this.socket.on('disconnect', () => {
        this.connected = false;
        console.log('Collaboration disconnected');
      });

      this.socket.on('collaboration-message', (message: CollaborationMessage) => {
        this.handleMessage(message);
      });

      this.socket.on('conflict', (data: { local: unknown; remote: unknown; component: string }) => {
        this.handleConflict(data);
      });
    } catch (error) {
      console.error('Failed to connect to collaboration server:', error);
    }
  }

  send(message: Omit<CollaborationMessage, 'timestamp' | 'version'>): void {
    const fullMessage: CollaborationMessage = {
      ...message,
      timestamp: Date.now(),
      version: this.getNextVersion(message.component),
    };

    if (this.connected && this.socket) {
      this.socket.emit('collaboration-message', fullMessage);
    } else {
      this.messageQueue.push(fullMessage);
    }
  }

  private flushQueue(): void {
    if (!this.connected || !this.socket) return;

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.socket.emit('collaboration-message', message);
      }
    }
  }

  private handleMessage(message: CollaborationMessage): void {
    // Check for conflicts
    const localVersion = this.versionVectors.get(message.component) || 0;
    if (message.version <= localVersion) {
      // Conflict detected
      this.handleConflict({
        local: { version: localVersion },
        remote: message,
        component: message.component,
      });
      return;
    }

    // Update version vector
    this.versionVectors.set(message.component, message.version);

    // Dispatch custom event for components to handle
    window.dispatchEvent(
      new CustomEvent('collaboration-update', { detail: message })
    );
  }

  private handleConflict(data: { local: unknown; remote: unknown; component: string }): void {
    const resolved = this.conflictResolver.resolve(data.local, data.remote);

    // Dispatch conflict resolution event
    window.dispatchEvent(
      new CustomEvent('collaboration-conflict-resolved', {
        detail: { ...data, resolved },
      })
    );
  }

  private getNextVersion(component: string): number {
    const current = this.versionVectors.get(component) || 0;
    const next = current + 1;
    this.versionVectors.set(component, next);
    return next;
  }

  subscribe(component: string, handler: (message: CollaborationMessage) => void): () => void {
    const listener = (e: Event) => {
      const customEvent = e as CustomEvent<CollaborationMessage>;
      if (customEvent.detail.component === component) {
        handler(customEvent.detail);
      }
    };

    window.addEventListener('collaboration-update', listener);

    return () => {
      window.removeEventListener('collaboration-update', listener);
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }
}

// Conflict resolution strategies
export const conflictStrategies = {
  lastWriteWins: {
    strategy: 'last-write-wins' as const,
    resolve: (local: unknown, remote: unknown) => remote,
  },
  merge: {
    strategy: 'merge' as const,
    resolve: (local: unknown, remote: unknown) => {
      // Simple merge - in production, use proper merge algorithm
      if (typeof local === 'object' && typeof remote === 'object' && local && remote) {
        return { ...local, ...remote };
      }
      return remote;
    },
  },
  manual: {
    strategy: 'manual' as const,
    resolve: (local: unknown, remote: unknown) => {
      // Trigger manual resolution UI
      window.dispatchEvent(
        new CustomEvent('manual-conflict-resolution', { detail: { local, remote } })
      );
      return local; // Keep local until user resolves
    },
  },
};

