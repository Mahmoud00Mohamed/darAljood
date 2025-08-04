import React from "react";
import { motion } from "framer-motion";
import { ImageOff } from "lucide-react";
import { Photo } from "../types";
import { optimizeImageUrl } from "../utils";
import { useImageLoader } from "../hooks/useImageLoader";

interface PhotoItemProps {
  photo: Photo;
  onClick: () => void;
}

export const PhotoItem: React.FC<PhotoItemProps> = React.memo(
  ({ photo, onClick }) => {
    const placeholderSrc = optimizeImageUrl(photo.src, {
      width: 50,
      quality: 20,
      blur: 10,
    });
    const fullSrc = optimizeImageUrl(photo.src, {
      width: 800,
      quality: 80,
      format: "webp",
    });

    const { status, currentSrc, isLoaded } = useImageLoader(
      fullSrc,
      placeholderSrc
    );

    return (
      <motion.div
        layoutId={`photo-${photo.id}`}
        onClick={onClick}
        className="relative cursor-pointer break-inside-avoid"
        style={{
          aspectRatio: `${photo.width} / ${photo.height}`,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
          {status === "error" ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <ImageOff className="h-12 w-12" />
              <span className="mt-2 text-sm">فشل تحميل الصورة</span>
            </div>
          ) : (
            <motion.img
              key={currentSrc}
              src={currentSrc}
              alt={photo.alt || photo.title}
              className="w-full h-full object-cover"
              initial={{
                filter: isLoaded ? "blur(10px)" : "blur(0px)",
                scale: 1.1,
              }}
              animate={{
                filter: isLoaded ? "blur(0px)" : "blur(10px)",
                scale: 1,
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          )}
        </div>
      </motion.div>
    );
  }
);
