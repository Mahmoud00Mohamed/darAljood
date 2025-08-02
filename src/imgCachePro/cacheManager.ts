import { CacheItem } from "./types";
import { getConfig } from "./config";
import { formatBytes } from "./utils";

class CacheManager {
  private memoryCache: Map<string, CacheItem> = new Map();
  private readonly STORAGE_KEY = "imgCachePro";
  private readonly METADATA_KEY = "imgCachePro_metadata";

  // الحصول على صورة من الكاش
  async getFromCache(key: string): Promise<CacheItem | null> {
    // البحث في كاش الذاكرة أولاً
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && this.isItemValid(memoryItem)) {
      return memoryItem;
    }

    // البحث في التخزين المحلي
    try {
      const storageItem = localStorage.getItem(`${this.STORAGE_KEY}_${key}`);
      if (storageItem) {
        const item: CacheItem = JSON.parse(storageItem);
        if (this.isItemValid(item)) {
          // إضافة إلى كاش الذاكرة للوصول السريع
          this.memoryCache.set(key, item);
          return item;
        } else {
          // حذف العنصر المنتهي الصلاحية
          this.removeFromStorage(key);
        }
      }
    } catch (error) {
      console.warn("خطأ في قراءة الكاش:", error);
    }

    return null;
  }

  // حفظ صورة في الكاش
  async saveToCache(
    key: string,
    url: string,
    data: string,
    contentType: string = "image/jpeg"
  ): Promise<void> {
    const size = this.calculateDataSize(data);

    const item: CacheItem = {
      key,
      url,
      data,
      timestamp: Date.now(),
      size,
      contentType,
    };

    // التحقق من حجم الكاش قبل الحفظ
    await this.ensureCacheSize(size);

    // حفظ في كاش الذاكرة
    this.memoryCache.set(key, item);

    // حفظ في التخزين المحلي
    try {
      localStorage.setItem(`${this.STORAGE_KEY}_${key}`, JSON.stringify(item));
      await this.updateMetadata(key);
    } catch (error) {
      console.warn("خطأ في حفظ الكاش:", error);
      // إذا فشل الحفظ، حاول حذف عناصر قديمة وإعادة المحاولة
      await this.cleanOldItems();
      try {
        localStorage.setItem(
          `${this.STORAGE_KEY}_${key}`,
          JSON.stringify(item)
        );
        await this.updateMetadata(key);
      } catch (retryError) {
        console.error("فشل في حفظ الكاش بعد التنظيف:", retryError);
      }
    }
  }

  // إلغاء صورة من الكاش
  invalidate(key: string): void {
    this.memoryCache.delete(key);
    this.removeFromStorage(key);
  }

  // تنظيف الكاش بالكامل
  async clearCache(): Promise<void> {
    this.memoryCache.clear();

    try {
      const metadata = this.getMetadata();
      for (const key of metadata.keys) {
        localStorage.removeItem(`${this.STORAGE_KEY}_${key}`);
      }
      localStorage.removeItem(this.METADATA_KEY);
    } catch (error) {
      console.warn("خطأ في تنظيف الكاش:", error);
    }
  }

  // الحصول على إحصائيات الكاش
  getCacheStats(): {
    itemCount: number;
    totalSize: string;
    memoryItems: number;
  } {
    const metadata = this.getMetadata();
    let totalSize = 0;
    for (const cacheItem of this.memoryCache.values()) {
      totalSize += cacheItem.size;
    }

    return {
      itemCount: metadata.keys.length,
      totalSize: formatBytes(totalSize),
      memoryItems: this.memoryCache.size,
    };
  }

  // التحقق من صلاحية العنصر
  private isItemValid(item: CacheItem): boolean {
    const config = getConfig();
    const expirationTime = config.cacheExpiration * 24 * 60 * 60 * 1000; // تحويل الأيام إلى ميللي ثانية
    return Date.now() - item.timestamp < expirationTime;
  }

  // حساب حجم البيانات
  private calculateDataSize(data: string): number {
    return new Blob([data]).size;
  }

  // ضمان عدم تجاوز حجم الكاش المسموح
  private async ensureCacheSize(newItemSize: number): Promise<void> {
    const config = getConfig();
    const maxSizeBytes = config.maxCacheSize * 1024 * 1024; // تحويل الميجابايت إلى بايت

    let currentSize = this.getCurrentCacheSize();

    while (
      currentSize + newItemSize > maxSizeBytes &&
      this.memoryCache.size > 0
    ) {
      await this.removeOldestItem();
      currentSize = this.getCurrentCacheSize();
    }
  }

  // الحصول على الحجم الحالي للكاش
  private getCurrentCacheSize(): number {
    let totalSize = 0;
    for (const item of this.memoryCache.values()) {
      totalSize += item.size;
    }
    return totalSize;
  }

  // حذف أقدم عنصر من الكاش
  private async removeOldestItem(): Promise<void> {
    let oldestKey = "";
    let oldestTimestamp = Date.now();

    for (const [key, item] of this.memoryCache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.invalidate(oldestKey);
    }
  }

  // حذف من التخزين المحلي
  private removeFromStorage(key: string): void {
    try {
      localStorage.removeItem(`${this.STORAGE_KEY}_${key}`);
      const metadata = this.getMetadata();
      metadata.keys = metadata.keys.filter((k) => k !== key);
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.warn("خطأ في حذف من التخزين:", error);
    }
  }

  // تحديث البيانات الوصفية
  private async updateMetadata(key: string): Promise<void> {
    try {
      const metadata = this.getMetadata();
      if (!metadata.keys.includes(key)) {
        metadata.keys.push(key);
      }
      metadata.lastUpdated = Date.now();
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.warn("خطأ في تحديث البيانات الوصفية:", error);
    }
  }

  // الحصول على البيانات الوصفية
  private getMetadata(): { keys: string[]; lastUpdated: number } {
    try {
      const stored = localStorage.getItem(this.METADATA_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn("خطأ في قراءة البيانات الوصفية:", error);
    }

    return { keys: [], lastUpdated: Date.now() };
  }

  // تنظيف العناصر القديمة
  private async cleanOldItems(): Promise<void> {
    const metadata = this.getMetadata();
    const validKeys: string[] = [];

    for (const key of metadata.keys) {
      try {
        const storageItem = localStorage.getItem(`${this.STORAGE_KEY}_${key}`);
        if (storageItem) {
          const item: CacheItem = JSON.parse(storageItem);
          if (this.isItemValid(item)) {
            validKeys.push(key);
          } else {
            localStorage.removeItem(`${this.STORAGE_KEY}_${key}`);
          }
        }
      } catch {
        // حذف العنصر التالف
        localStorage.removeItem(`${this.STORAGE_KEY}_${key}`);
      }
    }

    // تحديث البيانات الوصفية
    const newMetadata = {
      keys: validKeys,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(this.METADATA_KEY, JSON.stringify(newMetadata));
  }
}

// إنشاء مثيل واحد لإدارة الكاش
export const cacheManager = new CacheManager();
