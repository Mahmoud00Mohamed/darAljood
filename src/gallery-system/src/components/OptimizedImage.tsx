import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Loader2 } from "lucide-react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  placeholder?: string;
  blurDataURL?: string;
  sizes?: string;
  quality?: number;
}

/**
 * مكون صورة محسن مع تحميل مسبق وتخزين مؤقت
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = "",
  onLoad,
  onError,
  priority = false,
  placeholder,
  blurDataURL,
  sizes = "100vw",
  quality = 80,
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageSrc, setImageSrc] = useState<string>(blurDataURL || placeholder || '');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // تحسين URL الصورة
  const optimizeImageUrl = (url: string, width?: number) => {
    if (url.includes('cloudinary.com')) {
      const baseUrl = url.split('/upload/')[0] + '/upload/';
      const imagePath = url.split('/upload/')[1];
      const optimizations = [
        'f_auto', // تنسيق تلقائي
        'q_auto:good', // جودة تلقائية
        width ? `w_${width}` : '',
        'c_limit', // تحديد الحد الأقصى
        'dpr_auto' // كثافة البكسل التلقائية
      ].filter(Boolean).join(',');
      
      return `${baseUrl}${optimizations}/${imagePath}`;
    }
    
    if (url.includes('unsplash.com')) {
      const params = new URLSearchParams();
      if (width) params.set('w', width.toString());
      params.set('q', quality.toString());
      params.set('auto', 'format');
      params.set('fit', 'crop');
      return `${url}?${params.toString()}`;
    }
    
    return url;
  };

  // تحميل الصورة مع إدارة الحالة
  const loadImage = useCallback(async () => {
    if (!src) return;

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      
      // تحسين URL حسب حجم الحاوية
      const containerWidth = imgRef.current?.parentElement?.clientWidth || 400;
      const optimizedSrc = optimizeImageUrl(src, Math.ceil(containerWidth * 1.5));
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          setImageSrc(optimizedSrc);
          setImageState('loaded');
          onLoad?.();
          resolve();
        };
        
        img.onerror = () => {
          setImageState('error');
          onError?.();
          reject(new Error(`Failed to load image: ${src}`));
        };
        
        img.src = optimizedSrc;
      });
    } catch (error) {
      console.warn('Image loading failed:', error);
      setImageState('error');
    }
  }, [src, onLoad, onError, quality]);

  // إعداد Intersection Observer للتحميل الكسول
  useEffect(() => {
    if (priority) {
      // تحميل فوري للصور ذات الأولوية
      loadImage();
      return;
    }

    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage();
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // بدء التحميل قبل 50px من دخول الصورة للعرض
        threshold: 0.1,
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority, loadImage]);

  // تنظيف المراقب عند إلغاء تحميل المكون
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder/Loading State */}
      {imageState === 'loading' && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          {blurDataURL ? (
            <img
              src={blurDataURL}
              alt=""
              className="w-full h-full object-cover filter blur-sm scale-110"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
              <span className="text-xs">جاري التحميل...</span>
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {imageState === 'error' && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center text-gray-400">
            <ImageIcon className="w-8 h-8 mb-2" />
            <span className="text-xs text-center px-2">فشل في تحميل الصورة</span>
          </div>
        </div>
      )}

      {/* Main Image */}
      <motion.img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageState === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        sizes={sizes}
        style={{
          contentVisibility: 'auto',
          containIntrinsicSize: '400px 400px'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: imageState === 'loaded' ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
};