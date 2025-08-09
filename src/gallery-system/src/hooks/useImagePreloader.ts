import { useState, useEffect, useCallback } from 'react';
import { imagePreloader } from '../utils/imagePreloader';
import { Photo } from '../types';

interface UseImagePreloaderOptions {
  preloadAll?: boolean;
  visibleCount?: number;
  backgroundPreload?: boolean;
}

interface UseImagePreloaderReturn {
  preloadedUrls: string[];
  isPreloading: boolean;
  preloadImages: (photos: Photo[]) => Promise<void>;
  getOptimizedUrl: (url: string) => string;
  preloadVisible: (photos: Photo[], count?: number) => Promise<void>;
}

/**
 * Hook لإدارة تحميل الصور مسبقاً
 */
export const useImagePreloader = (
  options: UseImagePreloaderOptions = {}
): UseImagePreloaderReturn => {
  const [preloadedUrls, setPreloadedUrls] = useState<string[]>([]);
  const [isPreloading, setIsPreloading] = useState(false);

  const {
    preloadAll = false,
    visibleCount = 8,
    backgroundPreload = true,
  } = options;

  /**
   * تحميل صور مرئية بأولوية عالية
   */
  const preloadVisible = useCallback(async (photos: Photo[], count?: number) => {
    const visiblePhotos = photos.slice(0, count || visibleCount);
    const urls = visiblePhotos.map(photo => photo.src);
    
    try {
      const optimizedUrls = await imagePreloader.preloadVisibleImages(urls);
      setPreloadedUrls(prev => [...new Set([...prev, ...optimizedUrls])]);
    } catch (error) {
      console.warn('Failed to preload visible images:', error);
    }
  }, [visibleCount]);

  /**
   * تحميل جميع الصور
   */
  const preloadImages = useCallback(async (photos: Photo[]) => {
    if (photos.length === 0) return;

    setIsPreloading(true);

    try {
      // تحميل الصور المرئية أولاً
      await preloadVisible(photos);

      // تحميل باقي الصور في الخلفية إذا كان مفعل
      if (backgroundPreload && photos.length > visibleCount) {
        const backgroundPhotos = photos.slice(visibleCount);
        const backgroundUrls = backgroundPhotos.map(photo => photo.src);
        imagePreloader.preloadBackgroundImages(backgroundUrls);
      }
    } catch (error) {
      console.warn('Failed to preload images:', error);
    } finally {
      setIsPreloading(false);
    }
  }, [preloadVisible, backgroundPreload, visibleCount]);

  /**
   * الحصول على رابط محسن للصورة
   */
  const getOptimizedUrl = useCallback((url: string): string => {
    return imagePreloader.getOptimizedUrl(url);
  }, []);

  return {
    preloadedUrls,
    isPreloading,
    preloadImages,
    getOptimizedUrl,
    preloadVisible,
  };
};

export default useImagePreloader;