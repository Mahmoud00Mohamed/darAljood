import ImageLoader from "./loader";
import {
  LoadImageOptions,
  PreloadOptions,
  ImageState,
  ImageCacheConfig,
} from "./types";
import { defaultConfig } from "./config";

// Global instance
let globalLoader: ImageLoader | null = null;

export function initializeImageSystem(
  config: Partial<ImageCacheConfig> = {}
): ImageLoader {
  globalLoader = new ImageLoader(config);
  return globalLoader;
}

export function getImageSystem(): ImageLoader {
  if (!globalLoader) {
    globalLoader = new ImageLoader();
  }
  return globalLoader;
}

// Main API functions
export async function loadImage(
  url: string,
  options: LoadImageOptions = {}
): Promise<ImageState> {
  const loader = getImageSystem();
  return loader.loadImage(url, options);
}

export async function preloadImage(
  url: string,
  options: PreloadOptions = {}
): Promise<void> {
  const loader = getImageSystem();
  return loader.preloadImage(url, options);
}

export async function preloadImages(
  urls: string[],
  options: PreloadOptions = {}
): Promise<void> {
  const loader = getImageSystem();
  return loader.preloadImages(urls, options);
}

export function getImageState(url: string): ImageState | null {
  const loader = getImageSystem();
  return loader.getImageState(url);
}

export async function clearImageCache(): Promise<void> {
  const loader = getImageSystem();
  return loader.clearCache();
}

export function getImageSystemStats() {
  const loader = getImageSystem();
  return loader.getStats();
}

// Export types and config
export type { LoadImageOptions, PreloadOptions, ImageState, ImageCacheConfig };
export { defaultConfig };
export default ImageLoader;
