import React, { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * مكون صورة محسن مع lazy loading وpreloading ذكي
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  fallbackSrc,
  alt,
  className = '',
  priority = false,
  onLoad,
  onError,
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // تحميل فوري للصور ذات الأولوية العالية
  useEffect(() => {
    if (priority) {
      setImageSrc(src);
    }
  }, [src, priority]);

  // Intersection Observer للصور العادية
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // تحميل قبل 50px من دخول الصورة للعرض
        threshold: 0.1,
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    } else {
      onError?.();
    }
  };

  // تحسين الأداء بعدم إعادة الرندر غير الضرورية
  const imageStyle = React.useMemo(() => ({
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
  }), [isLoaded]);

  return (
    <div ref={imgRef} className="relative w-full h-full">
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={className}
          style={imageStyle}
          onLoad={handleLoad}
          onError={handleError}
          decoding="async"
          loading={priority ? 'eager' : 'lazy'}
        />
      )}
      
      {/* Placeholder أثناء التحميل - مخفي بصرياً */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gray-100"
          style={{ 
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};