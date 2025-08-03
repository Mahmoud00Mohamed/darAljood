import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud,
  Trash2,
  Download,
  Info,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import imageUploadService, {
  CloudinaryImageData,
} from "../../services/imageUploadService";
import CloudinaryImageUpload from "../forms/CloudinaryImageUpload";

interface CloudinaryImageManagerProps {
  onImageSelect?: (imageData: CloudinaryImageData) => void;
  showUploadSection?: boolean;
  className?: string;
}

const CloudinaryImageManager: React.FC<CloudinaryImageManagerProps> = ({
  onImageSelect,
  showUploadSection = true,
  className = "",
}) => {
  const [uploadedImages, setUploadedImages] = useState<CloudinaryImageData[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [selectedImage, setSelectedImage] =
    useState<CloudinaryImageData | null>(null);
  const [showImageDetails, setShowImageDetails] = useState(false);

  // معالجة رفع صورة جديدة
  const handleImageUpload = (imageData: CloudinaryImageData) => {
    setUploadedImages((prev) => [imageData, ...prev]);
    if (onImageSelect) {
      onImageSelect(imageData);
    }
  };

  // معالجة رفع عدة صور
  const handleMultipleImagesUpload = (imagesData: CloudinaryImageData[]) => {
    setUploadedImages((prev) => [...imagesData, ...prev]);
  };

  // حذف صورة
  const handleDeleteImage = async (imageData: CloudinaryImageData) => {
    setIsLoading(true);
    setError("");

    try {
      const success = await imageUploadService.deleteImage(imageData.publicId);
      if (success) {
        setUploadedImages((prev) =>
          prev.filter((img) => img.publicId !== imageData.publicId)
        );
      } else {
        setError("فشل في حذف الصورة من Cloudinary");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      setError("حدث خطأ أثناء حذف الصورة");
    } finally {
      setIsLoading(false);
    }
  };

  // عرض تفاصيل الصورة
  const handleShowImageDetails = (imageData: CloudinaryImageData) => {
    setSelectedImage(imageData);
    setShowImageDetails(true);
  };

  // تحميل الصورة
  const handleDownloadImage = (imageData: CloudinaryImageData) => {
    const link = document.createElement("a");
    link.href = imageData.url;
    link.download = `${imageData.publicId.split("/").pop()}.${
      imageData.format
    }`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // تنسيق حجم الملف
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* قسم رفع الصور */}
      {showUploadSection && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            رفع صور جديدة إلى Cloudinary
          </h3>
          <CloudinaryImageUpload
            onImageSelect={handleImageUpload}
            onMultipleImagesSelect={handleMultipleImagesUpload}
            multiple={true}
            placeholder="اسحب الصور هنا أو انقر لاختيار عدة صور"
            className="mb-4"
            cropTitle="اقتطاع الصورة"
          />
        </div>
      )}

      {/* عرض رسائل الخطأ */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </motion.div>
      )}

      {/* قائمة الصور المرفوعة */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            الصور المرفوعة ({uploadedImages.length})
          </h3>
          <button
            onClick={() => setUploadedImages([])}
            disabled={uploadedImages.length === 0 || isLoading}
            className="text-sm text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            مسح الكل
          </button>
        </div>

        {uploadedImages.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">لا توجد صور مرفوعة بعد</p>
            <p className="text-sm text-gray-500 mt-1">قم برفع صور لعرضها هنا</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((imageData, index) => (
              <motion.div
                key={imageData.publicId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={imageData.url}
                    alt={`صورة ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>

                <div className="p-3">
                  <p className="text-xs text-gray-600 truncate">
                    {imageData.publicId.split("/").pop()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {imageData.format.toUpperCase()} •{" "}
                    {formatFileSize(imageData.size)}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600">مرفوع بنجاح</span>
                  </div>
                </div>

                {/* أزرار التحكم */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleShowImageDetails(imageData)}
                    className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                    title="عرض التفاصيل"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDownloadImage(imageData)}
                    className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                    title="تحميل"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteImage(imageData)}
                    disabled={isLoading}
                    className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
                    title="حذف"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* زر الاختيار */}
                {onImageSelect && (
                  <button
                    onClick={() => onImageSelect(imageData)}
                    className="absolute bottom-2 left-2 right-2 bg-[#563660] text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#4b2e55]"
                  >
                    اختيار هذه الصورة
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* نافذة تفاصيل الصورة */}
      <AnimatePresence>
        {showImageDetails && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageDetails(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  تفاصيل الصورة
                </h3>
                <button
                  onClick={() => setShowImageDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                <div className="aspect-video mb-6 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={selectedImage.url}
                    alt="معاينة الصورة"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">
                      Public ID:
                    </span>
                    <p className="text-gray-600 break-all">
                      {selectedImage.publicId}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">التنسيق:</span>
                    <p className="text-gray-600">
                      {selectedImage.format.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">الأبعاد:</span>
                    <p className="text-gray-600">
                      {selectedImage.width} × {selectedImage.height}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">الحجم:</span>
                    <p className="text-gray-600">
                      {formatFileSize(selectedImage.size)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">
                      تاريخ الرفع:
                    </span>
                    <p className="text-gray-600">
                      {new Date(selectedImage.createdAt).toLocaleString(
                        "ar-SA"
                      )}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">الرابط:</span>
                    <p className="text-gray-600 break-all text-xs">
                      {selectedImage.url}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleDownloadImage(selectedImage)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    تحميل
                  </button>
                  {onImageSelect && (
                    <button
                      onClick={() => {
                        onImageSelect(selectedImage);
                        setShowImageDetails(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-[#563660] text-white rounded-lg hover:bg-[#4b2e55] transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      اختيار
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CloudinaryImageManager;
