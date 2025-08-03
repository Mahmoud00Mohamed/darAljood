import { ImageData, LoadImageOptions, LoadResult } from "../types";
import { getConfig } from "../config/settings";
import { isValidUrl, isImageUrl, validateOptions } from "../utils/validation";
import {
  getBestImageVariant,
  createImageElement,
  logger,
} from "../utils/helpers";
import { getCacheManager } from "./cacheManager";
import { getFallbackHandler } from "./fallbackHandler";

export const loadImageData = async (
  url: string,
  options: LoadImageOptions = {}
): Promise<ImageData> => {
  if (!isValidUrl(url) || !isImageUrl(url)) {
    throw new Error(`Invalid image URL: ${url}`);
  }

  const config = getConfig();
  const fallbackHandler = getFallbackHandler();

  return fallbackHandler.handleWithRetry(
    async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        config.loading.timeoutDuration
      );

      try {
        const response = await fetch(url, {
          signal: controller.signal,
          cache: "default",
          priority: options.priority || "auto",
        } as RequestInit);

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();

        if (!blob.type.startsWith("image/")) {
          throw new Error(`Invalid image type: ${blob.type}`);
        }

        const imageData: ImageData = {
          url,
          blob,
          timestamp: Date.now(),
          size: blob.size,
          format: blob.type,
          version: "1.0",
        };

        logger.debug(
          "Successfully loaded image data:",
          url,
          `(${Math.round(blob.size / 1024)}KB)`
        );
        return imageData;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
    url,
    { maxAttempts: options.retryAttempts }
  );
};

export const createImageFromData = (
  imageData: ImageData
): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = createImageElement();
    const objectUrl = URL.createObjectURL(imageData.blob);

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
    };

    img.onload = () => {
      img.style.opacity = "1";
      cleanup();
      resolve(img);
    };

    img.onerror = () => {
      cleanup();
      reject(new Error(`Failed to create image element from blob`));
    };

    img.src = objectUrl;
  });
};

export const loadImage = async (
  keyOrUrl: string,
  options: LoadImageOptions = {}
): Promise<LoadResult> => {
  const startTime = Date.now();
  const validatedOptions = validateOptions(options);

  try {
    if (!isValidUrl(keyOrUrl) || !isImageUrl(keyOrUrl)) {
      throw new Error(`Invalid image URL: ${keyOrUrl}`);
    }

    const cacheManager = getCacheManager();

    // Try cache first
    const cachedData = await cacheManager.getFromCache(keyOrUrl);
    if (cachedData) {
      const img = await createImageFromData(cachedData);
      const loadTime = Date.now() - startTime;

      logger.debug("Loaded from cache:", keyOrUrl, `(${loadTime}ms)`);

      if (validatedOptions.onLoad) {
        validatedOptions.onLoad(img.src);
      }

      return {
        success: true,
        imageUrl: img.src,
        fromCache: true,
        loadTime,
      };
    }

    // Load from network
    logger.debug("Loading from network:", keyOrUrl);

    const imageData = await loadImageData(keyOrUrl, validatedOptions);

    // Cache the loaded data
    await cacheManager.saveToCache(keyOrUrl, imageData);

    // Create image element
    const img = await createImageFromData(imageData);
    const loadTime = Date.now() - startTime;

    logger.debug("Loaded from network:", keyOrUrl, `(${loadTime}ms)`);

    if (validatedOptions.onLoad) {
      validatedOptions.onLoad(img.src);
    }

    return {
      success: true,
      imageUrl: img.src,
      fromCache: false,
      loadTime,
    };
  } catch (error) {
    const loadTime = Date.now() - startTime;

    logger.error("Failed to load image:", keyOrUrl, error);

    if (validatedOptions.onError) {
      validatedOptions.onError(error as Error);
    }

    return {
      success: false,
      error: error as Error,
      fromCache: false,
      loadTime,
    };
  }
};

export const preloadImage = async (
  keyOrUrl: string,
  options: LoadImageOptions = {}
): Promise<boolean> => {
  try {
    const result = await loadImage(keyOrUrl, {
      ...options,
      priority: options.priority || "low",
    });

    return result.success;
  } catch (error) {
    logger.warn("Preload failed:", keyOrUrl, error);
    return false;
  }
};

export const loadImageWithPlaceholder = async (
  container: HTMLElement,
  keyOrUrl: string,
  options: LoadImageOptions = {}
): Promise<LoadResult> => {
  const config = getConfig();
  const validatedOptions = validateOptions(options);

  // Set up placeholder
  const placeholderOptions = {
    ...config.placeholder.default,
    ...validatedOptions.placeholder,
  };

  // Calculate container dimensions for adaptive placeholder
  const containerRect = container.getBoundingClientRect();
  const containerWidth = containerRect.width || placeholderOptions.width!;
  const containerHeight = containerRect.height || placeholderOptions.height!;

  if (config.placeholder.adaptiveSize) {
    placeholderOptions.width = containerWidth;
    placeholderOptions.height = containerHeight;
  }

  // Create and show placeholder
  const placeholderImg = new Image();
  const useBestVariant = validatedOptions.responsive?.srcSet;

  const finalUrl = useBestVariant
    ? getBestImageVariant([keyOrUrl], containerWidth, window.devicePixelRatio)
    : keyOrUrl;

  // Show shimmer or static placeholder
  if (config.placeholder.showShimmer) {
    const { generateShimmerSVG } = await import("../utils/helpers");
    placeholderImg.src = generateShimmerSVG(
      placeholderOptions.width!,
      placeholderOptions.height!
    );
  } else {
    const { generatePlaceholderSVG } = await import("../utils/helpers");
    placeholderImg.src = generatePlaceholderSVG(placeholderOptions);
  }

  placeholderImg.style.width = "100%";
  placeholderImg.style.height = "100%";
  placeholderImg.style.objectFit = "cover";

  container.innerHTML = "";
  container.appendChild(placeholderImg);

  // Load actual image
  try {
    const result = await loadImage(finalUrl, validatedOptions);

    if (result.success && result.imageUrl) {
      // Create new image element for smooth transition
      const actualImg = new Image();
      actualImg.src = result.imageUrl;
      actualImg.style.width = "100%";
      actualImg.style.height = "100%";
      actualImg.style.objectFit = "cover";
      actualImg.style.opacity = "0";
      actualImg.style.transition = `opacity ${
        validatedOptions.fadeInDuration || config.loading.fadeInDuration
      }ms ease-in-out`;

      // Handle responsive attributes
      if (validatedOptions.responsive?.sizes) {
        actualImg.sizes = validatedOptions.responsive.sizes;
      }
      if (validatedOptions.responsive?.srcSet) {
        actualImg.srcset = validatedOptions.responsive.srcSet;
      }

      actualImg.onload = () => {
        // Replace placeholder with actual image
        container.innerHTML = "";
        container.appendChild(actualImg);

        // Trigger fade in
        requestAnimationFrame(() => {
          actualImg.style.opacity = "1";
        });
      };

      return result;
    } else {
      // Show error placeholder
      const fallbackHandler = getFallbackHandler();
      const errorImg = new Image();
      errorImg.src = fallbackHandler.generateFallbackImage(
        placeholderOptions.width!,
        placeholderOptions.height!,
        "Load failed"
      );
      errorImg.style.width = "100%";
      errorImg.style.height = "100%";
      errorImg.style.objectFit = "cover";

      container.innerHTML = "";
      container.appendChild(errorImg);

      return result;
    }
  } catch (error) {
    logger.error("Error in loadImageWithPlaceholder:", error);

    // Show error placeholder
    const fallbackHandler = getFallbackHandler();
    const errorImg = new Image();
    errorImg.src = fallbackHandler.generateFallbackImage(
      placeholderOptions.width!,
      placeholderOptions.height!,
      "Error occurred"
    );
    errorImg.style.width = "100%";
    errorImg.style.height = "100%";
    errorImg.style.objectFit = "cover";

    container.innerHTML = "";
    container.appendChild(errorImg);

    return {
      success: false,
      error: error as Error,
      fromCache: false,
      loadTime: Date.now() - Date.now(),
    };
  }
};
