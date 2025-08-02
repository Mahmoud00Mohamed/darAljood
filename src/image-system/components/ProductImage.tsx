import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EnhancedImage from "./EnhancedImage";
import { ZoomIn } from "lucide-react";
import type { ProductImageProps } from "../types";

const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = "",
  showZoom = true,
  priority = false,
  aspectRatio = "square",
  width = 400,
  height = 400,
  sizes,
  quality = 75,
  enableBlurUp = true,
  threshold = 0.1,
  rootMargin = "100px",
  fallbackSrc,
  placeholderSize,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const aspectRatioClasses = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
    auto: "",
  };

  return (
    <>
      <div
        className={`relative overflow-hidden group ${aspectRatioClasses[aspectRatio]} ${className}`}
      >
        {/* Main Image */}
        <EnhancedImage
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          priority={priority}
          width={width}
          height={height}
          sizes={sizes}
          aspectRatio={aspectRatio}
          quality={quality}
          enableBlurUp={enableBlurUp}
          threshold={threshold}
          rootMargin={rootMargin}
          fallbackSrc={fallbackSrc}
          placeholderSize={placeholderSize || Math.min(width || 40, 40)}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Overlay Effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Zoom Button */}
        {showZoom && imageLoaded && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsZoomed(true)}
            className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:bg-white"
          >
            <ZoomIn size={16} className="text-gray-700" />
          </motion.button>
        )}
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <EnhancedImage
                src={src}
                alt={alt}
                className="w-full h-full object-contain rounded-lg shadow-2xl"
                priority={true}
                width={1200}
                height={1200}
                aspectRatio="auto"
                quality={100}
                enableBlurUp={false}
                showPlaceholder={true}
                placeholderSize={60}
              />

              {/* Close Button */}
              <button
                onClick={() => setIsZoomed(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductImage;