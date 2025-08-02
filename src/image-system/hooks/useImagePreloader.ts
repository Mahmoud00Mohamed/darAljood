import { useEffect, useRef } from "react";
import { imageCache } from "../core/ImageCache";
import { generateOptimizedUrl } from "../utils/imageOptimizer";
import type { UseImagePreloaderOptions } from "../types";

/**
 * خطاف لتحميل الصور مسبقاً لتحسين تجربة المستخدم
 * Hook to preload images for better UX
 */
export const useImagePreloader = (
  images: string[],
  options: UseImagePreloaderOptions = {}
) => {
  const { enabled = true, priority = false, quality = 85 } = options;
  const preloadedRef = useRef(new Set<string>());

  useEffect(() => {
    if (!enabled || images.length === 0) return;

    const preloadImages = async () => {
      const imagesToPreload = images.filter(
        (img) => img && !preloadedRef.current.has(img)
      );

      if (imagesToPreload.length === 0) return;

      // تحميل الصور مع تأخير مناسب
      for (let i = 0; i < imagesToPreload.length; i++) {
        const img = imagesToPreload[i];

        try {
          // إضافة تأخير للصور غير المهمة لتجنب الحجب
          if (!priority && i > 0) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          // إنشاء رابط محسن
          const optimizedSrc = generateOptimizedUrl(img, {
            quality,
            width: 400,
          });

          // تخزين الصورة في التخزين المؤقت
          await imageCache.getImage(optimizedSrc);
          preloadedRef.current.add(img);
        } catch (error) {
          console.warn(`Failed to preload image: ${img}`, error);
        }
      }
    };

    // استخدام requestIdleCallback إذا كان متاحاً، وإلا setTimeout
    if ("requestIdleCallback" in window) {
      requestIdleCallback(preloadImages);
    } else {
      setTimeout(preloadImages, priority ? 0 : 1000);
    }
  }, [images, enabled, priority, quality]);

  return {
    preloadedCount: preloadedRef.current.size,
    isPreloaded: (src: string) => preloadedRef.current.has(src),
  };
};

/**
 * خطاف لتحميل الصور المهمة فوراً
 * Hook to preload critical images immediately
 */
export const usePreloadCriticalImages = (images: string[]) => {
  return useImagePreloader(images, { enabled: true, priority: true });
};

/**
 * خطاف لتحميل الصور عند ظهور المكون
 * Hook to preload images when component becomes visible
 */
export const usePreloadOnVisible = (
  images: string[],
  isVisible: boolean,
  options: UseImagePreloaderOptions = {}
) => {
  return useImagePreloader(images, { ...options, enabled: isVisible });
};