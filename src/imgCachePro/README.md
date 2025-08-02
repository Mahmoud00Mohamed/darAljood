# نظام imgCachePro - جلب وعرض الصور السريع

نظام متكامل لإدارة الصور مع كاش ذكي وتحميل مسبق وعرض سلس بدون وميض.

## المزايا الرئيسية

- ✅ **كاش دائم**: الصور تظهر فوراً حتى بعد إعادة تحميل الصفحة
- ✅ **عرض سلس**: بدون وميض أو تأخير محسوس
- ✅ **تحميل مسبق ذكي**: يتنبأ بالصور المطلوبة ويحملها مسبقاً
- ✅ **مقاوم للأخطاء**: إعادة المحاولة التلقائية و placeholders ذكية
- ✅ **قابل للتخصيص**: جميع الإعدادات قابلة للتعديل
- ✅ **قابل لإعادة الاستخدام**: نسخ ولصق في أي مشروع

## التثبيت السريع

```bash
# انسخ مجلد imgCachePro إلى مشروعك
cp -r imgCachePro /path/to/your/project/src/
```

## الاستخدام الأساسي

### 1. استيراد النظام

```typescript
import { OptimizedImage, useImage, preloadImage } from "./imgCachePro";
```

### 2. استخدام مكون الصورة المحسن

```tsx
import React from "react";
import { OptimizedImage } from "./imgCachePro";

function MyComponent() {
  return (
    <OptimizedImage
      src="https://example.com/image.jpg"
      alt="وصف الصورة"
      className="my-image-class"
      options={{
        priority: "high",
        resize: {
          width: 400,
          height: 300,
          quality: 80,
        },
      }}
    />
  );
}
```

### 3. استخدام Hook للتحكم الكامل

```tsx
import React from "react";
import { useImage } from "./imgCachePro";

function CustomImageComponent() {
  const { isLoading, isLoaded, hasError, imageRef, reload } = useImage(
    "https://example.com/image.jpg",
    {
      priority: "medium",
      onLoad: () => console.log("تم تحميل الصورة"),
      onError: (error) => console.error("خطأ في التحميل:", error),
    }
  );

  if (hasError) {
    return <button onClick={reload}>إعادة المحاولة</button>;
  }

  return (
    <div>
      {isLoading && <div>جاري التحميل...</div>}
      <img ref={imageRef} alt="صورة مخصصة" />
    </div>
  );
}
```

### 4. التحميل المسبق

```typescript
import { preloadImage, preloadImages } from "./imgCachePro";

// تحميل مسبق لصورة واحدة
await preloadImage("https://example.com/image.jpg", {
  priority: "high",
});

// تحميل مسبق لمجموعة صور
await preloadImages(
  [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
    "https://example.com/image3.jpg",
  ],
  {
    priority: "medium",
  }
);
```

### 5. معرض الصور

```tsx
import React from "react";
import { ImageGallery } from "./imgCachePro";

function Gallery() {
  const images = [
    { src: "https://example.com/1.jpg", alt: "صورة 1", caption: "الوصف الأول" },
    {
      src: "https://example.com/2.jpg",
      alt: "صورة 2",
      caption: "الوصف الثاني",
    },
    {
      src: "https://example.com/3.jpg",
      alt: "صورة 3",
      caption: "الوصف الثالث",
    },
  ];

  return (
    <ImageGallery
      images={images}
      columns={3}
      enableLazyLoad={true}
      preloadOptions={{ priority: "low" }}
      className="my-gallery"
    />
  );
}
```

## التخصيص والإعدادات

### تحديث الإعدادات

```typescript
import { updateConfig } from "./imgCachePro";

updateConfig({
  maxCacheSize: 100, // 100 ميجابايت
  cacheExpiration: 14, // أسبوعين
  fadeDuration: 500, // 500 مللي ثانية
  maxRetries: 5,
  enableWebP: true,
  quality: 90,
});
```

### إعدادات متاحة

```typescript
interface ImgCacheConfig {
  // إعدادات الكاش
  maxCacheSize: number; // بالميجابايت (افتراضي: 50)
  cacheExpiration: number; // بالأيام (افتراضي: 7)

  // إعدادات العرض
  fadeDuration: number; // مدة التلاشي بالمللي ثانية (افتراضي: 300)
  placeholderColor: string; // لون الـ placeholder (افتراضي: '#f3f4f6')
  placeholderText: string; // نص الـ placeholder (افتراضي: '')

  // إعدادات إعادة المحاولة
  maxRetries: number; // عدد المحاولات (افتراضي: 3)
  retryDelay: number; // تأخير المحاولة بالمللي ثانية (افتراضي: 1000)
  retryBackoffMultiplier: number; // مضاعف التأخير (افتراضي: 2)

  // إعدادات التحميل المسبق
  preloadThreshold: number; // عتبة بدء التحميل المسبق (افتراضي: 0.1)
  maxConcurrentPreloads: number; // عدد التحميلات المتزامنة (افتراضي: 3)

  // إعدادات التحسين
  enableWebP: boolean; // تفعيل WebP (افتراضي: true)
  enableLazyLoading: boolean; // تفعيل التحميل الكسول (افتراضي: true)
  quality: number; // جودة الصورة 1-100 (افتراضي: 80)
}
```

## إدارة الكاش

### واجهة برمجة التطبيقات للكاش

```typescript
import { cacheAPI } from "./imgCachePro";

// الحصول على إحصائيات الكاش
const stats = cacheAPI.getStats();
console.log(stats); // { itemCount: 45, totalSize: "12.5 MB", memoryItems: 23 }

// تنظيف الكاش بالكامل
await cacheAPI.clear();

// حذف صورة معينة
cacheAPI.remove("https://example.com/image.jpg");

// التحقق من وجود صورة
const exists = await cacheAPI.has("https://example.com/image.jpg");
```

### مكون إحصائيات الكاش

```tsx
import React from "react";
import { CacheStats } from "./imgCachePro";

function DebugPanel() {
  return (
    <CacheStats
      showDetails={true}
      refreshInterval={1000}
      className="debug-stats"
    />
  );
}
```

## الاستخدام المتقدم

### Hook للتحميل المسبق الذكي

```tsx
import React from "react";
import { usePreloadImages } from "./imgCachePro";

function SmartGallery() {
  const imageUrls = [
    "https://example.com/1.jpg",
    "https://example.com/2.jpg",
    "https://example.com/3.jpg",
  ];

  const { preloadAll, clearQueue, stats } = usePreloadImages(imageUrls, {
    priority: "medium",
  });

  return (
    <div>
      <button onClick={preloadAll}>بدء التحميل المسبق</button>
      <button onClick={clearQueue}>إيقاف التحميل المسبق</button>
      <p>
        حالة التحميل: {stats.active} نشط، {stats.queued} في الانتظار
      </p>
      {/* عرض الصور */}
    </div>
  );
}
```

### Hook للمراقبة والتحميل المسبق

```tsx
import React from "react";
import { useIntersectionPreload } from "./imgCachePro";

function LazySection() {
  const preloadRef = useIntersectionPreload(
    "https://example.com/heavy-image.jpg",
    {
      priority: "high",
    }
  );

  return (
    <section ref={preloadRef}>
      <h2>قسم يحتوي على صورة ثقيلة</h2>
      <p>عندما يصبح هذا القسم مرئياً، ستبدأ الصورة في التحميل تلقائياً</p>
    </section>
  );
}
```

### تحميل مباشر بدون مكونات

```typescript
import { loadImage } from "./imgCachePro";

async function handleImageLoad() {
  try {
    const dataUrl = await loadImage("https://example.com/image.jpg", {
      resize: {
        width: 300,
        height: 200,
        quality: 70,
      },
      priority: "high",
    });

    // استخدام dataUrl مباشرة
    const imgElement = document.createElement("img");
    imgElement.src = dataUrl;
    document.body.appendChild(imgElement);
  } catch (error) {
    console.error("فشل في تحميل الصورة:", error);
  }
}
```

## هيكل الملفات

```
imgCachePro/
├── index.ts              # نقطة الدخول الرئيسية
├── config.ts             # ملف الإعدادات
├── types.ts              # تعريف الأنواع
├── utils.ts              # دوال مساعدة
├── cacheManager.ts       # إدارة الكاش
├── preloadManager.ts     # إدارة التحميل المسبق
├── fallbackManager.ts    # إدارة الأخطاء والاسترجاع
├── displayManager.ts     # إدارة العرض والانتقالات
├── api.ts                # الواجهات العامة والـ hooks
├── components/
│   ├── OptimizedImage.tsx    # مكون الصورة المحسن
│   ├── ImageGallery.tsx      # مكون معرض الصور
│   └── CacheStats.tsx        # مكون إحصائيات الكاش
└── README.md             # هذا الملف
```

## الأمثلة العملية

### مثال: صفحة منتجات

```tsx
import React, { useEffect } from "react";
import { OptimizedImage, preloadImages } from "./imgCachePro";

interface Product {
  id: number;
  name: string;
  image: string;
  thumbnails: string[];
}

function ProductPage({ product }: { product: Product }) {
  // تحميل مسبق للصور المصغرة
  useEffect(() => {
    preloadImages(product.thumbnails, { priority: "low" });
  }, [product.thumbnails]);

  return (
    <div className="product-page">
      <div className="main-image">
        <OptimizedImage
          src={product.image}
          alt={product.name}
          options={{
            priority: "high",
            resize: { width: 800, height: 600, quality: 90 },
          }}
          className="product-main-image"
        />
      </div>

      <div className="thumbnails">
        {product.thumbnails.map((thumb, index) => (
          <OptimizedImage
            key={index}
            src={thumb}
            alt={`${product.name} - صورة ${index + 1}`}
            options={{
              priority: "medium",
              resize: { width: 150, height: 150, quality: 70 },
            }}
            className="product-thumbnail"
          />
        ))}
      </div>
    </div>
  );
}
```

### مثال: قائمة المقالات

```tsx
import React from "react";
import { OptimizedImage, useIntersectionPreload } from "./imgCachePro";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  featuredImage: string;
}

function ArticleCard({ article }: { article: Article }) {
  const preloadRef = useIntersectionPreload(article.featuredImage, {
    priority: "medium",
  });

  return (
    <article ref={preloadRef} className="article-card">
      <div className="article-image">
        <OptimizedImage
          src={article.featuredImage}
          alt={article.title}
          options={{
            resize: { width: 400, height: 250, quality: 80 },
          }}
          className="featured-image"
          loadingComponent={
            <div className="loading-placeholder">جاري تحميل الصورة...</div>
          }
        />
      </div>
      <div className="article-content">
        <h3>{article.title}</h3>
        <p>{article.excerpt}</p>
      </div>
    </article>
  );
}
```

## نصائح الأداء

### 1. أولويات التحميل

- استخدم `priority: 'high'` للصور المهمة فوق المشاهد
- استخدم `priority: 'medium'` للصور في النافذة الحالية
- استخدم `priority: 'low'` للصور التي ستظهر لاحقاً

### 2. تحسين الأحجام

```typescript
// للصور الصغيرة (أيقونات، صور شخصية)
resize: { width: 64, height: 64, quality: 60 }

// للصور المتوسطة (بطاقات، قوائم)
resize: { width: 300, height: 200, quality: 75 }

// للصور الكبيرة (معرض، صفحة رئيسية)
resize: { width: 800, height: 600, quality: 85 }
```

### 3. إدارة الكاش

```typescript
// للمواقع الصغيرة
updateConfig({ maxCacheSize: 25 }); // 25 ميجابايت

// للمواقع المتوسطة
updateConfig({ maxCacheSize: 50 }); // 50 ميجابايت

// للمواقع الكبيرة (معارض الصور)
updateConfig({ maxCacheSize: 100 }); // 100 ميجابايت
```

## استكشاف الأخطاء

### المشاكل الشائعة

1. **الصور لا تظهر**

   - تأكد من صحة الروابط
   - تحقق من إعدادات CORS
   - راجع console للأخطاء

2. **استهلاك ذاكرة عالي**

   - قلل من `maxCacheSize`
   - استخدم `resize` لتقليل أحجام الصور
   - فعّل التنظيف الدوري

3. **بطء في التحميل**
   - زد من `maxConcurrentPreloads`
   - استخدم أولويات مناسبة
   - فعّل التحميل المسبق

### تشخيص المشاكل

```tsx
import { CacheStats, imgCacheAPI } from "./imgCachePro";

// عرض إحصائيات مفصلة
function DiagnosticPanel() {
  const handleDiagnose = () => {
    const stats = imgCacheAPI.getSystemStats();
    console.log("تشخيص شامل:", stats);
  };

  return (
    <div>
      <CacheStats showDetails={true} />
      <button onClick={handleDiagnose}>تشخيص المشاكل</button>
    </div>
  );
}
```

## الترخيص

هذا النظام مفتوح المصدر ويمكن استخدامه واعادة توزيعه بحرية في أي مشروع.

---

**ملاحظة**: النظام مصمم ليعمل مع React. للاستخدام مع frameworks أخرى، يمكن استخدام الدوال المباشرة مثل `loadImage` و `preloadImage` بدون الـ hooks.
