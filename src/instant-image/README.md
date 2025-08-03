# InstantImage System

A high-performance image loading and caching system that provides instant image display with zero flashing, smart caching, and predictive preloading.

## Features

- **Zero Flash Loading**: Images appear instantly without visible loading states
- **Smart Multi-Level Caching**: Memory + Session + LocalStorage caching
- **Predictive Preloading**: Learn user behavior and preload likely images
- **Seamless Transitions**: Smooth placeholder-to-image transitions
- **Self-Contained**: Drop-in folder that works in any project
- **Configurable**: Extensive configuration options
- **TypeScript**: Full type safety

## Quick Start

```tsx
import { InstantImage } from "./instant-image";

function MyComponent() {
  return (
    <InstantImage
      src="https://example.com/image.jpg"
      alt="Example"
      width={400}
      height={300}
    />
  );
}
```

## Advanced Usage

```tsx
import { InstantImage, useInstantImage } from "./instant-image";

// Custom configuration
const customConfig = {
  cache: {
    maxMemoryItems: 200,
    memoryTTL: 60 * 60 * 1000, // 1 hour
  },
  preload: {
    enablePredictive: true,
    maxConcurrentPreloads: 5,
  },
  transition: {
    fadeInDuration: 200,
    blurTransition: true,
  },
};

function GalleryImage({ src, alt }) {
  return (
    <InstantImage
      src={src}
      alt={alt}
      config={customConfig}
      enablePreload={true}
      className="rounded-lg shadow-md"
      onLoad={() => console.log("Image loaded!")}
    />
  );
}
```

## Hook Usage

```tsx
function CustomImageComponent({ src }) {
  const { imageSrc, isLoading, error, retry } = useInstantImage({
    src,
    preload: true,
  });

  if (error) {
    return <button onClick={retry}>Retry</button>;
  }

  return imageSrc ? <img src={imageSrc} /> : <div>Loading...</div>;
}
```

## Configuration Options

The system is highly configurable through the `InstantImageConfig` interface:

- **Cache Settings**: Memory limits, TTL, storage preferences
- **Preload Settings**: Distance thresholds, concurrency, predictions
- **Transition Settings**: Animation durations, effects, placeholders
- **Performance Settings**: Format optimization, retry logic

## Installation

Simply copy the `instant-image` folder into your project and import the components you need. No external dependencies required beyond React.
