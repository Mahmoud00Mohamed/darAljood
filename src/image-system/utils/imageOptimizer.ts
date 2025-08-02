/**
 * أدوات تحسين الصور
 * Image optimization utilities
 */

/**
 * إنشاء رابط محسن للصور
 */
export const generateOptimizedUrl = (
  originalSrc: string,
  options: {
    quality?: number;
    width?: number;
    height?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}
): string => {
  const { quality = 85, width, height, format } = options;

  // تحسين خاص بـ Pexels
  if (originalSrc.includes("pexels.com")) {
    const url = new URL(originalSrc);
    
    if (width) url.searchParams.set("w", width.toString());
    if (height) url.searchParams.set("h", height.toString());
    
    if (quality < 90) {
      url.searchParams.set("auto", "compress");
      url.searchParams.set("cs", "tinysrgb");
    }
    
    // تحسين للشاشات عالية الدقة
    url.searchParams.set("dpr", "2");
    
    return url.toString();
  }

  // يمكن إضافة تحسينات لمصادر أخرى هنا
  // مثل Unsplash, Cloudinary, إلخ

  return originalSrc;
};

/**
 * إنشاء مجموعة من الأحجام المختلفة للصورة
 */
export const generateSrcSet = (
  originalSrc: string,
  sizes: number[] = [400, 800, 1200]
): string => {
  return sizes
    .map((size) => {
      const optimizedUrl = generateOptimizedUrl(originalSrc, { width: size });
      return `${optimizedUrl} ${size}w`;
    })
    .join(", ");
};

/**
 * تحديد الحجم المناسب للصورة بناءً على الجهاز
 */
export const getOptimalImageSize = (
  containerWidth: number,
  devicePixelRatio: number = window.devicePixelRatio || 1
): number => {
  const targetWidth = containerWidth * devicePixelRatio;
  
  // اختيار أقرب حجم متاح
  const availableSizes = [200, 400, 600, 800, 1200, 1600];
  return availableSizes.find(size => size >= targetWidth) || availableSizes[availableSizes.length - 1];
};

/**
 * فحص دعم تنسيقات الصور الحديثة
 */
export const checkImageFormatSupport = (): {
  webp: boolean;
  avif: boolean;
} => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return {
    webp: canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0,
    avif: canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0,
  };
};