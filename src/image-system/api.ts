import { LoadImageOptions, PreloadOptions, ImageData, ImageSystemEvents } from './types';
import { getConfig } from './config';
import { cacheManager } from './cache';
import { preloader } from './preloader';
import { recovery } from './recovery';
import { generateCacheKey, optimizeImageUrl, isValidUrl, createPlaceholderDataUrl } from './utils';

class ImageSystemAPI {
  public eventHandlers: ImageSystemEvents = {};

  setEventHandlers(handlers: ImageSystemEvents): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  async loadImage(keyOrUrl: string, options: LoadImageOptions = {}): Promise<{
    imageUrl: string;
    placeholder?: string;
    isFromCache: boolean;
  }> {
    if (!isValidUrl(keyOrUrl)) {
      throw new Error('Invalid URL provided');
    }

    const config = getConfig();
    const optimizedUrl = optimizeImageUrl(keyOrUrl, config, options.width, options.height);
    const cacheKey = generateCacheKey(optimizedUrl, options);

    // Create placeholder if requested
    let placeholder: string | undefined;
    if (options.placeholder !== false) {
      if (typeof options.placeholder === 'string') {
        placeholder = options.placeholder;
      } else {
        const width = options.width || config.placeholderSize.width;
        const height = options.height || config.placeholderSize.height;
        placeholder = createPlaceholderDataUrl(width, height, config.placeholderColor);
      }
    }

    // Check cache first
    try {
      const cachedData = await cacheManager.getFromCache(cacheKey);
      if (cachedData) {
        const imageUrl = URL.createObjectURL(cachedData.blob);
        // Use setTimeout to avoid blocking the render cycle
        setTimeout(() => {
          this.eventHandlers.onLoad?.(cacheKey, cachedData);
        }, 0);
        return {
          imageUrl,
          placeholder,
          isFromCache: true
        };
      }
    } catch (error) {
      console.warn('Cache lookup failed:', error);
    }

    // Load image in background
    this.loadInBackground(cacheKey, optimizedUrl, options);

    // Return placeholder or valid URL - never return empty string
    const fallbackUrl = placeholder || options.fallback;
    
    return {
      imageUrl: fallbackUrl || optimizedUrl,
      placeholder,
      isFromCache: false
    };
  }

  private async loadInBackground(cacheKey: string, url: string, options: LoadImageOptions): Promise<void> {
    try {
      const imageData = options.retry !== false 
        ? await recovery.loadWithFallback(url, options.fallback)
        : await recovery.fetchWithRetry(url);

      // Save to cache
      await cacheManager.saveToCache(cacheKey, imageData);
      
      // Use setTimeout to avoid blocking and potential loops
      setTimeout(() => {
        this.eventHandlers.onLoad?.(cacheKey, imageData);
        this.eventHandlers.onCache?.(cacheKey, imageData.size);
      }, 0);

    } catch (error) {
      console.error(`Failed to load image: ${url}`, error);
      setTimeout(() => {
        this.eventHandlers.onError?.(cacheKey, error as Error);
      }, 0);
    }
  }

  async preloadImage(keyOrUrl: string, options: PreloadOptions = {}): Promise<void> {
    if (!isValidUrl(keyOrUrl)) {
      throw new Error('Invalid URL provided');
    }

    await preloader.markAsNeeded(keyOrUrl, options);
    setTimeout(() => {
      this.eventHandlers.onPreload?.(keyOrUrl);
    }, 0);
  }

  async preloadImages(keysOrUrls: string[], options: PreloadOptions = {}): Promise<void> {
    await preloader.predictAndPreload(keysOrUrls, options);
    
    setTimeout(() => {
      for (const url of keysOrUrls) {
        this.eventHandlers.onPreload?.(url);
      }
    }, 0);
  }

  async invalidateCache(keyOrUrl?: string): Promise<void> {
    if (keyOrUrl) {
      const config = getConfig();
      const optimizedUrl = optimizeImageUrl(keyOrUrl, config);
      const cacheKey = generateCacheKey(optimizedUrl);
      await cacheManager.invalidate(cacheKey);
    } else {
      await cacheManager.clearCache();
    }
  }

  getCacheStats(): { memory: number; total: number; entries: number } {
    return cacheManager.getCacheStats();
  }

  getPreloadStatus(): { total: number; preloading: number; high: number; medium: number; low: number } {
    return preloader.getQueueStatus();
  }

  clearPreloadQueue(): void {
    preloader.clearQueue();
  }
}

export const imageSystem = new ImageSystemAPI();
