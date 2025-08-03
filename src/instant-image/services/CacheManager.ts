import type { ImageData, CacheConfig } from "../types/config";
import { StorageService } from "./StorageService";

export class CacheManager {
  private memoryCache = new Map<string, ImageData>();
  private accessTimes = new Map<string, number>();
  private storageService: StorageService;
  private cleanupTimer?: number;

  constructor(private config: CacheConfig) {
    this.storageService = new StorageService(config);
    this.startCleanupTimer();
  }

  async get(src: string): Promise<Blob | null> {
    // Check memory cache first (fastest)
    const memoryData = this.memoryCache.get(src);
    if (memoryData && this.isValidCache(memoryData)) {
      this.updateAccessTime(src, memoryData);
      return memoryData.blob;
    }

    // Check storage cache
    const storageData = await this.storageService.get(src);
    if (storageData && this.isValidCache(storageData)) {
      // Promote to memory cache
      this.memoryCache.set(src, storageData);
      this.updateAccessTime(src, storageData);
      return storageData.blob;
    }

    return null;
  }

  async set(src: string, blob: Blob): Promise<void> {
    const imageData: ImageData = {
      src,
      blob,
      timestamp: Date.now(),
      accessCount: 1,
      size: blob.size,
      format: blob.type,
    };

    // Store in memory cache
    this.memoryCache.set(src, imageData);
    this.updateAccessTime(src, imageData);

    // Store in persistent storage
    if (this.config.useLocalStorage || this.config.useSessionStorage) {
      await this.storageService.set(src, imageData);
    }

    // Enforce memory cache size limit
    this.enforceMemoryLimit();
  }

  private isValidCache(data: ImageData): boolean {
    const age = Date.now() - data.timestamp;
    return age < this.config.memoryTTL;
  }

  private updateAccessTime(src: string, data: ImageData): void {
    data.accessCount++;
    data.timestamp = Date.now();
    this.accessTimes.set(src, Date.now());
  }

  private enforceMemoryLimit(): void {
    if (this.memoryCache.size <= this.config.maxMemoryItems) return;

    // Remove least recently used items
    const sortedEntries = Array.from(this.accessTimes.entries()).sort(
      ([, a], [, b]) => a - b
    );

    const itemsToRemove = this.memoryCache.size - this.config.maxMemoryItems;
    for (let i = 0; i < itemsToRemove; i++) {
      const [src] = sortedEntries[i];
      this.memoryCache.delete(src);
      this.accessTimes.delete(src);
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = window.setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private cleanup(): void {
    const now = Date.now();

    // Clean memory cache
    for (const [src, data] of this.memoryCache.entries()) {
      if (now - data.timestamp > this.config.memoryTTL) {
        this.memoryCache.delete(src);
        this.accessTimes.delete(src);
      }
    }

    // Clean storage cache
    this.storageService.cleanup();
  }

  preload(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already cached
      this.get(src).then((cachedBlob) => {
        if (cachedBlob) {
          resolve();
          return;
        }

        // Load and cache the image
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = async () => {
          try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d")!;
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
              async (blob) => {
                if (blob) {
                  await this.set(src, blob);
                  resolve();
                } else {
                  reject(new Error("Failed to convert image to blob"));
                }
              },
              "image/webp",
              this.config.compressionQuality
            );
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
      });
    });
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.memoryCache.clear();
    this.accessTimes.clear();
    this.storageService.destroy();
  }

  getStats() {
    return {
      memoryItems: this.memoryCache.size,
      totalMemorySize: Array.from(this.memoryCache.values()).reduce(
        (sum, data) => sum + data.size,
        0
      ),
      storageStats: this.storageService.getStats(),
    };
  }
}
