export interface ImageSystemConfig {
  // إعدادات الكاش
  cache: {
    maxAge: number; // بالملي ثانية
    maxSize: number; // عدد الصور في الكاش
    enablePersistent: boolean; // استخدام localStorage
    persistentPrefix: string;
  };

  // إعدادات التحميل المسبق
  preload: {
    enabled: boolean;
    maxConcurrent: number; // عدد الصور المتزامنة
    priority: {
      viewport: number; // أولوية الصور في منطقة العرض
      predicted: number; // أولوية الصور المتوقعة
      manual: number; // أولوية التحميل اليدوي
    };
  };

  // إعدادات العرض
  display: {
    fadeTransition: number; // مدة التلاشي بالملي ثانية
    placeholderColor: string;
    placeholderOpacity: number;
    retryIndicator: boolean;
  };

  // إعدادات إعادة المحاولة
  retry: {
    maxAttempts: number;
    delays: number[]; // تأخير بين المحاولات
    exponentialBackoff: boolean;
  };

  // إعدادات تحسين الصور
  optimization: {
    enableResponsive: boolean;
    devicePixelRatio: boolean;
    formats: string[]; // أولوية الصيغ
    sizes: {
      small: number;
      medium: number;
      large: number;
    };
  };
}

export const defaultConfig: ImageSystemConfig = {
  cache: {
    maxAge: 24 * 60 * 60 * 1000, // 24 ساعة
    maxSize: 100,
    enablePersistent: true,
    persistentPrefix: "img_cache_",
  },

  preload: {
    enabled: true,
    maxConcurrent: 3,
    priority: {
      viewport: 1,
      predicted: 2,
      manual: 3,
    },
  },

  display: {
    fadeTransition: 300,
    placeholderColor: "#f3f4f6",
    placeholderOpacity: 0.8,
    retryIndicator: false,
  },

  retry: {
    maxAttempts: 3,
    delays: [500, 1000, 2000],
    exponentialBackoff: true,
  },

  optimization: {
    enableResponsive: true,
    devicePixelRatio: true,
    formats: ["webp", "avif", "jpg", "png"],
    sizes: {
      small: 300,
      medium: 600,
      large: 1200,
    },
  },
};
