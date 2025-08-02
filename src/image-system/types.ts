// أنواع البيانات للنظام

export interface EnhancedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  aspectRatio?: "square" | "portrait" | "landscape" | "auto";
  onLoad?: () => void;
  onError?: () => void;
  enableBlurUp?: boolean;
  showPlaceholder?: boolean;
  placeholderSize?: number;
  fallbackSrc?: string;
  threshold?: number;
  rootMargin?: string;
}

export interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  showZoom?: boolean;
  priority?: boolean;
  aspectRatio?: "square" | "portrait" | "landscape" | "auto";
  width?: number;
  height?: number;
  sizes?: string;
  quality?: number;
  enableBlurUp?: boolean;
  threshold?: number;
  rootMargin?: string;
  fallbackSrc?: string;
  placeholderSize?: number;
}

export interface LogoPlaceholderProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export interface UseImagePreloaderOptions {
  enabled?: boolean;
  priority?: boolean;
  quality?: number;
}

export interface CachedImage {
  url: string;
  blob: Blob;
  timestamp: number;
}