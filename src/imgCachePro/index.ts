// نقطة الدخول الرئيسية لنظام imgCachePro
// هذا الملف يصدر جميع الواجهات العامة للنظام

// التكوين
export { updateConfig, getConfig, defaultConfig } from "./config";
export type { ImgCacheConfig } from "./config";

// الأنواع
export type {
  CacheItem,
  LoadImageOptions,
  PreloadOptions,
  ImageState,
  ImageLoadStatus,
  RetryPolicy,
} from "./types";

// الواجهات الرئيسية
export {
  useImage,
  loadImage,
  preloadImage,
  preloadImages,
  usePreloadImages,
  useIntersectionPreload,
  cacheAPI,
  imgCacheAPI,
} from "./api";

// المكونات
export { OptimizedImage } from "./components/OptimizedImage";
export { ImageGallery } from "./components/ImageGallery";
export { CacheStats } from "./components/CacheStats";

// المديريات (للاستخدام المتقدم)
export { cacheManager } from "./cacheManager";
export { preloadManager } from "./preloadManager";
export { fallbackManager } from "./fallbackManager";
export { displayManager } from "./displayManager";

// دوال مساعدة
export {
  generateKey,
  formatBytes,
  isValidUrl,
  getImageSize,
  resizeImage,
  createPlaceholder,
  debounce,
  throttle,
} from "./utils";

// إعداد افتراضي للنظام
import { updateConfig, defaultConfig } from "./config";

// تطبيق الإعدادات الافتراضية عند تحميل النظام
if (typeof window !== "undefined") {
  // تحديث العنوان إذا لزم الأمر
  console.log("🖼️ imgCachePro System Loaded");

  // يمكن إضافة تهيئة إضافية هنا
  updateConfig(defaultConfig);
}
