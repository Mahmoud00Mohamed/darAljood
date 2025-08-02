/**
 * أمثلة على الاستخدام الأساسي لنظام تحميل الصور
 * Basic usage examples for the image loading system
 */

import React from 'react';
import { EnhancedImage, ProductImage } from '../';
import { useImagePreloader, usePreloadCriticalImages } from '../hooks/useImagePreloader';

const BasicUsageExamples: React.FC = () => {
  // تحميل مسبق للصور المهمة
  const criticalImages = [
    'https://images.pexels.com/photos/1058775/pexels-photo-1058775.jpeg',
    'https://images.pexels.com/photos/931162/pexels-photo-931162.jpeg',
  ];
  usePreloadCriticalImages(criticalImages);

  // تحميل مسبق للصور العادية
  const regularImages = [
    'https://images.pexels.com/photos/132474/pexels-photo-132474.jpeg',
    'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg',
  ];
  useImagePreloader(regularImages, { priority: false });

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold text-center">
        أمثلة على استخدام نظام تحميل الصور
      </h1>

      {/* مثال 1: صورة محسنة أساسية */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">1. صورة محسنة أساسية</h2>
        <div className="w-64 h-64">
          <EnhancedImage
            src="https://images.pexels.com/photos/1058775/pexels-photo-1058775.jpeg"
            alt="مثال على صورة محسنة"
            width={256}
            height={256}
            aspectRatio="square"
            priority={true}
            enableBlurUp={true}
            showPlaceholder={true}
          />
        </div>
      </section>

      {/* مثال 2: صورة منتج مع تكبير */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">2. صورة منتج مع إمكانية التكبير</h2>
        <div className="w-80 h-80">
          <ProductImage
            src="https://images.pexels.com/photos/931162/pexels-photo-931162.jpeg"
            alt="منتج مع تكبير"
            showZoom={true}
            aspectRatio="square"
            width={320}
            height={320}
            quality={90}
          />
        </div>
      </section>

      {/* مثال 3: شبكة من الصور */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">3. شبكة من الصور</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {regularImages.map((src, index) => (
            <div key={index} className="aspect-square">
              <EnhancedImage
                src={src}
                alt={`صورة ${index + 1}`}
                aspectRatio="square"
                width={200}
                height={200}
                quality={80}
                enableBlurUp={true}
                priority={index < 2}
              />
            </div>
          ))}
        </div>
      </section>

      {/* مثال 4: صور بنسب مختلفة */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">4. نسب مختلفة للصور</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="aspect-square">
            <EnhancedImage
              src="https://images.pexels.com/photos/132474/pexels-photo-132474.jpeg"
              alt="مربع"
              aspectRatio="square"
              width={300}
              height={300}
            />
          </div>
          <div className="aspect-[3/4]">
            <EnhancedImage
              src="https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg"
              alt="عمودي"
              aspectRatio="portrait"
              width={300}
              height={400}
            />
          </div>
          <div className="aspect-[4/3]">
            <EnhancedImage
              src="https://images.pexels.com/photos/1058775/pexels-photo-1058775.jpeg"
              alt="أفقي"
              aspectRatio="landscape"
              width={400}
              height={300}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default BasicUsageExamples;