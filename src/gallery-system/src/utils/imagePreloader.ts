/**
 * خدمة تحميل الصور مسبقاً لتحسين الأداء
 */

interface ImageCache {
  [url: string]: {
    blob: Blob;
    objectUrl: string;
    timestamp: number;
  };
}

interface PreloadOptions {
  priority?: 'high' | 'low';
  sizes?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
}

class ImagePreloader {
  private static instance: ImagePreloader;
  private cache: ImageCache = {};
  private preloadingQueue = new Set<string>();
  private maxCacheSize = 50; // حد أقصى للصور المحفوظة
  private cacheExpiry = 30 * 60 * 1000; // 30 دقيقة

  static getInstance(): ImagePreloader {
    if (!ImagePreloader.instance) {
      ImagePreloader.instance = new ImagePreloader();
    }
    return ImagePreloader.instance;
  }

  /**
   * تحميل صورة واحدة مسبقاً
   */
  async preloadImage(url: string, options: PreloadOptions = {}): Promise<string> {
    // إذا كانت الصورة محفوظة في الكاش، أرجع الرابط المحفوظ
    if (this.cache[url] && this.isValidCache(url)) {
      return this.cache[url].objectUrl;
    }

    // إذا كانت الصورة قيد التحميل، انتظر
    if (this.preloadingQueue.has(url)) {
      return this.waitForPreload(url);
    }

    this.preloadingQueue.add(url);

    try {
      // استخدام fetch مع تحسينات للأداء
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'force-cache', // استخدام الكاش بقوة
        priority: options.priority || 'high',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      // حفظ في الكاش
      this.cache[url] = {
        blob,
        objectUrl,
        timestamp: Date.now(),
      };

      // تنظيف الكاش إذا تجاوز الحد الأقصى
      this.cleanupCache();

      return objectUrl;
    } catch (error) {
      console.warn(`Failed to preload image: ${url}`, error);
      return url; // إرجاع الرابط الأصلي في حالة الفشل
    } finally {
      this.preloadingQueue.delete(url);
    }
  }

  /**
   * تحميل عدة صور مسبقاً بشكل متوازي
   */
  async preloadImages(urls: string[], options: PreloadOptions = {}): Promise<string[]> {
    const preloadPromises = urls.map(url => this.preloadImage(url, options));
    return Promise.all(preloadPromises);
  }

  /**
   * تحميل صور بأولوية عالية (للصور المرئية)
   */
  async preloadVisibleImages(urls: string[]): Promise<string[]> {
    return this.preloadImages(urls, { priority: 'high' });
  }

  /**
   * تحميل صور بأولوية منخفضة (للصور غير المرئية)
   */
  preloadBackgroundImages(urls: string[]): void {
    // تحميل في الخلفية دون انتظار
    urls.forEach(url => {
      this.preloadImage(url, { priority: 'low' }).catch(() => {
        // تجاهل الأخطاء للتحميل في الخلفية
      });
    });
  }

  /**
   * الحصول على رابط محسن للصورة
   */
  getOptimizedUrl(url: string): string {
    if (this.cache[url] && this.isValidCache(url)) {
      return this.cache[url].objectUrl;
    }
    return url;
  }

  /**
   * انتظار انتهاء تحميل صورة
   */
  private async waitForPreload(url: string): Promise<string> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.preloadingQueue.has(url)) {
          clearInterval(checkInterval);
          resolve(this.getOptimizedUrl(url));
        }
      }, 50);

      // timeout بعد 10 ثوان
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(url);
      }, 10000);
    });
  }

  /**
   * التحقق من صحة الكاش
   */
  private isValidCache(url: string): boolean {
    const cached = this.cache[url];
    if (!cached) return false;
    
    const isExpired = Date.now() - cached.timestamp > this.cacheExpiry;
    if (isExpired) {
      this.removeFromCache(url);
      return false;
    }
    
    return true;
  }

  /**
   * تنظيف الكاش
   */
  private cleanupCache(): void {
    const entries = Object.entries(this.cache);
    
    if (entries.length <= this.maxCacheSize) return;

    // ترتيب حسب التاريخ وحذف الأقدم
    entries
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, entries.length - this.maxCacheSize)
      .forEach(([url]) => this.removeFromCache(url));
  }

  /**
   * حذف صورة من الكاش
   */
  private removeFromCache(url: string): void {
    if (this.cache[url]) {
      URL.revokeObjectURL(this.cache[url].objectUrl);
      delete this.cache[url];
    }
  }

  /**
   * مسح الكاش بالكامل
   */
  clearCache(): void {
    Object.values(this.cache).forEach(cached => {
      URL.revokeObjectURL(cached.objectUrl);
    });
    this.cache = {};
  }

  /**
   * الحصول على حجم الكاش
   */
  getCacheSize(): number {
    return Object.keys(this.cache).length;
  }

  /**
   * التحقق من وجود صورة في الكاش
   */
  isCached(url: string): boolean {
    return this.cache[url] && this.isValidCache(url);
  }
}

export const imagePreloader = ImagePreloader.getInstance();
export default imagePreloader;