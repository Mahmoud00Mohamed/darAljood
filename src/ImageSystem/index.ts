// Main export file for the ImageSystem
// This file makes it easy to import everything from the ImageSystem

// Components
export { AdvancedImage } from './components/AdvancedImage';
export { ImageGallery } from './components/ImageGallery';
export { ResponsiveImage } from './components/ResponsiveImage';

// Hooks
export { useAdvancedImage } from './hooks/useAdvancedImage';
export { useIntersectionObserver } from './hooks/useIntersectionObserver';

// Services
export { ImageCache } from './services/ImageCache';
export { ImagePreloader } from './services/ImagePreloader';

// Utils
export {
  generateOptimizedUrl,
  supportsWebP,
  supportsAVIF,
  calculateOptimalDimensions,
  compressImage
} from './utils/imageOptimization';

// Types
export type {
  ImageCacheItem,
  ImagePreloadOptions,
  AdvancedImageProps,
  UseAdvancedImageOptions,
  ImageState
} from './types/image';

export type { ImageOptimizationOptions } from './utils/imageOptimization';