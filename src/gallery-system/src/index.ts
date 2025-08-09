// Components
export { Gallery } from "./components/Gallery";
export { CategoryFilter } from "./components/CategoryFilter";
export { PhotoGrid } from "./components/PhotoGrid";
export { PhotoModal } from "./components/PhotoModal";
export { OptimizedImage } from "./components/OptimizedImage";
export { GalleryLoadingIndicator } from "./components/GalleryLoadingIndicator";

// Hooks
export { useGallery } from "./hooks/useGallery";
export { useImagePreloader } from "./hooks/useImagePreloader";

// Types
export type {
  Photo,
  GalleryProps,
  PhotoModalProps,
  CategoryFilterProps,
  PhotoGridProps,
} from "./types";

// Utils
export {
  getGridColumns,
  generatePhotoId,
  optimizeImageUrl,
  validatePhoto,
} from "./utils";
export { imageCache } from "./utils/imageCache";
