import { PreloadOptions } from './types';
import { getConfig } from './config';
import { cacheManager } from './cache';
import { recovery } from './recovery';
import { generateCacheKey, optimizeImageUrl, isValidUrl } from './utils';

class PreloadEngine {
  private preloadQueue = new Set<string>();
  private preloading = new Set<string>();
  private priorityQueues = {
    high: new Set<string>(),
    medium: new Set<string>(),
    low: new Set<string>()
  };

  async predictAndPreload(keysOrUrls: string[], options: PreloadOptions = {}): Promise<void> {
    const validUrls = keysOrUrls.filter(url => isValidUrl(url));
    
    for (const url of validUrls) {
      await this.markAsNeeded(url, options);
    }

    this.processQueue();
  }

  async markAsNeeded(keyOrUrl: string, options: PreloadOptions = {}): Promise<void> {
    if (!isValidUrl(keyOrUrl)) return;

    const config = getConfig();
    const optimizedUrl = optimizeImageUrl(keyOrUrl, config);
    const cacheKey = generateCacheKey(optimizedUrl, options);

    // Check if already cached
    const cached = await cacheManager.getFromCache(cacheKey);
    if (cached) return;

    // Add to appropriate priority queue
    const priority = options.priority || 'medium';
    this.priorityQueues[priority].add(keyOrUrl);
    this.preloadQueue.add(keyOrUrl);

    if (options.immediate) {
      this.preloadImage(keyOrUrl, options);
    }
  }

  private async processQueue(): Promise<void> {
    const maxConcurrent = 3; // Limit concurrent preloads
    
    if (this.preloading.size >= maxConcurrent) return;

    // Process high priority first, then medium, then low
    const priorities: Array<keyof typeof this.priorityQueues> = ['high', 'medium', 'low'];
    
    for (const priority of priorities) {
      const queue = this.priorityQueues[priority];
      
      for (const url of queue) {
        if (this.preloading.size >= maxConcurrent) break;
        
        queue.delete(url);
        this.preloadQueue.delete(url);
        this.preloadImage(url);
      }
      
      if (this.preloading.size >= maxConcurrent) break;
    }
  }

  private async preloadImage(url: string, options: PreloadOptions = {}): Promise<void> {
    if (this.preloading.has(url)) return;

    this.preloading.add(url);

    try {
      const config = getConfig();
      const optimizedUrl = optimizeImageUrl(url, config);
      const cacheKey = generateCacheKey(optimizedUrl, options);

      // Check cache again in case it was loaded elsewhere
      const cached = await cacheManager.getFromCache(cacheKey);
      if (cached) {
        this.preloading.delete(url);
        this.continueProcessing();
        return;
      }

      const imageData = await recovery.fetchWithRetry(optimizedUrl);
      await cacheManager.saveToCache(cacheKey, imageData);

    } catch (error) {
      console.warn(`Failed to preload image: ${url}`, error);
    } finally {
      this.preloading.delete(url);
      this.continueProcessing();
    }
  }

  private continueProcessing(): void {
    // Continue processing queue after completion
    setTimeout(() => this.processQueue(), 100);
  }

  clearQueue(): void {
    this.preloadQueue.clear();
    this.priorityQueues.high.clear();
    this.priorityQueues.medium.clear();
    this.priorityQueues.low.clear();
  }

  getQueueStatus(): { total: number; preloading: number; high: number; medium: number; low: number } {
    return {
      total: this.preloadQueue.size,
      preloading: this.preloading.size,
      high: this.priorityQueues.high.size,
      medium: this.priorityQueues.medium.size,
      low: this.priorityQueues.low.size
    };
  }
}

export const preloader = new PreloadEngine();
