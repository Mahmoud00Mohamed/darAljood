export interface ImageConfig {
  // Cache settings
  maxCacheSize: number;
  cacheExpiryDays: number;
  memoryExpiryMs: number;
  
  // Loading settings
  fadeTransitionMs: number;
  retryAttempts: number;
  retryDelayMs: number;
  preloadThreshold: number;
  
  // Placeholder settings
  placeholderSize: {
    width: number;
    height: number;
  };
  placeholderColor: string;
  
  // Quality settings
  quality: 'auto' | 'low' | 'medium' | 'high';
  enableWebP: boolean;
  enableLazyLoad: boolean;
}

export interface ImageData {
  blob: Blob;
  url: string;
  timestamp: number;
  size: number;
  format: string;
}

export interface CacheEntry {
  data: ImageData;
  lastAccessed: number;
  accessCount: number;
}

export interface LoadImageOptions {
  priority?: 'low' | 'medium' | 'high';
  quality?: 'auto' | 'low' | 'medium' | 'high';
  fallback?: string;
  placeholder?: string | boolean;
  fadeIn?: boolean;
  retry?: boolean;
  width?: number;
  height?: number;
}

export interface PreloadOptions {
  priority?: 'low' | 'medium' | 'high';
  quality?: 'auto' | 'low' | 'medium' | 'high';
  immediate?: boolean;
}

export interface ImageSystemEvents {
  onLoad?: (key: string, imageData: ImageData) => void;
  onError?: (key: string, error: Error) => void;
  onCache?: (key: string, size: number) => void;
  onPreload?: (key: string) => void;
}
