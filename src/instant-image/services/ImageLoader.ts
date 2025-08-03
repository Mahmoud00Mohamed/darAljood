import type { InstantImageConfig } from "../types/config";
import { CacheManager } from "./CacheManager";

export class ImageLoader {
  private loadingPromises = new Map<string, Promise<string>>();

  constructor(
    private config: InstantImageConfig,
    private cacheManager: CacheManager
  ) {}

  async load(src: string): Promise<string> {
    // Return existing promise if already loading
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    const loadPromise = this.loadWithRetry(src);
    this.loadingPromises.set(src, loadPromise);

    try {
      const result = await loadPromise;
      return result;
    } finally {
      this.loadingPromises.delete(src);
    }
  }

  private async loadWithRetry(src: string, attempt = 0): Promise<string> {
    try {
      // Check cache first
      const cachedBlob = await this.cacheManager.get(src);
      if (cachedBlob) {
        return URL.createObjectURL(cachedBlob);
      }

      // Load fresh image
      const blob = await this.fetchImage(src);
      await this.cacheManager.set(src, blob);
      return URL.createObjectURL(blob);
    } catch (error) {
      if (attempt < this.config.retryAttempts) {
        // Wait before retry
        await new Promise((resolve) =>
          setTimeout(resolve, this.config.retryDelay * (attempt + 1))
        );
        return this.loadWithRetry(src, attempt + 1);
      }

      // Use fallback if available
      if (this.config.fallbackImage) {
        return this.config.fallbackImage;
      }

      throw error;
    }
  }

  private async fetchImage(src: string): Promise<Blob> {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    return response.blob();
  }

  getOptimizedSrc(src: string, width?: number, height?: number): string {
    // For demonstration, return original src
    // In production, this could implement responsive image logic
    if (!width && !height) return src;

    // Example: Add responsive parameters if your image service supports it
    // return `${src}?w=${width}&h=${height}&q=${this.config.cache.compressionQuality * 100}`;

    return src;
  }
}
