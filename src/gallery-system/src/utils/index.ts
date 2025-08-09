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
  // تحسين للصور من Cloudinary
  if (url.includes("cloudinary.com")) {
    const baseUrl = url.split('/upload/')[0] + '/upload/';
    const imagePath = url.split('/upload/')[1];
    const optimizations = [
      'f_auto', // تنسيق تلقائي (WebP, AVIF حسب دعم المتصفح)
      'q_auto:good', // جودة تلقائية محسنة
      width ? `w_${width}` : '',
      'c_limit', // تحديد الحد الأقصى للأبعاد
      'dpr_auto', // كثافة البكسل التلقائية للشاشات عالية الدقة
      'fl_progressive', // تحميل تدريجي
      'fl_immutable_cache' // تخزين مؤقت ثابت
    ].filter(Boolean).join(',');
    
    return `${baseUrl}${optimizations}/${imagePath}`;
  }
  
  // تحسين للصور من Unsplash
  if (url.includes("unsplash.com")) {
    const params = new URLSearchParams();
    if (width) params.set("w", width.toString());
    params.set("q", quality.toString());
    params.set("auto", "format");
    params.set("fit", "crop");
    params.set("fm", "webp"); // تفضيل تنسيق WebP
    params.set("dpr", "2"); // دعم الشاشات عالية الدقة

    return `${url}?${params.toString()}`;
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
