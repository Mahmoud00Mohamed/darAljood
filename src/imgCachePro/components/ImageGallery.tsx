import React, { useEffect, useState } from "react";
import { OptimizedImage } from "./OptimizedImage";
import { usePreloadImages, useIntersectionPreload } from "../api";
import { PreloadOptions } from "../types";

interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt?: string;
    caption?: string;
  }>;
  preloadOptions?: PreloadOptions;
  className?: string;
  imageClassName?: string;
  captionClassName?: string;
  enableLazyLoad?: boolean;
  columns?: number;
}

// مكون معرض الصور مع تحميل مسبق ذكي
export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  preloadOptions = {},
  className,
  imageClassName,
  captionClassName,
  enableLazyLoad = true,
  columns = 3,
}) => {
  const urls = images.map((img) => img.src);
  const { preloadAll, stats } = usePreloadImages(urls, preloadOptions);

  // بدء التحميل المسبق عند تحميل المكون
  useEffect(() => {
    if (!enableLazyLoad) {
      preloadAll();
    }
  }, [preloadAll, enableLazyLoad]);

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: "1rem",
  };

  return (
    <div className={className}>
      {/* عرض إحصائيات التحميل المسبق (اختياري) */}
      {import.meta.env.DEV && (
        <div
          style={{ marginBottom: "1rem", fontSize: "0.875rem", color: "#666" }}
        >
          التحميل المسبق: {stats.active} نشط، {stats.queued} في الانتظار
        </div>
      )}

      <div style={gridStyle}>
        {images.map((image, index) => (
          <ImageGalleryItem
            key={`${image.src}-${index}`}
            image={image}
            imageClassName={imageClassName}
            captionClassName={captionClassName}
            enableLazyLoad={enableLazyLoad}
            preloadOptions={preloadOptions}
          />
        ))}
      </div>
    </div>
  );
};

interface ImageGalleryItemProps {
  image: {
    src: string;
    alt?: string;
    caption?: string;
  };
  imageClassName?: string;
  captionClassName?: string;
  enableLazyLoad: boolean;
  preloadOptions: PreloadOptions;
}

const ImageGalleryItem: React.FC<ImageGalleryItemProps> = ({
  image,
  imageClassName,
  captionClassName,
  enableLazyLoad,
  preloadOptions,
}) => {
  const [isVisible, setIsVisible] = useState(!enableLazyLoad);
  const intersectionRef = useIntersectionPreload(
    image.src,
    preloadOptions
  ) as React.RefObject<HTMLDivElement>;

  // مراقبة ظهور العنصر
  useEffect(() => {
    if (!enableLazyLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (intersectionRef.current) {
      observer.observe(intersectionRef.current);
    }

    return () => observer.disconnect();
  }, [enableLazyLoad, intersectionRef]);

  return (
    <div
      ref={intersectionRef}
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "200px",
      }}
    >
      {isVisible ? (
        <>
          <OptimizedImage
            src={image.src}
            alt={image.alt || ""}
            className={imageClassName}
            style={{
              width: "100%",
              height: "auto",
              objectFit: "cover",
            }}
            options={{
              priority: "medium",
              resize: {
                width: 400,
                quality: 80,
              },
            }}
            loadingComponent={
              <div
                style={{
                  width: "100%",
                  height: "200px",
                  backgroundColor: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9ca3af",
                }}
              >
                جاري التحميل...
              </div>
            }
            errorComponent={
              <div
                style={{
                  width: "100%",
                  height: "200px",
                  backgroundColor: "#fef2f2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#dc2626",
                  border: "2px dashed #fca5a5",
                }}
              >
                فشل في التحميل
              </div>
            }
          />
          {image.caption && (
            <div
              className={captionClassName}
              style={{
                marginTop: "0.5rem",
                fontSize: "0.875rem",
                color: "#666",
              }}
            >
              {image.caption}
            </div>
          )}
        </>
      ) : (
        <div
          style={{
            width: "100%",
            height: "200px",
            backgroundColor: "#f9fafb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9ca3af",
          }}
        >
          سيتم التحميل عند الحاجة
        </div>
      )}
    </div>
  );
};
