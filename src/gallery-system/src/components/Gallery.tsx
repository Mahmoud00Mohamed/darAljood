import React from "react";
import { motion } from "framer-motion";
import { GalleryProps } from "../types";
import { useGallery } from "../hooks/useGallery";
import { CategoryFilter } from "./CategoryFilter";
import { PhotoGrid } from "./PhotoGrid";
import { PhotoModal } from "./PhotoModal";
import { preloadImages, optimizeImageUrl } from "../utils";

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

  // تحميل مسبق شامل للصور عند تحميل المعرض
  React.useEffect(() => {
    const initializeGallery = async () => {
      // تحميل جميع الصور بدقة منخفضة أولاً للمعاينة السريعة
      const thumbnailUrls = photos.map((photo) =>
        optimizeImageUrl(photo.src, 200)
      );

      // تحميل الصور المصغرة فوراً
      preloadImages(thumbnailUrls);

      // تحميل الصور بدقة متوسطة في الخلفية
      setTimeout(() => {
        const mediumUrls = photos.map((photo) =>
          optimizeImageUrl(photo.src, 400)
        );
        preloadImages(mediumUrls);
      }, 100);

      // تحميل الصور عالية الدقة للنافذة المنبثقة
      setTimeout(() => {
        const highResUrls = photos
          .slice(0, 10)
          .map((photo) => optimizeImageUrl(photo.src, 1200));
        preloadImages(highResUrls);
      }, 500);
    };

    initializeGallery();
  }, [photos]);

  // تحميل مسبق للصور عند تغيير الفئة
  React.useEffect(() => {
    if (filteredPhotos.length > 0) {
      const visibleUrls = filteredPhotos
        .slice(0, 12)
        .map((photo) => optimizeImageUrl(photo.src, 400));
      preloadImages(visibleUrls);
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
