import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Maximize,
  Minimize,
} from "lucide-react";
import { PhotoModalProps, Photo } from "../types";
import { optimizeImageUrl } from "../utils";
import { useFullscreen } from "../hooks/useFullscreen";

export const PhotoModal: React.FC<
  PhotoModalProps & {
    onNext?: () => void;
    onPrev?: () => void;
    hasNext?: boolean;
    hasPrev?: boolean;
  }
> = React.memo(
  ({
    photo,
    isOpen,
    onClose,
    onNext,
    onPrev,
    hasNext = false,
    hasPrev = false,
    rtl = true,
  }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const { isFullscreen, toggleFullscreen } = useFullscreen(modalRef);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
          case "Escape":
            if (isFullscreen) toggleFullscreen();
            else onClose();
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
    }, [
      isOpen,
      hasNext,
      hasPrev,
      onNext,
      onPrev,
      onClose,
      rtl,
      isFullscreen,
      toggleFullscreen,
    ]);

    const handleShare = async (photo: Photo) => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: photo.title,
            text: photo.description,
            url: window.location.href,
          });
        } catch (error) {
          console.error("Error sharing:", error);
        }
      } else {
        alert("المشاركة غير مدعومة على هذا المتصفح.");
      }
    };

    return (
      <AnimatePresence>
        {isOpen && photo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              ref={modalRef}
              className="relative w-full h-full flex items-center justify-center"
            >
              <motion.div
                layoutId={`photo-${photo.id}`}
                className="relative w-auto h-auto max-w-[90vw] max-h-[85vh] bg-white shadow-2xl rounded-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                style={{ direction: rtl ? "rtl" : "ltr" }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              >
                <img
                  src={optimizeImageUrl(photo.src, {
                    width: 1920,
                    quality: 90,
                    format: "webp",
                  })}
                  alt={photo.alt || photo.title}
                  className="block w-full h-full object-contain"
                />
              </motion.div>

              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white p-4 rounded-xl w-full max-w-4xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold">{photo.title}</h2>
                <p className="text-white/80 mt-1">{photo.description}</p>
              </div>

              <div
                className={`absolute top-4 flex gap-3 ${
                  rtl ? "left-4" : "right-4"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleShare(photo)}
                  className="bg-black/50 p-3 rounded-full hover:bg-black/70 transition-colors"
                  aria-label="مشاركة"
                >
                  <Share2 size={20} />
                </button>
                <a
                  href={optimizeImageUrl(photo.src, {})}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black/50 p-3 rounded-full hover:bg-black/70 transition-colors"
                  aria-label="تنزيل"
                >
                  <Download size={20} />
                </a>
                <button
                  onClick={toggleFullscreen}
                  className="bg-black/50 p-3 rounded-full hover:bg-black/70 transition-colors"
                  aria-label="ملء الشاشة"
                >
                  {isFullscreen ? (
                    <Minimize size={20} />
                  ) : (
                    <Maximize size={20} />
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="bg-black/50 p-3 rounded-full hover:bg-black/70 transition-colors"
                  aria-label="إغلاق"
                >
                  <X size={20} />
                </button>
              </div>

              {hasPrev && onPrev && (
                <button
                  onClick={onPrev}
                  className={`absolute top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors ${
                    rtl ? "right-4" : "left-4"
                  }`}
                  aria-label="السابق"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              {hasNext && onNext && (
                <button
                  onClick={onNext}
                  className={`absolute top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors ${
                    rtl ? "left-4" : "right-4"
                  }`}
                  aria-label="التالي"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
