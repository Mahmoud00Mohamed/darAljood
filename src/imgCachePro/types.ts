// أنواع البيانات المستخدمة في النظام
export interface CacheItem {
  key: string;
  url: string;
  data: string; // base64 data URL
  timestamp: number;
  size: number; // بالبايت
  contentType: string;
  etag?: string;
  lastModified?: string;
}

export interface LoadImageOptions {
  placeholder?: string;
  alt?: string;
  className?: string;
  priority?: "high" | "medium" | "low";
  resize?: {
    width?: number;
    height?: number;
    quality?: number;
  };
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export interface PreloadOptions {
  priority?: "high" | "medium" | "low";
  delay?: number;
}

export interface ImageState {
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
  src?: string;
  error?: Error;
}

export type ImageLoadStatus = "idle" | "loading" | "loaded" | "error";

export interface RetryPolicy {
  maxRetries: number;
  currentAttempt: number;
  delay: number;
  backoffMultiplier: number;
}
