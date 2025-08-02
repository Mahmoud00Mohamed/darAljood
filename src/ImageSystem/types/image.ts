// Types for the advanced image system
export interface ImageCacheItem {
  url: string;
  blob: Blob;
  timestamp: number;
  accessCount: number;
  size: number;
}

export interface ImagePreloadOptions {
  priority?: 'high' | 'medium' | 'low';
  crossOrigin?: 'anonymous' | 'use-credentials';
  referrerPolicy?: ReferrerPolicy;
}

export interface AdvancedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  fallback?: string;
  priority?: 'high' | 'medium' | 'low';
  lazy?: boolean;
  blur?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  sizes?: string;
  quality?: number;
  [key: string]: any;
}

export interface UseAdvancedImageOptions {
  preload?: boolean;
  priority?: 'high' | 'medium' | 'low';
  fallback?: string;
  blur?: boolean;
}

export interface ImageState {
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
  error?: Error;
  progress?: number;
}