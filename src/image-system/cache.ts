import { CacheEntry, ImageData } from './types';
import { getConfig } from './config';
import { generateCacheKey, calculateImageSize } from './utils';

class CacheManager {
  private memoryCache = new Map<string, CacheEntry>();
  private persistentCache: IDBDatabase | null = null;
  private dbInitialized = false;

  constructor() {
    this.initPersistentCache();
  }

  private async initPersistentCache(): Promise<void> {
    if (this.dbInitialized) return;

    try {
      const request = indexedDB.open('ImageSystemCache', 1);
      
      request.onerror = () => {
        console.warn('Failed to initialize persistent cache');
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('images')) {
          const store = db.createObjectStore('images', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.persistentCache = (event.target as IDBOpenDBRequest).result;
        this.dbInitialized = true;
        this.cleanExpiredCache();
      };
    } catch (error) {
      console.warn('IndexedDB not available, using memory cache only');
    }
  }

  async getFromCache(key: string): Promise<ImageData | null> {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry) {
      const config = getConfig();
      const now = Date.now();
      
      if (now - memoryEntry.data.timestamp < config.memoryExpiryMs) {
        memoryEntry.lastAccessed = now;
        memoryEntry.accessCount++;
        return memoryEntry.data;
      } else {
        this.memoryCache.delete(key);
      }
    }

    // Check persistent cache
    return this.getFromPersistentCache(key);
  }

  private async getFromPersistentCache(key: string): Promise<ImageData | null> {
    if (!this.persistentCache) return null;

    try {
      const transaction = this.persistentCache.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      const request = store.get(key);

      return new Promise((resolve) => {
        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            const config = getConfig();
            const now = Date.now();
            const expiry = config.cacheExpiryDays * 24 * 60 * 60 * 1000;
            
            if (now - result.timestamp < expiry) {
              // Move to memory cache for faster access
              this.memoryCache.set(key, {
                data: result,
                lastAccessed: now,
                accessCount: 1
              });
              resolve(result);
            } else {
              // Expired, remove from persistent cache
              this.invalidate(key);
              resolve(null);
            }
          } else {
            resolve(null);
          }
        };

        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.warn('Failed to read from persistent cache:', error);
      return null;
    }
  }

  async saveToCache(key: string, imageData: ImageData): Promise<boolean> {
    const config = getConfig();
    
    // Check cache size limits
    if (this.getTotalCacheSize() + imageData.size > config.maxCacheSize) {
      await this.evictLeastUsed();
    }

    // Save to memory cache
    this.memoryCache.set(key, {
      data: imageData,
      lastAccessed: Date.now(),
      accessCount: 1
    });

    // Save to persistent cache
    return this.saveToPersistentCache(key, imageData);
  }

  private async saveToPersistentCache(key: string, imageData: ImageData): Promise<boolean> {
    if (!this.persistentCache) return false;

    try {
      const transaction = this.persistentCache.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      
      const cacheEntry = {
        key,
        ...imageData,
        timestamp: Date.now()
      };

      const request = store.put(cacheEntry);

      return new Promise((resolve) => {
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      });
    } catch (error) {
      console.warn('Failed to save to persistent cache:', error);
      return false;
    }
  }

  async invalidate(key: string): Promise<void> {
    // Remove from memory
    this.memoryCache.delete(key);

    // Remove from persistent cache
    if (this.persistentCache) {
      try {
        const transaction = this.persistentCache.transaction(['images'], 'readwrite');
        const store = transaction.objectStore('images');
        store.delete(key);
      } catch (error) {
        console.warn('Failed to invalidate persistent cache:', error);
      }
    }
  }

  async clearCache(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();

    // Clear persistent cache
    if (this.persistentCache) {
      try {
        const transaction = this.persistentCache.transaction(['images'], 'readwrite');
        const store = transaction.objectStore('images');
        store.clear();
      } catch (error) {
        console.warn('Failed to clear persistent cache:', error);
      }
    }
  }

  private getTotalCacheSize(): number {
    let total = 0;
    for (const entry of this.memoryCache.values()) {
      total += entry.data.size;
    }
    return total;
  }

  private async evictLeastUsed(): Promise<void> {
    const config = getConfig();
    const targetSize = config.maxCacheSize * 0.8; // Keep 80% capacity

    // Sort by access patterns (LRU with frequency)
    const entries = Array.from(this.memoryCache.entries()).sort((a, b) => {
      const scoreA = a[1].accessCount / (Date.now() - a[1].lastAccessed + 1);
      const scoreB = b[1].accessCount / (Date.now() - b[1].lastAccessed + 1);
      return scoreA - scoreB;
    });

    let currentSize = this.getTotalCacheSize();
    
    for (const [key, entry] of entries) {
      if (currentSize <= targetSize) break;
      
      await this.invalidate(key);
      currentSize -= entry.data.size;
    }
  }

  private async cleanExpiredCache(): Promise<void> {
    if (!this.persistentCache) return;

    try {
      const config = getConfig();
      const expiry = config.cacheExpiryDays * 24 * 60 * 60 * 1000;
      const cutoff = Date.now() - expiry;

      const transaction = this.persistentCache.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      const index = store.index('timestamp');
      
      const range = IDBKeyRange.upperBound(cutoff);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
    } catch (error) {
      console.warn('Failed to clean expired cache:', error);
    }
  }

  getCacheStats(): { memory: number; total: number; entries: number } {
    const memorySize = this.getTotalCacheSize();
    return {
      memory: memorySize,
      total: memorySize, // In real implementation, would include persistent cache size
      entries: this.memoryCache.size
    };
  }
}

export const cacheManager = new CacheManager();
