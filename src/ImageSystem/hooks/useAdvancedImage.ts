// Advanced image hook with intelligent loading and state management
import { useState, useEffect, useRef, useCallback } from 'react';
import { ImagePreloader } from '../services/ImagePreloader';
import type { UseAdvancedImageOptions, ImageState } from '../types/image';

export function useAdvancedImage(
  src: string,
  options: UseAdvancedImageOptions = {}
) {
  const [state, setState] = useState<ImageState>({
    isLoading: false,
    isLoaded: false,
    hasError: false
  });

  const [imageSrc, setImageSrc] = useState<string>('');
  const [blurSrc, setBlurSrc] = useState<string>('');
  const preloader = ImagePreloader.getInstance();
  const mountedRef = useRef(true);

  const loadImage = useCallback(async () => {
    if (!src || !mountedRef.current) return;

    setState(prev => ({ ...prev, isLoading: true, hasError: false }));

    try {
      // Generate blur placeholder if needed
      if (options.blur) {
        const blurUrl = generateBlurDataUrl(src);
        setBlurSrc(blurUrl);
      }

      // Preload the actual image
      const loadedSrc = await preloader.preload(src, {
        priority: options.priority || 'medium'
      });

      if (mountedRef.current) {
        setImageSrc(loadedSrc);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          isLoaded: true 
        }));
      }
    } catch (error) {
      if (mountedRef.current) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          hasError: true, 
          error: error as Error 
        }));

        // Try fallback if available
        if (options.fallback) {
          try {
            const fallbackSrc = await preloader.preload(options.fallback);
            if (mountedRef.current) {
              setImageSrc(fallbackSrc);
              setState(prev => ({ 
                ...prev, 
                hasError: false, 
                isLoaded: true 
              }));
            }
          } catch (fallbackError) {
            console.error('Fallback image also failed:', fallbackError);
          }
        }
      }
    }
  }, [src, options.priority, options.fallback, options.blur]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (options.preload !== false) {
      loadImage();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [loadImage, options.preload]);

  const retry = useCallback(() => {
    loadImage();
  }, [loadImage]);

  return {
    ...state,
    src: imageSrc,
    blurSrc,
    retry
  };
}

// Generate a simple blur data URL (you can enhance this with canvas-based blur)
function generateBlurDataUrl(src: string): string {
  // Simple SVG blur placeholder
  const svg = `
    <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="blur">
          <feGaussianBlur stdDeviation="2"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="#e5e7eb" filter="url(#blur)"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}