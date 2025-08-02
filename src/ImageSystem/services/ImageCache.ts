// Advanced image caching system with memory management
import type { ImageCacheItem } from '../types/image';

export class ImageCache {
  private static instance: ImageCache;
  private cache = new Map<string, ImageCacheItem>();
  private maxCacheSize = 50 * 1024 * 1024; // 50MB
  private currentCacheSize = 0;
  private maxAge = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    // Clean up cache periodically
    setInterval(() => this.cleanup(), 5 * 60 * 1000); // Every 5 minutes
  }

  static getInstance(): ImageCache {
    if (!ImageCache.instance) {
      ImageCache.instance = new ImageCache();
    }
    return ImageCache.instance;
  }

  async get(url: string): Promise<string | null> {
    const item = this.cache.get(url);
    
    if (!item) return null;
    
    // Check if expired
    if (Date.now() - item.timestamp > this.maxAge) {
      this.delete(url);
      return null;
    }

    // Update access count and timestamp
    item.accessCount++;
    item.timestamp = Date.now();
    
    return URL.createObjectURL(item.blob);
  }

  async set(url: string, blob: Blob): Promise<void> {
    const size = blob.size;
    
    // Check if we need to make space
    while (this.currentCacheSize + size > this.maxCacheSize && this.cache.size > 0) {
      this.evictLeastUsed();
    }

    // Don't cache if still too large
    if (size > this.maxCacheSize) return;

    const item: ImageCacheItem = {
      url,
      blob,
      timestamp: Date.now(),
      accessCount: 1,
      size
    };

    this.cache.set(url, item);
    this.currentCacheSize += size;
  }

  private delete(url: string): void {
    const item = this.cache.get(url);
    if (item) {
      this.cache.delete(url);
      this.currentCacheSize -= item.size;
      // Revoke object URL to free memory
      URL.revokeObjectURL(URL.createObjectURL(item.blob));
    }
  }

  private evictLeastUsed(): void {
    let leastUsed: string | null = null;
    let minAccessCount = Infinity;
    let oldestTimestamp = Infinity;

    for (const [url, item] of this.cache.entries()) {
      if (item.accessCount < minAccessCount || 
          (item.accessCount === minAccessCount && item.timestamp < oldestTimestamp)) {
        leastUsed = url;
        minAccessCount = item.accessCount;
        oldestTimestamp = item.timestamp;
      }
    }

    if (leastUsed) {
      this.delete(leastUsed);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredUrls: string[] = [];

    for (const [url, item] of this.cache.entries()) {
      if (now - item.timestamp > this.maxAge) {
        expiredUrls.push(url);
      }
    }

    expiredUrls.forEach(url => this.delete(url));
  }

  clear(): void {
    // Revoke all object URLs
    for (const item of this.cache.values()) {
      URL.revokeObjectURL(URL.createObjectURL(item.blob));
    }
    this.cache.clear();
    this.currentCacheSize = 0;
  }

  getStats() {
    return {
      size: this.cache.size,
      totalSize: this.currentCacheSize,
      maxSize: this.maxCacheSize,
      hitRate: this.calculateHitRate()
    };
  }

  private calculateHitRate(): number {
    if (this.cache.size === 0) return 0;
    const totalAccess = Array.from(this.cache.values())
      .reduce((sum, item) => sum + item.accessCount, 0);
    return totalAccess / this.cache.size;
  }
}