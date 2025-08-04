import React from "react";
import { AnimatePresence } from "framer-motion";
import { PhotoGridProps } from "../types";
import { PhotoItem } from "./PhotoItem";

export const PhotoGrid: React.FC<PhotoGridProps> = React.memo(
  ({ photos, onPhotoClick, className = "" }) => {
    return (
      <div
        className={`columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 ${className}`}
      >
        <AnimatePresence>
          {photos.map((photo) => (
            <div key={photo.id} className="mb-6">
              <PhotoItem photo={photo} onClick={() => onPhotoClick(photo)} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    );
  }
);
