import { ImageCacheConfig } from "./types";

export const defaultConfig: ImageCacheConfig = {
  longTermCacheDurationMs: 30 * 24 * 60 * 60 * 1000, // 30 days
  memoryCache: {
    maxSizeBytes: 50 * 1024 * 1024, // 50MB
    maxItems: 200,
  },
  preload: {
    concurrentDownloads: 6, // زيادة التحميلات المتزامنة
    priorityThreshold: 0.8,
    predictiveDistance: 2,
    aggressivePreload: true, // تحميل فوري للصور المهمة
    preloadOnHover: true, // تحميل عند hover
  },
  placeholder: {
    fadeInDurationMs: 150, // أسرع
    fadeOutDurationMs: 100, // أسرع
    blurSize: 10,
    showProgressBar: false,
    progressiveLoading: true, // تحميل تدريجي
  },
  retry: {
    maxAttempts: 3,
    baseDelayMs: 500, // أسرع في إعادة المحاولة
    exponentialBackoff: true,
  },
  optimization: {
    enableResponsive: true,
    densityMultipliers: [1, 1.5, 2, 3],
    fallbackFormats: ["webp", "jpg", "png"],
    compressionQuality: 0.85, // جودة أفضل
    lazyLoading: false, // إيقاف التحميل الكسول للسرعة
  },
};
