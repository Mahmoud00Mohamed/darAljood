// Advanced Image Loading Utilities
import { imageCache } from './imageCache';
import { ImageSystemConfig } from '../types';

interface LoadImageOptions {
  retryAttempts?: number;
  retryDelay?: number;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

export class ImageLoader {
  private static instance: ImageLoader;
  private loadingPromises = new Map<string, Promise<string>>();
  private preloadQueue: string[] = [];
  private isPreloading = false;

  static getInstance(): ImageLoader {
    if (!ImageLoader.instance) {
      ImageLoader.instance = new ImageLoader();
    }
    return ImageLoader.instance;
  }

  async loadImage(
    url: string, 
    options: LoadImageOptions = {}
  ): Promise<string> {
    // Check if already loading
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    // Check cache first
    const cachedUrl = await imageCache.get(url);
    if (cachedUrl) {
      return cachedUrl;
    }

    // Create loading promise
    const loadingPromise = this.performLoad(url, options);
    this.loadingPromises.set(url, loadingPromise);

    try {
      const result = await loadingPromise;
      return result;
    } finally {
      this.loadingPromises.delete(url);
    }
  }

  private async performLoad(
    url: string, 
    options: LoadImageOptions
  ): Promise<string> {
    const { 
      retryAttempts = 3, 
      retryDelay = 1000, 
      onProgress,
      signal 
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retryAttempts; attempt++) {
      try {
        if (signal?.aborted) {
          throw new Error('Loading aborted');
        }

        const response = await fetch(url, {
          signal,
          cache: 'force-cache',
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Handle progress if supported
        if (onProgress && response.body) {
          const contentLength = response.headers.get('content-length');
          if (contentLength) {
            return this.loadWithProgress(response, parseInt(contentLength), onProgress);
          }
        }

        const blob = await response.blob();
        return await imageCache.set(url, blob);

      } catch (error) {
        lastError = error as Error;
        
        if (attempt < retryAttempts - 1) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => 
            setTimeout(resolve, retryDelay * Math.pow(2, attempt))
          );
        }
      }
    }

    throw lastError || new Error('Failed to load image');
  }

  private async loadWithProgress(
    response: Response,
    contentLength: number,
    onProgress: (progress: number) => void
  ): Promise<string> {
    const reader = response.body!.getReader();
    const chunks: Uint8Array[] = [];
    let receivedLength = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        receivedLength += value.length;
        
        const progress = (receivedLength / contentLength) * 100;
        onProgress(Math.min(progress, 100));
      }

      const blob = new Blob(chunks);
      return await imageCache.set(response.url, blob);
    } finally {
      reader.releaseLock();
    }
  }

  preloadImages(urls: string[]): void {
    this.preloadQueue.push(...urls);
    if (!this.isPreloading) {
      this.processPreloadQueue();
    }
  }

  private async processPreloadQueue(): Promise<void> {
    if (this.preloadQueue.length === 0) {
      this.isPreloading = false;
      return;
    }

    this.isPreloading = true;
    const url = this.preloadQueue.shift()!;

    try {
      await this.loadImage(url, { retryAttempts: 1 });
    } catch (error) {
      console.warn(`Failed to preload image: ${url}`, error);
    }

    // Continue with next image (with small delay to prevent overwhelming)
    setTimeout(() => this.processPreloadQueue(), 50);
  }

  cancelLoad(url: string): void {
    this.loadingPromises.delete(url);
  }

  isLoading(url: string): boolean {
    return this.loadingPromises.has(url);
  }

  clearPreloadQueue(): void {
    this.preloadQueue = [];
  }
}

export const imageLoader = ImageLoader.getInstance();