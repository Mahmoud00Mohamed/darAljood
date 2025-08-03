export interface ImageData {
  url: string;
  blob: Blob;
  timestamp: number;
  size: number;
  format: string;
  version: string;
}

export interface CacheEntry {
  key: string;
  data: ImageData;
  expiresAt: number;
  lastAccessed: number;
  hitCount: number;
}

export interface PlaceholderOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  textColor?: string;
  showText?: boolean;
  customText?: string;
}

export interface LoadImageOptions {
  placeholder?: PlaceholderOptions;
  priority?: "low" | "normal" | "high";
  fadeInDuration?: number;
  retryAttempts?: number;
  responsive?: {
    sizes?: string;
    srcSet?: string;
  };
  onLoad?: (imageUrl: string) => void;
  onError?: (error: Error) => void;
}

export interface PreloadOptions {
  priority?: "low" | "normal" | "high";
  responsive?: {
    sizes?: string;
    srcSet?: string;
  };
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  memoryUsage: number;
  oldestEntry: number;
  newestEntry: number;
}

export interface RetryPolicy {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBackoff: boolean;
}

export interface ImageVariant {
  url: string;
  width: number;
  density: number;
}

export interface LoadResult {
  success: boolean;
  imageUrl?: string;
  error?: Error;
  fromCache: boolean;
  loadTime: number;
}
