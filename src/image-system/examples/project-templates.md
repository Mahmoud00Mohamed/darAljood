# قوالب المشاريع لدمج نظام الصور

## 🚀 1. مشروع React بسيط

### البنية:
```
my-react-app/
├── src/
│   ├── image-system/          ← نسخ النظام هنا
│   ├── components/
│   │   └── Gallery.tsx
│   ├── App.tsx
│   └── main.tsx
```

### الاستخدام:
```tsx
// src/App.tsx
import React from 'react';
import { SmoothImage } from './image-system';

function App() {
  return (
    <div className="p-8">
      <SmoothImage
        src="https://picsum.photos/600/400"
        alt="صورة تجريبية"
        className="rounded-lg shadow-lg"
      />
    </div>
  );
}

export default App;
```

### خطوات التطبيق:
```bash
# 1. إنشاء مشروع جديد
npx create-react-app my-react-app --template typescript
cd my-react-app

# 2. نسخ نظام الصور
cp -r path/to/image-system src/

# 3. تثبيت Tailwind (اختياري)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 4. تشغيل المشروع
npm start
```

---

## 🛍️ 2. متجر إلكتروني (E-commerce)

### البنية:
```
ecommerce-app/
├── src/
│   ├── shared/
│   │   └── image-system/      ← النظام المشترك
│   ├── features/
│   │   ├── products/
│   │   │   ├── ProductCard.tsx
│   │   │   └── ProductGallery.tsx
│   │   └── user/
│   │       └── UserAvatar.tsx
│   └── App.tsx
```

### مكون منتج:
```tsx
// src/features/products/ProductCard.tsx
import React from 'react';
import { SmoothImage } from '../../shared/image-system';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  fallbackImage?: string;
}

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <SmoothImage
        src={product.image}
        alt={product.name}
        fallback={product.fallbackImage || '/images/product-placeholder.jpg'}
        className="w-full h-48 object-cover"
        size="medium"
        priority="normal"
        onError={(error) => {
          console.warn(`فشل تحميل صورة المنتج ${product.id}:`, error);
        }}
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-green-600 font-bold">${product.price}</p>
      </div>
    </div>
  );
};
```

### معرض منتج:
```tsx
// src/features/products/ProductGallery.tsx
import React, { useEffect, useState } from 'react';
import { SmoothImage, preloadImages } from '../../shared/image-system';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ 
  images, 
  productName 
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // تحميل مسبق لجميع صور المنتج
    preloadImages(images);
  }, [images]);

  return (
    <div className="space-y-4">
      {/* الصورة الرئيسية */}
      <SmoothImage
        src={images[activeIndex]}
        alt={`${productName} - صورة ${activeIndex + 1}`}
        className="w-full h-96 object-cover rounded-lg"
        size="large"
        priority="high"
      />
      
      {/* الصور المصغرة */}
      <div className="flex space-x-2 overflow-x-auto">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`flex-shrink-0 border-2 rounded-lg overflow-hidden ${
              index === activeIndex ? 'border-blue-500' : 'border-gray-200'
            }`}
          >
            <SmoothImage
              src={image}
              alt={`${productName} - مصغرة ${index + 1}`}
              className="w-20 h-20 object-cover"
              size="small"
              priority="low"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
```

---

## 📱 3. شبكة اجتماعية

### مكون منشور:
```tsx
// src/features/posts/PostCard.tsx
import React from 'react';
import { SmoothImage } from '../../shared/image-system';

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  images?: string[];
  timestamp: Date;
}

export const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <div className="bg-white rounded-lg shadow border p-4 space-y-4">
      {/* معلومات الكاتب */}
      <div className="flex items-center space-x-3">
        <SmoothImage
          src={post.author.avatar}
          alt={post.author.name}
          className="w-10 h-10 rounded-full"
          fallback="/images/default-avatar.png"
          size="small"
          priority="high"
        />
        <div>
          <h4 className="font-semibold">{post.author.name}</h4>
          <p className="text-sm text-gray-500">
            {post.timestamp.toLocaleDateString('ar')}
          </p>
        </div>
      </div>
      
      {/* محتوى المنشور */}
      <p>{post.content}</p>
      
      {/* صور المنشور */}
      {post.images && post.images.length > 0 && (
        <div className={`grid gap-2 ${
          post.images.length === 1 ? 'grid-cols-1' :
          post.images.length === 2 ? 'grid-cols-2' :
          'grid-cols-2 md:grid-cols-3'
        }`}>
          {post.images.map((image, index) => (
            <SmoothImage
              key={index}
              src={image}
              alt={`صورة المنشور ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90"
              size="medium"
              priority={index < 2 ? 'high' : 'normal'}
              onClick={() => openImageModal(image)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const openImageModal = (image: string) => {
  // فتح modal لعرض الصورة بحجم كامل
  console.log('Opening image modal for:', image);
};
```

---

## 📰 4. مدونة أو موقع أخبار

### مكون مقال:
```tsx
// src/features/articles/ArticleCard.tsx
import React from 'react';
import { SmoothImage } from '../../shared/image-system';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  author: string;
  publishDate: Date;
  category: string;
}

export const ArticleCard: React.FC<{ article: Article }> = ({ article }) => {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <SmoothImage
        src={article.coverImage}
        alt={article.title}
        className="w-full h-48 object-cover"
        size="medium"
        priority="normal"
        fallback="/images/article-placeholder.jpg"
      />
      
      <div className="p-6">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {article.category}
          </span>
          <time>{article.publishDate.toLocaleDateString('ar')}</time>
        </div>
        
        <h2 className="text-xl font-bold mb-2 line-clamp-2">
          {article.title}
        </h2>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {article.excerpt}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">بواسطة {article.author}</span>
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            اقرأ المزيد ←
          </button>
        </div>
      </div>
    </article>
  );
};
```

---

## 🏠 5. موقع عقارات

### مكون عقار:
```tsx
// src/features/properties/PropertyCard.tsx
import React, { useState } from 'react';
import { SmoothImage, preloadImages } from '../../shared/image-system';

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
  features: string[];
}

export const PropertyCard: React.FC<{ property: Property }> = ({ property }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // تحميل مسبق لجميع صور العقار عند hover
  const handleMouseEnter = () => {
    preloadImages(property.images.slice(1)); // تحميل باقي الصور
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      onMouseEnter={handleMouseEnter}
    >
      <div className="relative">
        <SmoothImage
          src={property.images[currentImageIndex]}
          alt={`${property.title} - صورة ${currentImageIndex + 1}`}
          className="w-full h-64 object-cover"
          size="medium"
          priority="normal"
        />
        
        {/* أزرار التنقل */}
        {property.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
            >
              ←
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
            >
              →
            </button>
          </>
        )}
        
        {/* مؤشر الصور */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {property.images.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
        <p className="text-gray-600 mb-2">{property.location}</p>
        <p className="text-2xl font-bold text-green-600 mb-3">
          ${property.price.toLocaleString()}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {property.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
            >
              {feature}
            </span>
          ))}
          {property.features.length > 3 && (
            <span className="text-gray-500 text-sm">
              +{property.features.length - 3} المزيد
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
```

---

## 🔧 6. إعدادات خاصة لكل نوع مشروع

### متجر إلكتروني:
```tsx
// إعدادات محسنة للأداء
const ecommerceImageLoader = new ImageLoader({
  cache: {
    maxAge: 12 * 60 * 60 * 1000, // 12 ساعة
    maxSize: 300, // حجم كاش أكبر
  },
  preload: {
    maxConcurrent: 5, // تحميل متوازي أكثر
  },
  optimization: {
    sizes: {
      small: 200,   // للمصغرات
      medium: 600,  // لكروت المنتجات
      large: 1200,  // للمعرض
    },
  },
});
```

### شبكة اجتماعية:
```tsx
// إعدادات للتفاعل السريع
const socialImageLoader = new ImageLoader({
  cache: {
    maxAge: 6 * 60 * 60 * 1000, // 6 ساعات
    maxSize: 500, // كاش كبير للصور الكثيرة
  },
  display: {
    fadeTransition: 200, // انتقالات سريعة
  },
  retry: {
    maxAttempts: 2, // محاولات أقل للسرعة
  },
});
```

### مدونة:
```tsx
// إعدادات للقراءة المريحة
const blogImageLoader = new ImageLoader({
  cache: {
    maxAge: 24 * 60 * 60 * 1000, // 24 ساعة
    maxSize: 100, // كاش أصغر
  },
  display: {
    fadeTransition: 500, // انتقالات أبطأ وأنعم
  },
  optimization: {
    sizes: {
      small: 300,
      medium: 800,
      large: 1600, // دقة عالية للمقالات
    },
  },
});
```

هذه القوالب توضح كيفية دمج نظام الصور في أنواع مختلفة من المشاريع مع التخصيصات المناسبة لكل نوع.
