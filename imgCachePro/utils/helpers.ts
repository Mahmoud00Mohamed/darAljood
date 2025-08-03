import { getConfig } from "../config/settings";
import { PlaceholderOptions } from "../types";

export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const createImageElement = (): HTMLImageElement => {
  const img = new Image();
  img.style.transition = `opacity ${
    getConfig().loading.fadeInDuration
  }ms ease-in-out`;
  img.style.opacity = "0";
  return img;
};

export const generatePlaceholderSVG = (options: PlaceholderOptions): string => {
  const {
    width = 200,
    height = 200,
    backgroundColor = "#f3f4f6",
    textColor = "#9ca3af",
    showText = false,
    customText = "",
  } = options;

  const text = customText || (showText ? `${width}×${height}` : "");
  const fontSize = Math.min(width, height) * 0.1;

  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      ${
        text
          ? `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
        font-family="Arial, sans-serif" font-size="${fontSize}" fill="${textColor}">
        ${text}
      </text>`
          : ""
      }
    </svg>
  `)}`;
};

export const generateShimmerSVG = (width: number, height: number): string => {
  const animationDuration = getConfig().placeholder.shimmerDuration;

  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#e5e7eb;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <animateTransform attributeName="gradientTransform" 
            type="translate" values="-100 0;100 0;-100 0" 
            dur="${animationDuration}ms" repeatCount="indefinite"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#shimmer)"/>
    </svg>
  `)}`;
};

export const getBestImageVariant = (
  variants: string[],
  containerWidth: number,
  devicePixelRatio: number = 1
): string => {
  if (!variants.length) return "";
  if (variants.length === 1) return variants[0];

  const targetWidth = containerWidth * devicePixelRatio;

  // Sort variants by their likely width (extract from URL patterns)
  const variantScores = variants.map((url) => {
    const widthMatch = url.match(/[_-](\d+)w?[_.-]/);
    const estimatedWidth = widthMatch ? parseInt(widthMatch[1]) : 1000;
    const score = Math.abs(estimatedWidth - targetWidth);
    return { url, score, width: estimatedWidth };
  });

  variantScores.sort((a, b) => a.score - b.score);
  return variantScores[0].url;
};

export const calculateRetryDelay = (
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  exponential: boolean
): number => {
  if (!exponential) return baseDelay;

  const delay = baseDelay * Math.pow(2, attempt - 1);
  return Math.min(delay, maxDelay);
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

export const getCurrentTimestamp = (): number => Date.now();

export const isExpired = (timestamp: number, ttl: number): boolean => {
  return getCurrentTimestamp() - timestamp > ttl;
};

export const getImageDimensions = (
  url: string
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () =>
      reject(new Error(`Failed to load image dimensions: ${url}`));
    img.src = url;
  });
};

export const logger = {
  debug: (message: string, ...args: unknown[]) => {
    const config = getConfig();
    if (config.debug.enabled && ["debug"].includes(config.debug.logLevel)) {
      console.debug(`[ImgCachePro] ${message}`, ...args);
    }
  },

  info: (message: string, ...args: unknown[]) => {
    const config = getConfig();
    if (
      config.debug.enabled &&
      ["debug", "info"].includes(config.debug.logLevel)
    ) {
      console.info(`[ImgCachePro] ${message}`, ...args);
    }
  },

  warn: (message: string, ...args: unknown[]) => {
    const config = getConfig();
    if (
      config.debug.enabled &&
      ["debug", "info", "warn"].includes(config.debug.logLevel)
    ) {
      console.warn(`[ImgCachePro] ${message}`, ...args);
    }
  },

  error: (message: string, ...args: unknown[]) => {
    const config = getConfig();
    if (config.debug.enabled) {
      console.error(`[ImgCachePro] ${message}`, ...args);
    }
  },
};
