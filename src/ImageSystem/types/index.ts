// Types for the Image System
export interface ImageCacheEntry {
  url: string;
  blob: Blob;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

export interface ImageLoadOptions {
  strategy?: 'eager' | 'lazy' | 'preload';
  priority?: 'high' | 'medium' | 'low';
  placeholder?: string;
  fallback?: string;
  progressive?: boolean;
  quality?: number;
  sizes?: string;
  srcSet?: string;
}

export interface ImageSystemConfig {
  maxCacheSize: number; // in MB
  maxCacheAge: number; // in milliseconds
  cleanupInterval: number; // in milliseconds
  preloadDistance: number; // pixels from viewport
  retryAttempts: number;
  retryDelay: number; // milliseconds
}

export interface LoadedImage {
  src: string;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  progress: number;
}

export interface ImageRef {
  element: HTMLImageElement | null;
  observer: IntersectionObserver | null;
}