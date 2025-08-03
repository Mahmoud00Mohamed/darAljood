import type { InstantImageConfig } from "../types/config";
import type { PartialInstantImageConfig } from "../types/config";
import { defaultConfig } from "../config/defaultConfig";
import { CacheManager } from "../services/CacheManager";
import { ImagePreloader } from "../services/ImagePreloader";
import { ImageLoader } from "../services/ImageLoader";

export class InstantImageSystem {
  private config: InstantImageConfig;
  private cacheManager: CacheManager;
  private preloader: ImagePreloader;
  private imageLoader: ImageLoader;
  private static instance?: InstantImageSystem;

  constructor(customConfig?: PartialInstantImageConfig) {
    this.config = this.mergeConfig(customConfig);
    this.cacheManager = new CacheManager(this.config.cache);
    this.preloader = new ImagePreloader(this.config.preload, this.cacheManager);
    this.imageLoader = new ImageLoader(this.config, this.cacheManager);
  }

  static getInstance(
    customConfig?: PartialInstantImageConfig
  ): InstantImageSystem {
    if (!InstantImageSystem.instance) {
      InstantImageSystem.instance = new InstantImageSystem(customConfig);
    }
    return InstantImageSystem.instance;
  }

  private mergeConfig(
    customConfig?: PartialInstantImageConfig
  ): InstantImageConfig {
    if (!customConfig) return defaultConfig;

    return {
      ...defaultConfig,
      ...customConfig,
      cache: { ...defaultConfig.cache, ...customConfig.cache },
      preload: { ...defaultConfig.preload, ...customConfig.preload },
      transition: { ...defaultConfig.transition, ...customConfig.transition },
    };
  }

  async loadImage(src: string): Promise<string> {
    return this.imageLoader.load(src);
  }

  getOptimizedSrc(src: string, width?: number, height?: number): string {
    return this.imageLoader.getOptimizedSrc(src, width, height);
  }

  preload(sources: string[]): void {
    sources.forEach((src) => {
      this.preloader.addToQueue(src, "high");
    });
  }

  observeElement(element: HTMLImageElement): void {
    this.preloader.observe(element);
  }

  unobserveElement(element: HTMLImageElement): void {
    this.preloader.unobserve(element);
  }

  getPredictions(): string[] {
    return this.preloader.getPredictions();
  }

  getStats() {
    return {
      cache: this.cacheManager.getStats(),
      activePreloads: this.preloader["activePreloads"].size,
      queueSize: this.preloader["preloadQueue"].size,
    };
  }

  updateConfig(newConfig: Partial<InstantImageConfig>): void {
    this.config = this.mergeConfig(newConfig as PartialInstantImageConfig);
  }

  getFallbackSrc(): string | undefined {
    return this.config.fallbackImage;
  }

  destroy(): void {
    this.cacheManager.destroy();
    this.preloader.destroy();
    InstantImageSystem.instance = undefined;
  }
}
