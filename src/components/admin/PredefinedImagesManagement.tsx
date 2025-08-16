import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Plus,
  RotateCcw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit3,
  Info,
  Save,
  Grid,
  Upload,
} from "lucide-react";
import predefinedImagesService, {
  PredefinedImageData,
} from "../../services/predefinedImagesService";
import { CategoryData } from "../../services/categoryService";
import CloudinaryImageUpload from "../../components/forms/CloudinaryImageUpload";
import { CloudinaryImageData } from "../../services/imageUploadService";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Modal from "../../components/ui/Modal";
import { useModal } from "../../hooks/useModal";

const PredefinedImagesManagement: React.FC = () => {
  const [predefinedImages, setPredefinedImages] = useState<
    PredefinedImageData[]
  >([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("all");
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [imagesError, setImagesError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [newImageData, setNewImageData] = useState({
    name: "",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
  });
  const [selectedImageForEdit, setSelectedImageForEdit] =
    useState<PredefinedImageData | null>(null);
  const [imageToDelete, setImageToDelete] =
    useState<PredefinedImageData | null>(null);
  const [uploadedImageData, setUploadedImageData] =
    useState<CloudinaryImageData | null>(null);
  const [nameError, setNameError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  const deleteImageModal = useModal();
  const editImageModal = useModal();
  const addImageModal = useModal();
  const confirmUploadModal = useModal();

  useEffect(() => {
    loadPredefinedImagesAndCategories();
  }, []);

  const loadPredefinedImagesAndCategories = async () => {
    setIsLoadingImages(true);
    setImagesError("");
    try {
      const data =
        await predefinedImagesService.loadPredefinedImagesWithCategories();
      setPredefinedImages(data.images);
      setCategories(data.categories);
    } catch (error) {
      setImagesError(
        error instanceof Error ? error.message : "فشل في تحميل البيانات"
      );
    } finally {
      setIsLoadingImages(false);
    }
  };

  const handleImageSelect = (
    imageData: CloudinaryImageData,
    originalFile?: File
  ) => {
    // حفظ الصورة المرفوعة مؤقتاً بدون إرسالها للسيرفر
    setUploadedImageData(imageData);

    // إذا كان هناك ملف أصلي، احفظه للرفع لاحقاً
    if (originalFile) {
      setPendingImageFile(originalFile);
    }

    addImageModal.closeModal();
    confirmUploadModal.openModal();
  };

  const handleConfirmUpload = async () => {
    if (!uploadedImageData || !pendingImageFile) return;

    if (!newImageData.name.trim()) {
      setNameError("يجب كتابة اسم الشعار قبل إتمام عملية الرفع");
      return;
    }

    setNameError("");
    setIsUploading(true);

    try {
      // استخدام الملف الأصلي المحفوظ مؤقتاً
      const newImage = await predefinedImagesService.addPredefinedImage(
        pendingImageFile,
        newImageData.name,
        newImageData.categoryId,
        newImageData.description
      );

      setPredefinedImages((prev) => [newImage, ...prev]);
      setSaveMessage("تم إضافة الشعار الجاهز بنجاح");
      setNewImageData({
        name: "",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
      });
      setUploadedImageData(null);
      setPendingImageFile(null);
      confirmUploadModal.closeModal();
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setImagesError(
        error instanceof Error ? error.message : "فشل في إضافة الشعار الجاهز"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePredefinedImage = async () => {
    if (!imageToDelete) return;

    setIsLoadingImages(true);
    try {
      await predefinedImagesService.deletePredefinedImage(imageToDelete.id);
      setPredefinedImages((prev) =>
        prev.filter((img) => img.id !== imageToDelete.id)
      );
      setSaveMessage("تم حذف الشعار الجاهز بنجاح");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setImagesError(
        error instanceof Error ? error.message : "فشل في حذف الشعار الجاهز"
      );
    } finally {
      setIsLoadingImages(false);
      setImageToDelete(null);
      deleteImageModal.closeModal();
    }
  };

  const handleEditImage = async () => {
    if (!selectedImageForEdit) return;

    try {
      const updatedImage = await predefinedImagesService.updatePredefinedImage(
        selectedImageForEdit.id,
        {
          name: selectedImageForEdit.name,
          categoryId: selectedImageForEdit.categoryId,
          description: selectedImageForEdit.description,
        }
      );

      setPredefinedImages((prev) =>
        prev.map((img) =>
          img.id === selectedImageForEdit.id ? updatedImage : img
        )
      );

      setSaveMessage("تم تحديث الشعار بنجاح");
      setTimeout(() => setSaveMessage(""), 3000);
      editImageModal.closeModal();
      setSelectedImageForEdit(null);
    } catch (error) {
      setImagesError(
        error instanceof Error ? error.message : "فشل في تحديث الشعار"
      );
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "غير محدد";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // فلترة الصور حسب التصنيف المحدد
  const filteredImages =
    selectedCategoryFilter === "all"
      ? predefinedImages
      : predefinedImages.filter(
          (img) => img.categoryId === selectedCategoryFilter
        );

  const getIconComponent = (iconId: string) => {
    const iconMap: {
      [key: string]: React.ComponentType<{ className?: string }>;
    } = {
      folder: Grid,
      star: Upload,
      shapes: Grid,
      type: Upload,
      image: Grid,
    };
    return iconMap[iconId] || Grid;
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Grid className="w-5 h-5 text-[#563660]" />
            إدارة الشعارات الجاهزة
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            إضافة وتعديل وحذف الشعارات المتاحة للعملاء
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={addImageModal.openModal}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-200 text-sm"
          >
            <Plus className="w-4 h-4" />
            إضافة شعار
          </button>
          <button
            onClick={loadPredefinedImagesAndCategories}
            disabled={isLoadingImages}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 text-sm"
          >
            {isLoadingImages ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            تحديث
          </button>
        </div>
      </div>

      <AnimatePresence>
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-green-700 font-medium text-sm">
              {saveMessage}
            </span>
          </motion.div>
        )}

        {imagesError && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-red-700 font-medium text-sm">
              {imagesError}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            فلترة حسب التصنيف
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategoryFilter("all")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategoryFilter === "all"
                  ? "bg-[#563660] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Grid className="w-4 h-4" />
              الكل ({predefinedImages.length})
            </button>
            {categories.map((category) => {
              const IconComponent = getIconComponent(category.icon);
              const categoryCount = predefinedImages.filter(
                (img) => img.categoryId === category.id
              ).length;

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryFilter(category.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategoryFilter === category.id
                      ? "text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  style={{
                    backgroundColor:
                      selectedCategoryFilter === category.id
                        ? category.color
                        : undefined,
                  }}
                >
                  <IconComponent className="w-4 h-4" />
                  {category.name} ({categoryCount})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isLoadingImages ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#563660] mx-auto mb-4" />
            <p className="text-gray-600 text-sm">
              جاري تحميل الشعارات الجاهزة...
            </p>
          </div>
        </div>
      ) : filteredImages.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedCategoryFilter === "all"
                ? "جميع الشعارات"
                : categories.find((cat) => cat.id === selectedCategoryFilter)
                    ?.name || "الشعارات المتاحة"}
            </h3>
            <span className="bg-[#563660] text-white px-3 py-1.5 rounded-lg font-medium text-sm">
              {filteredImages.length} شعار
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative group bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-200"
              >
                <div className="aspect-square p-3">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                <div className="p-3 border-t border-gray-200 bg-white">
                  <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
                    {image.name}
                  </h4>
                  <div className="flex items-center gap-1 mb-1">
                    {image.category && (
                      <>
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: image.category.color }}
                        />
                        <p className="text-xs text-gray-500 truncate">
                          {image.category.name}
                        </p>
                      </>
                    )}
                  </div>
                  {image.size && (
                    <p className="text-xs text-gray-400 mt-1">
                      {formatFileSize(image.size)}
                    </p>
                  )}
                </div>

                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => {
                      setSelectedImageForEdit(image);
                      editImageModal.openModal();
                    }}
                    className="w-6 h-6 bg-blue-500 text-white rounded-md flex items-center justify-center hover:bg-blue-600 transition-colors"
                    title="تعديل"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setImageToDelete(image);
                      deleteImageModal.openModal();
                    }}
                    disabled={isLoadingImages}
                    className="w-6 h-6 bg-red-500 text-white rounded-md flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
                    title="حذف"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            لا توجد شعارات جاهزة
          </h3>
          <p className="text-sm text-gray-600 mb-4 px-4">
            ابدأ بإضافة شعارات جاهزة للمجموعة
          </p>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteImageModal.isOpen}
        onClose={() => {
          deleteImageModal.closeModal();
          setImageToDelete(null);
        }}
        onConfirm={handleDeletePredefinedImage}
        title="تأكيد حذف الشعار"
        message={`هل أنت متأكد من حذف الشعار "${imageToDelete?.name}"؟ سيتم حذفه نهائياً من المجموعة ومن الخادم.`}
        confirmText="نعم، احذف"
        cancelText="إلغاء"
        type="danger"
        isLoading={isLoadingImages}
      />

      {/* نافذة رفع الشعار */}
      <Modal
        isOpen={addImageModal.isOpen}
        shouldRender={addImageModal.shouldRender}
        onClose={addImageModal.closeModal}
        title="إضافة شعار جديد"
        size="lg"
        options={addImageModal.options}
      >
        <div className="space-y-4">
          <div className="sm:hidden">
            <CloudinaryImageUpload
              onImageSelect={handleImageSelect}
              acceptedFormats={[
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/webp",
              ]}
              maxFileSize={10}
              placeholder="اختر الشعار"
              aspectRatio={1}
              cropTitle="اقتطاع الشعار"
              autoAddToLibrary={false}
            />
          </div>

          <div className="hidden sm:block">
            <CloudinaryImageUpload
              onImageSelect={handleImageSelect}
              acceptedFormats={[
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/webp",
              ]}
              maxFileSize={10}
              placeholder="اسحب الشعار هنا أو انقر للاختيار"
              aspectRatio={1}
              cropTitle="اقتطاع الشعار الجاهز"
              autoAddToLibrary={false}
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-amber-800 font-medium mb-1">ملاحظات:</p>
                <ul className="text-amber-700 space-y-0.5 text-xs">
                  <li>• الحد الأقصى: 5MB</li>
                  <li>• الأنواع: JPG, PNG, WEBP</li>
                  <li>• يفضل الشكل المربع</li>
                  <li>• لن يتم رفع الشعار للسيرفر إلا بعد التأكيد</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* نافذة تأكيد الرفع */}
      <Modal
        isOpen={confirmUploadModal.isOpen}
        shouldRender={confirmUploadModal.shouldRender}
        onClose={() => {
          confirmUploadModal.closeModal();
          setUploadedImageData(null);
          setPendingImageFile(null);
          setNameError("");
          setIsUploading(false);
        }}
        title="تأكيد رفع الشعار"
        size="md"
        options={{
          ...confirmUploadModal.options,
          closeOnBackdropClick: false,
        }}
      >
        <div className="space-y-6">
          {/* عرض الصورة المرفوعة */}
          {uploadedImageData && (
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={uploadedImageData.url}
                  alt="الشعار المرفوع"
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <p className="text-xs text-gray-600">
                حجم الملف: {formatFileSize(uploadedImageData.size)}
              </p>
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700 font-medium">
                  ⚠️ الشعار لم يتم رفعه للسيرفر بعد
                </p>
                <p className="text-xs text-blue-600">
                  سيتم الرفع فقط بعد تأكيد البيانات والضغط على "تأكيد الرفع"
                </p>
              </div>
            </div>
          )}

          {/* حقول إدخال البيانات */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم الشعار *
              </label>
              <input
                type="text"
                value={newImageData.name}
                onChange={(e) => {
                  setNewImageData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }));
                  if (nameError) setNameError("");
                }}
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-sm ${
                  nameError ? "border-red-300" : "border-gray-200"
                }`}
                placeholder="مثال: شعار الشركة"
                required
              />
              {nameError && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {nameError}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التصنيف
                </label>
                <select
                  value={newImageData.categoryId}
                  onChange={(e) =>
                    setNewImageData((prev) => ({
                      ...prev,
                      categoryId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-sm"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف
                </label>
                <input
                  type="text"
                  value={newImageData.description}
                  onChange={(e) =>
                    setNewImageData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-sm"
                  placeholder="وصف مختصر"
                />
              </div>
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleConfirmUpload}
              disabled={isUploading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isUploading ? "جاري الرفع للسيرفر..." : "تأكيد الرفع للسيرفر"}
            </button>
            <button
              onClick={() => {
                confirmUploadModal.closeModal();
                setUploadedImageData(null);
                setPendingImageFile(null);
                setNameError("");
                addImageModal.openModal();
              }}
              disabled={isUploading}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              العودة للتعديل
            </button>
            <button
              onClick={() => {
                confirmUploadModal.closeModal();
                setUploadedImageData(null);
                setPendingImageFile(null);
                setNameError("");
              }}
              disabled={isUploading}
              className="flex-1 py-2.5 border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={editImageModal.isOpen}
        shouldRender={editImageModal.shouldRender}
        onClose={() => {
          editImageModal.closeModal();
          setSelectedImageForEdit(null);
        }}
        title="تعديل معلومات الشعار"
        size="md"
        options={editImageModal.options}
      >
        {selectedImageForEdit && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={selectedImageForEdit.url}
                  alt={selectedImageForEdit.name}
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <p className="text-xs text-gray-600">
                معرف الصورة: {selectedImageForEdit.publicId}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الشعار *
                </label>
                <input
                  type="text"
                  value={selectedImageForEdit.name}
                  onChange={(e) =>
                    setSelectedImageForEdit((prev) =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التصنيف
                </label>
                <select
                  value={selectedImageForEdit.categoryId}
                  onChange={(e) =>
                    setSelectedImageForEdit((prev) =>
                      prev ? { ...prev, categoryId: e.target.value } : null
                    )
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-sm"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف
                </label>
                <textarea
                  value={selectedImageForEdit.description || ""}
                  onChange={(e) =>
                    setSelectedImageForEdit((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all resize-none text-sm"
                  placeholder="وصف مختصر للشعار"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleEditImage}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#563660] text-white font-medium rounded-lg hover:bg-[#4b2e55] transition-colors text-sm"
              >
                <Save className="w-4 h-4" />
                حفظ التغييرات
              </button>
              <button
                onClick={() => {
                  editImageModal.closeModal();
                  setSelectedImageForEdit(null);
                }}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PredefinedImagesManagement;
