import { CacheManager } from "./cache-manager";
import { PreloadEngine } from "./preload-engine";
import { RetryHandler } from "./retry-handler";
import { ImageOptimizer } from "./image-optimizer";
import { LoadImageOptions, ImageLoadResult, PreloadOptions } from "./types";
import { defaultConfig, ImageSystemConfig } from "./config";

export class ImageLoader {
  private cacheManager: CacheManager;
  private preloadEngine: PreloadEngine;
  private retryHandler: RetryHandler;
  private imageOptimizer: ImageOptimizer;
  private config: ImageSystemConfig;

  constructor(config: Partial<ImageSystemConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.cacheManager = new CacheManager(this.config.cache);
    this.preloadEngine = new PreloadEngine(this.config.preload);
    this.retryHandler = new RetryHandler(this.config.retry);
    this.imageOptimizer = new ImageOptimizer(this.config.optimization);
  }

  async loadImage(
    keyOrUrl: string,
    options: LoadImageOptions = {}
  ): Promise<ImageLoadResult> {
    const cacheKey = this.generateCacheKey(keyOrUrl, options);

    try {
      // فحص الكاش أولاً
      const cached = await this.cacheManager.getFromCache(cacheKey);
      if (cached) {
        return {
          state: "loaded",
          data: cached.data,
          metadata: cached.metadata,
        };
      }

      // تحميل الصورة مع إعادة المحاولة
      const result = await this.retryHandler.execute(
        cacheKey,
        () => this.fetchImage(keyOrUrl, options),
        (attempt, error) => {
          if (options.onError) {
            options.onError(new Error(`المحاولة ${attempt}: ${error.message}`));
          }
        }
      );

      return result;
    } catch (error) {
      return {
        state: "error",
        error: error as Error,
      };
    }
  }

  async preloadImage(
    keyOrUrl: string,
    options: PreloadOptions = {}
  ): Promise<void> {
    await this.preloadEngine.markAsNeeded(keyOrUrl, options);
  }

  private async fetchImage(
    keyOrUrl: string,
    options: LoadImageOptions
  ): Promise<ImageLoadResult> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const optimizedUrl = this.imageOptimizer.optimizeUrl(
        keyOrUrl,
        options.size,
        undefined
      );

      const handleLoad = async () => {
        try {
          // استخراج البيانات
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            throw new Error("فشل في إنشاء canvas context");
          }

          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          ctx.drawImage(img, 0, 0);

          const dataUrl = canvas.toDataURL();
          const metadata = this.imageOptimizer.extractMetadata(img);

          // حفظ في الكاش
          const cacheKey = this.generateCacheKey(keyOrUrl, options);
          await this.cacheManager.saveToCache(cacheKey, dataUrl, metadata);

          resolve({
            state: "loaded",
            data: dataUrl,
            metadata,
          });
        } catch (error) {
          reject(error);
        }
      };

      const handleError = () => {
        // تجربة fallback إذا وُجد
        if (options.fallback) {
          img.src = options.fallback;
          return;
        }

        reject(new Error(`فشل في تحميل الصورة: ${optimizedUrl}`));
      };

      // تتبع التقدم (تقريبي)
      if (options.onProgress) {
        let progressStarted = false;
        img.addEventListener("loadstart", () => {
          if (!progressStarted) {
            progressStarted = true;
            options.onProgress!(0);
          }
        });

        img.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            options.onProgress!(progress);
          }
        });
      }

      img.onload = handleLoad;
      img.onerror = handleError;
      img.crossOrigin = "anonymous";
      img.src = optimizedUrl;

      // بدء تتبع التقدم
      if (options.onProgress) {
        options.onProgress(10); // بداية التحميل
      }
    });
  }

  private generateCacheKey(url: string, options: LoadImageOptions): string {
    const parts = [
      url,
      options.size || "auto",
      options.responsive ? "responsive" : "fixed",
    ];

    return parts.join("|");
  }

  // طرق إضافية لإدارة النظام
  async clearCache(): Promise<void> {
    await this.cacheManager.clearAll();
  }

  getPreloadStatus() {
    return this.preloadEngine.getQueueStatus();
  }

  updateConfig(newConfig: Partial<ImageSystemConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
