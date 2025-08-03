import { RetryPolicy, PlaceholderOptions } from "../types";

export interface ImgCacheProConfig {
  // Cache settings
  cache: {
    maxMemorySize: number; // MB
    maxStorageSize: number; // MB
    defaultTTL: number; // milliseconds
    cleanupInterval: number; // milliseconds
    compressionLevel: number; // 0-1
    enablePersistence: boolean;
  };

  // Loading settings
  loading: {
    fadeInDuration: number; // milliseconds
    retryPolicy: RetryPolicy;
    concurrentLoads: number;
    timeoutDuration: number; // milliseconds
    prefetchThreshold: number; // viewport ratio
  };

  // Placeholder settings
  placeholder: {
    default: PlaceholderOptions;
    showShimmer: boolean;
    shimmerDuration: number; // milliseconds
    adaptiveSize: boolean;
  };

  // Preload settings
  preload: {
    enabled: boolean;
    aggressiveness: "low" | "medium" | "high";
    maxConcurrent: number;
    intersectionThreshold: number;
    rootMargin: string;
  };

  // Performance settings
  performance: {
    enableWebP: boolean;
    enableAVIF: boolean;
    qualityAdjustment: boolean;
    lazyLoadThreshold: number;
    priorityHints: boolean;
  };

  // Debug settings
  debug: {
    enabled: boolean;
    logLevel: "error" | "warn" | "info" | "debug";
    showStats: boolean;
  };
}

// ✅ DeepPartial type to allow recursive partial updates
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export const defaultConfig: ImgCacheProConfig = {
  cache: {
    maxMemorySize: 100,
    maxStorageSize: 500,
    defaultTTL: 7 * 24 * 60 * 60 * 1000,
    cleanupInterval: 60 * 60 * 1000,
    compressionLevel: 0.8,
    enablePersistence: true,
  },

  loading: {
    fadeInDuration: 300,
    retryPolicy: {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 5000,
      exponentialBackoff: true,
    },
    concurrentLoads: 6,
    timeoutDuration: 15000,
    prefetchThreshold: 0.5,
  },

  placeholder: {
    default: {
      width: 200,
      height: 200,
      backgroundColor: "#f3f4f6",
      textColor: "#9ca3af",
      showText: false,
      customText: "",
    },
    showShimmer: true,
    shimmerDuration: 1500,
    adaptiveSize: true,
  },

  preload: {
    enabled: true,
    aggressiveness: "medium",
    maxConcurrent: 3,
    intersectionThreshold: 0.1,
    rootMargin: "100px",
  },

  performance: {
    enableWebP: true,
    enableAVIF: true,
    qualityAdjustment: true,
    lazyLoadThreshold: 300,
    priorityHints: true,
  },

  debug: {
    enabled: false,
    logLevel: "warn",
    showStats: false,
  },
};

// Configuration state
let currentConfig: ImgCacheProConfig = { ...defaultConfig };

// ✅ Update config with deep merge
export const setConfig = (newConfig: DeepPartial<ImgCacheProConfig>): void => {
  currentConfig = mergeDeep(currentConfig, newConfig);
};

// Get current config
export const getConfig = (): ImgCacheProConfig => currentConfig;

// Reset config to default
export const resetConfig = (): void => {
  currentConfig = { ...defaultConfig };
};

// ✅ Deep merge utility without using `any`
function mergeDeep<T>(target: T, source: DeepPartial<T>): T {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue)
    ) {
      result[key] = mergeDeep(
        (targetValue ?? {}) as T[typeof key],
        sourceValue as DeepPartial<T[typeof key]>
      );
    } else {
      result[key] = sourceValue as T[typeof key];
    }
  }

  return result;
}
