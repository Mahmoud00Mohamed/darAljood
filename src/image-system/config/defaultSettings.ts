/**
 * الإعدادات الافتراضية لنظام تحميل الصور
 * Default settings for the image loading system
 */

export const DEFAULT_SETTINGS = {
  // إعدادات التخزين المؤقت
  cache: {
    maxSize: 50, // الحد الأقصى لعدد الصور المخزنة
    maxAge: 30 * 60 * 1000, // 30 دقيقة
    cleanupThreshold: 0.25, // نسبة التنظيف عند امتلاء التخزين
  },

  // إعدادات جودة الصور
  quality: {
    default: 85,
    thumbnail: 60,
    preview: 40,
    highQuality: 95,
    lowQuality: 20, // للتأثير الضبابي
  },

  // إعدادات Intersection Observer
  observer: {
    threshold: 0.1,
    rootMargin: "100px",
  },

  // إعدادات التحميل المسبق
  preload: {
    delay: 100, // تأخير بين تحميل الصور (ms)
    maxConcurrent: 3, // عدد الصور المحملة بالتوازي
    priorityDelay: 0, // تأخير للصور المهمة
  },

  // أحجام الصور المتاحة
  imageSizes: {
    thumbnail: 150,
    small: 300,
    medium: 600,
    large: 1200,
    xlarge: 1600,
  },

  // إعدادات التحسين
  optimization: {
    enableWebP: true,
    enableAVIF: false,
    enableBlurUp: true,
    enableLazyLoading: true,
    enableProgressiveLoading: true,
  },

  // إعدادات الأخطاء
  fallback: {
    retryAttempts: 3,
    retryDelay: 1000,
    showErrorPlaceholder: true,
  },
};

/**
 * دالة لدمج الإعدادات المخصصة مع الافتراضية
 */
export const mergeSettings = (customSettings: Partial<typeof DEFAULT_SETTINGS>) => {
  return {
    ...DEFAULT_SETTINGS,
    ...customSettings,
    cache: { ...DEFAULT_SETTINGS.cache, ...customSettings.cache },
    quality: { ...DEFAULT_SETTINGS.quality, ...customSettings.quality },
    observer: { ...DEFAULT_SETTINGS.observer, ...customSettings.observer },
    preload: { ...DEFAULT_SETTINGS.preload, ...customSettings.preload },
    imageSizes: { ...DEFAULT_SETTINGS.imageSizes, ...customSettings.imageSizes },
    optimization: { ...DEFAULT_SETTINGS.optimization, ...customSettings.optimization },
    fallback: { ...DEFAULT_SETTINGS.fallback, ...customSettings.fallback },
  };
};