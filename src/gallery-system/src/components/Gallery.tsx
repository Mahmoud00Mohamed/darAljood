import React from "react";
import { motion } from "framer-motion";
import { GalleryProps } from "../types";
import { useGallery } from "../hooks/useGallery";
import { CategoryFilter } from "./CategoryFilter";
import { PhotoGrid } from "./PhotoGrid";
import { PhotoModal } from "./PhotoModal";
import {
  preloadImages,
  preloadImagesImmediate,
  optimizeImageUrl,
  optimizeImageUrlForSpeed,
} from "../utils";

export const Gallery: React.FC<GalleryProps> = ({
  photos,
  categories,
  rtl = true,
  className = "",
  onPhotoClick,
  showCategories = true,
  columnsConfig,
  defaultCategory = "الكل",
}) => {
  const {
    selectedCategory,
    setSelectedCategory,
    selectedPhoto,
    filteredPhotos,
    openPhoto,
    closePhoto,
    nextPhoto,
    prevPhoto,
    hasNext,
    hasPrev,
  } = useGallery(photos, defaultCategory);

  // تحميل فوري للصور المرئية أولاً ثم باقي الصور
  React.useEffect(() => {
    const initializeGallery = async () => {
      // تحميل فوري للصور الأولى (أول 8 صور) بدقة منخفضة للسرعة القصوى
      const priorityPhotos = photos.slice(0, 8);
      const priorityUrls = priorityPhotos.map((photo) =>
        optimizeImageUrlForSpeed(photo.src, 200, 60)
      );

      // تحميل فوري للصور ذات الأولوية
      await preloadImagesImmediate(priorityUrls);

      // تحميل باقي الصور بدقة منخفضة في الخلفية
      setTimeout(() => {
        const remainingPhotos = photos.slice(8);
        const remainingUrls = remainingPhotos.map((photo) =>
          optimizeImageUrlForSpeed(photo.src, 300, 65)
        );
        preloadImages(remainingUrls, false);
      }, 200);

      // تحميل الصور بدقة أفضل للنافذة المنبثقة في الخلفية
      setTimeout(() => {
        const highResUrls = photos
          .slice(0, 6)
          .map((photo) => optimizeImageUrl(photo.src, 1200));
        preloadImages(highResUrls, false);
      }, 1000);
    };

    initializeGallery();
  }, [photos]);

  // تحميل فوري للصور المرئية عند تغيير الفئة
  React.useEffect(() => {
    if (filteredPhotos.length > 0) {
      // تحميل فوري للصور المرئية أولاً
      const visibleUrls = filteredPhotos
        .slice(0, 8)
        .map((photo) => optimizeImageUrlForSpeed(photo.src, 300, 65));
      preloadImagesImmediate(visibleUrls);

      // تحميل باقي الصور في الخلفية
      setTimeout(() => {
        const remainingUrls = filteredPhotos
          .slice(8, 20)
          .map((photo) => optimizeImageUrlForSpeed(photo.src, 300, 65));
        preloadImages(remainingUrls, false);
      }, 300);
    }
  }, [filteredPhotos]);

  const handlePhotoClick = (photo: (typeof photos)[0]) => {
    openPhoto(photo);
    onPhotoClick?.(photo);
  };

  return (
    <div
      className={`w-full ${className}`}
      style={{ direction: rtl ? "rtl" : "ltr" }}
    >
      {/* Category Filter */}
      {showCategories && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            rtl={rtl}
          />
        </motion.div>
      )}

      {/* Photos Grid */}
      <PhotoGrid
        photos={filteredPhotos}
        onPhotoClick={handlePhotoClick}
        columnsConfig={columnsConfig}
      />

      {/* Photo Modal */}
      <PhotoModal
        photo={selectedPhoto}
        isOpen={!!selectedPhoto}
        onClose={closePhoto}
        onNext={hasNext ? nextPhoto : undefined}
        onPrev={hasPrev ? prevPhoto : undefined}
        hasNext={hasNext}
        hasPrev={hasPrev}
        rtl={rtl}
      />
    </div>
  );
};
