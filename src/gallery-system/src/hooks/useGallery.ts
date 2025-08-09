import { useState, useMemo, useEffect } from "react";
import { Photo } from "../types";
import { preloadImages, optimizeImageUrl } from "../utils";

export const useGallery = (
  photos: Photo[],
  defaultCategory: string = "الكل"
) => {
  const [selectedCategory, setSelectedCategory] =
    useState<string>(defaultCategory);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const filteredPhotos = useMemo(() => {
    if (selectedCategory === "الكل") {
      return photos;
    }
    return photos.filter((photo) => photo.category === selectedCategory);
  }, [photos, selectedCategory]);

  // تحميل مسبق للصور عند تغيير الفئة
  useEffect(() => {
    if (filteredPhotos.length > 0) {
      // تحميل أول 8 صور من الفئة الجديدة
      const priorityUrls = filteredPhotos
        .slice(0, 8)
        .map((photo) => optimizeImageUrl(photo.src, 400));
      preloadImages(priorityUrls);
    }
  }, [filteredPhotos]);
  const openPhoto = (photo: Photo) => {
    // تحميل مسبق للصور المجاورة عند فتح صورة
    const currentIndex = filteredPhotos.findIndex((p) => p.id === photo.id);
    const adjacentPhotos = [
      filteredPhotos[currentIndex - 1],
      filteredPhotos[currentIndex + 1],
    ].filter(Boolean);

    const adjacentUrls = adjacentPhotos.map((p) =>
      optimizeImageUrl(p.src, 1200)
    );
    preloadImages(adjacentUrls);

    setSelectedPhoto(photo);
  };

  const closePhoto = () => {
    setSelectedPhoto(null);
  };

  const nextPhoto = () => {
    if (!selectedPhoto) return;
    const currentIndex = filteredPhotos.findIndex(
      (p) => p.id === selectedPhoto.id
    );
    const nextIndex = (currentIndex + 1) % filteredPhotos.length;
    const nextPhoto = filteredPhotos[nextIndex];

    // تحميل مسبق للصورة التالية
    preloadImages([optimizeImageUrl(nextPhoto.src, 1200)]);

    setSelectedPhoto(nextPhoto);
  };

  const prevPhoto = () => {
    if (!selectedPhoto) return;
    const currentIndex = filteredPhotos.findIndex(
      (p) => p.id === selectedPhoto.id
    );
    const prevIndex =
      currentIndex === 0 ? filteredPhotos.length - 1 : currentIndex - 1;
    const prevPhoto = filteredPhotos[prevIndex];

    // تحميل مسبق للصورة السابقة
    preloadImages([optimizeImageUrl(prevPhoto.src, 1200)]);

    setSelectedPhoto(prevPhoto);
  };

  return {
    selectedCategory,
    setSelectedCategory,
    selectedPhoto,
    filteredPhotos,
    openPhoto,
    closePhoto,
    nextPhoto,
    prevPhoto,
    hasNext: selectedPhoto
      ? filteredPhotos.findIndex((p) => p.id === selectedPhoto.id) <
        filteredPhotos.length - 1
      : false,
    hasPrev: selectedPhoto
      ? filteredPhotos.findIndex((p) => p.id === selectedPhoto.id) > 0
      : false,
  };
};
