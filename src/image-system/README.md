# Image System - نظام إدارة الصور المستقل

نظام شامل لإدارة الصور مع كاش ذكي وتحميل مسبق وعرض سلس بدون وميض.

## المميزات الرئيسية

- **كاش ذكي**: كاش في الذاكرة + IndexedDB للتخزين طويل الأمد
- **تحميل مسبق**: محرك ذكي للتنبؤ وتحميل الصور المتوقعة
- **عرض سلس**: بدون وميض أو تأخير محسوس، مع placeholder ذكي
- **استرجاع قوي**: إعادة محاولة تلقائية + fallback عند الفشل
- **تحسينات تلقائية**: تحسين الجودة والحجم حسب الشاشة
- **سهولة الاستخدام**: نسخ+لصق للمجلد في أي مشروع

## التثبيت السريع

```bash
# انسخ مجلد image-system إلى مشروعك
cp -r image-system src/

# في مشروع React/TypeScript مع Tailwind CSS
```

## الاستخدام الأساسي

### 1. تحميل الصور

```tsx
import { imageSystem, SmartImage } from './image-system';

// استخدام مكون SmartImage
function MyComponent() {
  return (
    <SmartImage
      src="https://example.com/image.jpg"
      alt="وصف الصورة"
      options={{
        priority: 'high',
        fallback: 'https://example.com/fallback.jpg',
        width: 400,
        height: 300
      }}
      onLoadComplete={(isFromCache) => {
        console.log(isFromCache ? 'من الكاش' : 'محملة حديثاً');
      }}
    />
  );
}

// أو استخدام API مباشرة
async function loadImageDirectly() {
  const result = await imageSystem.loadImage('https://example.com/image.jpg', {
    priority: 'medium',
    width: 800,
    height: 600
  });
  
  console.log('Image URL:', result.imageUrl);
  console.log('Is from cache:', result.isFromCache);
}
```

### 2. التحميل المسبق

```tsx
import { imageSystem } from './image-system';

// تحميل صورة واحدة مسبقاً
await imageSystem.preloadImage('https://example.com/next-image.jpg', {
  priority: 'high'
});

// تحميل مجموعة من الصور مسبقاً
const imageUrls = [
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
  'https://example.com/image3.jpg'
];

await imageSystem.preloadImages(imageUrls, {
  priority: 'medium'
});
```

### 3. التحميل التدريجي (Lazy Loading)

```tsx
import { LazyImage } from './image-system';

function Gallery() {
  return (
    <div>
      {images.map((image, index) => (
        <LazyImage
          key={index}
          src={image.url}
          alt={image.alt}
          threshold={0.2} // ابدأ التحميل عند 20% ظهور
          rootMargin="100px" // هامش إضافي 100px
          options={{
            priority: 'low',
            width: 300,
            height: 200
          }}
        />
      ))}
    </div>
  );
}
```

### 4. معرض الصور مع التحميل المسبق

```tsx
import { ImageGallery } from './image-system';

function PhotoGallery() {
  const images = [
    { src: 'https://example.com/photo1.jpg', alt: 'صورة 1' },
    { src: 'https://example.com/photo2.jpg', alt: 'صورة 2' },
    { src: 'https://example.com/photo3.jpg', alt: 'صورة 3' }
  ];

  return (
    <ImageGallery
      images={images}
      preloadNext={3} // حمّل 3 صور قادمة مسبقاً
      className="grid grid-cols-3 gap-4"
    />
  );
}
```

## الإعدادات والتخصيص

### تحديث الإعدادات

```tsx
import { updateConfig } from './image-system';

// تحديث إعدادات النظام
updateConfig({
  maxCacheSize: 100 * 1024 * 1024, // 100MB
  cacheExpiryDays: 7, // أسبوع واحد
  fadeTransitionMs: 500, // 500ms للانتقال
  retryAttempts: 5, // 5 محاولات
  placeholderColor: '#f3f4f6', // رمادي فاتح
  quality: 'high' // جودة عالية افتراضياً
});
```

### مراقبة الأحداث

```tsx
import { imageSystem } from './image-system';

imageSystem.setEventHandlers({
  onLoad: (key, imageData) => {
    console.log(`تم تحميل الصورة: ${key}`);
    console.log(`الحجم: ${imageData.size} bytes`);
  },
  
  onError: (key, error) => {
    console.error(`فشل تحميل الصورة: ${key}`, error);
  },
  
  onCache: (key, size) => {
    console.log(`تم حفظ في الكاش: ${key} - ${size} bytes`);
  },
  
  onPreload: (key) => {
    console.log(`بدء التحميل المسبق: ${key}`);
  }
});
```

## إدارة الكاش

### مراقبة الكاش

```tsx
import { imageSystem } from './image-system';

// احصائيات الكاش
const stats = imageSystem.getCacheStats();
console.log(`حجم الذاكرة: ${stats.memory} bytes`);
console.log(`عدد الملفات: ${stats.entries}`);

// حالة التحميل المسبق
const preloadStatus = imageSystem.getPreloadStatus();
console.log(`في الطابور: ${preloadStatus.total}`);
console.log(`قيد التحميل: ${preloadStatus.preloading}`);
```

### تنظيف الكاش

```tsx
import { imageSystem } from './image-system';

// مسح صورة محددة من الكاش
await imageSystem.invalidateCache('https://example.com/image.jpg');

// مسح كامل للكاش
await imageSystem.invalidateCache();

// مسح طابور التحميل المسبق
imageSystem.clearPreloadQueue();
```

## خيارات التحميل المتقدمة

### خيارات LoadImageOptions

```tsx
interface LoadImageOptions {
  priority?: 'low' | 'medium' | 'high';    // أولوية التحميل
  quality?: 'auto' | 'low' | 'medium' | 'high';  // جودة الصورة
  fallback?: string;                       // صورة بديلة عند الفشل
  placeholder?: string | boolean;          // صورة مؤقتة
  fadeIn?: boolean;                       // تأثير الظهور التدريجي
  retry?: boolean;                        // إعادة المحاولة عند الفشل
  width?: number;                         // العرض المطلوب
  height?: number;                        // الارتفاع المطلوب
}
```

### خيارات PreloadOptions

```tsx
interface PreloadOptions {
  priority?: 'low' | 'medium' | 'high';    // أولوية التحميل المسبق
  quality?: 'auto' | 'low' | 'medium' | 'high';  // جودة الصورة
  immediate?: boolean;                     // تحميل فوري أم في الطابور
}
```

## الإعدادات الافتراضية

```tsx
const defaultConfig = {
  maxCacheSize: 50 * 1024 * 1024,         // 50MB حد أقصى للكاش
  cacheExpiryDays: 30,                    // 30 يوم صلاحية
  memoryExpiryMs: 60 * 60 * 1000,         // ساعة واحدة في الذاكرة
  
  fadeTransitionMs: 300,                  // 300ms للانتقال
  retryAttempts: 3,                       // 3 محاولات
  retryDelayMs: 1000,                     // ثانية واحدة بين المحاولات
  preloadThreshold: 2,                    // ابدأ التحميل عند صورتين
  
  placeholderSize: { width: 400, height: 300 },
  placeholderColor: '#e5e7eb',            // رمادي فاتح
  
  quality: 'auto',                        // جودة تلقائية
  enableWebP: true,                       // تفعيل WebP
  enableLazyLoad: true                    // تفعيل التحميل التدريجي
};
```

## أمثلة متقدمة

### مكون مخصص مع معاينة

```tsx
import { SmartImage, imageSystem } from './image-system';

function ProductImage({ product }: { product: any }) {
  useEffect(() => {
    // تحميل صور المنتجات ذات الصلة مسبقاً
    const relatedImages = product.relatedProducts?.map(p => p.imageUrl) || [];
    imageSystem.preloadImages(relatedImages, { priority: 'low' });
  }, [product]);

  return (
    <div className="product-image-container">
      <SmartImage
        src={product.imageUrl}
        alt={product.name}
        options={{
          priority: 'high',
          fallback: '/images/product-placeholder.jpg',
          width: 600,
          height: 400
        }}
        className="w-full h-96 object-cover rounded-lg shadow-lg"
        onLoadComplete={(isFromCache) => {
          // تتبع الأداء
          analytics.track('product_image_loaded', {
            productId: product.id,
            fromCache: isFromCache
          });
        }}
      />
    </div>
  );
}
```

### تحسين الأداء للمعارض الكبيرة

```tsx
import { LazyImage, imageSystem } from './image-system';

function VirtualizedGallery({ images }: { images: string[] }) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });

  useEffect(() => {
    // تحميل الصور المرئية وما حولها مسبقاً
    const buffer = 5;
    const preloadStart = Math.max(0, visibleRange.start - buffer);
    const preloadEnd = Math.min(images.length, visibleRange.end + buffer);
    
    const urlsToPreload = images.slice(preloadStart, preloadEnd);
    imageSystem.preloadImages(urlsToPreload, { priority: 'medium' });
  }, [visibleRange, images]);

  return (
    <div className="gallery-grid">
      {images.slice(visibleRange.start, visibleRange.end).map((url, index) => (
        <LazyImage
          key={`${url}-${index}`}
          src={url}
          options={{
            priority: index < 3 ? 'high' : 'medium',
            width: 300,
            height: 200
          }}
          className="gallery-item"
        />
      ))}
    </div>
  );
}
```

## الدعم والاستكشاف

### تشخيص المشاكل

```tsx
import { imageSystem, formatBytes } from './image-system';

// مراقبة الأداء
function diagnosePerformance() {
  const cacheStats = imageSystem.getCacheStats();
  const preloadStatus = imageSystem.getPreloadStatus();
  
  console.log('=== تشخيص نظام الصور ===');
  console.log(`حجم الكاش: ${formatBytes(cacheStats.memory)}`);
  console.log(`عدد الصور المحفوظة: ${cacheStats.entries}`);
  console.log(`طابور التحميل المسبق: ${preloadStatus.total}`);
  console.log(`قيد التحميل: ${preloadStatus.preloading}`);
}
```

### التعامل مع الأخطاء

```tsx
// معالج أخطاء شامل
imageSystem.setEventHandlers({
  onError: (key, error) => {
    // تسجيل الخطأ
    console.error(`Image error: ${key}`, error);
    
    // إرسال للمراقبة
    if (window.analytics) {
      window.analytics.track('image_load_error', {
        imageKey: key,
        error: error.message
      });
    }
    
    // تنظيف تلقائي عند تراكم الأخطاء
    if (error.message.includes('cache')) {
      imageSystem.invalidateCache(key);
    }
  }
});
```

## الترقية والصيانة

النظام مصمم ليكون مستقلاً ولا يحتاج صيانة خاصة، لكن يُنصح بـ:

1. **مراقبة دورية** لحجم الكاش وتنظيفه عند الحاجة
2. **تحديث الإعدادات** حسب احتياجات التطبيق
3. **مراجعة الأداء** باستخدام أدوات التشخيص المدمجة

---

هذا النظام جاهز للاستخدام في أي مشروع React/TypeScript مع Tailwind CSS. ما عليك سوى نسخ المجلد والبدء!
