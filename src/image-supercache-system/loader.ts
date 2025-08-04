import {
  LoadImageOptions,
  ImageState,
  ImageCacheConfig,
  PreloadOptions,
} from "./types";
import { defaultConfig } from "./config";
import CacheManager from "./cache-manager";
import PreloadEngine from "./preloader";

class ImageLoader {
  private cacheManager: CacheManager;
  private preloader: PreloadEngine;
  private config: ImageCacheConfig;
  private loadingStates = new Map<string, ImageState>();
  private downloadPromises = new Map<string, Promise<string>>(); // Cache ongoing downloads

  constructor(config: Partial<ImageCacheConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.cacheManager = new CacheManager(config);
    this.preloader = new PreloadEngine(this.cacheManager, config);
  }

  private generateImageKey(url: string): string {
    return btoa(url).replace(/[/+=]/g, "");
  }

  private createPlaceholder(width: number = 400, height: number = 300): string {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = width;
    canvas.height = height;

    // Create faster gradient placeholder
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#f8fafc");
    gradient.addColorStop(0.5, "#e2e8f0");
    gradient.addColorStop(1, "#cbd5e1");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add subtle pattern for better UX
    ctx.fillStyle = "rgba(148, 163, 184, 0.1)";
    for (let x = 0; x < width; x += 20) {
      for (let y = 0; y < height; y += 20) {
        ctx.fillRect(x, y, 10, 10);
      }
    }

    return canvas.toDataURL("image/png", 0.5); // Lower quality for speed
  }

  private async downloadWithFetch(
    url: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const contentLength = +(response.headers.get("Content-Length") ?? 0);
    let receivedLength = 0;
    const chunks: Uint8Array[] = [];

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        if (onProgress && contentLength > 0) {
          onProgress((receivedLength / contentLength) * 100);
        }
      }
    }

    // Convert to blob
    const blob = new Blob(chunks);

    // Convert to data URL using canvas for better compression
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        // High quality WebP with good compression
        const dataURL = canvas.toDataURL(
          "image/webp",
          this.config.optimization.compressionQuality
        );
        resolve(dataURL);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }

  private async downloadWithRetry(
    url: string,
    onProgress?: (progress: number) => void,
    onError?: (error: Error) => void
  ): Promise<string> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.retry.maxAttempts; attempt++) {
      try {
        return await this.downloadWithFetch(url, onProgress);
      } catch (downloadError) {
        lastError = downloadError as Error;

        if (onError) {
          onError(lastError);
        }

        if (attempt < this.config.retry.maxAttempts) {
          const delay = this.config.retry.exponentialBackoff
            ? this.config.retry.baseDelayMs * Math.pow(2, attempt - 1)
            : this.config.retry.baseDelayMs;

          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  async loadImage(
    url: string,
    loadOptions: LoadImageOptions = {}
  ): Promise<ImageState> {
    const key = this.generateImageKey(url);

    // تحسين: إذا كانت الصورة قيد التحميل، انتظر نفس الطلب
    if (this.downloadPromises.has(key)) {
      try {
        const imageData = await this.downloadPromises.get(key)!;
        const state: ImageState = {
          loading: false,
          loaded: true,
          error: null,
          progress: 100,
          url: imageData,
          placeholder: null,
        };
        this.loadingStates.set(key, state);
        return state;
      } catch (downloadError) {
        // Handle error case
        const errorState: ImageState = {
          loading: false,
          loaded: false,
          error: downloadError as Error,
          progress: 0,
          url: loadOptions.fallback || null,
          placeholder: null,
        };
        this.loadingStates.set(key, errorState);
        return errorState;
      }
    }

    // Initialize loading state with immediate placeholder
    const placeholderUrl =
      loadOptions.placeholder === true
        ? this.createPlaceholder()
        : typeof loadOptions.placeholder === "string"
        ? loadOptions.placeholder
        : null;

    const initialState: ImageState = {
      loading: true,
      loaded: false,
      error: null,
      progress: 0,
      url: null,
      placeholder: placeholderUrl,
    };

    this.loadingStates.set(key, initialState);

    try {
      // Check cache first - فحص فوري
      const cached = await this.cacheManager.getFromCache(key);
      if (cached) {
        const state: ImageState = {
          loading: false,
          loaded: true,
          error: null,
          progress: 100,
          url: cached.data,
          placeholder: null,
          lowQualityUrl: cached.metadata.lowQuality,
        };
        this.loadingStates.set(key, state);
        return state;
      }

      // Start download
      const downloadPromise = this.downloadWithRetry(
        url,
        (progress) => {
          const currentState = this.loadingStates.get(key);
          if (currentState) {
            currentState.progress = progress;
            this.loadingStates.set(key, currentState);
            if (loadOptions.onProgress) loadOptions.onProgress(progress);
          }
        },
        loadOptions.onError
      );

      // Cache the promise to avoid duplicate downloads
      this.downloadPromises.set(key, downloadPromise);

      const imageData = await downloadPromise;

      // Remove from promises cache
      this.downloadPromises.delete(key);

      // Cache the result immediately
      await this.cacheManager.saveToCache(key, imageData, {
        originalUrl: url,
      });

      const finalState: ImageState = {
        loading: false,
        loaded: true,
        error: null,
        progress: 100,
        url: imageData,
        placeholder: null,
      };

      this.loadingStates.set(key, finalState);
      return finalState;
    } catch (loadError) {
      this.downloadPromises.delete(key);

      const errorState: ImageState = {
        loading: false,
        loaded: false,
        error: loadError as Error,
        progress: 0,
        url: loadOptions.fallback || null,
        placeholder: null,
      };

      this.loadingStates.set(key, errorState);

      if (loadOptions.onError) {
        loadOptions.onError(loadError as Error);
      }

      return errorState;
    }
  }

  async preloadImage(
    url: string,
    preloadOptions: PreloadOptions = {}
  ): Promise<void> {
    await this.preloader.markAsNeeded(url, preloadOptions);
  }

  async preloadImages(
    urls: string[],
    preloadOptions: PreloadOptions = {}
  ): Promise<void> {
    if (preloadOptions.batch) {
      // Batch preloading for better performance
      const batchSize = this.config.preload.concurrentDownloads;
      for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        await Promise.all(
          batch.map((url) => this.preloader.markAsNeeded(url, preloadOptions))
        );
      }
    } else {
      await this.preloader.predictAndPreload(urls, preloadOptions);
    }
  }

  getImageState(url: string): ImageState | null {
    const key = this.generateImageKey(url);
    return this.loadingStates.get(key) || null;
  }

  getStats() {
    return {
      cache: this.cacheManager.getCacheStats(),
      preloader: this.preloader.getQueueStats(),
      loadingStates: this.loadingStates.size,
      activeDownloads: this.downloadPromises.size,
    };
  }

  async clearCache(): Promise<void> {
    await this.cacheManager.clearAll();
    this.loadingStates.clear();
    this.downloadPromises.clear();
    this.preloader.clearQueue();
  }
}

export default ImageLoader;
