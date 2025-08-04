// Main exports
export { imageSystem } from './api';
export { SmartImage, LazyImage, ImageGallery } from './components';
export { getConfig, updateConfig, resetConfig } from './config';

// Type exports
export type {
  ImageConfig,
  ImageData,
  LoadImageOptions,
  PreloadOptions,
  ImageSystemEvents
} from './types';

// Utility exports
export { 
  generateCacheKey, 
  isValidUrl, 
  formatBytes 
} from './utils';

// Default initialization
import { imageSystem } from './api';
import { getConfig } from './config';

// Auto-initialize with default event handlers
imageSystem.setEventHandlers({
  onError: (key, error) => {
    console.warn(`Image system error for ${key}:`, error);
  },
  onCache: (key, size) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Cached image ${key}: ${size} bytes`);
    }
  }
});

// Export ready-to-use instance
export default imageSystem;
