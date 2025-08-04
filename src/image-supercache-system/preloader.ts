import { PreloadOptions, ImageCacheConfig } from "./types";
import { defaultConfig } from "./config";
import CacheManager from "./cache-manager";

class PreloadEngine {
  private preloadQueue = new Map<
    string,
    { url: string; priority: string; timestamp: number }
  >();
  private downloading = new Set<string>();
  private config: ImageCacheConfig;
  private cacheManager: CacheManager;
  private immediateQueue = new Set<string>(); // للتحميل الفوري

  constructor(
    cacheManager: CacheManager,
    config: Partial<ImageCacheConfig> = {}
  ) {
    this.cacheManager = cacheManager;
    this.config = { ...defaultConfig, ...config };

    // Start immediate processing
    this.startImmediateProcessor();
  }

  private generateImageKey(url: string): string {
    return btoa(url).replace(/[/+=]/g, "");
  }

  private async downloadImage(url: string): Promise<string> {
    // Use fetch for better performance and progress tracking
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        // High quality WebP compression
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

  private startImmediateProcessor(): void {
    // Process immediate queue continuously
    setInterval(() => {
      if (this.immediateQueue.size > 0) {
        this.processImmediateQueue();
      }
    }, 50); // Very frequent processing for immediate items
  }

  private async processImmediateQueue(): Promise<void> {
    const items = Array.from(this.immediateQueue);
    this.immediateQueue.clear();

    // Process all immediate items in parallel
    await Promise.all(
      items.map(async (key) => {
        if (this.downloading.has(key)) return;

        this.downloading.add(key);
        try {
          const url = atob(key);
          const cached = await this.cacheManager.getFromCache(key);
          if (cached) {
            this.downloading.delete(key);
            return;
          }

          const imageData = await this.downloadImage(url);
          await this.cacheManager.saveToCache(key, imageData, {
            originalUrl: url,
          });
        } catch (error) {
          console.warn("Immediate preload failed for key:", key, error);
        } finally {
          this.downloading.delete(key);
        }
      })
    );
  }

  async predictAndPreload(
    urls: string[],
    options: PreloadOptions = {}
  ): Promise<void> {
    const { delay = 0, priority = "normal" } = options;

    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    urls.forEach((url) => {
      const key = this.generateImageKey(url);

      if (priority === "immediate") {
        this.immediateQueue.add(key);
      } else if (!this.downloading.has(key) && !this.preloadQueue.has(key)) {
        this.preloadQueue.set(key, {
          url,
          priority,
          timestamp: Date.now(),
        });
      }
    });

    if (priority !== "immediate") {
      this.processPreloadQueue();
    }
  }

  async markAsNeeded(url: string, options: PreloadOptions = {}): Promise<void> {
    const key = this.generateImageKey(url);
    const { priority = "high" } = options;

    // Check if already cached
    const cached = await this.cacheManager.getFromCache(key);
    if (cached) return;

    if (priority === "immediate") {
      this.immediateQueue.add(key);
    } else {
      // Add to high priority preload
      this.preloadQueue.set(key, {
        url,
        priority,
        timestamp: Date.now(),
      });
      this.processPreloadQueue();
    }
  }

  private async processPreloadQueue(): Promise<void> {
    const concurrentLimit = this.config.preload.concurrentDownloads;

    if (this.downloading.size >= concurrentLimit) return;

    // Sort by priority and timestamp
    const sortedItems = Array.from(this.preloadQueue.entries()).sort(
      ([, a], [, b]) => {
        const priorityOrder = { immediate: 4, high: 3, normal: 2, low: 1 };
        const aPriority =
          priorityOrder[a.priority as keyof typeof priorityOrder] || 1;
        const bPriority =
          priorityOrder[b.priority as keyof typeof priorityOrder] || 1;

        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        return a.timestamp - b.timestamp;
      }
    );

    const availableSlots = concurrentLimit - this.downloading.size;
    const itemsToProcess = sortedItems.slice(0, availableSlots);

    itemsToProcess.forEach(async ([key, item]) => {
      this.preloadQueue.delete(key);
      this.downloading.add(key);

      try {
        // Check if already cached
        const cached = await this.cacheManager.getFromCache(key);
        if (cached) {
          this.downloading.delete(key);
          return;
        }

        // Download and cache
        const imageData = await this.downloadImage(item.url);
        await this.cacheManager.saveToCache(key, imageData, {
          originalUrl: item.url,
        });
      } catch (error) {
        console.warn("Preload failed for key:", key, error);
      } finally {
        this.downloading.delete(key);

        // Process next items in queue
        if (this.preloadQueue.size > 0) {
          setTimeout(() => this.processPreloadQueue(), 10);
        }
      }
    });
  }

  getQueueStats() {
    return {
      queued: this.preloadQueue.size,
      downloading: this.downloading.size,
      immediate: this.immediateQueue.size,
    };
  }

  clearQueue(): void {
    this.preloadQueue.clear();
    this.immediateQueue.clear();
  }
}

export default PreloadEngine;
