import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn } from "lucide-react";
import { PhotoGridProps } from "../types";
import { optimizeImageUrl } from "../utils";

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  onPhotoClick,
  columnsConfig = { mobile: 1, tablet: 2, desktop: 4 },
  className = "",
}) => {
  const getGridClass = () => {
    return `grid grid-cols-${columnsConfig.mobile} sm:grid-cols-${columnsConfig.tablet} lg:grid-cols-${columnsConfig.desktop} xl:grid-cols-${columnsConfig.desktop} gap-6`;
  };

  return (
    <motion.div layout className={`${getGridClass()} ${className}`}>
      <AnimatePresence>
        {photos.map((photo) => (
          <motion.div
            key={photo.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => onPhotoClick(photo)}
          >
            <div className="aspect-square">
              <img
                src={optimizeImageUrl(photo.src, 400)}
                alt={photo.alt || photo.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
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
