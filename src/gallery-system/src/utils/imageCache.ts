/**
 * نظام تخزين مؤقت متقدم للصور
 */
class ImageCache {
  private static instance: ImageCache;
  private cache = new Map<string, HTMLImageElement>();
  private cacheTimestamps = new Map<string, number>();
  private readonly maxCacheSize = 100; // حد أقصى 100 صورة
  private readonly maxAge = 30 * 60 * 1000; // 30 دقيقة

  static getInstance(): ImageCache {
    if (!ImageCache.instance) {
      ImageCache.instance = new ImageCache();
    }
    return ImageCache.instance;
  }

  /**
   * تحميل صورة وحفظها في التخزين المؤقت
   */
  async preloadImage(src: string): Promise<HTMLImageElement> {
    // التحقق من وجود الصورة في التخزين المؤقت
    const cached = this.get(src);
    if (cached) {
      return cached;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      
      img.onload = () => {
        this.set(src, img);
        resolve(img);
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      img.src = src;
    });
  }

  /**
   * تحميل مجموعة من الصور بشكل متوازي
   */
  async preloadImages(sources: string[], batchSize = 6): Promise<void> {
    const batches: string[][] = [];
    
    // تقسيم الصور إلى مجموعات
    for (let i = 0; i < sources.length; i += batchSize) {
      batches.push(sources.slice(i, i + batchSize));
    }

    // تحميل كل مجموعة بشكل متتالي
    for (const batch of batches) {
      const promises = batch.map(src => 
        this.preloadImage(src).catch(error => {
          console.warn(`Failed to preload image: ${src}`, error);
          return null;
        })
      );
      
      await Promise.allSettled(promises);
      
      // تأخير قصير بين المجموعات
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
  }

  /**
   * الحصول على صورة من التخزين المؤقت
   */
  get(src: string): HTMLImageElement | null {
    const timestamp = this.cacheTimestamps.get(src);
    
    // التحقق من انتهاء صلاحية الصورة
    if (timestamp && Date.now() - timestamp > this.maxAge) {
      this.delete(src);
      return null;
    }
    
    return this.cache.get(src) || null;
  }

  /**
   * حفظ صورة في التخزين المؤقت
   */
  set(src: string, img: HTMLImageElement): void {
    // تنظيف التخزين المؤقت إذا تجاوز الحد الأقصى
    if (this.cache.size >= this.maxCacheSize) {
      this.cleanup();
    }
    
    this.cache.set(src, img);
    this.cacheTimestamps.set(src, Date.now());
  }

  /**
   * حذف صورة من التخزين المؤقت
   */
  delete(src: string): void {
    this.cache.delete(src);
    this.cacheTimestamps.delete(src);
  }

  /**
   * التحقق من وجود صورة في التخزين المؤقت
   */
  has(src: string): boolean {
    return this.cache.has(src) && !this.isExpired(src);
  }

  /**
   * التحقق من انتهاء صلاحية صورة
   */
  private isExpired(src: string): boolean {
    const timestamp = this.cacheTimestamps.get(src);
    return timestamp ? Date.now() - timestamp > this.maxAge : true;
  }

  /**
   * تنظيف التخزين المؤقت من الصور القديمة
   */
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];
    
    // العثور على الصور المنتهية الصلاحية
    this.cacheTimestamps.forEach((timestamp, src) => {
      if (now - timestamp > this.maxAge) {
        toDelete.push(src);
      }
    });
    
    // حذف الصور المنتهية الصلاحية
    toDelete.forEach(src => this.delete(src));
    
    // إذا لم يكن هناك صور منتهية الصلاحية، احذف الأقدم
    if (this.cache.size >= this.maxCacheSize) {
      const oldestEntries = Array.from(this.cacheTimestamps.entries())
        .sort(([, a], [, b]) => a - b)
        .slice(0, Math.floor(this.maxCacheSize * 0.2)); // احذف 20% من الأقدم
      
      oldestEntries.forEach(([src]) => this.delete(src));
    }
  }

  /**
   * مسح جميع التخزين المؤقت
   */
  clear(): void {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  /**
   * الحصول على إحصائيات التخزين المؤقت
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitRate: this.cache.size > 0 ? (this.cache.size / this.maxCacheSize) * 100 : 0,
    };
  }
}

export const imageCache = ImageCache.getInstance();
export default imageCache;