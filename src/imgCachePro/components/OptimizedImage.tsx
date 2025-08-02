import React, { forwardRef } from "react";
import { useImage } from "../api";
import { LoadImageOptions } from "../types";

interface OptimizedImageProps
  extends Omit<
    React.ImgHTMLAttributes<HTMLImageElement>,
    "src" | "onLoad" | "onError"
  > {
  src: string;
  options?: LoadImageOptions;
  fallbackSrc?: string;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}

// مكون صورة محسن مع جميع المزايا
export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  (
    {
      src,
      options = {},
      fallbackSrc,
      loadingComponent,
      errorComponent,
      alt,
      className,
      ...props
    },
    ref
  ) => {
    const { isLoading, hasError, imageRef, reload } = useImage(src, {
      ...options,
      alt,
      className,
    });

    // دمج المراجع
    React.useImperativeHandle(ref, () => imageRef.current!, [imageRef]);

    // عرض مكون التحميل المخصص
    if (isLoading && loadingComponent) {
      return <>{loadingComponent}</>;
    }

    // عرض مكون الخطأ المخصص
    if (hasError && errorComponent) {
      return <>{errorComponent}</>;
    }

    // عرض صورة احتياطية في حالة الخطأ
    if (hasError && fallbackSrc) {
      return (
        <img
          ref={imageRef}
          src={fallbackSrc}
          alt={alt}
          className={className}
          {...props}
        />
      );
    }

    return (
      <img
        ref={imageRef}
        alt={alt}
        className={className}
        onClick={hasError ? reload : undefined}
        style={{
          cursor: hasError ? "pointer" : undefined,
          ...props.style,
        }}
        {...props}
      />
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";
