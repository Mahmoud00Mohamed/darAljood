import type { InstantImageConfig } from "../types/config";

export const defaultConfig: InstantImageConfig = {
  cache: {
    maxMemoryItems: 100,
    memoryTTL: 30 * 60 * 1000, // 30 minutes
    useLocalStorage: true,
    useSessionStorage: true,
    storageTTL: 24 * 60 * 60 * 1000, // 24 hours
    maxStorageSize: 50 * 1024 * 1024, // 50MB
    cleanupInterval: 5 * 60 * 1000, // 5 minutes
    compressionQuality: 0.8,
  },
  preload: {
    enablePreload: true,
    preloadDistance: 500, // pixels
    maxConcurrentPreloads: 3,
    preloadPriority: "auto",
    enablePredictive: true,
    trackUserBehavior: true,
    learningThreshold: 3,
  },
  transition: {
    fadeInDuration: 300,
    blurTransition: true,
    scaleEffect: false,
    placeholderColor: "#f3f4f6",
    placeholderBlur: 10,
    showShimmer: true,
  },
  retryAttempts: 3,
  retryDelay: 1000,
  enableLazyLoading: true,
  enableWebP: true,
  enableAVIF: false,
  responsiveBreakpoints: [640, 768, 1024, 1280, 1536],
};
