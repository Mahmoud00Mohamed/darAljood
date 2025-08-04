export interface Photo {
  id: string;
  src: string;
  title: string;
  category: string;
  description: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface GalleryProps {
  photos: Photo[];
  categories: string[];
  rtl?: boolean;
  className?: string;
  onPhotoClick?: (photo: Photo) => void;
  showCategories?: boolean;
  columnsConfig?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  defaultCategory?: string;
}

export interface PhotoModalProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
  rtl?: boolean;
}

export interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  rtl?: boolean;
  className?: string;
}

export interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
  columnsConfig?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  className?: string;
}
