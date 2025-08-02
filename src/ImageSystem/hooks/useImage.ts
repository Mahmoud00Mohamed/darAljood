// Advanced Image Hook with Progressive Loading
import { useState, useEffect, useRef, useCallback } from 'react';
import { imageLoader } from '../utils/imageLoader';
import { LoadedImage, ImageLoadOptions } from '../types';

export const useImage = (
  src: string | undefined,
  options: ImageLoadOptions = {}
) => {
  const [state, setState] = useState<LoadedImage>({
    src: src || '',
    isLoaded: false,
    isLoading: false,
    error: null,
    progress: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const loadImage = useCallback(async (url: string) => {
    if (!url || !isMountedRef.current) return;

    // Cancel previous loading
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      progress: 0,
    }));

    try {
      const loadedUrl = await imageLoader.loadImage(url, {
        retryAttempts: 3,
        retryDelay: 1000,
        signal: abortControllerRef.current.signal,
        onProgress: (progress) => {
          if (isMountedRef.current) {
            setState(prev => ({
              ...prev,
              progress,
            }));
          }
        },
      });

      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          src: loadedUrl,
          isLoaded: true,
          isLoading: false,
          progress: 100,
        }));
      }
    } catch (error) {
      if (isMountedRef.current && error instanceof Error) {
        setState(prev => ({
          ...prev,
          error: error.message,
          isLoading: false,
          progress: 0,
        }));
      }
    }
  }, []);

  const reload = useCallback(() => {
    if (src) {
      loadImage(src);
    }
  }, [src, loadImage]);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (src) {
      // Immediate loading for eager strategy
      if (options.strategy === 'eager' || options.strategy === 'preload') {
        loadImage(src);
      }
      // Preload for preload strategy
      else if (options.strategy === 'preload') {
        imageLoader.preloadImages([src]);
      }
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [src, loadImage, options.strategy]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    reload,
  };
};