# نظام معرض الصور المتقدم

نظام معرض صور متطور مبني بـ React و TypeScript مع دعم كامل للغة العربية.

## المميزات

✅ **معرض صور تفاعلي** مع إمكانية التكبير والعرض التفصيلي  
✅ **نظام فلترة متقدم** حسب الفئات  
✅ **تأثيرات حركية جميلة** باستخدام Framer Motion  
✅ **تصميم متجاوب** لجميع الأجهزة  
✅ **دعم كامل للغة العربية** مع اتجاه RTL  
✅ **سهولة التخصيص والتركيب**  

## التركيب

1. انسخ مجلد `gallery-system` إلى مشروعك
2. تأكد من وجود المكتبات المطلوبة:

```bash
npm install framer-motion lucide-react
# أو
yarn add framer-motion lucide-react
```

## الاستخدام

```typescript
import { Gallery } from './gallery-system/src';

const photos = [
  {
    id: '1',
    src: 'https://example.com/image1.jpg',
    title: 'عنوان الصورة',
    category: 'الفئة',
    description: 'وصف الصورة'
  }
];

const categories = ['الكل', 'الفئة الأولى', 'الفئة الثانية'];

function App() {
  return (
    <Gallery 
      photos={photos}
      categories={categories}
      rtl={true}
    />
  );
}
```

## التخصيص

يمكنك تخصيص الألوان والتصميم عبر تمرير `className` أو تعديل ملف CSS.

## المتطلبات

- React 18+ أو 19+
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

## الدعم

هذا النظام مصمم ليكون مستقل ومرن، يمكن استخدامه في أي مشروع React.
