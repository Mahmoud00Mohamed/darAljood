export interface CachedImage {
  data: string; // base64 أو blob URL
  timestamp: number;
  size: number;
  metadata: ImageMetadata;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  source: string;
  responsive?: ResponsiveVariants;
}

export interface ResponsiveVariants {
  small?: string;
  medium?: string;
  large?: string;
}

export interface LoadImageOptions {
  priority?: "low" | "normal" | "high";
  placeholder?: string | boolean;
  fallback?: string;
  responsive?: boolean;
  size?: "small" | "medium" | "large" | "auto";
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}

export interface PreloadOptions {
  priority?: number;
  responsive?: boolean;
  sizes?: string[];
}

export type LoadState = "idle" | "loading" | "loaded" | "error" | "retrying";

export interface ImageLoadResult {
  state: LoadState;
  data?: string;
  metadata?: ImageMetadata;
  error?: Error;
  progress?: number;
}
