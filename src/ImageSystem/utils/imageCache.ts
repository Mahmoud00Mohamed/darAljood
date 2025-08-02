// Advanced Image Caching System
import { ImageCacheEntry, ImageSystemConfig } from '../types';

class ImageCacheManager {
  private cache = new Map<string, ImageCacheEntry>();
  private config: ImageSystemConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: ImageSystemConfig) {
    this.config = config;
    this.startCleanupTimer();
  }

  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Sort by access count and last accessed time
    entries.sort((a, b) => {
      const aScore = a[1].accessCount * (now - a[1].lastAccessed);
      const bScore = b[1].accessCount * (now - b[1].lastAccessed);
      return bScore - aScore;
    });

    // Calculate current cache size
    let currentSize = 0;
    entries.forEach(([, entry]) => {
      currentSize += entry.blob.size;
    });

    // Remove old or excessive entries
    const maxSize = this.config.maxCacheSize * 1024 * 1024; // Convert MB to bytes
    
    for (const [url, entry] of entries) {
      const shouldRemove = 
        now - entry.timestamp > this.config.maxCacheAge ||
        currentSize > maxSize;

      if (shouldRemove) {
        this.cache.delete(url);
        currentSize -= entry.blob.size;
        // Clean up blob URL
        if (entry.url.startsWith('blob:')) {
          URL.revokeObjectURL(entry.url);
        }
      }
    }
  }

  async get(url: string): Promise<string | null> {
    const entry = this.cache.get(url);
    
    if (entry) {
      // Update access statistics
      entry.lastAccessed = Date.now();
      entry.accessCount++;
      return entry.url;
    }

    return null;
  }

  async set(originalUrl: string, blob: Blob): Promise<string> {
    const blobUrl = URL.createObjectURL(blob);
    const entry: ImageCacheEntry = {
      url: blobUrl,
      blob,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
    };

    this.cache.set(originalUrl, entry);
    return blobUrl;
  }

  has(url: string): boolean {
    return this.cache.has(url);
  }

  clear(): void {
    // Clean up all blob URLs
    this.cache.forEach(entry => {
      if (entry.url.startsWith('blob:')) {
        URL.revokeObjectURL(entry.url);
      }
    });
    
    this.cache.clear();
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }

  getStats() {
    const entries = Array.from(this.cache.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.blob.size, 0);
    
    return {
      totalEntries: this.cache.size,
      totalSize: totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
    };
  }
}

// Default configuration
const defaultConfig: ImageSystemConfig = {
  maxCacheSize: 50, // 50MB
  maxCacheAge: 30 * 60 * 1000, // 30 minutes
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
  preloadDistance: 100, // 100px from viewport
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

// Singleton instance
export const imageCache = new ImageCacheManager(defaultConfig);

// Utility functions
export const configureImageCache = (config: Partial<ImageSystemConfig>) => {
  const newConfig = { ...defaultConfig, ...config };
  imageCache.destroy();
  return new ImageCacheManager(newConfig);
};

export { ImageCacheManager };