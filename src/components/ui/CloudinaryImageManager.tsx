import React, { useState } from "react";
import {
  Cloud,
  Trash2,
  Download,
  Info,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import imageUploadService, {
  CloudinaryImageData,
} from "../../services/imageUploadService";
import CloudinaryImageUpload from "../forms/CloudinaryImageUpload";
import Modal from "./Modal";
import { useModal } from "../../hooks/useModal";

interface CloudinaryImageManagerProps {
  onImageSelect?: (imageData: CloudinaryImageData) => void;
  showUploadSection?: boolean;
  className?: string;
  autoAddToLibrary?: boolean;
}

const CloudinaryImageManager: React.FC<CloudinaryImageManagerProps> = ({
  onImageSelect,
  showUploadSection = true,
  className = "",
  autoAddToLibrary = false,
}) => {
  const [uploadedImages, setUploadedImages] = useState<CloudinaryImageData[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [selectedImage, setSelectedImage] =
    useState<CloudinaryImageData | null>(null);

  const imageDetailsModal = useModal();

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
    imageDetailsModal.openModal();
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
            autoAddToLibrary={autoAddToLibrary}
          />
        </div>
      )}

      {/* عرض رسائل الخطأ */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </div>
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
            {uploadedImages.map((imageData) => (
              <div
                key={imageData.publicId}
                className="relative group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={imageData.url}
                    alt={`صورة مرفوعة`}
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* نافذة تفاصيل الصورة */}
      {selectedImage && (
        <Modal
          isOpen={imageDetailsModal.isOpen}
          shouldRender={imageDetailsModal.shouldRender}
          onClose={imageDetailsModal.closeModal}
          title="تفاصيل الصورة"
          size="lg"
          className="max-h-[90vh] overflow-y-auto"
          options={imageDetailsModal.options}
        >
          <div className="aspect-video mb-6 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={selectedImage.url}
              alt="معاينة الصورة"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Public ID:</span>
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
              <span className="font-medium text-gray-700">تاريخ الرفع:</span>
              <p className="text-gray-600">
                {(() => {
                  const date = new Date(selectedImage.createdAt);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  const hours = String(date.getHours()).padStart(2, "0");
                  const minutes = String(date.getMinutes()).padStart(2, "0");
                  return `${year}/${month}/${day} ${hours}:${minutes}`;
                })()}
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
                  imageDetailsModal.closeModal();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-[#563660] text-white rounded-lg hover:bg-[#4b2e55] transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                اختيار
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CloudinaryImageManager;
