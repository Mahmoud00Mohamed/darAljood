# نظام إدارة الصور المتقدم

نظام مستقل وشامل لإدارة الصور مع كاش ذكي، تحميل مسبق، وعرض سلس بدون وميض.

## 🎯 الميزات الرئيسية

- **كاش ذكي**: كاش في الذاكرة وكاش مستمر باستخدام localStorage
- **تحميل مسبق**: تحميل استباقي للصور المتوقعة
- **عرض سلس**: لا وميض، انتقالات سلسة، placeholder ذكي
- **استرجاع ذكي**: إعادة محاولة تلقائية مع exponential backoff
- **تحسين تلقائي**: اختيار أفضل صيغة وحجم حسب الجهاز
- **مقاوم للأخطاء**: fallback images وإدارة شاملة للأخطاء

## 🚀 البداية السريعة

### التثبيت

انسخ مجلد `image-system` إلى مشروعك:

```bash
cp -r image-system/ your-project/src/
```

### الاستخدام الأساسي

```tsx
import React from "react";
import { SmoothImage, loadImage, preloadImages } from "./image-system";

// استخدام المكون
function MyComponent() {
  return (
    <SmoothImage
      src="https://example.com/image.jpg"
      alt="وصف الصورة"
      className="w-full h-64 rounded-lg"
      priority="high"
      size="medium"
    />
  );
}

// تحميل مسبق للصور
async function preloadGallery() {
  const imageUrls = [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
    "https://example.com/image3.jpg",
  ];

  await preloadImages(imageUrls);
  console.log("تم تحميل جميع الصور مسبقاً!");
}

// تحميل برمجي للصور
async function loadProgrammatically() {
  const result = await loadImage("https://example.com/image.jpg", {
    size: "large",
    priority: "high",
    fallback: "https://example.com/fallback.jpg",
  });

  if (result.state === "loaded") {
    console.log("تم تحميل الصورة:", result.data);
  }
}
```

## 📚 واجهة برمجة التطبيقات

### مكون SmoothImage

```tsx
interface SmoothImageProps {
  src: string; // رابط الصورة
  alt: string; // النص البديل
  className?: string; // CSS classes
  placeholder?: string | boolean; // placeholder image أو true للافتراضي
  fallback?: string; // صورة احتياطية عند الفشل
  size?: "small" | "medium" | "large" | "auto";
  priority?: "low" | "normal" | "high";
  onLoad?: () => void; // عند انتهاء التحميل
  onError?: (error: Error) => void; // عند حدوث خطأ
  style?: React.CSSProperties;
  fadeTransition?: number; // مدة التلاشي (ms)
}
```

### دوال التحميل

```tsx
// تحميل صورة واحدة
const result = await loadImage(url, options);

// تحميل مسبق لصورة واحدة
await preloadImage(url, options);

// تحميل مسبق لعدة صور
await preloadImages(urls);

// تحميل مسبق مع أولويات
await preloadImagesWithPriority([
  { url: "image1.jpg", priority: 1 },
  { url: "image2.jpg", priority: 2 },
]);

// مسح الكاش
await clearImageCache();
```

### خيارات التحميل

```tsx
interface LoadImageOptions {
  priority?: "low" | "normal" | "high";
  placeholder?: string | boolean;
  fallback?: string;
  responsive?: boolean;
  size?: "small" | "medium" | "large" | "auto";
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}
```

## ⚙️ التخصيص والإعدادات

### تخصيص الإعدادات

```tsx
import { ImageLoader } from "./image-system";

const customLoader = new ImageLoader({
  cache: {
    maxAge: 12 * 60 * 60 * 1000, // 12 ساعة
    maxSize: 50, // 50 صورة
    enablePersistent: true,
  },

  display: {
    fadeTransition: 500, // 500ms
    placeholderColor: "#f0f0f0",
    retryIndicator: true,
  },

  retry: {
    maxAttempts: 5,
    delays: [300, 600, 1200],
    exponentialBackoff: true,
  },

  optimization: {
    enableResponsive: true,
    devicePixelRatio: true,
    sizes: {
      small: 400,
      medium: 800,
      large: 1600,
    },
  },
});
```

### إعدادات التحميل المسبق

```tsx
const preloadConfig = {
  enabled: true,
  maxConcurrent: 5, // 5 صور متزامنة
  priority: {
    viewport: 1, // أولوية عالية للصور في منطقة العرض
    predicted: 3, // أولوية متوسطة للصور المتوقعة
    manual: 2, // أولوية للتحميل اليدوي
  },
};
```

## 🔄 سلوك الكاش

### الكاش في الذاكرة

- سريع الوصول
- يُمسح عند إعادة تحميل الصفحة
- حد أقصى 100 صورة افتراضياً

### الكاش المستمر

- يبقى بعد إعادة التحميل
- يستخدم localStorage
- تنظيف تلقائي للصور المنتهية الصلاحية

### استراتيجيات التنظيف

- تنظيف دوري كل ساعة
- حذف أقدم الصور عند امتلاء الذاكرة
- حذف 25% من أقدم الصور عند امتلاء localStorage

## 🎨 أمثلة متقدمة

### مكون معرض الصور

```tsx
import React, { useEffect } from "react";
import { SmoothImage, preloadImages } from "./image-system";

interface GalleryProps {
  images: string[];
}

export const Gallery: React.FC<GalleryProps> = ({ images }) => {
  useEffect(() => {
    // تحميل مسبق لجميع الصور
    preloadImages(images);
  }, [images]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((src, index) => (
        <SmoothImage
          key={src}
          src={src}
          alt={`صورة ${index + 1}`}
          className="w-full h-64 rounded-lg shadow-lg"
          size="medium"
          priority={index < 3 ? "high" : "normal"}
        />
      ))}
    </div>
  );
};
```

### صورة مع تتبع التقدم

```tsx
import React, { useState } from "react";
import { loadImage } from "./image-system";

export const ProgressiveImage: React.FC<{ src: string }> = ({ src }) => {
  const [progress, setProgress] = useState(0);
  const [imageData, setImageData] = useState<string | null>(null);

  useEffect(() => {
    loadImage(src, {
      onProgress: setProgress,
    }).then((result) => {
      if (result.state === "loaded") {
        setImageData(result.data!);
      }
    });
  }, [src]);

  return (
    <div className="relative">
      {!imageData && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              {Math.round(progress)}%
            </div>
            <div className="w-32 h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {imageData && <img src={imageData} className="w-full h-auto" />}
    </div>
  );
};
```

## 🔧 الاستكشاف وإصلاح الأخطاء

### مراقبة حالة النظام

```tsx
import { imageLoader } from "./image-system";

// حالة التحميل المسبق
const status = imageLoader.getPreloadStatus();
console.log({
  queued: status.queued, // في الانتظار
  running: status.running, // قيد التحميل
  completed: status.completed, // مكتمل
});

// مسح الكاش عند الحاجة
await imageLoader.clearCache();
```

### معالجة الأخطاء

```tsx
<SmoothImage
  src="https://example.com/image.jpg"
  alt="صورة"
  fallback="https://example.com/default.jpg"
  onError={(error) => {
    console.error("خطأ في تحميل الصورة:", error);
    // إرسال تقرير للمراقبة
  }}
/>
```

## 📱 التجاوب والتحسين

النظام يدعم تلقائياً:

- اختيار حجم الصورة المناسب للشاشة
- دعم device pixel ratio
- تحسين تلقائي للصيغة (WebP, AVIF)
- تحميل lazy loading

## 🔒 الأمان

- جميع الصور تُحمل مع `crossOrigin="anonymous"`
- تشفير البيانات في localStorage
- تنظيف تلقائي للذاكرة
- حماية من memory leaks

## 📊 الأداء

- تحميل متوازي محدود (3 صور افتراضياً)
- كاش ذكي مع إدارة الذاكرة
- تحسين تلقائي للصور
- lazy loading افتراضي

---

**ملاحظة**: هذا النظام مصمم ليكون مستقلاً تماماً. انسخ المجلد واستخدمه في أي مشروع React بدون تعديلات.
