import type { PreloadConfig, PreloadItem } from "../types/config";
import { CacheManager } from "./CacheManager";

export class ImagePreloader {
  private preloadQueue: Map<string, PreloadItem> = new Map();
  private activePreloads = new Set<string>();
  private intersectionObserver?: IntersectionObserver;
  private userBehavior: Map<string, number> = new Map();

  constructor(
    private config: PreloadConfig,
    private cacheManager: CacheManager
  ) {
    if (config.enablePreload) {
      this.initializeObserver();
    }
  }

  private initializeObserver(): void {
    if (!("IntersectionObserver" in window)) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src || img.src;

          if (entry.isIntersecting) {
            this.addToQueue(src, "high");
            if (this.config.trackUserBehavior) {
              this.trackBehavior(src);
            }
          }
        });
      },
      {
        rootMargin: `${this.config.preloadDistance}px`,
        threshold: 0.1,
      }
    );
  }

  addToQueue(src: string, priority: "low" | "high" | "auto" = "auto"): void {
    if (!this.config.enablePreload || this.activePreloads.has(src)) return;

    const numericPriority = this.getPriorityScore(src, priority);

    this.preloadQueue.set(src, {
      src,
      priority: numericPriority,
      timestamp: Date.now(),
      inViewport: false,
    });

    this.processQueue();
  }

  private getPriorityScore(
    src: string,
    priority: "low" | "high" | "auto"
  ): number {
    let baseScore = 0;

    switch (priority) {
      case "high":
        baseScore = 100;
        break;
      case "low":
        baseScore = 10;
        break;
      case "auto":
        baseScore = 50;
        break;
    }

    // Add behavior-based scoring
    if (this.config.enablePredictive) {
      const behaviorScore = this.userBehavior.get(src) || 0;
      baseScore += Math.min(behaviorScore * 10, 50);
    }

    return baseScore;
  }

  private async processQueue(): Promise<void> {
    const availableSlots =
      this.config.maxConcurrentPreloads - this.activePreloads.size;
    if (availableSlots <= 0) return;

    // Sort by priority (highest first)
    const sortedItems = Array.from(this.preloadQueue.values())
      .sort((a, b) => b.priority - a.priority)
      .slice(0, availableSlots);

    for (const item of sortedItems) {
      this.preloadQueue.delete(item.src);
      this.startPreload(item.src);
    }
  }

  private async startPreload(src: string): Promise<void> {
    if (this.activePreloads.has(src)) return;

    this.activePreloads.add(src);

    try {
      // Check if already cached
      const cached = await this.cacheManager.get(src);
      if (cached) {
        this.activePreloads.delete(src);
        return;
      }

      // Preload the image
      await this.cacheManager.preload(src);
    } catch (error) {
      console.warn("Failed to preload image:", src, error);
    } finally {
      this.activePreloads.delete(src);
      // Process any remaining items in queue
      setTimeout(() => this.processQueue(), 100);
    }
  }

  observe(element: HTMLImageElement): void {
    if (this.intersectionObserver && this.config.enablePreload) {
      this.intersectionObserver.observe(element);
    }
  }

  unobserve(element: HTMLImageElement): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.unobserve(element);
    }
  }

  private trackBehavior(src: string): void {
    if (!this.config.trackUserBehavior) return;

    const currentCount = this.userBehavior.get(src) || 0;
    this.userBehavior.set(src, currentCount + 1);
  }

  getPredictions(): string[] {
    if (!this.config.enablePredictive) return [];

    return Array.from(this.userBehavior.entries())
      .filter(([, count]) => count >= this.config.learningThreshold)
      .sort(([, a], [, b]) => b - a)
      .map(([src]) => src)
      .slice(0, 10); // Top 10 predictions
  }

  destroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    this.preloadQueue.clear();
    this.activePreloads.clear();
    this.userBehavior.clear();
  }
}
