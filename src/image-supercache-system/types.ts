export interface ImageCacheConfig {
  // Cache settings
  longTermCacheDurationMs: number;
  memoryCache: {
    maxSizeBytes: number;
    maxItems: number;
  };

  // Preloading settings
  preload: {
    concurrentDownloads: number;
    priorityThreshold: number;
    predictiveDistance: number;
    aggressivePreload: boolean; // New: للتحميل الفوري
    preloadOnHover: boolean; // New: تحميل عند hover
  };

  // UI settings
  placeholder: {
    fadeInDurationMs: number;
    fadeOutDurationMs: number;
    blurSize: number;
    showProgressBar: boolean;
    progressiveLoading: boolean; // New: تحميل تدريجي
  };

  // Retry settings
  retry: {
    maxAttempts: number;
    baseDelayMs: number;
    exponentialBackoff: boolean;
  };

  // Image optimization
  optimization: {
    enableResponsive: boolean;
    densityMultipliers: number[];
    fallbackFormats: string[];
    compressionQuality: number; // New: جودة الضغط
    lazyLoading: boolean; // New: تحميل كسول
  };
}

export interface CacheEntry {
  key: string;
  url: string;
  data: string; // base64 or blob URL
  timestamp: number;
  size: number;
  metadata: {
    width?: number;
    height?: number;
    format?: string;
    originalUrl: string;
    lowQuality?: string; // New: نسخة منخفضة الجودة
  };
}

export interface LoadImageOptions {
  priority?: "low" | "normal" | "high" | "immediate"; // New: immediate priority
  placeholder?: string | boolean;
  fallback?: string;
  responsive?: {
    sizes: string;
    srcSet?: string;
  };
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  progressive?: boolean; // New: تحميل تدريجي
  lazy?: boolean; // New: تحميل كسول
}

export interface PreloadOptions {
  priority?: "low" | "normal" | "high" | "immediate";
  delay?: number;
  batch?: boolean; // New: تحميل مجمع
}

export interface ImageState {
  loading: boolean;
  loaded: boolean;
  error: Error | null;
  progress: number;
  url: string | null;
  placeholder: string | null;
  lowQualityUrl?: string | null; // New: صورة منخفضة الجودة
}
