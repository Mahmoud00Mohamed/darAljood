/**
 * نظام التخزين المؤقت للصور لتحسين الأداء
 * Image caching system for better performance
 */

import type { CachedImage } from '../types';

class ImageCacheManager {
  private cache = new Map<string, CachedImage>();
  private maxCacheSize = 50; // الحد الأقصى لعدد الصور المخزنة
  private maxAge = 30 * 60 * 1000; // 30 دقيقة بالميلي ثانية

  /**
   * الحصول على صورة من التخزين المؤقت أو تحميلها
   */
  async getImage(url: string): Promise<string> {
    // التحقق من وجود الصورة في التخزين المؤقت وصلاحيتها
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.maxAge) {
      return URL.createObjectURL(cached.blob);
    }

    try {
      // تحميل وتخزين الصورة
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch image");

      const blob = await response.blob();

      // تنظيف الإدخالات القديمة إذا كان التخزين ممتلئاً
      if (this.cache.size >= this.maxCacheSize) {
        this.cleanOldEntries();
      }

      // تخزين الصورة
      this.cache.set(url, {
        url,
        blob,
        timestamp: Date.now(),
      });

      return URL.createObjectURL(blob);
    } catch (error) {
      console.warn("Failed to cache image:", url, error);
      return url; // العودة للرابط الأصلي في حالة الفشل
    }
  }

  /**
   * تنظيف الإدخالات القديمة
   */
  private cleanOldEntries() {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // إزالة أقدم 25% من الإدخالات
    const toRemove = Math.floor(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      const [key, value] = entries[i];
      URL.revokeObjectURL(URL.createObjectURL(value.blob));
      this.cache.delete(key);
    }
  }

  /**
   * مسح جميع الصور المخزنة
   */
  clearCache() {
    this.cache.forEach((cached) => {
      URL.revokeObjectURL(URL.createObjectURL(cached.blob));
    });
    this.cache.clear();
  }

  /**
   * الحصول على معلومات التخزين المؤقت
   */
  getCacheInfo() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      maxAge: this.maxAge,
    };
  }

  /**
   * تحديث إعدادات التخزين المؤقت
   */
  updateSettings(settings: { maxCacheSize?: number; maxAge?: number }) {
    if (settings.maxCacheSize) this.maxCacheSize = settings.maxCacheSize;
    if (settings.maxAge) this.maxAge = settings.maxAge;
  }
}

export const imageCache = new ImageCacheManager();