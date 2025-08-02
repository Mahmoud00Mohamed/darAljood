// Image Preloader Component
import { useEffect } from 'react';
import { imageLoader } from '../utils/imageLoader';

interface ImagePreloaderProps {
  images: string[];
  priority?: 'high' | 'medium' | 'low';
  onProgress?: (loaded: number, total: number) => void;
  onComplete?: () => void;
}

export const ImagePreloader: React.FC<ImagePreloaderProps> = ({
  images,
  priority = 'medium',
  onProgress,
  onComplete,
}) => {
  useEffect(() => {
    if (images.length === 0) return;

    let loadedCount = 0;
    const totalCount = images.length;

    const loadImages = async () => {
      const loadPromises = images.map(async (src) => {
        try {
          await imageLoader.loadImage(src, {
            retryAttempts: priority === 'high' ? 3 : 1,
          });
          loadedCount++;
          onProgress?.(loadedCount, totalCount);
        } catch (error) {
          console.warn(`Failed to preload image: ${src}`, error);
          loadedCount++;
          onProgress?.(loadedCount, totalCount);
        }
      });

      await Promise.allSettled(loadPromises);
      onComplete?.();
    };

    loadImages();
  }, [images, priority, onProgress, onComplete]);

  return null; // This component doesn't render anything
};