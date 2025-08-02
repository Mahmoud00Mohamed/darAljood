// Advanced image preloading service with priority queuing
import { ImageCache } from './ImageCache';
import type { ImagePreloadOptions } from '../types/image';

export class ImagePreloader {
  private static instance: ImagePreloader;
  private cache = ImageCache.getInstance();
  private loadingPromises = new Map<string, Promise<string>>();
  private priorityQueues = {
    high: [] as string[],
    medium: [] as string[],
    low: [] as string[]
  };
  private isProcessing = false;
  private maxConcurrent = 3;
  private activeLoads = 0;

  private constructor() {}

  static getInstance(): ImagePreloader {
    if (!ImagePreloader.instance) {
      ImagePreloader.instance = new ImagePreloader();
    }
    return ImagePreloader.instance;
  }

  async preload(
    url: string, 
    options: ImagePreloadOptions = {}
  ): Promise<string> {
    // Check cache first
    const cached = await this.cache.get(url);
    if (cached) return cached;

    // Check if already loading
    const existingPromise = this.loadingPromises.get(url);
    if (existingPromise) return existingPromise;

    // Create loading promise
    const promise = this.loadImage(url, options);
    this.loadingPromises.set(url, promise);

    // Add to priority queue
    const priority = options.priority || 'medium';
    if (!this.priorityQueues[priority].includes(url)) {
      this.priorityQueues[priority].push(url);
    }

    // Process queue
    this.processQueue();

    try {
      const result = await promise;
      return result;
    } finally {
      this.loadingPromises.delete(url);
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.activeLoads >= this.maxConcurrent) return;
    
    this.isProcessing = true;

    while (this.activeLoads < this.maxConcurrent) {
      const url = this.getNextUrl();
      if (!url) break;

      this.activeLoads++;
      this.loadImage(url).finally(() => {
        this.activeLoads--;
        this.processQueue();
      });
    }

    this.isProcessing = false;
  }

  private getNextUrl(): string | null {
    // Process in priority order
    for (const priority of ['high', 'medium', 'low'] as const) {
      const queue = this.priorityQueues[priority];
      if (queue.length > 0) {
        return queue.shift()!;
      }
    }
    return null;
  }

  private async loadImage(
    url: string, 
    options: ImagePreloadOptions = {}
  ): Promise<string> {
    try {
      const response = await fetch(url, {
        mode: 'cors',
        credentials: options.crossOrigin === 'use-credentials' ? 'include' : 'omit',
        referrerPolicy: options.referrerPolicy
      });

      if (!response.ok) {
        throw new Error(`Failed to load image: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // Validate it's an image
      if (!blob.type.startsWith('image/')) {
        throw new Error('Response is not an image');
      }

      await this.cache.set(url, blob);
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Image preload failed:', url, error);
      throw error;
    }
  }

  // Preload multiple images
  async preloadBatch(
    urls: string[], 
    options: ImagePreloadOptions = {}
  ): Promise<string[]> {
    const promises = urls.map(url => this.preload(url, options));
    return Promise.all(promises);
  }

  // Cancel preloading for a specific URL
  cancel(url: string): void {
    // Remove from queues
    for (const queue of Object.values(this.priorityQueues)) {
      const index = queue.indexOf(url);
      if (index > -1) {
        queue.splice(index, 1);
      }
    }
  }

  // Get loading stats
  getStats() {
    return {
      loading: this.loadingPromises.size,
      queued: Object.values(this.priorityQueues)
        .reduce((sum, queue) => sum + queue.length, 0),
      active: this.activeLoads,
      cache: this.cache.getStats()
    };
  }
}