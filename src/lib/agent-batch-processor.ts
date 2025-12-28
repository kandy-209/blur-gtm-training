/**
 * Agent Batch Processor
 * Efficiently batch process multiple agent calls
 */

interface BatchJob<T> {
  id: string;
  agentName: string;
  operation: string;
  data: any;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

export class AgentBatchProcessor {
  private batches: Map<string, BatchJob<any>[]> = new Map();
  private batchSize = 10;
  private batchTimeout = 1000; // 1 second
  private timers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Add job to batch
   */
  async addToBatch<T>(
    agentName: string,
    operation: string,
    data: any,
    processor: (batch: any[]) => Promise<T[]>
  ): Promise<T> {
    const batchKey = `${agentName}:${operation}`;

    return new Promise<T>((resolve, reject) => {
      const job: BatchJob<T> = {
        id: `${Date.now()}-${Math.random()}`,
        agentName,
        operation,
        data,
        resolve,
        reject,
      };

      // Get or create batch
      let batch = this.batches.get(batchKey);
      if (!batch) {
        batch = [];
        this.batches.set(batchKey, batch);
      }

      batch.push(job);

      // Process if batch is full
      if (batch.length >= this.batchSize) {
        this.processBatch(batchKey, processor);
      } else {
        // Set timeout to process batch
        if (this.timers.has(batchKey)) {
          clearTimeout(this.timers.get(batchKey)!);
        }

        const timer = setTimeout(() => {
          this.processBatch(batchKey, processor);
        }, this.batchTimeout);

        this.timers.set(batchKey, timer);
      }
    });
  }

  /**
   * Process batch
   */
  private async processBatch<T>(
    batchKey: string,
    processor: (batch: any[]) => Promise<T[]>
  ): Promise<void> {
    const batch = this.batches.get(batchKey);
    if (!batch || batch.length === 0) return;

    // Clear batch and timer
    this.batches.delete(batchKey);
    if (this.timers.has(batchKey)) {
      clearTimeout(this.timers.get(batchKey)!);
      this.timers.delete(batchKey);
    }

    try {
      // Process all jobs in batch
      const dataArray = batch.map(job => job.data);
      const results = await processor(dataArray);

      // Resolve all promises
      batch.forEach((job, index) => {
        if (results[index] !== undefined) {
          job.resolve(results[index]);
        } else {
          job.reject(new Error('No result returned for job'));
        }
      });
    } catch (error: any) {
      // Reject all promises on error
      batch.forEach(job => {
        job.reject(error);
      });
    }
  }

  /**
   * Get batch status
   */
  getStatus(): Record<string, number> {
    const status: Record<string, number> = {};
    for (const [key, batch] of this.batches.entries()) {
      status[key] = batch.length;
    }
    return status;
  }

  /**
   * Clear all batches
   */
  clear(): void {
    this.batches.clear();
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }
}

export const agentBatchProcessor = new AgentBatchProcessor();

