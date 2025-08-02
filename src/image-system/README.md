# نظام تحميل الصور السريع - Fast Image Loading System

نظام متقدم لتحميل الصور مع تحسينات الأداء والتخزين المؤقت.

## المميزات

- **تحميل تدريجي**: تحميل صور بجودة منخفضة أولاً ثم عالية الجودة
- **تخزين مؤقت ذكي**: نظام تخزين مؤقت للصور مع إدارة الذاكرة
- **تحسين تلقائي**: تحسين URLs للصور من Pexels تلقائياً
- **Lazy Loading**: تحميل الصور عند الحاجة فقط
- **Intersection Observer**: مراقبة ظهور العناصر في الشاشة
- **Blur-up Effect**: تأثير التدرج من الضبابية للوضوح
- **تحميل مسبق**: إمكانية تحميل الصور مسبقاً للصور المهمة
- **معالجة الأخطاء**: نظام fallback للصور التالفة
- **دعم RTL**: دعم كامل للغات من اليمين لليسار

## كيفية الاستخدام

### 1. نسخ الملفات

انسخ مجلد `image-system` بالكامل إلى مشروعك.

### 2. تثبيت التبعيات المطلوبة

```bash
npm install framer-motion react
```

### 3. استيراد المكونات

```tsx
import { EnhancedImage, ProductImage } from './image-system';
import { useImagePreloader, usePreloadCriticalImages } from './image-system/hooks';
```

### 4. استخدام المكونات

```tsx
// للصور العادية مع تحسينات
<EnhancedImage
  src="https://example.com/image.jpg"
  alt="وصف الصورة"
  width={400}
  height={300}
  priority={true}
  enableBlurUp={true}
/>

// للصور المنتجات مع إمكانية التكبير
<ProductImage
  src="https://example.com/product.jpg"
  alt="منتج"
  showZoom={true}
  aspectRatio="square"
/>

// تحميل مسبق للصور المهمة
const images = ['image1.jpg', 'image2.jpg'];
usePreloadCriticalImages(images);
```

## الإعدادات

يمكنك تخصيص الإعدادات في `ImageCache.ts`:

- `maxCacheSize`: الحد الأقصى لعدد الصور المخزنة (افتراضي: 50)
- `maxAge`: مدة صلاحية الصور المخزنة (افتراضي: 30 دقيقة)

## التوافق

- React 18+
- TypeScript
- Framer Motion
- المتصفحات الحديثة التي تدعم Intersection Observer

## الملاحظات

- النظام محسن للعمل مع Pexels ولكن يعمل مع أي مصدر صور
- يدعم تحسين الأداء للأجهزة المحمولة
- يتضمن نظام placeholder مخصص
- يدعم الوضع المظلم والفاتح