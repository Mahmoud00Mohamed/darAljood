// ImgCachePro - Advanced Image Caching System
// Version: 1.0.0

import {
  LoadImageOptions,
  PreloadOptions,
  CacheStats,
  LoadResult,
} from "./types";
import {
  ImgCacheProConfig,
  setConfig,
  getConfig,
  resetConfig,
} from "./config/settings";
import { getCacheManager, destroyCacheManager } from "./core/cacheManager";
import {
  getPreloadPredictor,
  destroyPreloadPredictor,
} from "./core/preloadPredictor";
import {
  getFallbackHandler,
  destroyFallbackHandler,
} from "./core/fallbackHandler";
import {
  loadImage as coreLoadImage,
  preloadImage as corePreloadImage,
  loadImageWithPlaceholder,
} from "./core/imageLoader";
import { logger } from "./utils/helpers";

/**
 * Main ImgCachePro class - Public Interface
 */
export class ImgCachePro {
  private static instance: ImgCachePro | null = null;
  private initialized = false;

  private constructor() {}

  static getInstance(): ImgCachePro {
    if (!ImgCachePro.instance) {
      ImgCachePro.instance = new ImgCachePro();
      ImgCachePro.instance.initialize();
    }
    return ImgCachePro.instance;
  }

  private initialize(): void {
    if (this.initialized) return;

    // Initialize core components
    getCacheManager();
    getPreloadPredictor();
    getFallbackHandler();

    this.initialized = true;
    logger.info("ImgCachePro initialized");
  }

  /**
   * Configure the caching system
   */
  configure(config: Partial<ImgCacheProConfig>): void {
    setConfig(config);
    logger.info("Configuration updated");
  }

  /**
   * Load an image with caching and placeholder support
   */
  async loadImage(
    keyOrUrl: string,
    options?: LoadImageOptions
  ): Promise<LoadResult> {
    if (!this.initialized) this.initialize();
    return coreLoadImage(keyOrUrl, options);
  }

  /**
   * Load image into a container with automatic placeholder handling
   */
  async loadImageIntoContainer(
    container: HTMLElement,
    keyOrUrl: string,
    options?: LoadImageOptions
  ): Promise<LoadResult> {
    if (!this.initialized) this.initialize();
    return loadImageWithPlaceholder(container, keyOrUrl, options);
  }

  /**
   * Preload an image for future use
   */
  async preloadImage(
    keyOrUrl: string,
    options?: PreloadOptions
  ): Promise<boolean> {
    if (!this.initialized) this.initialize();
    return corePreloadImage(keyOrUrl, options);
  }

  /**
   * Preload multiple images intelligently
   */
  async preloadImages(
    keysOrUrls: string[],
    options?: PreloadOptions
  ): Promise<void> {
    if (!this.initialized) this.initialize();

    const predictor = getPreloadPredictor();
    await predictor.predictAndPreload(keysOrUrls, options);
  }

  /**
   * Mark an image as likely to be needed soon
   */
  async markAsNeeded(keyOrUrl: string): Promise<void> {
    if (!this.initialized) this.initialize();

    const predictor = getPreloadPredictor();
    await predictor.markAsNeeded(keyOrUrl);
  }

  /**
   * Observe an element for intersection-based preloading
   */
  observeElementForPreload(element: Element, imageUrl: string): void {
    if (!this.initialized) this.initialize();

    const predictor = getPreloadPredictor();
    predictor.observeElement(element, imageUrl);
  }

  /**
   * Stop observing an element
   */
  unobserveElement(element: Element): void {
    if (!this.initialized) this.initialize();

    const predictor = getPreloadPredictor();
    predictor.unobserveElement(element);
  }

  /**
   * Invalidate a specific cache entry
   */
  async invalidateCache(keyOrUrl: string): Promise<boolean> {
    const cacheManager = getCacheManager();
    return cacheManager.invalidate(keyOrUrl);
  }

  /**
   * Clear all cached images
   */
  async clearCache(): Promise<void> {
    const cacheManager = getCacheManager();
    await cacheManager.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    const cacheManager = getCacheManager();
    return cacheManager.getStats();
  }

  /**
   * Get current configuration
   */
  getConfig(): ImgCacheProConfig {
    return getConfig();
  }

  /**
   * Reset configuration to defaults
   */
  resetConfig(): void {
    resetConfig();
    logger.info("Configuration reset to defaults");
  }

  /**
   * Reset failed URLs to retry them
   */
  resetFailedUrls(): void {
    const fallbackHandler = getFallbackHandler();
    fallbackHandler.clearFailedUrls();
  }

  /**
   * Test if a URL is accessible
   */
  async testImageUrl(url: string): Promise<boolean> {
    const fallbackHandler = getFallbackHandler();
    return fallbackHandler.testConnection(url);
  }

  /**
   * Destroy the instance and cleanup resources
   */
  destroy(): void {
    if (!this.initialized) return;

    destroyCacheManager();
    destroyPreloadPredictor();
    destroyFallbackHandler();

    this.initialized = false;
    ImgCachePro.instance = null;

    logger.info("ImgCachePro destroyed");
  }
}

// Convenience functions for direct use
const getInstance = () => ImgCachePro.getInstance();

/**
 * Load an image with caching
 * @param keyOrUrl - Image URL or cache key
 * @param options - Loading options
 * @returns Load result with success status and image URL
 */
export const loadImage = (
  keyOrUrl: string,
  options?: LoadImageOptions
): Promise<LoadResult> => {
  return getInstance().loadImage(keyOrUrl, options);
};

/**
 * Load image into a container with automatic placeholder
 * @param container - HTML element to load image into
 * @param keyOrUrl - Image URL or cache key
 * @param options - Loading options
 * @returns Load result
 */
export const loadImageIntoContainer = (
  container: HTMLElement,
  keyOrUrl: string,
  options?: LoadImageOptions
): Promise<LoadResult> => {
  return getInstance().loadImageIntoContainer(container, keyOrUrl, options);
};

/**
 * Preload an image for future use
 * @param keyOrUrl - Image URL or cache key
 * @param options - Preload options
 * @returns Success status
 */
export const preloadImage = (
  keyOrUrl: string,
  options?: PreloadOptions
): Promise<boolean> => {
  return getInstance().preloadImage(keyOrUrl, options);
};

/**
 * Preload multiple images intelligently
 * @param keysOrUrls - Array of image URLs or cache keys
 * @param options - Preload options
 */
export const preloadImages = (
  keysOrUrls: string[],
  options?: PreloadOptions
): Promise<void> => {
  return getInstance().preloadImages(keysOrUrls, options);
};

/**
 * Configure the caching system
 * @param config - Partial configuration object
 */
export const configure = (config: Partial<ImgCacheProConfig>): void => {
  getInstance().configure(config);
};

/**
 * Get cache statistics
 * @returns Cache statistics object
 */
export const getCacheStats = (): CacheStats => {
  return getInstance().getCacheStats();
};

/**
 * Clear all cached images
 */
export const clearCache = (): Promise<void> => {
  return getInstance().clearCache();
};

/**
 * Invalidate a specific cache entry
 * @param keyOrUrl - Image URL or cache key to invalidate
 * @returns Success status
 */
export const invalidateCache = (keyOrUrl: string): Promise<boolean> => {
  return getInstance().invalidateCache(keyOrUrl);
};

// Export types for external use
export * from "./types";
export type { ImgCacheProConfig } from "./config/settings";

// Default export
export default ImgCachePro;
