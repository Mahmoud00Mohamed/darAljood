import React, { useState, useEffect, useRef, useCallback } from "react";
import { loadImage, preloadImage, getImageState } from "./index";
import { LoadImageOptions, ImageState } from "./types";

interface SuperCacheImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "onError"> {
  src: string;
  options?: LoadImageOptions;
  fadeInDuration?: number;
  fadeOutDuration?: number;
  showPlaceholder?: boolean;
  preloadOnHover?: boolean; // New: تحميل مسبق عند hover
  immediateLoad?: boolean; // New: تحميل فوري
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onError?: (error: Error) => void;
}

const SuperCacheImage: React.FC<SuperCacheImageProps> = ({
  src,
  options = {},
  fadeInDuration = 150,
  fadeOutDuration = 100,
  showPlaceholder = true,
  preloadOnHover = true,
  immediateLoad = false,
  onLoadStart,
  onLoadComplete,
  onError,
  style,
  className = "",
  alt = "",
  ...props
}) => {
  const [imageState, setImageState] = useState<ImageState | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasHovered, setHasHovered] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);

  const handleLoadStart = useCallback(() => {
    if (onLoadStart) onLoadStart();
  }, [onLoadStart]);

  const handleLoadComplete = useCallback(() => {
    if (onLoadComplete) onLoadComplete();
  }, [onLoadComplete]);

  const handleError = useCallback(
    (error: Error) => {
      if (onError) onError(error);
    },
    [onError]
  );

  // Intersection Observer for smart loading
  useEffect(() => {
    if (!containerRef.current || immediateLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Start preloading when image is near viewport
            preloadImage(src, { priority: "high" });
          }
        });
      },
      { rootMargin: "50px" } // Start loading 50px before entering viewport
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [src, immediateLoad]);

  // Mouse hover preloading
  const handleMouseEnter = useCallback(() => {
    if (preloadOnHover && !hasHovered) {
      setHasHovered(true);
      preloadImage(src, { priority: "immediate" });
    }
  }, [src, preloadOnHover, hasHovered]);

  useEffect(() => {
    // Check if image is already cached
    const cachedState = getImageState(src);
    if (cachedState && cachedState.loaded) {
      setImageState(cachedState);
      setIsVisible(true);
      return;
    }

    // Start loading immediately for high priority or immediate load
    if (
      immediateLoad ||
      options.priority === "immediate" ||
      options.priority === "high"
    ) {
      handleLoadStart();

      const loadImageAsync = async () => {
        try {
          const state = await loadImage(src, {
            ...options,
            priority: immediateLoad ? "immediate" : options.priority,
            placeholder: showPlaceholder,
            onError: (error) => {
              handleError(error);
              if (options.onError) options.onError(error);
            },
          });

          setImageState(state);

          if (state.loaded) {
            // Faster fade in for cached images
            const delay = state.url?.startsWith("data:") ? 20 : 50;
            setTimeout(() => {
              setIsVisible(true);
              handleLoadComplete();
            }, delay);
          }
        } catch (error) {
          handleError(error as Error);
        }
      };

      loadImageAsync();
    }
  }, [
    src,
    options,
    showPlaceholder,
    immediateLoad,
    handleLoadStart,
    handleLoadComplete,
    handleError,
  ]);

  const containerStyle: React.CSSProperties = {
    position: "relative",
    overflow: "hidden",
    ...style,
  };

  const imageStyle: React.CSSProperties = {
    transition: `opacity ${fadeInDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`, // Better easing
    opacity: isVisible && imageState?.loaded ? 1 : 0,
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    willChange: "opacity", // GPU acceleration
  };

  const placeholderStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)",
    transition: `opacity ${fadeOutDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    opacity: (!imageState?.loaded || !isVisible) && showPlaceholder ? 1 : 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500",
  };

  const progressStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: "2px",
    backgroundColor: "#3b82f6",
    width: `${imageState?.progress || 0}%`,
    transition: "width 0.3s ease",
    opacity: imageState?.loading ? 1 : 0,
  };

  return (
    <div
      ref={containerRef}
      className={`${className}`}
      style={containerStyle}
      onMouseEnter={handleMouseEnter}
    >
      {/* Placeholder */}
      {showPlaceholder && (
        <div ref={placeholderRef} style={placeholderStyle}>
          {imageState?.loading && "Loading..."}
          {imageState?.error && "Failed to load"}
          {!imageState && "Image"}

          {/* Progress bar */}
          {imageState?.loading && <div style={progressStyle} />}
        </div>
      )}

      {/* Actual Image */}
      {imageState?.url && (
        <img
          ref={imgRef}
          src={imageState.url}
          alt={alt}
          style={imageStyle}
          loading="eager" // Disable browser lazy loading for better control
          {...props}
        />
      )}
    </div>
  );
};

// Default export for React Fast Refresh compatibility
export default SuperCacheImage;

// Named export
export { SuperCacheImage };
