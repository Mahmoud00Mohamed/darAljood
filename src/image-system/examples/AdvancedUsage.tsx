/**
 * أمثلة متقدمة على استخدام نظام تحميل الصور
 * Advanced usage examples for the image loading system
 */

import React, { useState, useEffect } from 'react';
import { EnhancedImage, ProductImage } from '../';
import { usePreloadOnVisible } from '../hooks/useImagePreloader';
import { imageCache } from '../core/ImageCache';

const AdvancedUsageExamples: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [cacheInfo, setCacheInfo] = useState({ size: 0, maxSize: 0, maxAge: 0 });

  // تحميل مسبق عند الظهور
  const conditionalImages = [
    'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg',
    'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg',
  ];
  usePreloadOnVisible(conditionalImages, isVisible, { quality: 90 });

  // مراقبة معلومات التخزين المؤقت
  useEffect(() => {
    const updateCacheInfo = () => {
      setCacheInfo(imageCache.getCacheInfo());
    };

    updateCacheInfo();
    const interval = setInterval(updateCacheInfo, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold text-center">
        أمثلة متقدمة على نظام تحميل الصور
      </h1>

      {/* معلومات التخزين المؤقت */}
      <section className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">معلومات التخزين المؤقت</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{cacheInfo.size}</div>
            <div className="text-sm text-gray-600">صور محفوظة</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{cacheInfo.maxSize}</div>
            <div className="text-sm text-gray-600">الحد الأقصى</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(cacheInfo.maxAge / 60000)}م
            </div>
            <div className="text-sm text-gray-600">مدة الصلاحية</div>
          </div>
        </div>
        <button
          onClick={() => imageCache.clearCache()}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          مسح التخزين المؤقت
        </button>
      </section>

      {/* تحميل مشروط */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">تحميل مشروط للصور</h2>
        <div className="mb-4">
          <button
            onClick={() => setIsVisible(!isVisible)}
            className={`px-4 py-2 rounded transition-colors ${
              isVisible
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            {isVisible ? 'إخفاء الصور' : 'إظهار الصور'}
          </button>
        </div>
        
        {isVisible && (
          <div className="grid grid-cols-2 gap-4">
            {conditionalImages.map((src, index) => (
              <div key={index} className="aspect-square">
                <EnhancedImage
                  src={src}
                  alt={`صورة مشروطة ${index + 1}`}
                  aspectRatio="square"
                  width={300}
                  height={300}
                  quality={90}
                  enableBlurUp={true}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* صور بجودات مختلفة */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">جودات مختلفة للصور</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">جودة منخفضة (60%)</h3>
            <EnhancedImage
              src="https://images.pexels.com/photos/1395306/pexels-photo-1395306.jpeg"
              alt="جودة منخفضة"
              aspectRatio="square"
              width={200}
              height={200}
              quality={60}
            />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">جودة متوسطة (85%)</h3>
            <EnhancedImage
              src="https://images.pexels.com/photos/1395306/pexels-photo-1395306.jpeg"
              alt="جودة متوسطة"
              aspectRatio="square"
              width={200}
              height={200}
              quality={85}
            />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">جودة عالية (95%)</h3>
            <EnhancedImage
              src="https://images.pexels.com/photos/1395306/pexels-photo-1395306.jpeg"
              alt="جودة عالية"
              aspectRatio="square"
              width={200}
              height={200}
              quality={95}
            />
          </div>
        </div>
      </section>

      {/* معالجة الأخطاء */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">معالجة الأخطاء</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">صورة تالفة مع fallback</h3>
            <EnhancedImage
              src="https://invalid-url.com/broken-image.jpg"
              alt="صورة تالفة"
              aspectRatio="square"
              width={200}
              height={200}
              fallbackSrc="https://images.pexels.com/photos/1058775/pexels-photo-1058775.jpeg"
              onError={() => console.log('خطأ في تحميل الصورة')}
            />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">صورة تالفة بدون fallback</h3>
            <EnhancedImage
              src="https://invalid-url.com/broken-image.jpg"
              alt="صورة تالفة بدون fallback"
              aspectRatio="square"
              width={200}
              height={200}
              onError={() => console.log('خطأ في تحميل الصورة')}
            />
          </div>
        </div>
      </section>

      {/* تحسينات الأداء */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">تحسينات الأداء</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">تحميل فوري (Priority)</h3>
            <div className="w-64 h-48">
              <EnhancedImage
                src="https://images.pexels.com/photos/807598/pexels-photo-807598.jpeg"
                alt="تحميل فوري"
                aspectRatio="landscape"
                width={256}
                height={192}
                priority={true}
                quality={90}
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">تحميل كسول (Lazy Loading)</h3>
            <div className="w-64 h-48">
              <EnhancedImage
                src="https://images.pexels.com/photos/13554884/pexels-photo-13554884.jpeg"
                alt="تحميل كسول"
                aspectRatio="landscape"
                width={256}
                height={192}
                priority={false}
                threshold={0.5}
                rootMargin="50px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* تخصيص المظهر */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">تخصيص المظهر</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">بدون تأثير ضبابي</h3>
            <EnhancedImage
              src="https://images.pexels.com/photos/704748/pexels-photo-704748.jpeg"
              alt="بدون تأثير ضبابي"
              aspectRatio="square"
              width={200}
              height={200}
              enableBlurUp={false}
            />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">بدون placeholder</h3>
            <EnhancedImage
              src="https://images.pexels.com/photos/7957747/pexels-photo-7957747.jpeg"
              alt="بدون placeholder"
              aspectRatio="square"
              width={200}
              height={200}
              showPlaceholder={false}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdvancedUsageExamples;