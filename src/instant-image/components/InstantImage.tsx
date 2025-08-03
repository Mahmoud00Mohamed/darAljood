import React, { useRef, useEffect, useState } from "react";
import { useInstantImage } from "../hooks/useInstantImage";
import type { PartialInstantImageConfig } from "../types/config";

interface InstantImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "onError"> {
  src: string;
  config?: PartialInstantImageConfig;
  enablePreload?: boolean;
  showPlaceholder?: boolean;
  placeholderClassName?: string;
  containerClassName?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export function InstantImage({
  src,
  config,
  enablePreload = true,
  showPlaceholder = true,
  placeholderClassName = "",
  containerClassName = "",
  onLoad,
  onError,
  className = "",
  style = {},
  width,
  height,
  alt = "",
  ...imgProps
}: InstantImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showImage, setShowImage] = useState(false);

  const { imageSrc, isLoading, isLoaded, error } = useInstantImage({
    src,
    config,
    preload: enablePreload,
    width: typeof width === "string" ? parseInt(width) : width,
    height: typeof height === "string" ? parseInt(height) : height,
  });

  // Handle image load success
  useEffect(() => {
    if (isLoaded && imageSrc) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setShowImage(true);
        onLoad?.();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, imageSrc, onLoad]);

  // Handle errors
  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (!imgRef.current || !config?.enableLazyLoading) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [config?.enableLazyLoading]);

  const shouldShowPlaceholder = showPlaceholder && (!showImage || isLoading);
  const transitionConfig = config?.transition;

  return (
    <div
      className={`relative overflow-hidden ${containerClassName}`}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {shouldShowPlaceholder && (
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${placeholderClassName}`}
          style={{
            backgroundColor: transitionConfig?.placeholderColor || "#f3f4f6",
            opacity: showImage ? 0 : 1,
            filter: transitionConfig?.showShimmer ? "blur(2px)" : "none",
          }}
        >
          {transitionConfig?.showShimmer && (
            <div className="animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full" />
          )}
        </div>
      )}

      {/* Actual Image */}
      {(isVisible || !config?.enableLazyLoading) && imageSrc && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          className={`transition-all duration-300 ${className}`}
          style={{
            ...style,
            opacity: showImage ? 1 : 0,
            transform: showImage ? "scale(1)" : "scale(1.02)",
            filter: showImage ? "blur(0)" : "blur(4px)",
          }}
          loading="eager"
          {...imgProps}
        />
      )}

      {/* Error state */}
      {error && !imageSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
          {config?.fallbackImage
            ? "Loading fallback..."
            : "Failed to load image"}
        </div>
      )}
    </div>
  );
}
