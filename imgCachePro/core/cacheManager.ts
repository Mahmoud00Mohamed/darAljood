import { CacheEntry, ImageData, CacheStats } from "../types";
import { getConfig } from "../config/settings";
import { getCurrentTimestamp, logger } from "../utils/helpers";
import { validateKey } from "../utils/validation";

export class CacheManager {
  private memoryCache = new Map<string, CacheEntry>();
  private persistenceAvailable: boolean;
  private readonly STORAGE_PREFIX = "imgCachePro_";
  private readonly METADATA_KEY = "imgCachePro_metadata";
  private cleanupInterval: number | null = null;

  constructor() {
    this.persistenceAvailable = this.checkStorageAvailable("localStorage");
    this.startCleanupInterval();
    this.loadFromPersistentStorage();
  }

  async getFromCache(key: string): Promise<ImageData | null> {
    if (!validateKey(key)) {
      logger.warn("Invalid cache key provided:", key);
      return null;
    }

    try {
      // Check memory cache first
      const memoryEntry = this.memoryCache.get(key);
      if (memoryEntry && !this.isEntryExpired(memoryEntry)) {
        this.updateAccessMetrics(memoryEntry);
        logger.debug("Cache hit (memory):", key);
        return memoryEntry.data;
      }

      // Check persistent storage
      if (this.persistenceAvailable && getConfig().cache.enablePersistence) {
        const persistentData = await this.getFromPersistentStorage(key);
        if (persistentData && !this.isEntryExpired(persistentData)) {
          // Move to memory cache for faster access
          this.memoryCache.set(key, persistentData);
          this.updateAccessMetrics(persistentData);
          logger.debug("Cache hit (persistent):", key);
          return persistentData.data;
        }
      }

      logger.debug("Cache miss:", key);
      return null;
    } catch (error) {
      logger.error("Error getting from cache:", error);
      return null;
    }
  }

  async saveToCache(key: string, imageData: ImageData): Promise<boolean> {
    if (!validateKey(key)) {
      logger.warn("Invalid cache key for saving:", key);
      return false;
    }

    try {
      const config = getConfig();
      const entry: CacheEntry = {
        key,
        data: imageData,
        expiresAt: getCurrentTimestamp() + config.cache.defaultTTL,
        lastAccessed: getCurrentTimestamp(),
        hitCount: 0,
      };

      // Save to memory cache
      this.memoryCache.set(key, entry);

      // Save to persistent storage
      if (this.persistenceAvailable && config.cache.enablePersistence) {
        await this.saveToPersistentStorage(key, entry);
      }

      // Cleanup if needed
      await this.enforceMemoryLimits();

      logger.debug(
        "Cached image:",
        key,
        `(${Math.round(imageData.size / 1024)}KB)`
      );
      return true;
    } catch (error) {
      logger.error("Error saving to cache:", error);
      return false;
    }
  }

  async invalidate(key: string): Promise<boolean> {
    if (!validateKey(key)) return false;

    try {
      // Remove from memory
      const removed = this.memoryCache.delete(key);

      // Remove from persistent storage
      if (this.persistenceAvailable) {
        localStorage.removeItem(this.STORAGE_PREFIX + key);
      }

      if (removed) {
        logger.debug("Invalidated cache entry:", key);
      }

      return removed;
    } catch (error) {
      logger.error("Error invalidating cache:", error);
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      // Clear memory cache
      this.memoryCache.clear();

      // Clear persistent storage
      if (this.persistenceAvailable) {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (key.startsWith(this.STORAGE_PREFIX)) {
            localStorage.removeItem(key);
          }
        });
      }

      logger.info("Cache cleared");
    } catch (error) {
      logger.error("Error clearing cache:", error);
    }
  }

  getStats(): CacheStats {
    const entries = Array.from(this.memoryCache.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.data.size, 0);
    const totalHits = entries.reduce((sum, entry) => sum + entry.hitCount, 0);
    const totalAccesses = entries.reduce(
      (sum, entry) => sum + entry.hitCount + 1,
      0
    );

    return {
      totalEntries: entries.length,
      totalSize,
      hitRate: totalAccesses > 0 ? (totalHits / totalAccesses) * 100 : 0,
      memoryUsage: totalSize / (1024 * 1024), // MB
      oldestEntry:
        entries.length > 0
          ? Math.min(...entries.map((e) => e.lastAccessed))
          : 0,
      newestEntry:
        entries.length > 0
          ? Math.max(...entries.map((e) => e.lastAccessed))
          : 0,
    };
  }

  private async loadFromPersistentStorage(): Promise<void> {
    if (!this.persistenceAvailable || !getConfig().cache.enablePersistence)
      return;

    try {
      const metadata = localStorage.getItem(this.METADATA_KEY);
      if (!metadata) return;

      const keys = JSON.parse(metadata) as string[];

      for (const key of keys) {
        const entry = await this.getFromPersistentStorage(key);
        if (entry && !this.isEntryExpired(entry)) {
          this.memoryCache.set(key, entry);
        } else if (entry) {
          // Remove expired entry
          localStorage.removeItem(this.STORAGE_PREFIX + key);
        }
      }

      this.updateMetadata();
      logger.debug("Loaded cache from persistent storage");
    } catch (error) {
      logger.error("Error loading from persistent storage:", error);
    }
  }

  private async getFromPersistentStorage(
    key: string
  ): Promise<CacheEntry | null> {
    try {
      const stored = localStorage.getItem(this.STORAGE_PREFIX + key);
      if (!stored) return null;

      const entry = JSON.parse(stored) as CacheEntry;

      // Reconstruct blob from base64
      const binaryString = atob(entry.data.blob as unknown as string);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      entry.data.blob = new Blob([bytes], { type: entry.data.format });

      return entry;
    } catch (error) {
      logger.warn("Error parsing persistent cache entry:", key, error);
      return null;
    }
  }

  private async saveToPersistentStorage(
    key: string,
    entry: CacheEntry
  ): Promise<void> {
    try {
      const config = getConfig();

      // Check storage limits
      const currentSize = this.calculatePersistentStorageSize();
      const maxSize = config.cache.maxStorageSize * 1024 * 1024; // Convert MB to bytes

      if (currentSize + entry.data.size > maxSize) {
        await this.cleanupPersistentStorage();
      }

      // Convert blob to base64 for storage
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        const storableEntry = {
          ...entry,
          data: {
            ...entry.data,
            blob: base64 as unknown as Blob,
          },
        };

        localStorage.setItem(
          this.STORAGE_PREFIX + key,
          JSON.stringify(storableEntry)
        );
        this.updateMetadata();
      };
      reader.readAsDataURL(entry.data.blob);
    } catch (error) {
      logger.warn("Error saving to persistent storage:", error);
    }
  }

  private updateMetadata(): void {
    if (!this.persistenceAvailable) return;

    try {
      const keys = Array.from(this.memoryCache.keys());
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(keys));
    } catch (error) {
      logger.warn("Error updating metadata:", error);
    }
  }

  private calculatePersistentStorageSize(): number {
    if (!this.persistenceAvailable) return 0;

    let total = 0;
    const keys = Object.keys(localStorage);

    keys.forEach((key) => {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            total += item.length;
          }
        } catch (error) {
          logger.warn("Error calculating storage size for key:", key, error);
        }
      }
    });

    return total;
  }

  private async cleanupPersistentStorage(): Promise<void> {
    if (!this.persistenceAvailable) return;

    try {
      const entries: { key: string; lastAccessed: number; size: number }[] = [];
      const keys = Object.keys(localStorage);

      keys.forEach((key) => {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const entry = JSON.parse(item) as CacheEntry;
              entries.push({
                key: key.replace(this.STORAGE_PREFIX, ""),
                lastAccessed: entry.lastAccessed,
                size: item.length,
              });
            }
          } catch {
            // Remove corrupted entries
            localStorage.removeItem(key);
          }
        }
      });

      // Sort by last accessed (oldest first)
      entries.sort((a, b) => a.lastAccessed - b.lastAccessed);

      // Remove oldest entries until we're under limit
      const maxSize = getConfig().cache.maxStorageSize * 1024 * 1024;
      let currentSize = entries.reduce((sum, entry) => sum + entry.size, 0);

      while (currentSize > maxSize * 0.8 && entries.length > 0) {
        const oldest = entries.shift()!;
        localStorage.removeItem(this.STORAGE_PREFIX + oldest.key);
        this.memoryCache.delete(oldest.key);
        currentSize -= oldest.size;
        logger.debug("Cleaned up old cache entry:", oldest.key);
      }

      this.updateMetadata();
    } catch (error) {
      logger.error("Error during persistent storage cleanup:", error);
    }
  }

  private async enforceMemoryLimits(): Promise<void> {
    const config = getConfig();
    const maxSize = config.cache.maxMemorySize * 1024 * 1024; // Convert MB to bytes

    let currentSize = 0;
    const entries = Array.from(this.memoryCache.entries());

    // Calculate current size
    entries.forEach(([, entry]) => {
      currentSize += entry.data.size;
    });

    if (currentSize <= maxSize) return;

    // Sort by access metrics (LRU with hit count consideration)
    entries.sort(([, a], [, b]) => {
      const scoreA = a.lastAccessed / 1000 + a.hitCount * 10;
      const scoreB = b.lastAccessed / 1000 + b.hitCount * 10;
      return scoreA - scoreB;
    });

    // Remove least valuable entries
    while (currentSize > maxSize * 0.8 && entries.length > 0) {
      const [key, entry] = entries.shift()!;
      this.memoryCache.delete(key);
      currentSize -= entry.data.size;
      logger.debug("Evicted from memory cache:", key);
    }
  }

  private isEntryExpired(entry: CacheEntry): boolean {
    return getCurrentTimestamp() > entry.expiresAt;
  }

  private updateAccessMetrics(entry: CacheEntry): void {
    entry.lastAccessed = getCurrentTimestamp();
    entry.hitCount++;
  }

  private startCleanupInterval(): void {
    const interval = getConfig().cache.cleanupInterval;

    this.cleanupInterval = window.setInterval(() => {
      this.performCleanup();
    }, interval);
  }

  private async performCleanup(): Promise<void> {
    try {
      // Remove expired entries from memory
      const expiredKeys: string[] = [];

      this.memoryCache.forEach((entry, key) => {
        if (this.isEntryExpired(entry)) {
          expiredKeys.push(key);
        }
      });

      expiredKeys.forEach((key) => {
        this.memoryCache.delete(key);
        logger.debug("Removed expired entry:", key);
      });

      // Cleanup persistent storage periodically
      if (Math.random() < 0.1) {
        // 10% chance
        await this.cleanupPersistentStorage();
      }

      if (expiredKeys.length > 0) {
        logger.debug(`Cleaned up ${expiredKeys.length} expired entries`);
      }
    } catch (error) {
      logger.error("Error during cleanup:", error);
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.memoryCache.clear();
    logger.debug("Cache manager destroyed");
  }

  private checkStorageAvailable(
    type: "localStorage" | "sessionStorage"
  ): boolean {
    try {
      const storage = window[type];
      const testKey = "__imgCachePro_test__";
      storage.setItem(testKey, "test");
      storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private isExpired(timestamp: number, ttl: number): boolean {
    return getCurrentTimestamp() - timestamp > ttl;
  }
}

// Singleton instance
let cacheManagerInstance: CacheManager | null = null;

export const getCacheManager = (): CacheManager => {
  if (!cacheManagerInstance) {
    cacheManagerInstance = new CacheManager();
  }
  return cacheManagerInstance;
};

export const destroyCacheManager = (): void => {
  if (cacheManagerInstance) {
    cacheManagerInstance.destroy();
    cacheManagerInstance = null;
  }
};
