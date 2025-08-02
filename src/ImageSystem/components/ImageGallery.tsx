// Example gallery component to demonstrate batch loading
import React, { useEffect } from 'react';
import { AdvancedImage } from './AdvancedImage';
import { ImagePreloader } from '../services/ImagePreloader';

interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    priority?: 'high' | 'medium' | 'low';
  }>;
  columns?: number;
  gap?: number;
}

export function ImageGallery({ 
  images, 
  columns = 3, 
  gap = 4 
}: ImageGalleryProps) {
  const preloader = ImagePreloader.getInstance();

  // Preload visible images with high priority
  useEffect(() => {
    const highPriorityImages = images
      .filter(img => img.priority === 'high')
      .map(img => img.src);
    
    if (highPriorityImages.length > 0) {
      preloader.preloadBatch(highPriorityImages, { priority: 'high' });
    }
  }, [images, preloader]);

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap * 0.25}rem`
  };

  return (
    <div style={gridStyle} className="w-full">
      {images.map((image, index) => (
        <div key={index} className="aspect-square">
          <AdvancedImage
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover rounded-lg"
            priority={image.priority || 'medium'}
            lazy={index > 6} // Load first 6 immediately
            blur={true}
          />
        </div>
      ))}
    </div>
  );
}