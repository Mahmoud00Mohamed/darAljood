import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { PhotoModalProps } from "../types";
import {
  optimizeImageUrl,
  optimizeImageUrlForSpeed,
  preloadImage,
} from "../utils";

export const PhotoModal: React.FC<
  PhotoModalProps & {
    onNext?: () => void;
    onPrev?: () => void;
    hasNext?: boolean;
    hasPrev?: boolean;
  }
> = ({
  photo,
  isOpen,
  onClose,
  onNext,
  onPrev,
  hasNext = false,
  hasPrev = false,
  rtl = true,
}) => {
  // تحميل فوري للصورة الحالية
  useEffect(() => {
    if (photo && isOpen) {
      // تحميل فوري للصورة الحالية بدقة متوسطة أولاً
      preloadImage(optimizeImageUrlForSpeed(photo.src, 800, 75), true);

      // تحميل الصورة بدقة عالية في الخلفية
      setTimeout(() => {
        preloadImage(optimizeImageUrl(photo.src, 1200), false);
      }, 500);
    }
  }, [photo, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          if (rtl && hasNext && onNext) onNext();
          else if (!rtl && hasPrev && onPrev) onPrev();
          break;
        case "ArrowRight":
          if (rtl && hasPrev && onPrev) onPrev();
          else if (!rtl && hasNext && onNext) onNext();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasNext, hasPrev, onNext, onPrev, onClose, rtl]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!photo) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-4xl w-full bg-white rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ direction: rtl ? "rtl" : "ltr" }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className={`absolute top-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors ${
                rtl ? "right-4" : "left-4"
              }`}
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation Buttons */}
            {hasPrev && onPrev && (
              <button
                onClick={onPrev}
                className={`absolute top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors ${
                  rtl ? "right-4" : "left-4"
                }`}
              >
                {rtl ? (
                  <ChevronRight className="h-6 w-6" />
                ) : (
                  <ChevronLeft className="h-6 w-6" />
                )}
              </button>
            )}

            {hasNext && onNext && (
              <button
                onClick={onNext}
                className={`absolute top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors ${
                  rtl ? "left-4" : "right-4"
                }`}
              >
                {rtl ? (
                  <ChevronLeft className="h-6 w-6" />
                ) : (
                  <ChevronRight className="h-6 w-6" />
                )}
              </button>
            )}

            <img
              src={optimizeImageUrlForSpeed(photo.src, 800, 75)}
              alt={photo.alt || photo.title}
              className="w-full h-96 object-cover"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />

            <div className="p-6">
              <div
                className={`flex items-center justify-between mb-4 ${
                  rtl ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <h2 className="text-2xl font-bold text-gray-800">
                  {photo.title}
                </h2>
                <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-sm font-medium">
                  {photo.category}
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed text-right">
                {photo.description}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
