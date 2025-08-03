export interface CacheConfig {
  // Memory cache settings
  maxMemoryItems: number;
  memoryTTL: number; // milliseconds

  // Storage cache settings
  useLocalStorage: boolean;
  useSessionStorage: boolean;
  storageTTL: number; // milliseconds
  maxStorageSize: number; // bytes

  // Cache cleanup
  cleanupInterval: number; // milliseconds
  compressionQuality: number; // 0-1
}

export interface PreloadConfig {
  // Preloading behavior
  enablePreload: boolean;
  preloadDistance: number; // pixels from viewport
  maxConcurrentPreloads: number;
  preloadPriority: "low" | "high" | "auto";

  // Smart preloading
  enablePredictive: boolean;
  trackUserBehavior: boolean;
  learningThreshold: number;
}

export interface TransitionConfig {
  // Animation settings
  fadeInDuration: number; // milliseconds
  blurTransition: boolean;
  scaleEffect: boolean;

  // Placeholder settings
  placeholderColor: string;
  placeholderBlur: number;
  showShimmer: boolean;
}

export interface InstantImageConfig {
  cache: CacheConfig;
  preload: PreloadConfig;
  transition: TransitionConfig;

  // General settings
  retryAttempts: number;
  retryDelay: number;
  fallbackImage?: string;
  enableLazyLoading: boolean;

  // Performance
  enableWebP: boolean;
  enableAVIF: boolean;
  responsiveBreakpoints: number[];
}

export interface PartialInstantImageConfig {
  cache?: Partial<CacheConfig>;
  preload?: Partial<PreloadConfig>;
  transition?: Partial<TransitionConfig>;

  // General settings
  retryAttempts?: number;
  retryDelay?: number;
  fallbackImage?: string;
  enableLazyLoading?: boolean;

  // Performance
  enableWebP?: boolean;
  enableAVIF?: boolean;
  responsiveBreakpoints?: number[];
}

export interface ImageData {
  src: string;
  blob: Blob;
  timestamp: number;
  accessCount: number;
  size: number;
  format: string;
}

export interface PreloadItem {
  src: string;
  priority: number;
  timestamp: number;
  inViewport: boolean;
}
