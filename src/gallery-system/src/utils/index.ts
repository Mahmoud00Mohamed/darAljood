import { Photo } from "../types";

// Cache للصور المحملة مسبقاً
const imageCache = new Map<string, HTMLImageElement>();
const preloadQueue = new Set<string>();
const priorityQueue = new Set<string>();
const loadingPromises = new Map<string, Promise<HTMLImageElement>>();

/**
 * تحميل مسبق للصورة مع تخزين مؤقت
 */
export const preloadImage = (
  src: string,
  priority: boolean = false
): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    // إذا كانت الصورة محملة مسبقاً، أرجعها فوراً
    if (imageCache.has(src)) {
      resolve(imageCache.get(src)!);
      return;
    }

    // إذا كانت الصورة قيد التحميل، أرجع نفس الـ Promise
    if (loadingPromises.has(src)) {
      loadingPromises.get(src)!.then(resolve).catch(reject);
      return;
    }

    const loadingPromise = new Promise<HTMLImageElement>(
      (resolveInner, rejectInner) => {
        preloadQueue.add(src);
        if (priority) {
          priorityQueue.add(src);
        }

        const img = new Image();

        // تحسين إعدادات التحميل للسرعة القصوى
        img.crossOrigin = "anonymous";
        img.decoding = priority ? "sync" : "async";
        img.fetchPriority = priority ? "high" : "auto";
        img.loading = "eager";

        img.onload = () => {
          imageCache.set(src, img);
          preloadQueue.delete(src);
          priorityQueue.delete(src);
          loadingPromises.delete(src);
          resolveInner(img);
        };

        img.onerror = () => {
          preloadQueue.delete(src);
          priorityQueue.delete(src);
          loadingPromises.delete(src);
          rejectInner(new Error(`Failed to load image: ${src}`));
        };

        img.src = src;
      }
    );

    loadingPromises.set(src, loadingPromise);
    loadingPromise.then(resolve).catch(reject);
  });
};

/**
 * تحميل مسبق لمجموعة من الصور بالتوازي مع إدارة الأولوية
 */
export const preloadImages = async (
  urls: string[],
  priority: boolean = false
): Promise<void> => {
  // تقسيم التحميل إلى مجموعات صغيرة لتجنب إرهاق الشبكة
  const batchSize = priority ? 6 : 3;
  const batches: string[][] = [];

  for (let i = 0; i < urls.length; i += batchSize) {
    batches.push(urls.slice(i, i + batchSize));
  }

  // تحميل المجموعات بالتتابع مع تأخير قصير بينها
  for (const batch of batches) {
    const promises = batch.map((url) =>
      preloadImage(url, priority).catch(() => null)
    );
    await Promise.allSettled(promises);

    // تأخير قصير بين المجموعات لتجنب إرهاق الشبكة
    if (!priority && batches.indexOf(batch) < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
};

/**
 * تحميل فوري للصور ذات الأولوية العالية
 */
export const preloadImagesImmediate = async (urls: string[]): Promise<void> => {
  const promises = urls.map((url) => preloadImage(url, true));
  await Promise.allSettled(promises);
};

/**
 * مسح cache الصور (للذاكرة)
 */
export const clearImageCache = (): void => {
  imageCache.clear();
  preloadQueue.clear();
  priorityQueue.clear();
  loadingPromises.clear();
};

/**
 * الحصول على حجم cache الحالي
 */
export const getCacheSize = (): number => {
  return imageCache.size;
};

/**
 * تحسين URL الصورة للتحميل السريع
 */
export const optimizeImageUrlForSpeed = (
  url: string,
  width?: number,
  quality: number = 75
) => {
  // تحسين URLs للصور مع إعدادات محسنة للسرعة القصوى
  if (url.includes("unsplash.com")) {
    const params = new URLSearchParams();
    if (width) params.set("w", width.toString());
    params.set("q", Math.min(quality, 75).toString()); // جودة أقل للسرعة
    params.set("auto", "format,compress");
    params.set("fit", "crop");
    params.set("fm", "webp"); // تنسيق WebP للأداء الأفضل
    params.set("dpr", "1"); // تقليل DPR للسرعة
    params.set("cs", "tinysrgb"); // ضغط الألوان

    return `${url}?${params.toString()}`;
  }

  // تحسين URLs لـ Cloudinary للسرعة القصوى
  if (url.includes("cloudinary.com")) {
    const parts = url.split("/upload/");
    if (parts.length === 2) {
      const transformations = [
        "f_auto", // تنسيق تلقائي
        "q_auto:low", // جودة منخفضة للسرعة
        "c_fill", // ملء الإطار
        width ? `w_${width}` : "w_300", // حجم أصغر للسرعة
        "fl_progressive", // تحميل تدريجي
        "fl_immutable_cache", // تخزين مؤقت دائم
      ].join(",");

      return `${parts[0]}/upload/${transformations}/${parts[1]}`;
    }
  }

  return url;
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
