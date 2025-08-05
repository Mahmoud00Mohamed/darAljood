import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  FileImage,
  Crop,
} from "lucide-react";
import ImageCropModal from "../modals/ImageCropModal";

interface ImageUploadWithCropProps {
  onImageSelect: (imageUrl: string, originalFile: File) => void;
  acceptedFormats?: string[];
  maxFileSize?: number; // بالميجابايت
  aspectRatio?: number;
  className?: string;
  placeholder?: string;
  showPreview?: boolean;
  cropTitle?: string;
}

const ImageUploadWithCrop: React.FC<ImageUploadWithCropProps> = ({
  onImageSelect,
  acceptedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  maxFileSize = 10, // 10MB افتراضي
  aspectRatio,
  className = "",
  placeholder = "اسحب الصورة هنا أو انقر للاختيار",
  cropTitle = "اقتطاع الصورة",
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [error, setError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // التحقق من صحة الملف
  const validateFile = (file: File): string | null => {
    // التحقق من نوع الملف
    if (!acceptedFormats.includes(file.type)) {
      return `نوع الملف غير مدعوم. الأنواع المدعومة: ${acceptedFormats
        .map((format) => format.split("/")[1].toUpperCase())
        .join(", ")}`;
    }

    // التحقق من حجم الملف
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxFileSize) {
      return `حجم الملف كبير جداً. الحد الأقصى: ${maxFileSize}MB`;
    }

    return null;
  };

  // معالجة اختيار الملف
  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setSelectedFile(file);

    // إنشاء معاينة
    const reader = new FileReader();
    reader.onload = () => {
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  // معالجة السحب والإفلات
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // معالجة اختيار الملف من المتصفح
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // معالجة اكتمال الاقتطاع
  const handleCropComplete = (croppedImageUrl: string, originalFile: File) => {
    setIsUploading(true);

    // محاكاة تأخير التحميل لتحسين تجربة المستخدم
    setTimeout(() => {
      onImageSelect(croppedImageUrl, originalFile);
      setShowCropModal(false);
      setSelectedFile(null);
      setIsUploading(false);

      // إعادة تعيين input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 500);
  };

  // إلغاء العملية
  const handleCancel = () => {
    setShowCropModal(false);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // فتح متصفح الملفات
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className={`relative ${className}`}>
        {/* منطقة السحب والإفلات */}
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
          className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 cursor-pointer ${
            isDragOver
              ? "border-[#563660] bg-[#563660]/5 scale-[1.02]"
              : error
              ? "border-red-300 bg-red-50"
              : "border-gray-300 bg-gray-50 hover:border-[#563660] hover:bg-[#563660]/5"
          }`}
        >
          {/* أيقونة التحميل */}
          <div className="flex flex-col items-center justify-center text-center">
            <motion.div
              animate={
                isDragOver ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }
              }
              transition={{ duration: 0.2 }}
              className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                isDragOver
                  ? "bg-[#563660] text-white"
                  : error
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {error ? (
                <AlertCircle className="w-6 h-6" />
              ) : isDragOver ? (
                <Upload className="w-6 h-6" />
              ) : (
                <ImageIcon className="w-6 h-6" />
              )}
            </motion.div>

            <h3
              className={`text-lg font-medium mb-2 ${
                error ? "text-red-800" : "text-gray-900"
              }`}
            >
              {isDragOver ? "أفلت الصورة هنا" : placeholder}
            </h3>

            <p
              className={`text-sm mb-4 ${
                error ? "text-red-600" : "text-gray-600"
              }`}
            >
              {error ||
                `الأنواع المدعومة: ${acceptedFormats
                  .map((format) => format.split("/")[1].toUpperCase())
                  .join(", ")} | الحد الأقصى: ${maxFileSize}MB`}
            </p>

            {/* زر الاختيار */}
            <button
              type="button"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                error
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-[#563660] text-white hover:bg-[#4b2e55]"
              }`}
            >
              <FileImage className="w-4 h-4" />
              اختر صورة
            </button>
          </div>

          {/* مؤشر التحميل */}
          {isUploading && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-xl">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-[#563660] border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-sm text-gray-600">جاري المعالجة...</p>
              </div>
            </div>
          )}
        </div>

        {/* معلومات إضافية */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Crop className="w-3 h-3" />
              اقتطاع متقدم
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              جودة عالية
            </span>
          </div>
          {aspectRatio && <span>النسبة المطلوبة: {aspectRatio}:1</span>}
        </div>

        {/* Input مخفي */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* مودال الاقتطاع */}
      <ImageCropModal
        isOpen={showCropModal}
        onClose={handleCancel}
        imageFile={selectedFile}
        onCropComplete={handleCropComplete}
        aspectRatio={aspectRatio}
        title={cropTitle}
      />
    </>
  );
};

export default ImageUploadWithCrop;
