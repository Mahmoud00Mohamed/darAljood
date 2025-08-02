# ImageSystem - Advanced Image Loading and Caching System

نظام متقدم لإدارة الصور مع تحميل ذكي وتخزين مؤقت محسّن، مصمم ليكون قابلاً للاستخدام في جميع مشاريعك.

## الميزات الرئيسية

- **تخزين مؤقت ذكي**: نظام LRU cache مع إدارة تلقائية للذاكرة
- **تحميل تدريجي**: تأثير blur-to-sharp للانتقال السلس
- **Lazy Loading**: تحميل الصور عند الحاجة مع Intersection Observer
- **نظام أولويات**: تحميل الصور المهمة أولاً
- **معالجة الأخطاء**: صور احتياطية وإعادة المحاولة
- **تحسين الأداء**: تحميل متوازي مع حد أقصى للطلبات المتزامنة

## كيفية الاستخدام

### 1. نسخ النظام إلى مشروعك

انسخ مجلد `ImageSystem` بالكامل إلى مشروعك:

```
src/
  ImageSystem/
    components/
    hooks/
    services/
    types/
    utils/
    index.ts
    README.md
```

### 2. الاستخدام الأساسي

```tsx
import { AdvancedImage } from './ImageSystem';

function MyComponent() {
  return (
    <AdvancedImage
      src="https://example.com/image.jpg"
      alt="وصف الصورة"
      className="w-full h-64 object-cover"
      priority="high"
      blur={true}
      lazy={false}
    />
  );
}
```

### 3. معرض الصور

```tsx
import { ImageGallery } from './ImageSystem';

const images = [
  { src: 'image1.jpg', alt: 'صورة 1', priority: 'high' },
  { src: 'image2.jpg', alt: 'صورة 2', priority: 'medium' },
  // ...
];

function Gallery() {
  return (
    <ImageGallery
      images={images}
      columns={3}
      gap={4}
    />
  );
}
```

### 4. الصور المتجاوبة

```tsx
import { ResponsiveImage } from './ImageSystem';

function ResponsiveComponent() {
  return (
    <ResponsiveImage
      src="large-image.jpg"
      alt="صورة متجاوبة"
      breakpoints={[320, 640, 1024, 1280]}
      className="w-full"
    />
  );
}
```

## خصائص AdvancedImage

| الخاصية | النوع | الافتراضي | الوصف |
|---------|------|----------|-------|
| `src` | string | - | رابط الصورة (مطلوب) |
| `alt` | string | - | النص البديل (مطلوب) |
| `priority` | 'high' \| 'medium' \| 'low' | 'medium' | أولوية التحميل |
| `lazy` | boolean | true | تفعيل lazy loading |
| `blur` | boolean | true | تأثير الضبابية أثناء التحميل |
| `fallback` | string | - | صورة احتياطية عند الفشل |
| `placeholder` | string | - | صورة مؤقتة مخصصة |
| `onLoad` | function | - | callback عند اكتمال التحميل |
| `onError` | function | - | callback عند حدوث خطأ |

## إعدادات النظام

يمكنك تخصيص إعدادات النظام من خلال:

```tsx
import { ImageCache, ImagePreloader } from './ImageSystem';

// تخصيص إعدادات التخزين المؤقت
const cache = ImageCache.getInstance();
// cache.clear(); // مسح التخزين المؤقت

// تخصيص إعدادات التحميل المسبق
const preloader = ImagePreloader.getInstance();
// preloader.preloadBatch(urls, { priority: 'high' });
```

## إحصائيات النظام

```tsx
import { ImageCache, ImagePreloader } from './ImageSystem';

function Stats() {
  const cache = ImageCache.getInstance();
  const preloader = ImagePreloader.getInstance();
  
  const cacheStats = cache.getStats();
  const preloaderStats = preloader.getStats();
  
  return (
    <div>
      <p>الصور المحفوظة: {cacheStats.size}</p>
      <p>معدل النجاح: {(cacheStats.hitRate * 100).toFixed(1)}%</p>
      <p>قيد التحميل: {preloaderStats.loading}</p>
    </div>
  );
}
```

## التكامل مع خدمات تحسين الصور

يمكنك ربط النظام بخدمات مثل Cloudinary أو ImageKit من خلال تعديل `utils/imageOptimization.ts`:

```tsx
export function generateOptimizedUrl(originalUrl: string, options: ImageOptimizationOptions = {}) {
  // مثال للتكامل مع Cloudinary
  return `https://res.cloudinary.com/your-cloud/image/fetch/w_${options.width || 'auto'},q_${options.quality || 'auto'}/${encodeURIComponent(originalUrl)}`;
}
```

## المتطلبات

- React 18+
- TypeScript (اختياري لكن مُوصى به)
- Tailwind CSS للتصميم

## الدعم

النظام مصمم ليعمل مع جميع المتصفحات الحديثة ويتضمن fallbacks للمتصفحات القديمة.