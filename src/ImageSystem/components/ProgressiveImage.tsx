// Progressive Image Component with Blur Effect
import React, { useState, useRef, useEffect } from 'react';
import { useImage } from '../hooks/useImage';

interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  blurDataURL?: string;
  placeholder?: string;
  alt: string;
  className?: string;
  quality?: number;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  blurDataURL,
  placeholder,
  alt,
  className = '',
  quality = 90,
  onLoad,
  onError,
  ...props
}) => {
  const [showBlur, setShowBlur] = useState(true);
  const { src: loadedSrc, isLoaded, error } = useImage(src, {
    strategy: 'eager',
    quality,
  });

  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isLoaded) {
      setShowBlur(false);
      onLoad?.();
    }
  }, [isLoaded, onLoad]);

  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  const baseStyles: React.CSSProperties = {
    transition: 'all 0.3s ease-in-out',
    display: 'block',
    width: '100%',
    height: 'auto',
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Blur placeholder */}
      {blurDataURL && showBlur && (
        <img
          src={blurDataURL}
          alt=""
          style={{
            ...baseStyles,
            position: 'absolute',
            top: 0,
            left: 0,
            filter: 'blur(10px)',
            transform: 'scale(1.1)',
            opacity: showBlur ? 1 : 0,
            zIndex: 1,
          }}
        />
      )}

      {/* Main image */}
      <img
        ref={imageRef}
        src={loadedSrc || placeholder}
        alt={alt}
        className={`${className} ${isLoaded ? 'loaded' : 'loading'}`}
        style={{
          ...baseStyles,
          opacity: isLoaded ? 1 : 0,
          zIndex: 2,
          position: 'relative',
        }}
        {...props}
      />
    </div>
  );
};