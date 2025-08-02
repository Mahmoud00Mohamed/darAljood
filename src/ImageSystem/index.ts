// Main exports for the Image System
export { SmartImage } from './components/SmartImage';
export { ProgressiveImage } from './components/ProgressiveImage';
export { ImagePreloader } from './components/ImagePreloader';
export { ImageGallery } from './components/ImageGallery';

export { useImage } from './hooks/useImage';
export { useLazyImage } from './hooks/useLazyImage';

export { imageLoader } from './utils/imageLoader';
export { imageCache, configureImageCache } from './utils/imageCache';

export type {
  ImageCacheEntry,
  ImageLoadOptions,
  ImageSystemConfig,
  LoadedImage,
  ImageRef,
} from './types';

// Utility functions for easy integration
export const preloadImages = (urls: string[]) => {
  imageLoader.preloadImages(urls);
};

export const clearImageCache = () => {
  imageCache.clear();
};

export const getImageCacheStats = () => {
  return imageCache.getStats();
};