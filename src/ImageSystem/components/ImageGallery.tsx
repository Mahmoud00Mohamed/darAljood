// Smart Image Gallery Component
import React, { useState, useCallback, useMemo } from 'react';
import { SmartImage } from './SmartImage';
import { ImagePreloader } from './ImagePreloader';

interface GalleryImage {
  src: string;
  alt: string;
  thumbnail?: string;
  caption?: string;
  id: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  strategy?: 'eager' | 'lazy' | 'preload';
  thumbnailStrategy?: 'eager' | 'lazy';
  preloadAhead?: number;
  className?: string;
  onImageClick?: (image: GalleryImage, index: number) => void;
  showCaptions?: boolean;
  columns?: number;
  gap?: number;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  strategy = 'lazy',
  thumbnailStrategy = 'lazy',
  preloadAhead = 3,
  className = '',
  onImageClick,
  showCaptions = false,
  columns = 3,
  gap = 16,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Calculate which images to preload
  const preloadImages = useMemo(() => {
    const start = Math.max(0, currentIndex - preloadAhead);
    const end = Math.min(images.length, currentIndex + preloadAhead + 1);
    
    return images
      .slice(start, end)
      .map(img => img.src);
  }, [images, currentIndex, preloadAhead]);

  const handleImageClick = useCallback((image: GalleryImage, index: number) => {
    setCurrentIndex(index);
    onImageClick?.(image, index);
  }, [onImageClick]);

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap}px`,
    width: '100%',
  };

  const itemStyles: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '8px',
    cursor: onImageClick ? 'pointer' : 'default',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  };

  const imageStyles: React.CSSProperties = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  };

  const captionStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '8px 12px',
    fontSize: '0.875rem',
    opacity: 0,
    transition: 'opacity 0.2s ease',
  };

  return (
    <div className={className}>
      {/* Preload upcoming images */}
      <ImagePreloader images={preloadImages} priority="medium" />
      
      <div style={gridStyles}>
        {images.map((image, index) => (
          <div
            key={image.id}
            style={itemStyles}
            className="gallery-item"
            onClick={() => handleImageClick(image, index)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
              
              const caption = e.currentTarget.querySelector('.caption') as HTMLElement;
              if (caption) {
                caption.style.opacity = '1';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              
              const caption = e.currentTarget.querySelector('.caption') as HTMLElement;
              if (caption) {
                caption.style.opacity = '0';
              }
            }}
          >
            <SmartImage
              src={image.thumbnail || image.src}
              alt={image.alt}
              strategy={thumbnailStrategy}
              style={imageStyles}
              progressive={true}
            />
            
            {showCaptions && image.caption && (
              <div className="caption" style={captionStyles}>
                {image.caption}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};