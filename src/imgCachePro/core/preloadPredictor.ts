import { PreloadOptions } from "../types";
import { getConfig } from "../config/settings";
import { isValidUrl, isImageUrl } from "../utils/validation";
import { logger, debounce, throttle } from "../utils/helpers";
import { getCacheManager } from "./cacheManager";
import { loadImageData } from "./imageLoader";

export class PreloadPredictor {
  private preloadQueue = new Set<string>();
  private activePreloads = new Map<string, Promise<void>>();
  private intersectionObserver: IntersectionObserver | null = null;
  private observedElements = new WeakMap<Element, string>();

  constructor() {
    this.initializeIntersectionObserver();
  }

  async predictAndPreload(
    keysOrUrls: string[],
    options?: PreloadOptions
  ): Promise<void> {
    const config = getConfig();

    if (!config.preload.enabled) {
      logger.debug("Preloading disabled in config");
      return;
    }

    const validUrls = keysOrUrls.filter(
      (url) => isValidUrl(url) && isImageUrl(url)
    );

    if (validUrls.length === 0) {
      logger.warn("No valid image URLs provided for preloading");
      return;
    }

    logger.debug(`Starting preload prediction for ${validUrls.length} images`);

    const priority = options?.priority || "normal";
    const aggressiveness = config.preload.aggressiveness;

    // Determine how many to preload based on aggressiveness
    let preloadCount: number;
    switch (aggressiveness) {
      case "low":
        preloadCount = Math.min(2, validUrls.length);
        break;
      case "high":
        preloadCount = validUrls.length;
        break;
      default: // medium
        preloadCount = Math.min(Math.ceil(validUrls.length / 2), 4);
    }

    // Prioritize URLs that aren't already cached
    const cacheManager = getCacheManager();
    const uncachedUrls: string[] = [];
    const cachedUrls: string[] = [];

    for (const url of validUrls.slice(0, preloadCount)) {
      const cached = await cacheManager.getFromCache(url);
      if (cached) {
        cachedUrls.push(url);
      } else {
        uncachedUrls.push(url);
      }
    }

    logger.debug(
      `Preload analysis: ${cachedUrls.length} cached, ${uncachedUrls.length} to fetch`
    );

    // Preload uncached images with concurrency control
    await this.preloadWithConcurrencyControl(uncachedUrls, priority);
  }

  async markAsNeeded(keyOrUrl: string): Promise<void> {
    if (!isValidUrl(keyOrUrl) || !isImageUrl(keyOrUrl)) {
      logger.warn("Invalid URL marked as needed:", keyOrUrl);
      return;
    }

    const cacheManager = getCacheManager();
    const cached = await cacheManager.getFromCache(keyOrUrl);

    if (!cached && !this.activePreloads.has(keyOrUrl)) {
      this.preloadQueue.add(keyOrUrl);
      await this.processPreloadQueue();
    }
  }

  observeElement(element: Element, imageUrl: string): void {
    if (!this.intersectionObserver) {
      logger.warn("Intersection observer not available");
      return;
    }

    this.observedElements.set(element, imageUrl);
    this.intersectionObserver.observe(element);
    logger.debug("Started observing element for preload:", imageUrl);
  }

  unobserveElement(element: Element): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.unobserve(element);
      this.observedElements.delete(element);
    }
  }

  private initializeIntersectionObserver(): void {
    if (typeof IntersectionObserver === "undefined") {
      logger.warn("IntersectionObserver not supported");
      return;
    }

    const config = getConfig();

    this.intersectionObserver = new IntersectionObserver(
      throttle((entries) => {
        (entries as IntersectionObserverEntry[]).forEach((entry) => {
          if (entry.isIntersecting) {
            const imageUrl = this.observedElements.get(entry.target);
            if (imageUrl) {
              this.markAsNeeded(imageUrl);
              this.unobserveElement(entry.target);
            }
          }
        });
      }, 100),
      {
        threshold: config.preload.intersectionThreshold,
        rootMargin: config.preload.rootMargin,
      }
    );

    logger.debug("Intersection observer initialized");
  }

  private async preloadWithConcurrencyControl(
    urls: string[],
    priority: string
  ): Promise<void> {
    const config = getConfig();
    const maxConcurrent = config.preload.maxConcurrent;

    // Group URLs by priority
    const highPriorityUrls = priority === "high" ? urls.slice(0, 2) : [];
    const normalPriorityUrls = priority === "high" ? urls.slice(2) : urls;

    // Process high priority first
    if (highPriorityUrls.length > 0) {
      await this.processBatch(
        highPriorityUrls,
        Math.min(maxConcurrent, highPriorityUrls.length)
      );
    }

    // Then process normal priority
    if (normalPriorityUrls.length > 0) {
      await this.processBatch(
        normalPriorityUrls,
        Math.min(maxConcurrent, normalPriorityUrls.length)
      );
    }
  }

  private async processBatch(
    urls: string[],
    concurrency: number
  ): Promise<void> {
    const batches: string[][] = [];

    for (let i = 0; i < urls.length; i += concurrency) {
      batches.push(urls.slice(i, i + concurrency));
    }

    for (const batch of batches) {
      const promises = batch.map((url) => this.preloadSingleImage(url));
      await Promise.allSettled(promises);

      // Small delay between batches to avoid overwhelming
      if (batches.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }
  }

  private async preloadSingleImage(url: string): Promise<void> {
    if (this.activePreloads.has(url)) {
      return this.activePreloads.get(url);
    }

    const preloadPromise = this.performPreload(url);
    this.activePreloads.set(url, preloadPromise);

    try {
      await preloadPromise;
    } finally {
      this.activePreloads.delete(url);
      this.preloadQueue.delete(url);
    }
  }

  private async performPreload(url: string): Promise<void> {
    try {
      logger.debug("Preloading image:", url);

      const imageData = await loadImageData(url, {
        priority: "low",
        retryAttempts: 1, // Fewer retries for preload
      });

      const cacheManager = getCacheManager();
      await cacheManager.saveToCache(url, imageData);

      logger.debug("Successfully preloaded and cached:", url);
    } catch (error) {
      logger.warn("Failed to preload image:", url, error);
    }
  }

  private processPreloadQueue = debounce(async () => {
    if (this.preloadQueue.size === 0) return;

    const config = getConfig();
    const urls = Array.from(this.preloadQueue).slice(
      0,
      config.preload.maxConcurrent
    );

    const promises = urls.map((url) => this.preloadSingleImage(url));
    await Promise.allSettled(promises);
  }, 100);

  getQueueStats(): { pending: number; active: number } {
    return {
      pending: this.preloadQueue.size,
      active: this.activePreloads.size,
    };
  }

  destroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }

    this.preloadQueue.clear();
    this.activePreloads.clear();
    this.observedElements = new WeakMap();

    logger.debug("Preload predictor destroyed");
  }
}

// Singleton instance
let preloadPredictorInstance: PreloadPredictor | null = null;

export const getPreloadPredictor = (): PreloadPredictor => {
  if (!preloadPredictorInstance) {
    preloadPredictorInstance = new PreloadPredictor();
  }
  return preloadPredictorInstance;
};

export const destroyPreloadPredictor = (): void => {
  if (preloadPredictorInstance) {
    preloadPredictorInstance.destroy();
    preloadPredictorInstance = null;
  }
};
