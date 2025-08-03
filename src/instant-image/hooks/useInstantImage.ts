import { useState, useEffect, useRef, useCallback } from "react";
import type { PartialInstantImageConfig } from "../types/config";
import { InstantImageSystem } from "../core/InstantImageSystem";

interface UseInstantImageProps {
  src: string;
  config?: PartialInstantImageConfig;
  preload?: boolean;
  width?: number;
  height?: number;
}

interface UseInstantImageReturn {
  imageSrc: string | null;
  isLoading: boolean;
  isLoaded: boolean;
  error: Error | null;
  retry: () => void;
}

export function useInstantImage({
  src,
  config,
  preload = false,
  width,
  height,
}: UseInstantImageProps): UseInstantImageReturn {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const systemRef = useRef<InstantImageSystem>();

  // Initialize system
  useEffect(() => {
    if (!systemRef.current) {
      systemRef.current = new InstantImageSystem(config);
    }
  }, [config]);

  const loadImage = useCallback(async () => {
    if (!src || !systemRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const optimizedSrc = systemRef.current.getOptimizedSrc(
        src,
        width,
        height
      );
      const objectUrl = await systemRef.current.loadImage(optimizedSrc);
      setImageSrc(objectUrl);
      setIsLoaded(true);
    } catch (err) {
      setError(err as Error);
      // Set fallback image if available
      const fallbackSrc = systemRef.current?.getFallbackSrc();
      if (fallbackSrc) {
        setImageSrc(fallbackSrc);
      }
    } finally {
      setIsLoading(false);
    }
  }, [src, width, height]);

  const retry = useCallback(() => {
    loadImage();
  }, [loadImage]);

  // Load image when src changes
  useEffect(() => {
    loadImage();
  }, [loadImage]);

  // Preload if requested
  useEffect(() => {
    if (preload && src && systemRef.current) {
      systemRef.current.preload([src]);
    }
  }, [src, preload]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (imageSrc && imageSrc.startsWith("blob:")) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);

  return {
    imageSrc,
    isLoading,
    isLoaded,
    error,
    retry,
  };
}
