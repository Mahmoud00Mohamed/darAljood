import { useState, useEffect } from "react";

type ImageStatus = "loading" | "loaded" | "error";

export const useImageLoader = (src: string, placeholderSrc: string) => {
  const [status, setStatus] = useState<ImageStatus>("loading");

  useEffect(() => {
    const image = new Image();
    image.src = src;

    const handleLoad = () => setStatus("loaded");
    const handleError = () => setStatus("error");

    image.addEventListener("load", handleLoad);
    image.addEventListener("error", handleError);

    return () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
    };
  }, [src]);

  const currentSrc = status === "loaded" ? src : placeholderSrc;
  const isLoaded = status === "loaded";

  return { status, currentSrc, isLoaded };
};
