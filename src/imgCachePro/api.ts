import { useState, useEffect, useRef, useCallback } from "react";
import { cacheManager } from "./cacheManager";
import { preloadManager } from "./preloadManager";
import { fallbackManager } from "./fallbackManager";
import { displayManager } from "./displayManager";
import { LoadImageOptions, ImageState, PreloadOptions } from "./types";
import { ImgCacheConfig, updateConfig } from "./config";
import { generateKey, isValidUrl, resizeImage } from "./utils";
import { getConfig } from "./config";

// Hook رئيسي لاستخدام الصور
export function useImage(
  url: string,
  options: LoadImageOptions = {}
): ImageState & {
  imageRef: React.RefObject<HTMLImageElement>;
  reload: () => void;
} {
  const [state, setState] = useState<ImageState>({
    isLoading: true,
    isLoaded: false,
    hasError: false,
  });

  const imageRef = useRef<HTMLImageElement>(null);
  const key = generateKey(url, options);

  // دالة تحميل الصورة
  const loadImage = useCallback(async () => {
    if (!isValidUrl(url)) {
      setState({
        isLoading: false,
        isLoaded: false,
        hasError: true,
        error: new Error("رابط الصورة غير صحيح"),
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      hasError: false,
      error: undefined,
    }));

    try {
      // البحث في الكاش أولاً
      const cached = await cacheManager.getFromCache(key);
      if (cached) {
        setState({
          isLoading: false,
          isLoaded: true,
          hasError: false,
          src: cached.data,
        });
        options.onLoad?.();
        return;
      }

      // تحميل من الشبكة مع إعادة المحاولة
      await fallbackManager.executeWithRetry(
        key,
        async () => {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const blob = await response.blob();
          let dataUrl = await blobToDataUrl(blob);

          // تطبيق تغيير الحجم إذا لزم الأمر
          if (options.resize) {
            dataUrl = await resizeImage(
              dataUrl,
              options.resize.width,
              options.resize.height,
              options.resize.quality
            );
          }

          // حفظ في الكاش
          await cacheManager.saveToCache(key, url, dataUrl, blob.type);

          setState({
            isLoading: false,
            isLoaded: true,
            hasError: false,
            src: dataUrl,
          });

          options.onLoad?.();
        },
        (attempt, error) => {
          console.warn(`إعادة محاولة ${attempt} لتحميل الصورة: ${url}`, error);
        }
      );
    } catch (error) {
      setState({
        isLoading: false,
        isLoaded: false,
        hasError: true,
        error: error as Error,
      });
      options.onError?.(error as Error);
    }
  }, [url, key, options]);

  // دالة إعادة التحميل
  const reload = useCallback(() => {
    cacheManager.invalidate(key);
    loadImage();
  }, [key, loadImage]);

  // تحميل الصورة عند التغيير
  useEffect(() => {
    loadImage();
  }, [loadImage]);

  // إدارة العرض عند تغيير الحالة
  useEffect(() => {
    const element = imageRef.current;
    if (!element) return;

    if (state.hasError) {
      const errorPlaceholder = fallbackManager.createErrorPlaceholder(
        element.width || 300,
        element.height || 200,
        "فشل في تحميل الصورة"
      );
      element.src = errorPlaceholder;
    } else if (state.isLoading) {
      if (options.placeholder) {
        element.src = options.placeholder;
      } else {
        const smartPlaceholder = fallbackManager.createSmartPlaceholder(
          element.width || 300,
          element.height || 200
        );
        element.src = smartPlaceholder;
      }
      displayManager.applyLoadingEffects(element, "shimmer");
    } else if (state.isLoaded && state.src) {
      displayManager.removeLoadingEffects(element);
      displayManager.displayImageSmoothly(element, state.src);
    }
  }, [state, options.placeholder]);

  return {
    ...state,
    imageRef,
    reload,
  };
}

// دالة مباشرة لتحميل صورة
export async function loadImage(
  url: string,
  options: LoadImageOptions = {}
): Promise<string> {
  if (!isValidUrl(url)) {
    throw new Error("رابط الصورة غير صحيح");
  }

  const key = generateKey(url, options);

  // البحث في الكاش
  const cached = await cacheManager.getFromCache(key);
  if (cached) {
    return cached.data;
  }

  // تحميل من الشبكة
  return await fallbackManager.executeWithRetry(key, async () => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    let dataUrl = await blobToDataUrl(blob);

    // تطبيق تغيير الحجم
    if (options.resize) {
      dataUrl = await resizeImage(
        dataUrl,
        options.resize.width,
        options.resize.height,
        options.resize.quality
      );
    }

    // حفظ في الكاش
    await cacheManager.saveToCache(key, url, dataUrl, blob.type);

    return dataUrl;
  });
}

// دالة التحميل المسبق
export async function preloadImage(
  url: string,
  options: PreloadOptions = {}
): Promise<void> {
  return preloadManager.preloadImage(url, options);
}

// دالة التحميل المسبق لمجموعة
export async function preloadImages(
  urls: string[],
  options: PreloadOptions = {}
): Promise<void> {
  return preloadManager.preloadImages(urls, options);
}

// Hook للتحميل المسبق الذكي
export function usePreloadImages(
  urls: string[],
  options: PreloadOptions = {}
): {
  preloadAll: () => void;
  clearQueue: () => void;
  stats: { queued: number; active: number; completed: number };
} {
  const [stats, setStats] = useState({ queued: 0, active: 0, completed: 0 });

  const preloadAll = useCallback(() => {
    preloadManager.preloadImages(urls, options);
  }, [urls, options]);

  const clearQueue = useCallback(() => {
    preloadManager.clearQueue();
  }, []);

  // تحديث الإحصائيات دورياً
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(preloadManager.getPreloadStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { preloadAll, clearQueue, stats };
}

// Hook لمراقبة عنصر للتحميل المسبق
export function useIntersectionPreload(
  url: string,
  options: PreloadOptions = {}
): React.RefObject<HTMLElement> {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (element && isValidUrl(url)) {
      preloadManager.observeElement(element, url, options);

      return () => {
        preloadManager.unobserveElement(element);
      };
    }
  }, [url, options]);

  return elementRef;
}

// دالة مساعدة لتحويل Blob إلى Data URL
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// دوال إدارة الكاش
export const cacheAPI = {
  // الحصول على إحصائيات الكاش
  getStats: () => cacheManager.getCacheStats(),

  // تنظيف الكاش
  clear: () => cacheManager.clearCache(),

  // حذف صورة معينة
  remove: (url: string, options?: LoadImageOptions) => {
    const key = generateKey(url, options);
    cacheManager.invalidate(key);
  },

  // التحقق من وجود صورة في الكاش
  has: async (url: string, options?: LoadImageOptions) => {
    const key = generateKey(url, options);
    const cached = await cacheManager.getFromCache(key);
    return !!cached;
  },
};

// دوال التحكم العامة
export const imgCacheAPI = {
  // تحديث الإعدادات
  updateConfig: (config: Partial<ImgCacheConfig>) => {
    updateConfig(config);
  },

  // الحصول على الإعدادات الحالية
  getConfig: () => {
    return getConfig();
  },

  // إحصائيات شاملة
  getSystemStats: () => ({
    cache: cacheManager.getCacheStats(),
    preload: preloadManager.getPreloadStats(),
    retry: fallbackManager.getRetryStats(),
  }),

  // تنظيف شامل
  cleanup: async () => {
    await cacheManager.clearCache();
    preloadManager.clearQueue();
    fallbackManager.cleanup();
  },
};
