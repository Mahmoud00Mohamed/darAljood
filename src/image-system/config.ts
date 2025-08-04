import { ImageConfig } from './types';

export const defaultConfig: ImageConfig = {
  // Cache settings - 50MB max, 30 days persistent, 1 hour memory
  maxCacheSize: 50 * 1024 * 1024, // 50MB
  cacheExpiryDays: 30,
  memoryExpiryMs: 60 * 60 * 1000, // 1 hour
  
  // Loading settings
  fadeTransitionMs: 300,
  retryAttempts: 3,
  retryDelayMs: 1000,
  preloadThreshold: 2, // Start preloading when 2 images away
  
  // Placeholder settings
  placeholderSize: {
    width: 400,
    height: 300
  },
  placeholderColor: '#e5e7eb', // gray-200
  
  // Quality settings
  quality: 'auto',
  enableWebP: true,
  enableLazyLoad: true
};

let currentConfig: ImageConfig = { ...defaultConfig };

export const getConfig = (): ImageConfig => currentConfig;

export const updateConfig = (newConfig: Partial<ImageConfig>): void => {
  currentConfig = { ...currentConfig, ...newConfig };
};

export const resetConfig = (): void => {
  currentConfig = { ...defaultConfig };
};
