import { useState, useEffect, useCallback } from "react";
import { Photo } from "../types";

interface ImagePreloaderState {
  loadedImages: Set<string>;
  loadingImages: Set<string>;
  failedImages: Set<string>;
  isPreloading: boolean;
  progress: number;
}

interface UseImagePreloaderReturn extends ImagePreloaderState {
  preloadImages: (photos: Photo[]) => Promise<void>;
  preloadImage: (src: string) => Promise<void>;
  isImageLoaded: (src: string) => boolean;
  isImageLoading: (src: string) => boolean;
  isImageFailed: (src: string) => boolean;
  clearCache: () => void;
}

/**
 * Hook لتحميل الصور مسبقاً وإدارة التخزين المؤقت
 */
export const useImagePreloader = (): UseImagePreloaderReturn => {
  const [state, setState] = useState<ImagePreloaderState>({
    loadedImages: new Set(),
    loadingImages: new Set(),
    failedImages: new Set(),
    isPreloading: false,
    progress: 0,
  });

  // تحميل صورة واحدة
  const preloadImage = useCallback(async (src: string): Promise<void> => {
    // إذا كانت الصورة محملة أو قيد التحميل، لا نحتاج لتحميلها مرة أخرى
    if (state.loadedImages.has(src) || state.loadingImages.has(src)) {
      return Promise.resolve();
    }

    setState(prev => ({
      ...prev,
      loadingImages: new Set([...prev.loadingImages, src]),
      failedImages: new Set([...prev.failedImages].filter(url => url !== src))
    }));

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // إعدادات تحسين التحميل
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.loading = "eager";
      
      const cleanup = () => {
        setState(prev => ({
          ...prev,
          loadingImages: new Set([...prev.loadingImages].filter(url => url !== src))
        }));
      };

      img.onload = () => {
        setState(prev => ({
          ...prev,
          loadedImages: new Set([...prev.loadedImages, src]),
          loadingImages: new Set([...prev.loadingImages].filter(url => url !== src))
        }));
        cleanup();
        resolve();
      };

      img.onerror = () => {
        setState(prev => ({
          ...prev,
          failedImages: new Set([...prev.failedImages, src]),
          loadingImages: new Set([...prev.loadingImages].filter(url => url !== src))
        }));
        cleanup();
        reject(new Error(`Failed to load image: ${src}`));
      };

      // بدء التحميل
      img.src = src;
    });
  }, [state.loadedImages, state.loadingImages]);

  // تحميل مجموعة من الصور بشكل متوازي مع تحديد الأولوية
  const preloadImages = useCallback(async (photos: Photo[]): Promise<void> => {
    if (photos.length === 0) return;

    setState(prev => ({ ...prev, isPreloading: true, progress: 0 }));

    try {
      // تقسيم الصور إلى مجموعات للتحميل المتوازي المحدود
      const batchSize = 6; // تحميل 6 صور في نفس الوقت
      const batches: Photo[][] = [];
      
      for (let i = 0; i < photos.length; i += batchSize) {
        batches.push(photos.slice(i, i + batchSize));
      }

      let completedCount = 0;
      const totalCount = photos.length;

      // تحميل كل مجموعة بشكل متتالي
      for (const batch of batches) {
        const batchPromises = batch.map(async (photo) => {
          try {
            await preloadImage(photo.src);
            completedCount++;
            setState(prev => ({
              ...prev,
              progress: Math.round((completedCount / totalCount) * 100)
            }));
          } catch (error) {
            console.warn(`Failed to preload image: ${photo.src}`, error);
            completedCount++;
            setState(prev => ({
              ...prev,
              progress: Math.round((completedCount / totalCount) * 100)
            }));
          }
        });

        // انتظار انتهاء المجموعة الحالية قبل البدء في التالية
        await Promise.allSettled(batchPromises);
        
        // تأخير قصير بين المجموعات لتجنب إرهاق الشبكة
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

    } finally {
      setState(prev => ({ 
        ...prev, 
        isPreloading: false, 
        progress: 100 
      }));
    }
  }, [preloadImage]);

  // دوال مساعدة للتحقق من حالة الصور
  const isImageLoaded = useCallback((src: string) => state.loadedImages.has(src), [state.loadedImages]);
  const isImageLoading = useCallback((src: string) => state.loadingImages.has(src), [state.loadingImages]);
  const isImageFailed = useCallback((src: string) => state.failedImages.has(src), [state.failedImages]);

  // مسح التخزين المؤقت
  const clearCache = useCallback(() => {
    setState({
      loadedImages: new Set(),
      loadingImages: new Set(),
      failedImages: new Set(),
      isPreloading: false,
      progress: 0,
    });
  }, []);

  return {
    ...state,
    preloadImages,
    preloadImage,
    isImageLoaded,
    isImageLoading,
    isImageFailed,
    clearCache,
  };
};