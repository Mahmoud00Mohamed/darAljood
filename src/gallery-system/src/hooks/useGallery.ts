import { useState, useMemo, useEffect } from "react";
import { Photo } from "../types";
import {
  preloadImages,
  preloadImagesImmediate,
  optimizeImageUrlForSpeed,
  preloadImage,
} from "../utils";

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

  // تحميل فوري للصور المرئية عند تغيير الفئة
  useEffect(() => {
    if (filteredPhotos.length > 0) {
      // تحميل فوري للصور المرئية أولاً
      const priorityUrls = filteredPhotos
        .slice(0, 6)
        .map((photo) => optimizeImageUrlForSpeed(photo.src, 300, 60));
      preloadImagesImmediate(priorityUrls);

      // تحميل باقي الصور في الخلفية
      setTimeout(() => {
        const remainingUrls = filteredPhotos
          .slice(6, 12)
          .map((photo) => optimizeImageUrlForSpeed(photo.src, 300, 65));
        preloadImages(remainingUrls, false);
      }, 300);
    }
  }, [filteredPhotos]);

  const openPhoto = (photo: Photo) => {
    // تحميل فوري للصور المجاورة عند فتح صورة
    const currentIndex = filteredPhotos.findIndex((p) => p.id === photo.id);
    const adjacentPhotos = [
      filteredPhotos[currentIndex - 1],
      filteredPhotos[currentIndex + 1],
    ].filter(Boolean);

    // تحميل فوري للصور المجاورة بدقة متوسطة
    const adjacentUrls = adjacentPhotos.map((p) =>
      optimizeImageUrlForSpeed(p.src, 800, 75)
    );
    preloadImagesImmediate(adjacentUrls);

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

    // تحميل فوري للصورة التالية
    preloadImage(optimizeImageUrlForSpeed(nextPhoto.src, 800, 75), true);

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

    // تحميل فوري للصورة السابقة
    preloadImage(optimizeImageUrlForSpeed(prevPhoto.src, 800, 75), true);

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
