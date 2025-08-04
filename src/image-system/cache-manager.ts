import { CachedImage, ImageMetadata } from "./types";
import { defaultConfig, ImageSystemConfig } from "./config";

export class CacheManager {
  private memoryCache = new Map<string, CachedImage>();
  private config: ImageSystemConfig["cache"];

  constructor(config: ImageSystemConfig["cache"] = defaultConfig.cache) {
    this.config = config;
    this.initializeCleanup();
  }

  async getFromCache(key: string): Promise<CachedImage | null> {
    // فحص الكاش في الذاكرة أولاً
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && this.isValid(memoryItem)) {
      return memoryItem;
    }

    // فحص الكاش المستمر
    if (this.config.enablePersistent) {
      const persistentItem = await this.getFromPersistentCache(key);
      if (persistentItem && this.isValid(persistentItem)) {
        // نقل إلى كاش الذاكرة للوصول السريع
        this.memoryCache.set(key, persistentItem);
        return persistentItem;
      }
    }

    return null;
  }

  async saveToCache(
    key: string,
    imageData: string,
    metadata: ImageMetadata
  ): Promise<void> {
    const cachedImage: CachedImage = {
      data: imageData,
      timestamp: Date.now(),
      size: this.estimateSize(imageData),
      metadata,
    };

    // حفظ في كاش الذاكرة
    this.memoryCache.set(key, cachedImage);
    this.enforceMemoryLimit();

    // حفظ في الكاش المستمر
    if (this.config.enablePersistent) {
      await this.saveToPersistentCache(key, cachedImage);
    }
  }

  async invalidate(key: string): Promise<void> {
    this.memoryCache.delete(key);

    if (this.config.enablePersistent) {
      localStorage.removeItem(this.config.persistentPrefix + key);
    }
  }

  async clearAll(): Promise<void> {
    this.memoryCache.clear();

    if (this.config.enablePersistent) {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.config.persistentPrefix)) {
          localStorage.removeItem(key);
        }
      });
    }
  }

  private isValid(item: CachedImage): boolean {
    const age = Date.now() - item.timestamp;
    return age < this.config.maxAge;
  }

  private async getFromPersistentCache(
    key: string
  ): Promise<CachedImage | null> {
    try {
      const stored = localStorage.getItem(this.config.persistentPrefix + key);
      if (stored) {
        return JSON.parse(stored) as CachedImage;
      }
    } catch (error) {
      console.warn("فشل في قراءة الكاش المستمر:", error);
    }
    return null;
  }

  private async saveToPersistentCache(
    key: string,
    item: CachedImage
  ): Promise<void> {
    try {
      localStorage.setItem(
        this.config.persistentPrefix + key,
        JSON.stringify(item)
      );
    } catch (error) {
      console.warn("فشل في حفظ الكاش المستمر:", error);
      // تنظيف الكاش عند امتلاء التخزين
      this.cleanupPersistentCache();
    }
  }

  private enforceMemoryLimit(): void {
    if (this.memoryCache.size > this.config.maxSize) {
      // حذف أقدم العناصر
      const entries = Array.from(this.memoryCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      const toDelete = entries.slice(0, entries.length - this.config.maxSize);
      toDelete.forEach(([key]) => this.memoryCache.delete(key));
    }
  }

  private cleanupPersistentCache(): void {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys
      .filter((key) => key.startsWith(this.config.persistentPrefix))
      .map((key) => {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const item = JSON.parse(stored) as CachedImage;
            return { key, timestamp: item.timestamp };
          } catch {
            return { key, timestamp: 0 };
          }
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a!.timestamp - b!.timestamp);

    // حذف أقدم 25% من الكاش
    const toDelete = cacheKeys.slice(0, Math.floor(cacheKeys.length * 0.25));
    toDelete.forEach((item) => localStorage.removeItem(item!.key));
  }

  private estimateSize(data: string): number {
    // تقدير تقريبي لحجم البيانات
    return data.length * 0.75; // base64 overhead
  }

  private initializeCleanup(): void {
    // تنظيف دوري كل ساعة
    setInterval(() => {
      this.cleanupExpired();
    }, 60 * 60 * 1000);
  }

  private cleanupExpired(): void {
    // تنظيف كاش الذاكرة
    for (const [key, item] of this.memoryCache.entries()) {
      if (!this.isValid(item)) {
        this.memoryCache.delete(key);
      }
    }

    // تنظيف الكاش المستمر
    if (this.config.enablePersistent) {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.config.persistentPrefix)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              const item = JSON.parse(stored) as CachedImage;
              if (!this.isValid(item)) {
                localStorage.removeItem(key);
              }
            } catch {
              localStorage.removeItem(key);
            }
          }
        }
      });
    }
  }
}
