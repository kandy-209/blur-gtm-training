'use client';

// Web Worker manager for offloading heavy computations
export class WebWorkerManager {
  private workers: Map<string, Worker> = new Map();
  private workerPromises: Map<string, Promise<Worker>> = new Map();

  async getWorker(name: string, workerScript: string | (() => Worker)): Promise<Worker> {
    // Check if worker already exists
    const existing = this.workers.get(name);
    if (existing) {
      return existing;
    }

    // Check if worker is being created
    const existingPromise = this.workerPromises.get(name);
    if (existingPromise) {
      return existingPromise;
    }

    // Create new worker
    const promise = this.createWorker(name, workerScript);
    this.workerPromises.set(name, promise);

    try {
      const worker = await promise;
      this.workers.set(name, worker);
      this.workerPromises.delete(name);
      return worker;
    } catch (error) {
      this.workerPromises.delete(name);
      throw error;
    }
  }

  private async createWorker(
    name: string,
    workerScript: string | (() => Worker)
  ): Promise<Worker> {
    if (typeof workerScript === 'function') {
      return workerScript();
    }

    return new Worker(workerScript);
  }

  terminateWorker(name: string): void {
    const worker = this.workers.get(name);
    if (worker) {
      worker.terminate();
      this.workers.delete(name);
    }
  }

  terminateAll(): void {
    for (const [name, worker] of this.workers.entries()) {
      worker.terminate();
      this.workers.delete(name);
    }
  }

  postMessage<T>(name: string, message: T, transfer?: Transferable[]): void {
    const worker = this.workers.get(name);
    if (worker) {
      worker.postMessage(message, transfer || []);
    } else {
      throw new Error(`Worker ${name} not found`);
    }
  }

  onMessage<T>(name: string, handler: (data: T) => void): void {
    const worker = this.workers.get(name);
    if (worker) {
      worker.onmessage = (e) => handler(e.data);
    } else {
      throw new Error(`Worker ${name} not found`);
    }
  }
}

export const webWorkerManager = new WebWorkerManager();

// IndexedDB cache manager
export class IndexedDBCache {
  private dbName: string;
  private dbVersion: number;
  private storeName: string;
  private db: IDBDatabase | null = null;

  constructor(dbName: string, storeName: string = 'cache', version: number = 1) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.dbVersion = version;
  }

  async open(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };
    });
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const db = await this.open();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    const expiresAt = ttl ? Date.now() + ttl : undefined;

    return new Promise((resolve, reject) => {
      const request = store.put({ key, value, expiresAt, timestamp: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const db = await this.open();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        // Check expiration
        if (result.expiresAt && Date.now() > result.expiresAt) {
          this.delete(key).then(() => resolve(null));
          return;
        }

        resolve(result.value as T);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async delete(key: string): Promise<void> {
    const db = await this.open();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    const db = await this.open();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllKeys(): Promise<string[]> {
    const db = await this.open();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAllKeys();
      request.onsuccess = () => resolve(request.result as string[]);
      request.onerror = () => reject(request.error);
    });
  }
}

export const indexedDBCache = new IndexedDBCache('app-cache', 'data');

// Request batching
export class RequestBatcher<T, R> {
  private batch: Array<{ data: T; resolve: (value: R) => void; reject: (error: Error) => void }> = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private maxBatchSize: number;
  private batchDelay: number;
  private batchFn: (items: T[]) => Promise<R[]>;

  constructor(
    batchFn: (items: T[]) => Promise<R[]>,
    maxBatchSize: number = 10,
    batchDelay: number = 100
  ) {
    this.batchFn = batchFn;
    this.maxBatchSize = maxBatchSize;
    this.batchDelay = batchDelay;
  }

  async add(data: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.batch.push({ data, resolve, reject });

      if (this.batch.length >= this.maxBatchSize) {
        this.flush();
      } else if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => this.flush(), this.batchDelay);
      }
    });
  }

  private async flush(): Promise<void> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    if (this.batch.length === 0) return;

    const currentBatch = [...this.batch];
    this.batch = [];

    try {
      const results = await this.batchFn(currentBatch.map((b) => b.data));
      currentBatch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      currentBatch.forEach((item) => {
        item.reject(error as Error);
      });
    }
  }

  async flushNow(): Promise<void> {
    await this.flush();
  }
}

