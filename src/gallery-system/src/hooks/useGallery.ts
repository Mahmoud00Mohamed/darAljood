import { useState, useMemo } from "react";
import { Photo } from "../types";

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

  const openPhoto = (photo: Photo) => {
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
    setSelectedPhoto(filteredPhotos[nextIndex]);
  };

  const prevPhoto = () => {
    if (!selectedPhoto) return;
    const currentIndex = filteredPhotos.findIndex(
      (p) => p.id === selectedPhoto.id
    );
    const prevIndex =
      currentIndex === 0 ? filteredPhotos.length - 1 : currentIndex - 1;
    setSelectedPhoto(filteredPhotos[prevIndex]);
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
