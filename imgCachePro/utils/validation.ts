import { LoadImageOptions, PlaceholderOptions } from "../types";

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isImageUrl = (url: string): boolean => {
  if (!isValidUrl(url)) return false;

  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|avif|svg|bmp|ico)(\?.*)?$/i;
  return imageExtensions.test(url);
};

export const validateKey = (key: string): boolean => {
  return typeof key === "string" && key.length > 0 && key.length <= 255;
};

export const validateOptions = (
  options?: LoadImageOptions
): LoadImageOptions => {
  if (!options) return {};

  const validated: LoadImageOptions = {};

  if (options.placeholder) {
    validated.placeholder = validatePlaceholderOptions(options.placeholder);
  }

  if (
    options.priority &&
    ["low", "normal", "high"].includes(options.priority)
  ) {
    validated.priority = options.priority;
  }

  if (
    options.fadeInDuration &&
    typeof options.fadeInDuration === "number" &&
    options.fadeInDuration >= 0
  ) {
    validated.fadeInDuration = Math.min(options.fadeInDuration, 2000);
  }

  if (options.retryAttempts && typeof options.retryAttempts === "number") {
    validated.retryAttempts = Math.max(0, Math.min(options.retryAttempts, 10));
  }

  if (options.responsive) {
    validated.responsive = options.responsive;
  }

  if (typeof options.onLoad === "function") {
    validated.onLoad = options.onLoad;
  }

  if (typeof options.onError === "function") {
    validated.onError = options.onError;
  }

  return validated;
};

export const validatePlaceholderOptions = (
  options: PlaceholderOptions
): PlaceholderOptions => {
  const validated: PlaceholderOptions = {};

  if (options.width && typeof options.width === "number" && options.width > 0) {
    validated.width = Math.min(options.width, 2000);
  }

  if (
    options.height &&
    typeof options.height === "number" &&
    options.height > 0
  ) {
    validated.height = Math.min(options.height, 2000);
  }

  if (options.backgroundColor && typeof options.backgroundColor === "string") {
    validated.backgroundColor = options.backgroundColor;
  }

  if (options.textColor && typeof options.textColor === "string") {
    validated.textColor = options.textColor;
  }

  if (typeof options.showText === "boolean") {
    validated.showText = options.showText;
  }

  if (options.customText && typeof options.customText === "string") {
    validated.customText = options.customText.slice(0, 50);
  }

  return validated;
};

export const sanitizeKey = (key: string): string => {
  return key.replace(/[^a-zA-Z0-9-_./]/g, "_").slice(0, 255);
};

export const generateCacheKey = (
  url: string,
  options?: Record<string, unknown>
): string => {
  const baseKey = sanitizeKey(url);

  if (!options) return baseKey;

  const optionsHash = JSON.stringify(options)
    .split("")
    .reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0)
    .toString(36);

  return `${baseKey}_${optionsHash}`;
};

export const isStorageAvailable = (
  type: "localStorage" | "sessionStorage"
): boolean => {
  try {
    const storage = window[type];
    const testKey = "__imgCachePro_test__";
    storage.setItem(testKey, "test");
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};
