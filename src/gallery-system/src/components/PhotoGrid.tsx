import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn } from "lucide-react";
import { PhotoGridProps } from "../types";
import {
  optimizeImageUrlForSpeed,
  preloadImage,
  preloadImagesImmediate,
} from "../utils";

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  onPhotoClick,
  columnsConfig = { mobile: 1, tablet: 2, desktop: 4 },
  className = "",
}) => {
  // تحميل فوري للصور المرئية عند تحميل المكون
  React.useEffect(() => {
    const preloadImages = async () => {
      // تحميل فوري للصور المرئية أولاً (أول 6 صور)
      const priorityImages = photos.slice(0, 6);
      const priorityUrls = priorityImages.map((photo) =>
        optimizeImageUrlForSpeed(photo.src, 300, 60)
      );

      // تحميل فوري للصور ذات الأولوية
      await preloadImagesImmediate(priorityUrls);

      // تحميل باقي الصور في الخلفية بشكل تدريجي
      if (photos.length > 6) {
        setTimeout(() => {
          const remainingImages = photos.slice(6, 12);
          remainingImages.forEach((photo, index) => {
            setTimeout(() => {
              preloadImage(optimizeImageUrlForSpeed(photo.src, 300, 65), false);
            }, index * 100);
          });
        }, 500);

        // تحميل باقي الصور بعد ذلك
        setTimeout(() => {
          const laterImages = photos.slice(12);
          laterImages.forEach((photo, index) => {
            setTimeout(() => {
              preloadImage(optimizeImageUrlForSpeed(photo.src, 300, 65), false);
            }, index * 200);
          });
        }, 2000);
      }
    };

    preloadImages();
  }, [photos]);

  const getGridClass = () => {
    return `grid grid-cols-${columnsConfig.mobile} sm:grid-cols-${columnsConfig.tablet} lg:grid-cols-${columnsConfig.desktop} xl:grid-cols-${columnsConfig.desktop} gap-6`;
  };

  return (
    <motion.div layout className={`${getGridClass()} ${className}`}>
      <AnimatePresence>
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, delay: index < 6 ? 0 : index * 0.05 }}
            className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => onPhotoClick(photo)}
          >
            <div className="aspect-square">
              <img
                src={
                  index < 8
                    ? optimizeImageUrlForSpeed(photo.src, 300, 60)
                    : optimizeImageUrlForSpeed(photo.src, 300, 65)
                }
                alt={photo.alt || photo.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading={index < 6 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={index < 6 ? "high" : "auto"}
                style={{
                  contentVisibility: "auto",
                  containIntrinsicSize: "300px 300px",
                }}
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold mb-1 text-right">
                  {photo.title}
                </h3>
                <p className="text-white/80 text-sm text-right">
                  {photo.category}
                </p>
              </div>

              <div className="absolute top-4 right-4">
                <ZoomIn className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};
