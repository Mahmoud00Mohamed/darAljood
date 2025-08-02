import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LogoPlaceholder from "./LogoPlaceholder";
import { imageCache } from "../core/ImageCache";
import { generateOptimizedUrl } from "../utils/imageOptimizer";
import type { EnhancedImageProps } from "../types";

const EnhancedImage: React.FC<EnhancedImageProps> = ({
  src,
  alt,
  className = "",
  width,
  height,
  priority = false,
  quality = 85,
  sizes,
  aspectRatio = "auto",
  onLoad,
  onError,
  enableBlurUp = true,
  showPlaceholder = true,
  placeholderSize = 40,
  fallbackSrc,
  threshold = 0.1,
  rootMargin = "100px",
}) => {
  const [imageState, setImageState] = useState<"loading" | "loaded" | "error">(
    "loading"
  );
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isInView, setIsInView] = useState(priority);
  const [lowQualityLoaded, setLowQualityLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const aspectRatioClasses = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
    auto: "",
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView) {
          setIsInView(true);
        }
      },
      { threshold, rootMargin }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority, threshold, rootMargin, isInView]);

  // Progressive loading effect
  useEffect(() => {
    if (!isInView || !src) return;

    const loadImage = async () => {
      try {
        // تحميل نسخة منخفضة الجودة أولاً للتأثير الضبابي
        if (enableBlurUp) {
          const lowQualitySrc = generateOptimizedUrl(src, {
            quality: 20,
            width: Math.min(width || 100, 100),
          });
          const lowQualityImg = new Image();

          lowQualityImg.onload = () => {
            setLowQualityLoaded(true);
            setImageSrc(lowQualitySrc);
          };

          lowQualityImg.src = lowQualitySrc;
        }

        // تحميل النسخة عالية الجودة
        const highQualitySrc = generateOptimizedUrl(src, { quality, width });

        // محاولة الحصول من التخزين المؤقت أولاً
        const cachedSrc = await imageCache.getImage(highQualitySrc);

        const highQualityImg = new Image();

        highQualityImg.onload = () => {
          setImageSrc(cachedSrc);
          setImageState("loaded");
          onLoad?.();
        };

        highQualityImg.onerror = () => {
          if (fallbackSrc) {
            const fallbackImg = new Image();
            fallbackImg.onload = () => {
              setImageSrc(fallbackSrc);
              setImageState("loaded");
            };
            fallbackImg.onerror = () => {
              setImageState("error");
              onError?.();
            };
            fallbackImg.src = fallbackSrc;
          } else {
            setImageState("error");
            onError?.();
          }
        };

        highQualityImg.src = cachedSrc;
      } catch (error) {
        console.warn("Image loading failed:", error);
        setImageState("error");
        onError?.();
      }
    };

    loadImage();
  }, [
    isInView,
    src,
    quality,
    width,
    enableBlurUp,
    fallbackSrc,
    onLoad,
    onError,
  ]);

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${aspectRatioClasses[aspectRatio]} ${className}`}
    >
      {/* Placeholder */}
      <AnimatePresence>
        {imageState === "loading" && showPlaceholder && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"
          >
            <LogoPlaceholder
              size={placeholderSize}
              animate={true}
              className="opacity-60"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Low Quality Image (Blur-up) */}
      <AnimatePresence>
        {lowQualityLoaded && imageState === "loading" && enableBlurUp && (
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            src={imageSrc}
            alt=""
            className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-105"
            loading="eager"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* High Quality Image */}
      <AnimatePresence>
        {imageState === "loaded" && (
          <motion.img
            initial={{ opacity: 0, scale: enableBlurUp ? 1.05 : 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            src={imageSrc}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            className="absolute inset-0 w-full h-full object-cover"
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />
        )}
      </AnimatePresence>

      {/* Error State */}
      {imageState === "error" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500"
        >
          <LogoPlaceholder
            size={Math.min(placeholderSize, 32)}
            animate={false}
            className="opacity-40 mb-2"
          />
          <span className="text-xs font-medium opacity-60">
            {alt || "Image unavailable"}
          </span>
        </motion.div>
      )}

      {/* Loading Progress Indicator */}
      {imageState === "loading" && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: "0%" }}
            animate={{ width: lowQualityLoaded ? "70%" : "100%" }}
            transition={{
              duration: lowQualityLoaded ? 1 : 2,
              ease: "easeOut",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EnhancedImage;