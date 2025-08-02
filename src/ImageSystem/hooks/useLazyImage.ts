// Lazy Loading Hook with Intersection Observer
import { useState, useEffect, useRef, useCallback } from 'react';
import { imageLoader } from '../utils/imageLoader';
import { LoadedImage, ImageLoadOptions } from '../types';

interface UseLazyImageOptions extends ImageLoadOptions {
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

export const useLazyImage = (
  src: string | undefined,
  options: UseLazyImageOptions = {}
) => {
  const [state, setState] = useState<LoadedImage>({
    src: src || '',
    isLoaded: false,
    isLoading: false,
    error: null,
    progress: 0,
  });

  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const {
    rootMargin = '100px',
    threshold = 0.1,
    triggerOnce = true,
    ...imageOptions
  } = options;

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

  // Setup intersection observer
  const setupObserver = useCallback(() => {
    if (!elementRef.current || observerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isInView) {
          setIsInView(true);
          
          if (triggerOnce && observerRef.current && elementRef.current) {
            observerRef.current.unobserve(elementRef.current);
          }
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observerRef.current.observe(elementRef.current);
  }, [rootMargin, threshold, triggerOnce, isInView]);

  // Set element ref
  const setElementRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
    setupObserver();
  }, [setupObserver]);

  // Load image when in view
  useEffect(() => {
    if (isInView && src && !state.isLoaded && !state.isLoading) {
      loadImage(src);
    }
  }, [isInView, src, state.isLoaded, state.isLoading, loadImage]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const reload = useCallback(() => {
    if (src) {
      loadImage(src);
    }
  }, [src, loadImage]);

  return {
    ...state,
    isInView,
    setElementRef,
    reload,
  };
};