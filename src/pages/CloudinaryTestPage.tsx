import React from "react";
import { motion } from "framer-motion";
import R2ImageManager from "../components/ui/CloudinaryImageManager";
import { CloudinaryImageData } from "../services/imageUploadService";

const R2TestPage: React.FC = () => {
  const handleImageSelect = (imageData: CloudinaryImageData) => {
    alert(`تم اختيار الصورة من R2: ${imageData.publicId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 mobile-content-padding">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light text-gray-900 mb-4">
              اختبار تكامل Cloudflare R2
            </h1>
            <p className="text-lg text-gray-600">
              صفحة اختبار لرفع وإدارة الصور عبر Cloudflare R2
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <R2ImageManager
              onImageSelect={handleImageSelect}
              showUploadSection={true}
              autoAddToLibrary={false}
            />
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              معلومات التكامل
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• يتم رفع الصور مباشرة إلى Cloudflare R2 عبر الباك إند</li>
              <li>• يمكن رفع صورة واحدة أو عدة صور في نفس الوقت</li>
              <li>• يتم حفظ معلومات الصور (URL, Key, الحجم، إلخ)</li>
              <li>• يمكن حذف الصور من R2 مباشرة</li>
              <li>• يمكن عرض تفاصيل كاملة لكل صورة</li>
              <li>• تخزين آمن وسريع مع Cloudflare R2</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default R2TestPage;