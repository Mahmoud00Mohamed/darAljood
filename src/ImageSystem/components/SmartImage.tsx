// Smart Image Component with All Features
import React, { forwardRef, useState, useEffect } from 'react';
import { useImage } from '../hooks/useImage';
import { useLazyImage } from '../hooks/useLazyImage';
import { ImageLoadOptions } from '../types';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  strategy?: 'eager' | 'lazy' | 'preload';
  placeholder?: string;
  fallback?: string;
  progressive?: boolean;
  quality?: number;
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onLoadError?: (error: string) => void;
  onLoadProgress?: (progress: number) => void;
  rootMargin?: string;
  threshold?: number;
  showProgress?: boolean;
  blurDataURL?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const SmartImage = forwardRef<HTMLImageElement, SmartImageProps>(({
  src,
  alt,
  strategy = 'lazy',
  placeholder,
  fallback,
  progressive = true,
  quality = 90,
  onLoadStart,
  onLoadComplete,
  onLoadError,
  onLoadProgress,
  rootMargin = '100px',
  threshold = 0.1,
  showProgress = false,
  blurDataURL,
  className = '',
  style = {},
  ...props
}, ref) => {
  const [currentSrc, setCurrentSrc] = useState<string>(placeholder || blurDataURL || '');
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  // Choose the appropriate hook based on strategy
  const isLazy = strategy === 'lazy';
  
  const imageOptions: ImageLoadOptions = {
    strategy,
    progressive,
    quality,
    placeholder,
    fallback,
  };

  const lazyResult = useLazyImage(
    isLazy ? src : undefined,
    {
      ...imageOptions,
      rootMargin,
      threshold,
    }
  );

  const eagerResult = useImage(
    !isLazy ? src : undefined,
    imageOptions
  );

  // Use the appropriate result
  const result = isLazy ? lazyResult : eagerResult;
  const setElementRef = isLazy ? lazyResult.setElementRef : undefined;

  // Handle load states
  useEffect(() => {
    if (result.isLoading && onLoadStart) {
      onLoadStart();
    }
  }, [result.isLoading, onLoadStart]);

  useEffect(() => {
    if (result.isLoaded && onLoadComplete) {
      onLoadComplete();
    }
  }, [result.isLoaded, onLoadComplete]);

  useEffect(() => {
    if (result.error && onLoadError) {
      onLoadError(result.error);
    }
  }, [result.error, onLoadError]);

  useEffect(() => {
    if (onLoadProgress) {
      onLoadProgress(result.progress);
    }
  }, [result.progress, onLoadProgress]);

  // Update current src
  useEffect(() => {
    if (result.isLoaded && result.src) {
      setCurrentSrc(result.src);
      setShowPlaceholder(false);
    } else if (result.error && fallback) {
      setCurrentSrc(fallback);
      setShowPlaceholder(false);
    }
  }, [result.isLoaded, result.src, result.error, fallback]);

  // Combined styles
  const combinedStyles: React.CSSProperties = {
    ...style,
    transition: progressive ? 'opacity 0.3s ease-in-out, filter 0.3s ease-in-out' : undefined,
    filter: showPlaceholder && blurDataURL ? 'blur(10px)' : undefined,
    opacity: result.isLoaded ? 1 : (showPlaceholder ? 0.8 : 0),
  };

  const combinedClassName = `
    ${className}
    ${result.isLoading ? 'loading' : ''}
    ${result.isLoaded ? 'loaded' : ''}
    ${result.error ? 'error' : ''}
  `.trim();

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }}
      ref={setElementRef as React.RefCallback<HTMLDivElement>}
    >
      <img
        ref={ref}
        src={currentSrc}
        alt={alt}
        className={combinedClassName}
        style={combinedStyles}
        loading={strategy === 'eager' ? 'eager' : 'lazy'}
        {...props}
      />
      
      {/* Progress indicator */}
      {showProgress && result.isLoading && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            backgroundColor: '#3b82f6',
            width: `${result.progress}%`,
            transition: 'width 0.3s ease',
            borderRadius: '1.5px',
          }}
        />
      )}

      {/* Error state */}
      {result.error && !fallback && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#ef4444',
            fontSize: '0.875rem',
            textAlign: 'center',
            padding: '0.5rem',
          }}
        >
          Failed to load image
        </div>
      )}
    </div>
  );
});

SmartImage.displayName = 'SmartImage';