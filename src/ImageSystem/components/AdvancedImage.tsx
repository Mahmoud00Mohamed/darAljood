// Advanced Image component with all features integrated
import React, { forwardRef, useEffect, useState } from 'react';
import { useAdvancedImage } from '../hooks/useAdvancedImage';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import type { AdvancedImageProps } from '../types/image';

export const AdvancedImage = forwardRef<HTMLImageElement, AdvancedImageProps>(
  ({
    src,
    alt,
    className = '',
    placeholder,
    fallback,
    priority = 'medium',
    lazy = true,
    blur = true,
    onLoad,
    onError,
    sizes,
    quality = 85,
    ...props
  }, ref) => {
    const [shouldLoad, setShouldLoad] = useState(!lazy || priority === 'high');
    const { elementRef, isIntersecting, hasIntersected } = useIntersectionObserver({
      threshold: 0.1,
      rootMargin: '100px',
      triggerOnce: true
    });

    const {
      src: imageSrc,
      blurSrc,
      isLoading,
      isLoaded,
      hasError,
      error,
      retry
    } = useAdvancedImage(src, {
      preload: shouldLoad,
      priority,
      fallback,
      blur
    });

    // Trigger loading when element comes into view
    useEffect(() => {
      if (lazy && (isIntersecting || hasIntersected) && !shouldLoad) {
        setShouldLoad(true);
      }
    }, [lazy, isIntersecting, hasIntersected, shouldLoad]);

    // Handle load event
    useEffect(() => {
      if (isLoaded && onLoad) {
        onLoad();
      }
    }, [isLoaded, onLoad]);

    // Handle error event
    useEffect(() => {
      if (hasError && onError && error) {
        onError(error);
      }
    }, [hasError, onError, error]);

    const baseClasses = `
      transition-all duration-300 ease-in-out
      ${isLoaded ? 'opacity-100' : 'opacity-0'}
      ${className}
    `;

    const containerClasses = `
      relative overflow-hidden
      ${!isLoaded ? 'bg-gray-200' : ''}
    `;

    // Show placeholder while loading
    if (!shouldLoad || (!isLoaded && !hasError)) {
      return (
        <div
          ref={elementRef}
          className={containerClasses}
          {...props}
        >
          {/* Blur placeholder */}
          {blur && blurSrc && (
            <img
              src={blurSrc}
              alt=""
              className={`
                absolute inset-0 w-full h-full object-cover
                transition-opacity duration-300
                ${isLoaded ? 'opacity-0' : 'opacity-60'}
              `}
            />
          )}
          
          {/* Custom placeholder */}
          {placeholder && (
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={placeholder}
                alt=""
                className="max-w-full max-h-full object-contain opacity-50"
              />
            </div>
          )}
          
          {/* Loading skeleton */}
          {!placeholder && !blur && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
          )}
        </div>
      );
    }

    // Show error state
    if (hasError && !imageSrc) {
      return (
        <div
          ref={elementRef}
          className={`
            ${containerClasses}
            flex items-center justify-center bg-gray-100 text-gray-500
          `}
          {...props}
        >
          <div className="text-center p-4">
            <svg
              className="w-8 h-8 mx-auto mb-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Failed to load image</p>
            <button
              onClick={retry}
              className="mt-1 text-xs text-blue-500 hover:text-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    // Show loaded image
    return (
      <div ref={elementRef} className={containerClasses}>
        {/* Blur background (shown while main image loads) */}
        {blur && blurSrc && (
          <img
            src={blurSrc}
            alt=""
            className={`
              absolute inset-0 w-full h-full object-cover
              transition-opacity duration-500
              ${isLoaded ? 'opacity-0' : 'opacity-60'}
            `}
          />
        )}
        
        {/* Main image */}
        <img
          ref={ref}
          src={imageSrc}
          alt={alt}
          className={baseClasses}
          sizes={sizes}
          loading={lazy ? 'lazy' : 'eager'}
          {...props}
        />
      </div>
    );
  }
);

AdvancedImage.displayName = 'AdvancedImage';