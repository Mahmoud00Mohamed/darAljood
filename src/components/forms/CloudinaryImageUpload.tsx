import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  AlertCircle,
  FileImage,
  Crop,
  Loader2,
  Cloud,
  Trash2,
} from "lucide-react";
import imageUploadService, {
  CloudinaryImageData,
} from "../../services/imageUploadService";
import ImageCropModal from "../modals/ImageCropModal";
import { useImageLibrary } from "../../context/ImageLibraryContext";

interface CloudinaryImageUploadProps {
  onImageSelect: (imageData: CloudinaryImageData, originalFile?: File) => void;
  acceptedFormats?: string[];
  maxFileSize?: number; // بالميجابايت
  className?: string;
  placeholder?: string;
  showPreview?: boolean;
  multiple?: boolean;
  onMultipleImagesSelect?: (imagesData: CloudinaryImageData[]) => void;
  aspectRatio?: number;
  cropTitle?: string;
  onUploadStateChange?: (isUploading: boolean) => void;
  autoAddToLibrary?: boolean; // خيار لإضافة الصور تلقائياً للمكتبة
}

const CloudinaryImageUpload: React.FC<CloudinaryImageUploadProps> = ({
  onImageSelect,
  onMultipleImagesSelect,
  acceptedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  maxFileSize = 10, // 10MB افتراضي
  className = "",
  placeholder = "اسحب الصورة هنا أو انقر للاختيار",
  multiple = false,
  aspectRatio,
  cropTitle = "اقتطاع الصورة",
  onUploadStateChange,
  autoAddToLibrary = true,
}) => {
  const { addUserImage, selectImage } = useImageLibrary();
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [uploadedImages, setUploadedImages] = useState<CloudinaryImageData[]>(
    []
  );
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedFileForCrop, setSelectedFileForCrop] = useState<File | null>(
    null
  );

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

  // تحويل Data URL إلى File
  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // معالجة اكتمال القص
  const handleCropComplete = async (
    croppedImageUrl: string,
    originalFile: File
  ) => {
    try {
      // إذا كان autoAddToLibrary مفعل، ارفع للسيرفر
      if (autoAddToLibrary) {
        // تحويل الصورة المقتصة إلى File
        const croppedFile = dataURLtoFile(croppedImageUrl, originalFile.name);

        // رفع الصورة المقتصة
        await handleFileUpload([croppedFile]);
      } else {
        // إنشاء بيانات وهمية للمعاينة فقط
        const mockImageData: CloudinaryImageData = {
          url: croppedImageUrl,
          publicId: `temp-${Date.now()}`,
          width: 400,
          height: 400,
          format: "png",
          size: originalFile.size,
          createdAt: new Date().toISOString(),
          originalName: originalFile.name,
        };

        setUploadedImages([mockImageData]);
        onImageSelect(mockImageData, originalFile);
        setUploadProgress("تم تحضير الصورة للمعاينة!");

        // إخفاء رسالة النجاح بعد 3 ثوان
        setTimeout(() => {
          setUploadProgress("");
        }, 3000);
      }

      setShowCropModal(false);
      setSelectedFileForCrop(null);
    } catch (error) {
      console.error("Error processing cropped image:", error);
      setError("حدث خطأ أثناء معالجة الصورة المقتصة");
    }
  };

  // معالجة إلغاء القص
  const handleCropCancel = () => {
    setShowCropModal(false);
    setSelectedFileForCrop(null);

    // إعادة تعيين input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // معالجة رفع الملفات
  const handleFileUpload = async (files: File[]) => {
    setError("");
    setIsUploading(true);
    onUploadStateChange?.(true);
    setUploadProgress("جاري التحضير...");

    try {
      // التحقق من صحة جميع الملفات
      for (const file of files) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          setIsUploading(false);
          return;
        }
      }

      if (multiple && files.length > 1) {
        // رفع عدة صور
        setUploadProgress(`جاري رفع ${files.length} صورة...`);
        const uploadedData = await imageUploadService.uploadMultipleImages(
          files
        );

        // إضافة الصور إلى المكتبة تلقائياً إذا كان مفعل
        if (autoAddToLibrary) {
          uploadedData.forEach((imageData) => {
            addUserImage(imageData);
            selectImage(imageData, "user");
          });
        }

        setUploadedImages(uploadedData);
        if (onMultipleImagesSelect) {
          onMultipleImagesSelect(uploadedData);
        }
        setUploadProgress("تم رفع جميع الصور بنجاح!");
      } else {
        // رفع صورة واحدة
        setUploadProgress("جاري رفع الصورة...");
        const uploadedData = await imageUploadService.uploadSingleImage(
          files[0]
        );

        // إضافة الصورة إلى المكتبة تلقائياً إذا كان مفعل
        if (autoAddToLibrary) {
          addUserImage(uploadedData);
          selectImage(uploadedData, "user");
        }

        setUploadedImages([uploadedData]);
        onImageSelect(uploadedData, files[0]);
        setUploadProgress("تم رفع الصورة بنجاح!");
      }

      // إعادة تعيين input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // إخفاء رسالة النجاح بعد 3 ثوان
      setTimeout(() => {
        setUploadProgress("");
      }, 3000);
    } catch (error) {
      console.error("Upload error:", error);
      setError(
        error instanceof Error ? error.message : "حدث خطأ أثناء رفع الصورة"
      );
    } finally {
      setIsUploading(false);
      onUploadStateChange?.(false);
    }
  };

  // معالجة اختيار الملفات (مع القص للصورة الواحدة)
  const handleFileSelection = (files: File[]) => {
    // التحقق من صحة جميع الملفات
    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    if (multiple && files.length > 1) {
      // رفع عدة صور مباشرة (بدون قص)
      handleFileUpload(files);
    } else if (files.length === 1) {
      // صورة واحدة - فتح أداة القص
      setSelectedFileForCrop(files[0]);
      setShowCropModal(true);
    }
  };

  // معالجة اختيار الملف من المتصفح
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(Array.from(files));
    }
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
      handleFileSelection(files);
    }
  };

  // فتح متصفح الملفات
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // حذف صورة مرفوعة
  const handleDeleteImage = async (
    imageData: CloudinaryImageData,
    index: number
  ) => {
    // إذا كانت الصورة مؤقتة (لم ترفع للسيرفر بعد)، احذفها محلياً فقط
    if (imageData.publicId.startsWith("temp-")) {
      setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      // إذا كانت مرفوعة للسيرفر، احذفها من Cloudinary
      try {
        const success = await imageUploadService.deleteImage(
          imageData.publicId
        );
        if (success) {
          setUploadedImages((prev) => prev.filter((_, i) => i !== index));
        } else {
          console.warn("Failed to delete image from Cloudinary");
        }
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }
  };

  return (
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
            : isUploading
            ? "border-blue-300 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:border-[#563660] hover:bg-[#563660]/5"
        }`}
      >
        {/* أيقونة التحميل */}
        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            animate={
              isDragOver
                ? { scale: 1.1, rotate: 5 }
                : isUploading
                ? { scale: 1.05 }
                : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.2 }}
            className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
              isDragOver
                ? "bg-[#563660] text-white"
                : error
                ? "bg-red-100 text-red-600"
                : isUploading
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : error ? (
              <AlertCircle className="w-6 h-6" />
            ) : isDragOver ? (
              <Upload className="w-6 h-6" />
            ) : (
              <Cloud className="w-6 h-6" />
            )}
          </motion.div>

          <h3
            className={`text-lg font-medium mb-2 ${
              error
                ? "text-red-800"
                : isUploading
                ? "text-blue-800"
                : "text-gray-900"
            }`}
          >
            {isUploading
              ? "جاري الرفع..."
              : isDragOver
              ? "أفلت الصورة هنا"
              : placeholder}
          </h3>

          <p
            className={`text-sm mb-4 ${
              error
                ? "text-red-600"
                : isUploading
                ? "text-blue-600"
                : "text-gray-600"
            }`}
          >
            {error ||
              uploadProgress ||
              `الأنواع المدعومة: ${acceptedFormats
                .map((format) => format.split("/")[1].toUpperCase())
                .join(", ")} | الحد الأقصى: ${maxFileSize}MB`}
          </p>

          {/* زر الاختيار */}
          {!isUploading && (
            <button
              type="button"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                error
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-[#563660] text-white hover:bg-[#4b2e55]"
              }`}
            >
              <FileImage className="w-4 h-4" />
              {multiple ? "اختر صور" : "اختر صورة"}
            </button>
          )}
        </div>

        {/* مؤشر التحميل */}
        {isUploading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-xl">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-[#563660] border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm text-gray-600">
                {autoAddToLibrary
                  ? uploadProgress
                  : "جاري تحضير الصورة للمعاينة..."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* عرض الصور المرفوعة */}
      <AnimatePresence>
        {uploadedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {uploadedImages.map((imageData, index) => (
              <motion.div
                key={imageData.publicId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative group bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <img
                  src={imageData.url}
                  alt={`صورة مرفوعة ${index + 1}`}
                  className="w-full h-24 object-cover"
                />
                <div className="p-2">
                  <p className="text-xs text-gray-600 truncate">
                    {imageData.format.toUpperCase()} •{" "}
                    {Math.round(imageData.size / 1024)}KB
                  </p>
                  {imageData.publicId.startsWith("temp-") ? (
                    <p className="text-xs text-blue-600 mt-1">
                      جاهز للتأكيد ⏳
                    </p>
                  ) : (
                    <p className="text-xs text-green-600 mt-1">
                      تم الرفع بنجاح ✓
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(imageData, index);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* معلومات إضافية */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Crop className="w-3 h-3" />
            قص متقدم
          </span>
          {!autoAddToLibrary && (
            <span className="flex items-center gap-1 text-blue-600">
              <AlertCircle className="w-3 h-3" />
              معاينة فقط
            </span>
          )}
        </div>
        {multiple && <span>يمكن رفع عدة صور</span>}
        {aspectRatio && <span>النسبة المطلوبة: {aspectRatio}:1</span>}
      </div>

      {/* Input مخفي */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(",")}
        onChange={handleFileInputChange}
        multiple={multiple}
        className="hidden"
      />

      {/* مودال القص */}
      {showCropModal && (
        <ImageCropModal
          isOpen={showCropModal}
          onClose={handleCropCancel}
          imageFile={selectedFileForCrop}
          onCropComplete={handleCropComplete}
          aspectRatio={aspectRatio}
          title={cropTitle}
        />
      )}
    </div>
  );
};

export default CloudinaryImageUpload;
