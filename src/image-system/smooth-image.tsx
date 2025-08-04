import React, { useState, useEffect, useRef, useCallback } from "react";
import { ImageLoader } from "./image-loader";
import { LoadImageOptions, LoadState } from "./types";
import { defaultConfig } from "./config";

// إنشاء مثيل محلي لتجنب مشاكل الاستيراد الدائري
const imageLoader = new ImageLoader();

interface SmoothImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string | boolean;
  fallback?: string;
  size?: "small" | "medium" | "large" | "auto";
  priority?: "low" | "normal" | "high";
  onLoad?: () => void;
  onError?: (error: Error) => void;
  style?: React.CSSProperties;
  fadeTransition?: number;
}

export const SmoothImage: React.FC<SmoothImageProps> = ({
  src,
  alt,
  className = "",
  placeholder = true,
  fallback,
  size = "auto",
  priority = "normal",
  onLoad,
  onError,
  style,
  fadeTransition = defaultConfig.display.fadeTransition,
}) => {
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [imageData, setImageData] = useState<string | null>(null);
  const [showImage, setShowImage] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadImage = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    setLoadState("loading");

    const options: LoadImageOptions = {
      size,
      priority,
      fallback,
      onError: (error) => {
        setLoadState("error");
        onError?.(error);
      },
    };

    try {
      const result = await imageLoader.loadImage(src, options);

      if (result.state === "loaded" && result.data) {
        setImageData(result.data);
        setLoadState("loaded");

        // تأخير إظهار الصورة للانتقال السلس
        setTimeout(() => {
          setShowImage(true);
          onLoad?.();
        }, 10);
      } else if (result.state === "error") {
        setLoadState("error");
        onError?.(result.error || new Error("خطأ غير معروف"));
      }
    } catch (error) {
      setLoadState("error");
      onError?.(error as Error);
    } finally {
      loadingRef.current = false;
    }
  }, [src, size, priority, fallback, onError, onLoad]);

  useEffect(() => {
    loadImage();
  }, [loadImage]);

  // إنشاء placeholder
  const renderPlaceholder = () => {
    if (placeholder === false) return null;

    const placeholderStyle: React.CSSProperties = {
      backgroundColor: defaultConfig.display.placeholderColor,
      opacity: defaultConfig.display.placeholderOpacity,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100px",
      width: "100%",
      height: "100%",
      position: "absolute",
      top: 0,
      left: 0,
      transition: `opacity ${fadeTransition}ms ease-in-out`,
    };

    if (typeof placeholder === "string") {
      return (
        <div style={placeholderStyle}>
          <img
            src={placeholder}
            alt="placeholder"
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
        </div>
      );
    }

    return (
      <div style={placeholderStyle}>
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid #e5e7eb",
            borderTop: "3px solid #3b82f6",
            borderRadius: "50%",
            animation:
              loadState === "loading" ? "spin 1s linear infinite" : "none",
          }}
        />
      </div>
    );
  };

  const containerStyle: React.CSSProperties = {
    position: "relative",
    overflow: "hidden",
    ...style,
  };

  const imageStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: showImage ? 1 : 0,
    transition: `opacity ${fadeTransition}ms ease-in-out`,
    position: "absolute",
    top: 0,
    left: 0,
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div ref={imgRef} className={className} style={containerStyle}>
        {/* Placeholder */}
        {(!showImage || loadState === "loading") && renderPlaceholder()}

        {/* الصورة الفعلية */}
        {imageData && (
          <img src={imageData} alt={alt} style={imageStyle} loading="lazy" />
        )}

        {/* حالة الخطأ */}
        {loadState === "error" && (
          <div
            style={{
              ...containerStyle,
              backgroundColor: "#fef2f2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
          >
            فشل في تحميل الصورة
          </div>
        )}
      </div>
    </>
  );
};

export default SmoothImage;
