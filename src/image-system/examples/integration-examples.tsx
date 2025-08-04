import React, { useEffect, useState } from "react";
import {
  SmoothImage,
  loadImage,
  preloadImages,
  clearImageCache,
  type LoadImageOptions,
} from "../index";

// مثال 1: استخدام أساسي بسيط
export const BasicExample: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">مثال أساسي</h2>
      <SmoothImage
        src="https://picsum.photos/400/300?random=1"
        alt="صورة تجريبية"
        className="w-full max-w-md rounded-lg shadow-lg"
      />
    </div>
  );
};

// مثال 2: معرض صور مع تحميل مسبق
export const GalleryExample: React.FC = () => {
  const images = [
    "https://picsum.photos/400/300?random=10",
    "https://picsum.photos/400/300?random=11",
    "https://picsum.photos/400/300?random=12",
    "https://picsum.photos/400/300?random=13",
    "https://picsum.photos/400/300?random=14",
    "https://picsum.photos/400/300?random=15",
  ];

  useEffect(() => {
    // تحميل مسبق لجميع الصور
    preloadImages(images.slice(2)); // تحميل الصور من الثالثة فما فوق
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">معرض الصور</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((src, index) => (
          <SmoothImage
            key={src}
            src={src}
            alt={`صورة ${index + 1}`}
            className="w-full h-48 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            priority={index < 2 ? "high" : "normal"}
            size="medium"
            onLoad={() => console.log(`تم تحميل الصورة ${index + 1}`)}
          />
        ))}
      </div>
    </div>
  );
};

// مثال 3: صورة بروفايل مع fallback
export const ProfileExample: React.FC = () => {
  const [userImage, setUserImage] = useState<string>("");

  return (
    <div className="p-4 flex items-center space-x-4">
      <SmoothImage
        src={userImage || "https://picsum.photos/100/100?random=user"}
        alt="صورة المستخدم"
        className="w-20 h-20 rounded-full border-2 border-gray-300"
        fallback="https://via.placeholder.com/100x100/cccccc/666666?text=User"
        size="small"
        priority="high"
      />
      <div>
        <h3 className="text-lg font-semibold">اسم المستخدم</h3>
        <button
          onClick={() =>
            setUserImage("https://picsum.photos/100/100?random=" + Date.now())
          }
          className="text-blue-500 text-sm hover:underline"
        >
          تغيير الصورة
        </button>
      </div>
    </div>
  );
};

// مثال 4: تحميل برمجي للصور
export const ProgrammaticExample: React.FC = () => {
  const [imageData, setImageData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRandomImage = async () => {
    setLoading(true);
    setError(null);
    setImageData(null);

    const options: LoadImageOptions = {
      size: "large",
      priority: "high",
      onProgress: (progress) => {
        console.log(`تقدم التحميل: ${progress}%`);
      },
      onError: (err) => {
        setError(err.message);
      },
    };

    try {
      const result = await loadImage(
        `https://picsum.photos/600/400?random=${Date.now()}`,
        options
      );

      if (result.state === "loaded" && result.data) {
        setImageData(result.data);
      } else if (result.error) {
        setError(result.error.message);
      }
    } catch (err) {
      setError("فشل في تحميل الصورة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">تحميل برمجي</h2>

      <button
        onClick={loadRandomImage}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded mb-4"
      >
        {loading ? "جاري التحميل..." : "تحميل صورة جديدة"}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          خطأ: {error}
        </div>
      )}

      {imageData && (
        <div className="border rounded-lg overflow-hidden max-w-md">
          <img
            src={imageData}
            alt="صورة محملة برمجياً"
            className="w-full h-auto"
          />
        </div>
      )}
    </div>
  );
};

// مثال 5: إدارة الكاش
export const CacheManagementExample: React.FC = () => {
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClearCache = async () => {
    await clearImageCache();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">إدارة الكاش</h2>

      <div className="space-y-4">
        <button
          onClick={handleClearCache}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          مسح الكاش
        </button>

        {cacheCleared && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            تم مسح الكاش بنجاح!
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>• الصور محفوظة في الكاش للوصول السريع</p>
          <p>• مسح الكاش يؤدي إلى إعادة تحميل الصور</p>
          <p>• الكاش ينظف نفسه تلقائياً</p>
        </div>
      </div>
    </div>
  );
};

// مثال 6: مكون wrapper مخصص
interface CustomImageProps {
  src: string;
  alt: string;
  variant?: "card" | "hero" | "thumbnail";
  onClick?: () => void;
}

export const CustomImage: React.FC<CustomImageProps> = ({
  src,
  alt,
  variant = "card",
  onClick,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "hero":
        return "w-full h-96 object-cover";
      case "thumbnail":
        return "w-16 h-16 object-cover rounded";
      case "card":
      default:
        return "w-full h-48 object-cover rounded-lg";
    }
  };

  const getVariantPriority = () => {
    return variant === "hero" ? "high" : "normal";
  };

  return (
    <div className={onClick ? "cursor-pointer" : ""} onClick={onClick}>
      <SmoothImage
        src={src}
        alt={alt}
        className={`${getVariantClasses()} transition-transform hover:scale-105`}
        priority={getVariantPriority()}
        size={variant === "thumbnail" ? "small" : "medium"}
        fadeTransition={300}
      />
    </div>
  );
};

// مثال شامل يجمع كل الأمثلة
export const IntegrationExamples: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        أمثلة دمج نظام الصور
      </h1>

      <div className="space-y-12">
        <BasicExample />
        <hr className="border-gray-300" />

        <GalleryExample />
        <hr className="border-gray-300" />

        <ProfileExample />
        <hr className="border-gray-300" />

        <ProgrammaticExample />
        <hr className="border-gray-300" />

        <CacheManagementExample />
        <hr className="border-gray-300" />

        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">مكون مخصص</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CustomImage
              src="https://picsum.photos/300/200?random=20"
              alt="بطاقة"
              variant="card"
            />
            <CustomImage
              src="https://picsum.photos/100/100?random=21"
              alt="مصغرة"
              variant="thumbnail"
            />
            <CustomImage
              src="https://picsum.photos/800/400?random=22"
              alt="رئيسية"
              variant="hero"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationExamples;
