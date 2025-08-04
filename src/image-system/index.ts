// استيراد الكلاسات
import { ImageLoader } from "./image-loader";
import { SmoothImage } from "./smooth-image";
import { CacheManager } from "./cache-manager";
import { PreloadEngine } from "./preload-engine";
import { RetryHandler } from "./retry-handler";
import { ImageOptimizer } from "./image-optimizer";

// استيراد الأنواع
import type {
  LoadImageOptions,
  PreloadOptions,
  ImageLoadResult,
  LoadState,
  CachedImage,
  ImageMetadata,
  ResponsiveVariants,
} from "./types";

import type { ImageSystemConfig } from "./config";
import { defaultConfig } from "./config";

// إنشاء مثيل مشترك هنا
const imageLoader = new ImageLoader();

// التصدير الرئيسي للنظام
export { ImageLoader, imageLoader };
export { SmoothImage };
export { CacheManager };
export { PreloadEngine };
export { RetryHandler };
export { ImageOptimizer };

// التصدير للأنواع والإعدادات
export type {
  LoadImageOptions,
  PreloadOptions,
  ImageLoadResult,
  LoadState,
  CachedImage,
  ImageMetadata,
  ResponsiveVariants,
  ImageSystemConfig,
};

export { defaultConfig };

// دوال سهلة الاستخدام
export const loadImage = (keyOrUrl: string, options?: LoadImageOptions) =>
  imageLoader.loadImage(keyOrUrl, options);

export const preloadImage = (keyOrUrl: string, options?: PreloadOptions) =>
  imageLoader.preloadImage(keyOrUrl, options);

export const clearImageCache = () => imageLoader.clearCache();

// دوال التحميل المسبق المتقدم
export const preloadImages = async (urls: string[]) => {
  const promises = urls.map((url) => imageLoader.preloadImage(url));
  await Promise.allSettled(promises);
};

export const preloadImagesWithPriority = async (
  urls: { url: string; priority?: number }[]
) => {
  const promises = urls.map(({ url, priority }) =>
    imageLoader.preloadImage(url, { priority })
  );
  await Promise.allSettled(promises);
};
