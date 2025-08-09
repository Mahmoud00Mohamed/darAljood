import { Photo } from "../types";

export const getGridColumns = (columnsConfig?: {
  mobile: number;
  tablet: number;
  desktop: number;
}) => {
  const defaultConfig = { mobile: 1, tablet: 2, desktop: 4 };
  const config = { ...defaultConfig, ...columnsConfig };

  return `grid-cols-${config.mobile} sm:grid-cols-${config.tablet} lg:grid-cols-${config.desktop}`;
};

export const generatePhotoId = () => {
  return `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const optimizeImageUrl = (
  url: string,
  width?: number,
  quality: number = 80
) => {
  // تحسين URLs للخدمات المختلفة
  if (url.includes("unsplash.com")) {
    const params = new URLSearchParams();
    if (width) params.set("w", width.toString());
    params.set("q", quality.toString());
    params.set("auto", "format");
    params.set("fit", "crop");

    return `${url}?${params.toString()}`;
  }
  
  // تحسين Cloudinary URLs
  if (url.includes("cloudinary.com")) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      const transformations = [];
      if (width) transformations.push(`w_${width}`);
      transformations.push(`q_${quality}`);
      transformations.push('f_auto'); // تنسيق تلقائي
      transformations.push('c_fill'); // ملء الإطار
      
      return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
    }
  }

  return url;
};

export const validatePhoto = (photo: Partial<Photo>): photo is Photo => {
  return !!(
    photo.id &&
    photo.src &&
    photo.title &&
    photo.category &&
    photo.description
  );
};

/**
 * تحسين رابط الصورة للعرض السريع
 */
export const getOptimizedImageUrl = (url: string, width?: number): string => {
  // إضافة معاملات تحسين إضافية
  const optimized = optimizeImageUrl(url, width, 85);
  
  // إضافة cache busting للصور الجديدة فقط
  if (url.includes('cloudinary.com') && !url.includes('v1')) {
    const separator = optimized.includes('?') ? '&' : '?';
    return `${optimized}${separator}cache=1`;
  }
  
  return optimized;
};

/**
 * تحديد أولوية تحميل الصورة
 */
export const getImagePriority = (index: number, totalImages: number): 'high' | 'low' => {
  // أول 8 صور بأولوية عالية
  if (index < 8) return 'high';
  
  // باقي الصور بأولوية منخفضة
  return 'low';
};
