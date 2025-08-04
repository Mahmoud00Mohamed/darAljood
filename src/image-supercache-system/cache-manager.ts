import { CacheEntry, ImageCacheConfig } from "./types";
import { defaultConfig } from "./config";

class CacheManager {
  private memoryCache = new Map<string, CacheEntry>();
  private memoryCacheSize = 0;
  private config: ImageCacheConfig;

  constructor(config: Partial<ImageCacheConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  private getStorageKey(key: string): string {
    return `image-supercache-${key}`;
  }

  private async cleanupMemoryCache(): Promise<void> {
    if (
      this.memoryCacheSize <= this.config.memoryCache.maxSizeBytes &&
      this.memoryCache.size <= this.config.memoryCache.maxItems
    ) {
      return;
    }

    // Sort by timestamp (LRU)
    const entries = Array.from(this.memoryCache.entries()).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    );

    // Remove oldest entries
    const toRemove = Math.max(
      entries.length - this.config.memoryCache.maxItems,
      0
    );

    for (let i = 0; i < toRemove; i++) {
      const [key, entry] = entries[i];
      this.memoryCache.delete(key);
      this.memoryCacheSize -= entry.size;
    }

    // Check size constraint
    let currentSize = this.memoryCacheSize;
    let index = toRemove;
    while (
      currentSize > this.config.memoryCache.maxSizeBytes &&
      index < entries.length
    ) {
      const [key, entry] = entries[index];
      this.memoryCache.delete(key);
      currentSize -= entry.size;
      index++;
    }

    this.memoryCacheSize = currentSize;
  }

  async getFromCache(key: string): Promise<CacheEntry | null> {
    // Check memory cache first
    const memEntry = this.memoryCache.get(key);
    if (memEntry) {
      // Update timestamp for LRU
      memEntry.timestamp = Date.now();
      return memEntry;
    }

    // Check persistent cache
    try {
      const storageKey = this.getStorageKey(key);
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const entry: CacheEntry = JSON.parse(cached);

        // Check if expired
        const isExpired =
          Date.now() - entry.timestamp > this.config.longTermCacheDurationMs;
        if (isExpired) {
          localStorage.removeItem(storageKey);
          return null;
        }

        // Add to memory cache
        entry.timestamp = Date.now();
        this.memoryCache.set(key, entry);
        this.memoryCacheSize += entry.size;

        await this.cleanupMemoryCache();
        return entry;
      }
    } catch (error) {
      console.warn("Failed to read from cache:", error);
    }

    return null;
  }

  async saveToCache(
    key: string,
    imageData: string,
    metadata: CacheEntry["metadata"]
  ): Promise<void> {
    const entry: CacheEntry = {
      key,
      url: metadata.originalUrl,
      data: imageData,
      timestamp: Date.now(),
      size: imageData.length,
      metadata,
    };

    // Save to memory cache
    this.memoryCache.set(key, entry);
    this.memoryCacheSize += entry.size;
    await this.cleanupMemoryCache();

    // Save to persistent cache
    try {
      const storageKey = this.getStorageKey(key);
      localStorage.setItem(storageKey, JSON.stringify(entry));
    } catch (error) {
      // Handle storage quota exceeded
      console.warn("Failed to save to persistent cache:", error);
      this.clearOldEntries();
    }
  }

  async invalidate(key: string): Promise<void> {
    this.memoryCache.delete(key);

    try {
      const storageKey = this.getStorageKey(key);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn("Failed to invalidate cache entry:", error);
    }
  }

  private clearOldEntries(): void {
    const now = Date.now();
    const keys = Object.keys(localStorage);

    keys
      .filter((key) => key.startsWith("image-supercache-"))
      .forEach((key) => {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || "");
          const isExpired =
            now - entry.timestamp > this.config.longTermCacheDurationMs;
          if (isExpired) {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
        }
      });
  }

  async clearAll(): Promise<void> {
    this.memoryCache.clear();
    this.memoryCacheSize = 0;

    const keys = Object.keys(localStorage);
    keys
      .filter((key) => key.startsWith("image-supercache-"))
      .forEach((key) => localStorage.removeItem(key));
  }

  getCacheStats() {
    return {
      memoryItems: this.memoryCache.size,
      memorySize: this.memoryCacheSize,
      maxMemorySize: this.config.memoryCache.maxSizeBytes,
    };
  }
}

export default CacheManager;
