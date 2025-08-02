// Responsive image component with automatic srcset generation
import React from 'react';
import { AdvancedImage } from './AdvancedImage';
import type { AdvancedImageProps } from '../types/image';

interface ResponsiveImageProps extends Omit<AdvancedImageProps, 'src' | 'sizes'> {
  src: string;
  breakpoints?: number[];
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
}

export function ResponsiveImage({
  src,
  breakpoints = [320, 640, 768, 1024, 1280],
  quality = 85,
  format = 'webp',
  ...props
}: ResponsiveImageProps) {
  // Generate srcset for different breakpoints
  const generateSrcSet = (originalSrc: string) => {
    return breakpoints
      .map(width => {
        // You can integrate with image optimization services here
        // For now, we'll use the original src
        return `${originalSrc} ${width}w`;
      })
      .join(', ');
  };

  // Generate sizes attribute
  const generateSizes = () => {
    return breakpoints
      .map((width, index) => {
        if (index === breakpoints.length - 1) {
          return `${width}px`;
        }
        return `(max-width: ${width}px) ${width}px`;
      })
      .join(', ');
  };

  return (
    <AdvancedImage
      src={src}
      sizes={generateSizes()}
      {...props}
    />
  );
}