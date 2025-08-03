# ImgCachePro - Advanced Image Caching System

A standalone, production-ready image caching system that provides instant image loading with zero flicker, intelligent preloading, and seamless placeholder handling.

## Features

✨ **Zero Flicker Loading** - Images appear instantly after page refresh  
🚀 **Intelligent Preloading** - Predictive loading based on user behavior  
💾 **Hybrid Caching** - Memory + LocalStorage for maximum performance  
🎨 **Smart Placeholders** - Adaptive placeholders with shimmer effects  
🔄 **Automatic Fallbacks** - Robust error handling with retry policies  
📱 **Responsive Support** - Optimal image variants for different screen sizes  
⚡ **High Performance** - Concurrent loading with smart throttling  
🛠️ **Zero Configuration** - Works out of the box, configurable when needed

## Quick Start

### 1. Installation

Copy the entire `imgCachePro` folder to your project:

```bash
cp -r imgCachePro /path/to/your/project/
```

### 2. Basic Usage

```typescript
import {
  loadImageIntoContainer,
  preloadImages,
  configure,
} from "./imgCachePro";

// Load image into a container with automatic placeholder
const container = document.getElementById("image-container");
await loadImageIntoContainer(container, "https://example.com/image.jpg");

// Preload images for future use
await preloadImages([
  "https://example.com/image1.jpg",
  "https://example.com/image2.jpg",
  "https://example.com/image3.jpg",
]);

// Optional: Configure the system
configure({
  cache: {
    maxMemorySize: 200, // 200MB
    defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
  },
  loading: {
    fadeInDuration: 500, // 500ms fade-in
  },
});
```

## API Reference

### Core Functions

#### `loadImageIntoContainer(container, url, options?)`

Loads an image into a container with automatic placeholder handling.

```typescript
const container = document.getElementById("my-image");
const result = await loadImageIntoContainer(
  container,
  "https://example.com/photo.jpg",
  {
    placeholder: {
      backgroundColor: "#f0f0f0",
      showText: true,
    },
    fadeInDuration: 300,
    priority: "high",
  }
);

console.log(result.fromCache); // true if loaded from cache
```

#### `loadImage(url, options?)`

Loads an image and returns the result without automatic DOM manipulation.

```typescript
const result = await loadImage("https://example.com/photo.jpg", {
  priority: "high",
  retryAttempts: 2,
  onLoad: (imageUrl) => console.log("Loaded:", imageUrl),
  onError: (error) => console.error("Failed:", error),
});

if (result.success) {
  // Use result.imageUrl
  const img = new Image();
  img.src = result.imageUrl;
  document.body.appendChild(img);
}
```

#### `preloadImage(url, options?)`

Preloads a single image for future use.

```typescript
const success = await preloadImage("https://example.com/future-image.jpg", {
  priority: "low",
});

console.log("Preloaded successfully:", success);
```

#### `preloadImages(urls, options?)`

Intelligently preloads multiple images with concurrency control.

```typescript
await preloadImages(
  [
    "https://example.com/img1.jpg",
    "https://example.com/img2.jpg",
    "https://example.com/img3.jpg",
  ],
  {
    priority: "normal",
  }
);
```

### Configuration

#### `configure(config)`

Updates the system configuration.

```typescript
configure({
  cache: {
    maxMemorySize: 150, // Maximum memory cache size (MB)
    maxStorageSize: 1000, // Maximum storage cache size (MB)
    defaultTTL: 7 * 24 * 60 * 60 * 1000, // Cache expiry (7 days)
    enablePersistence: true, // Enable localStorage caching
  },

  loading: {
    fadeInDuration: 400, // Fade-in animation duration (ms)
    concurrentLoads: 4, // Max concurrent downloads
    timeoutDuration: 10000, // Request timeout (ms)
    retryPolicy: {
      maxAttempts: 3, // Max retry attempts
      baseDelay: 1000, // Base retry delay (ms)
      exponentialBackoff: true, // Use exponential backoff
    },
  },

  placeholder: {
    default: {
      backgroundColor: "#f3f4f6",
      textColor: "#9ca3af",
      showText: false,
    },
    showShimmer: true, // Show shimmer animation
    adaptiveSize: true, // Adapt to container size
  },

  preload: {
    enabled: true,
    aggressiveness: "medium", // 'low' | 'medium' | 'high'
    maxConcurrent: 3, // Max concurrent preloads
    intersectionThreshold: 0.1, // Intersection observer threshold
  },

  debug: {
    enabled: true,
    logLevel: "info", // 'error' | 'warn' | 'info' | 'debug'
  },
});
```

### Cache Management

#### `getCacheStats()`

Returns detailed cache statistics.

```typescript
const stats = getCacheStats();
console.log(`Cache entries: ${stats.totalEntries}`);
console.log(`Memory usage: ${stats.memoryUsage.toFixed(2)} MB`);
console.log(`Hit rate: ${stats.hitRate.toFixed(1)}%`);
```

#### `clearCache()`

Clears all cached images.

```typescript
await clearCache();
console.log("Cache cleared");
```

#### `invalidateCache(url)`

Invalidates a specific cache entry.

```typescript
const success = await invalidateCache("https://example.com/old-image.jpg");
console.log("Invalidated:", success);
```

## Usage Examples

### React Component

```tsx
import React, { useEffect, useRef } from "react";
import { loadImageIntoContainer, preloadImages } from "./imgCachePro";

const ImageGallery: React.FC<{ images: string[] }> = ({ images }) => {
  const containerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Preload all images
    preloadImages(images);
  }, [images]);

  useEffect(() => {
    // Load images into containers
    containerRefs.current.forEach((container, index) => {
      if (container && images[index]) {
        loadImageIntoContainer(container, images[index], {
          placeholder: { showText: false },
          priority: index < 3 ? "high" : "normal", // Prioritize first 3 images
        });
      }
    });
  }, [images]);

  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map((_, index) => (
        <div
          key={index}
          ref={(el) => (containerRefs.current[index] = el)}
          className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden"
        />
      ))}
    </div>
  );
};
```

### Vanilla JavaScript

```javascript
import { loadImageIntoContainer, configure } from "./imgCachePro";

// Configure for your needs
configure({
  loading: { fadeInDuration: 600 },
  placeholder: { showShimmer: true },
});

// Load images
document
  .querySelectorAll(".image-container")
  .forEach(async (container, index) => {
    const imageUrl = container.dataset.src;

    if (imageUrl) {
      await loadImageIntoContainer(container, imageUrl, {
        priority: index < 2 ? "high" : "normal",
        placeholder: {
          customText: `Loading image ${index + 1}...`,
        },
      });
    }
  });
```

### Advanced Usage with Responsive Images

```typescript
import { loadImageIntoContainer } from "./imgCachePro";

const container = document.getElementById("hero-image");

await loadImageIntoContainer(container, "https://example.com/hero-large.jpg", {
  responsive: {
    srcSet: `
      https://example.com/hero-small.jpg 400w,
      https://example.com/hero-medium.jpg 800w,
      https://example.com/hero-large.jpg 1200w
    `,
    sizes: "(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px",
  },
  placeholder: {
    backgroundColor: "#1f2937",
    adaptiveSize: true,
  },
  priority: "high",
});
```

## Configuration Options

### Cache Settings

- `maxMemorySize`: Maximum memory cache size in MB (default: 100)
- `maxStorageSize`: Maximum localStorage cache size in MB (default: 500)
- `defaultTTL`: Cache expiry time in milliseconds (default: 7 days)
- `enablePersistence`: Enable localStorage caching (default: true)

### Loading Settings

- `fadeInDuration`: Image fade-in animation duration in ms (default: 300)
- `concurrentLoads`: Maximum concurrent image downloads (default: 6)
- `timeoutDuration`: Request timeout in ms (default: 15000)
- `retryPolicy`: Retry configuration for failed loads

### Placeholder Settings

- `default`: Default placeholder appearance options
- `showShimmer`: Enable shimmer loading animation (default: true)
- `adaptiveSize`: Adapt placeholder to container size (default: true)

### Preload Settings

- `enabled`: Enable intelligent preloading (default: true)
- `aggressiveness`: Preload aggressiveness level (default: 'medium')
- `maxConcurrent`: Maximum concurrent preloads (default: 3)

## Best Practices

### 1. Preload Critical Images

```typescript
// Preload above-the-fold images immediately
await preloadImages(["/hero-image.jpg", "/logo.png", "/featured-product.jpg"], {
  priority: "high",
});
```

### 2. Use Appropriate Priorities

```typescript
// High priority for visible images
await loadImageIntoContainer(heroContainer, heroUrl, { priority: "high" });

// Normal priority for in-viewport images
await loadImageIntoContainer(cardContainer, cardUrl, { priority: "normal" });

// Low priority for below-fold images
await preloadImage(belowFoldUrl, { priority: "low" });
```

### 3. Configure for Your Use Case

```typescript
// E-commerce site with many product images
configure({
  cache: { maxMemorySize: 200 },
  preload: { aggressiveness: "high" },
  loading: { concurrentLoads: 8 },
});

// Blog with occasional images
configure({
  cache: { maxMemorySize: 50 },
  preload: { aggressiveness: "low" },
  loading: { concurrentLoads: 3 },
});
```

### 4. Handle Errors Gracefully

```typescript
const result = await loadImageIntoContainer(container, imageUrl, {
  onError: (error) => {
    console.warn("Image failed to load:", error.message);
    // Optional: Load fallback image
    loadImageIntoContainer(container, "/fallback-image.jpg");
  },
});
```

### 5. Monitor Performance

```typescript
// Check cache performance
const stats = getCacheStats();
console.log(`Hit rate: ${stats.hitRate.toFixed(1)}%`);
console.log(`Memory usage: ${stats.memoryUsage.toFixed(2)} MB`);

// Clear cache if needed
if (stats.memoryUsage > 150) {
  await clearCache();
}
```

## Troubleshooting

### Images Not Caching

1. Check if localStorage is available and enabled
2. Verify the image URLs are valid and accessible
3. Check browser's storage quota
4. Enable debug logging to see cache operations

```typescript
configure({
  debug: {
    enabled: true,
    logLevel: "debug",
  },
});
```

### Slow Loading

1. Increase concurrent load limit
2. Reduce retry attempts for faster failures
3. Use appropriate image priorities
4. Check network conditions

```typescript
configure({
  loading: {
    concurrentLoads: 8,
    retryPolicy: { maxAttempts: 2 },
  },
});
```

### High Memory Usage

1. Reduce memory cache size
2. Decrease image quality or size
3. Implement more aggressive cleanup

```typescript
configure({
  cache: {
    maxMemorySize: 50, // Reduce to 50MB
    cleanupInterval: 30 * 60 * 1000, // Cleanup every 30 minutes
  },
});
```

## Migration Guide

### From Standard Image Loading

**Before:**

```html
<img src="https://example.com/image.jpg" alt="Image" />
```

**After:**

```typescript
const container = document.getElementById("image-container");
await loadImageIntoContainer(container, "https://example.com/image.jpg");
```

### From Other Caching Solutions

1. Replace existing image loading calls with `loadImageIntoContainer`
2. Replace preloading logic with `preloadImages`
3. Configure the system to match your previous cache settings
4. Remove old caching code and dependencies

## Performance Tips

1. **Preload strategically** - Only preload images that are likely to be viewed
2. **Use appropriate priorities** - High for visible, low for speculative
3. **Monitor cache hit rates** - Aim for >80% hit rate for optimal performance
4. **Configure cache size** - Balance memory usage with cache effectiveness
5. **Enable compression** - Use WebP/AVIF formats when possible

## License

This system is designed to be copied and integrated into any project. No external dependencies or licensing concerns.

## Support

The system includes comprehensive error logging. Enable debug mode to troubleshoot issues:

```typescript
configure({
  debug: {
    enabled: true,
    logLevel: "debug",
  },
});
```

Check browser console for detailed operation logs and error messages.
