import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LoadImageOptions } from './types';
import { imageSystem } from './api';
import { getConfig } from './config';

interface SmartImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  options?: LoadImageOptions;
  fallback?: string;
  onLoadComplete?: (isFromCache: boolean) => void;
  onError?: (error: Error) => void;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  options = {},
  fallback,
  onLoadComplete,
  onError,
  className = '',
  style = {},
  ...imgProps
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [placeholderUrl, setPlaceholderUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const isMountedRef = useRef(true);

  // Create stable callbacks
  const stableOnLoadComplete = useCallback(onLoadComplete || (() => {}), []);
  const stableOnError = useCallback(onError || (() => {}), []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!src) return;

    let cleanup: (() => void) | undefined;

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        setFadeIn(false);
        setImageUrl(null); // Reset to null instead of empty string

        const result = await imageSystem.loadImage(src, {
          ...options,
          fallback
        });

        if (!isMountedRef.current) return;

        // Set placeholder if available
        if (result.placeholder && result.placeholder !== result.imageUrl) {
          setPlaceholderUrl(result.placeholder);
        }

        if (result.isFromCache) {
          setImageUrl(result.imageUrl);
          setIsLoading(false);
          setFadeIn(true);
          stableOnLoadComplete(true);
        } else {
          // If we have a placeholder that's different from final image, show it first
          if (result.placeholder && result.placeholder !== result.imageUrl) {
            setImageUrl(result.placeholder);
          }

          // Set up one-time listener for this specific image
          const handleLoad = (key: string, imageData: any) => {
            if (key.includes(btoa(src)) && isMountedRef.current) {
              const newUrl = URL.createObjectURL(imageData.blob);
              setImageUrl(newUrl);
              setIsLoading(false);
              
              setTimeout(() => {
                if (isMountedRef.current) {
                  setFadeIn(true);
                  stableOnLoadComplete(false);
                }
              }, 50);
            }
          };

          // Store current handlers to restore later
          const currentHandlers = imageSystem['eventHandlers'] || {};
          const originalOnLoad = currentHandlers.onLoad;

          // Combine handlers
          imageSystem.setEventHandlers({
            ...currentHandlers,
            onLoad: (key, imageData) => {
              originalOnLoad?.(key, imageData);
              handleLoad(key, imageData);
            }
          });

          cleanup = () => {
            // Restore original handlers
            imageSystem.setEventHandlers({
              ...currentHandlers,
              onLoad: originalOnLoad
            });
          };
        }

      } catch (error) {
        if (!isMountedRef.current) return;
        
        setHasError(true);
        setIsLoading(false);
        stableOnError(error as Error);
      }
    };

    loadImage();

    return cleanup;
  }, [src, fallback, stableOnLoadComplete, stableOnError]);

  const handleImageLoad = useCallback(() => {
    if (isMountedRef.current) {
      setIsLoading(false);
      if (!fadeIn) {
        setFadeIn(true);
      }
    }
  }, [fadeIn]);

  const handleImageError = useCallback(() => {
    if (isMountedRef.current) {
      setHasError(true);
      setIsLoading(false);
    }
  }, []);

  const config = getConfig();
  const fadeTransition = options.fadeIn !== false ? config.fadeTransitionMs : 0;

  const imageStyle: React.CSSProperties = {
    ...style,
    transition: fadeTransition > 0 ? `opacity ${fadeTransition}ms ease-in-out` : undefined,
    opacity: fadeIn ? 1 : (isLoading ? 0.7 : 1),
  };

  // Show error state if image failed and no valid URL
  if (hasError && !imageUrl) {
    return (
      <div 
        className={`bg-red-100 border border-red-300 flex items-center justify-center text-red-600 text-sm ${className}`}
        style={style}
      >
        Failed to load image
      </div>
    );
  }

  // Don't render img element if no valid URL - this prevents empty src attribute
  if (!imageUrl) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse flex items-center justify-center text-gray-400 text-sm ${className}`}
        style={style}
      >
        Loading...
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={imageUrl}
      onLoad={handleImageLoad}
      onError={handleImageError}
      className={className}
      style={imageStyle}
      {...imgProps}
    />
  );
};

interface LazyImageProps extends SmartImageProps {
  threshold?: number;
  rootMargin?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  threshold = 0.1,
  rootMargin = '50px',
  ...props
}) => {
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const config = getConfig();
    if (!config.enableLazyLoad) {
      setIsInView(true);
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  if (!isInView) {
    return (
      <div
        ref={elementRef}
        className={`bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 text-sm ${props.className || ''}`}
        style={props.style}
      >
        {/* Placeholder while not in view */}
        <span>⏳</span>
      </div>
    );
  }

  return <SmartImage {...props} />;
};

interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt?: string;
    options?: LoadImageOptions;
  }>;
  preloadNext?: number;
  className?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  preloadNext = 2,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const preloadedRef = useRef(new Set<string>());

  useEffect(() => {
    // Preload upcoming images (avoid duplicate preloads)
    const startIndex = Math.max(0, currentIndex - 1);
    const endIndex = Math.min(images.length - 1, currentIndex + preloadNext);
    
    const urlsToPreload = images
      .slice(startIndex, endIndex + 1)
      .map(img => img.src)
      .filter(url => !preloadedRef.current.has(url));

    if (urlsToPreload.length > 0) {
      imageSystem.preloadImages(urlsToPreload, { priority: 'high' });
      urlsToPreload.forEach(url => preloadedRef.current.add(url));
    }
  }, [currentIndex, images, preloadNext]);

  return (
    <div className={`image-gallery ${className}`}>
      {images.map((image, index) => (
        <LazyImage
          key={`${image.src}-${index}`}
          src={image.src}
          alt={image.alt}
          options={image.options}
          className="gallery-image cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setCurrentIndex(index)}
        />
      ))}
    </div>
  );
};
