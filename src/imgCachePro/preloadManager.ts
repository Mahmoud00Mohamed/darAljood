import { cacheManager } from "./cacheManager";
import { getConfig } from "./config";
import { generateKey, isValidUrl, throttle } from "./utils";
import { PreloadOptions } from "./types";

class PreloadManager {
  private preloadQueue: Map<
    string,
    { url: string; options: PreloadOptions; priority: number }
  > = new Map();
  private activePreloads: Set<string> = new Set();
  private intersectionObserver?: IntersectionObserver;
  private pendingPreloads: Map<
    string,
    { resolve: () => void; reject: (error: Error) => void }
  > = new Map();

  constructor() {
    this.initIntersectionObserver();
  }

  // التحميل المسبق لصورة واحدة
  async preloadImage(url: string, options: PreloadOptions = {}): Promise<void> {
    if (!isValidUrl(url)) {
      throw new Error("رابط الصورة غير صحيح");
    }

    const key = generateKey(url);

    // التحقق من وجود الصورة في الكاش
    const cached = await cacheManager.getFromCache(key);
    if (cached) {
      return; // الصورة موجودة بالفعل
    }

    // إضافة إلى قائمة الانتظار
    const priority = this.getPriorityValue(options.priority || "medium");
    this.preloadQueue.set(key, { url, options, priority });

    // بدء المعالجة
    await this.processQueue();
  }

  // التحميل المسبق لمجموعة من الصور
  async preloadImages(
    urls: string[],
    options: PreloadOptions = {}
  ): Promise<void> {
    const promises = urls.map((url) => this.preloadImage(url, options));
    await Promise.allSettled(promises);
  }

  // التنبؤ والتحميل المسبق الذكي
  predictAndPreload(keysOrUrls: string[]): void {
    const throttledPreload = throttle(() => {
      keysOrUrls.forEach(async (keyOrUrl) => {
        try {
          await this.preloadImage(keyOrUrl, { priority: "low" });
        } catch (error) {
          console.warn("فشل في التحميل المسبق:", error);
        }
      });
    }, 500);

    throttledPreload();
  }

  // تسجيل صورة كمطلوبة قريباً
  markAsNeeded(keyOrUrl: string, options: PreloadOptions = {}): void {
    void this.preloadImage(keyOrUrl, { ...options, priority: "high" });
  }

  // مراقبة عنصر للتحميل المسبق عند الاقتراب منه
  observeElement(
    element: HTMLElement,
    url: string,
    options: PreloadOptions = {}
  ): void {
    if (!this.intersectionObserver) {
      this.initIntersectionObserver();
    }

    // ربط البيانات بالعنصر
    element.dataset.preloadUrl = url;
    element.dataset.preloadOptions = JSON.stringify(options);

    this.intersectionObserver?.observe(element);
  }

  // إلغاء مراقبة عنصر
  unobserveElement(element: HTMLElement): void {
    this.intersectionObserver?.unobserve(element);
  }

  // الحصول على حالة قائمة التحميل المسبق
  getPreloadStats(): { queued: number; active: number; completed: number } {
    return {
      queued: this.preloadQueue.size,
      active: this.activePreloads.size,
      completed: 0, // يمكن تتبع هذا إذا لزم الأمر
    };
  }

  // تنظيف قائمة التحميل المسبق
  clearQueue(): void {
    this.preloadQueue.clear();
    this.activePreloads.clear();
  }

  // معالجة قائمة التحميل المسبق
  private async processQueue(): Promise<void> {
    const config = getConfig();
    const maxConcurrent = config.maxConcurrentPreloads;

    // ترتيب العناصر حسب الأولوية
    const sortedQueue = Array.from(this.preloadQueue.entries()).sort(
      ([, a], [, b]) => b.priority - a.priority
    );

    for (const [key, item] of sortedQueue) {
      if (this.activePreloads.size >= maxConcurrent) {
        break; // انتظار حتى يتم تحرير مساحة
      }

      if (this.activePreloads.has(key)) {
        continue; // التحميل جاري بالفعل
      }

      this.preloadQueue.delete(key);
      this.activePreloads.add(key);

      // بدء التحميل
      this.loadImageData(key, item.url, item.options).finally(() => {
        this.activePreloads.delete(key);
        // معالجة المزيد من العناصر
        if (this.preloadQueue.size > 0) {
          this.processQueue();
        }
      });

      // تأخير إضافي حسب الإعدادات
      if (item.options.delay) {
        await new Promise((resolve) => setTimeout(resolve, item.options.delay));
      }
    }
  }

  // تحميل بيانات الصورة
  private async loadImageData(
    key: string,
    url: string,
    options: PreloadOptions
  ): Promise<void> {
    try {
      // يمكن استخدام options هنا للتحكم في عملية التحميل
      const priority = options.priority || "medium";
      console.debug(`Loading image with priority: ${priority}`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const dataUrl = await this.blobToDataUrl(blob);

      await cacheManager.saveToCache(key, url, dataUrl, blob.type);

      // تنفيذ callback إذا كان موجوداً
      const pending = this.pendingPreloads.get(key);
      if (pending) {
        pending.resolve();
        this.pendingPreloads.delete(key);
      }
    } catch (error) {
      console.warn(`فشل في تحميل الصورة: ${url}`, error);

      const pending = this.pendingPreloads.get(key);
      if (pending) {
        pending.reject(error as Error);
        this.pendingPreloads.delete(key);
      }
    }
  }

  // تحويل Blob إلى Data URL
  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // تحويل الأولوية إلى رقم
  private getPriorityValue(priority: "high" | "medium" | "low"): number {
    switch (priority) {
      case "high":
        return 3;
      case "medium":
        return 2;
      case "low":
        return 1;
      default:
        return 2;
    }
  }

  // تهيئة مراقب التقاطع
  private initIntersectionObserver(): void {
    const config = getConfig();

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const url = element.dataset.preloadUrl;
            const optionsStr = element.dataset.preloadOptions;

            if (url) {
              try {
                const parsedOptions = optionsStr ? JSON.parse(optionsStr) : {};
                void this.preloadImage(url, parsedOptions);

                // إلغاء المراقبة بعد التحميل المسبق
                this.intersectionObserver?.unobserve(element);
              } catch (error) {
                console.warn("خطأ في معالجة التحميل المسبق:", error);
              }
            }
          }
        });
      },
      {
        rootMargin: `${config.preloadThreshold * 100}px`,
        threshold: config.preloadThreshold,
      }
    );
  }
}

// إنشاء مثيل واحد لإدارة التحميل المسبق
export const preloadManager = new PreloadManager();
