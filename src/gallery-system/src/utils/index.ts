import { Photo } from "../types";

// Cache للصور المحملة مسبقاً
const imageCache = new Map<string, HTMLImageElement>();
const preloadQueue = new Set<string>();

/**
 * تحميل مسبق للصورة مع تخزين مؤقت
 */
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    // إذا كانت الصورة محملة مسبقاً، أرجعها فوراً
    if (imageCache.has(src)) {
      resolve(imageCache.get(src)!);
      return;
    }

    // إذا كانت الصورة قيد التحميل، انتظر
    if (preloadQueue.has(src)) {
      const checkCache = () => {
        if (imageCache.has(src)) {
          resolve(imageCache.get(src)!);
        } else {
          setTimeout(checkCache, 10);
        }
      };
      checkCache();
      return;
    }

    preloadQueue.add(src);

    const img = new Image();

    // تحسين إعدادات التحميل
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.fetchPriority = "high";

    img.onload = () => {
      imageCache.set(src, img);
      preloadQueue.delete(src);
      resolve(img);
    };

    img.onerror = () => {
      preloadQueue.delete(src);
      reject(new Error(`Failed to load image: ${src}`));
    };

    img.src = src;
  });
};

/**
 * تحميل مسبق لمجموعة من الصور بالتوازي
 */
export const preloadImages = async (urls: string[]): Promise<void> => {
  const promises = urls.map((url) => preloadImage(url).catch(() => null));
  await Promise.allSettled(promises);
};

/**
 * مسح cache الصور (للذاكرة)
 */
export const clearImageCache = (): void => {
  imageCache.clear();
  preloadQueue.clear();
};

/**
 * الحصول على حجم cache الحالي
 */
export const getCacheSize = (): number => {
  return imageCache.size;
};

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
  // تحسين URLs للصور مع إعدادات محسنة للأداء
  if (url.includes("unsplash.com")) {
    const params = new URLSearchParams();
    if (width) params.set("w", width.toString());
    params.set("q", Math.min(quality, 85).toString()); // جودة محسنة
    params.set("auto", "format");
    params.set("fit", "crop");
    params.set("fm", "webp"); // تنسيق WebP للأداء الأفضل
    params.set("dpr", "2"); // دعم الشاشات عالية الدقة

    return `${url}?${params.toString()}`;
  }

  // تحسين URLs لـ Cloudinary
  if (url.includes("cloudinary.com")) {
    // إضافة تحسينات Cloudinary
    const parts = url.split("/upload/");
    if (parts.length === 2) {
      const transformations = [
        "f_auto", // تنسيق تلقائي
        "q_auto:good", // جودة تلقائية محسنة
        "c_fill", // ملء الإطار
        width ? `w_${width}` : "w_400",
        "dpr_auto", // كثافة البكسل التلقائية
      ].join(",");

      return `${parts[0]}/upload/${transformations}/${parts[1]}`;
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
