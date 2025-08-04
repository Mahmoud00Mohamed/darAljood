import { useState, useEffect, useCallback } from "react";
import { loadImage, preloadImage } from "./index";
import { LoadImageOptions, ImageState } from "./types";

// Hook for manual image loading
export const useImageLoader = (src: string, options: LoadImageOptions = {}) => {
  const [state, setState] = useState<ImageState | null>(null);

  useEffect(() => {
    const loadImageAsync = async () => {
      try {
        const imageState = await loadImage(src, options);
        setState(imageState);
      } catch (error) {
        setState({
          loading: false,
          loaded: false,
          error: error as Error,
          progress: 0,
          url: null,
          placeholder: null,
        });
      }
    };

    loadImageAsync();
  }, [src, options]);

  const preload = useCallback(async () => {
    await preloadImage(src);
  }, [src]);

  return { state, preload };
};

// Hook for image preloading
export const useImagePreloader = () => {
  const preloadSingle = useCallback(async (src: string, options = {}) => {
    await preloadImage(src, options);
  }, []);

  const preloadMultiple = useCallback(
    async (sources: string[], options = {}) => {
      const { preloadImages } = await import("./index");
      await preloadImages(sources, options);
    },
    []
  );

  return { preloadSingle, preloadMultiple };
};
