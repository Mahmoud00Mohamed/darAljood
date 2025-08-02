// ملف الإعدادات الرئيسي - قابل للتخصيص حسب احتياجات المشروع
export interface ImgCacheConfig {
  // إعدادات الكاش
  maxCacheSize: number; // بالميجابايت
  cacheExpiration: number; // بالأيام

  // إعدادات العرض
  fadeDuration: number; // مدة التلاشي بالميللي ثانية
  placeholderColor: string;
  placeholderText: string;

  // إعدادات إعادة المحاولة
  maxRetries: number;
  retryDelay: number; // بالميللي ثانية
  retryBackoffMultiplier: number;

  // إعدادات التحميل المسبق
  preloadThreshold: number; // نسبة ظهور العنصر لبدء التحميل المسبق
  maxConcurrentPreloads: number;

  // إعدادات التحسين
  enableWebP: boolean;
  enableLazyLoading: boolean;
  quality: number; // جودة الصورة (1-100)
}

// الإعدادات الافتراضية
export const defaultConfig: ImgCacheConfig = {
  maxCacheSize: 50, // 50 ميجابايت
  cacheExpiration: 7, // أسبوع واحد

  fadeDuration: 300,
  placeholderColor: "#f3f4f6",
  placeholderText: "",

  maxRetries: 3,
  retryDelay: 1000,
  retryBackoffMultiplier: 2,

  preloadThreshold: 0.1,
  maxConcurrentPreloads: 3,

  enableWebP: true,
  enableLazyLoading: true,
  quality: 80,
};

// متغير الإعدادات الحالية
let currentConfig: ImgCacheConfig = { ...defaultConfig };

// دالة تحديث الإعدادات
export function updateConfig(newConfig: Partial<ImgCacheConfig>): void {
  currentConfig = { ...currentConfig, ...newConfig };
}

// دالة الحصول على الإعدادات الحالية
export function getConfig(): ImgCacheConfig {
  return { ...currentConfig };
}
