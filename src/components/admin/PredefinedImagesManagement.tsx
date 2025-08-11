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
} from "lucide-react";
import predefinedImagesService, {
  PredefinedImageData,
} from "../../services/predefinedImagesService";
import CloudinaryImageUpload from "../../components/forms/CloudinaryImageUpload";
import { CloudinaryImageData } from "../../services/imageUploadService";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Modal from "../../components/ui/Modal";
import { useModal } from "../../hooks/useModal";

const PredefinedImagesManagement: React.FC = () => {
  const [predefinedImages, setPredefinedImages] = useState<
    PredefinedImageData[]
  >([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [imagesError, setImagesError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [newImageData, setNewImageData] = useState({
    name: "",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
  });
  const [selectedImageForEdit, setSelectedImageForEdit] =
    useState<PredefinedImageData | null>(null);
  const [imageToDelete, setImageToDelete] =
    useState<PredefinedImageData | null>(null);

  const deleteImageModal = useModal();
  const editImageModal = useModal();
  const addImageModal = useModal();

  useEffect(() => {
    loadPredefinedImages();
  }, []);

  const loadPredefinedImages = async () => {
    setIsLoadingImages(true);
    setImagesError("");
    try {
      const images = await predefinedImagesService.loadPredefinedImages();
      setPredefinedImages(images);
    } catch (error) {
      setImagesError(
        error instanceof Error ? error.message : "فشل في تحميل الشعارات الجاهزة"
      );
    } finally {
      setIsLoadingImages(false);
    }
  };

  const handleAddPredefinedImage = async (imageData: CloudinaryImageData) => {
    if (!newImageData.name.trim()) {
      alert("اسم الشعار مطلوب");
      return;
    }

    try {
      const response = await fetch(imageData.url);
      const blob = await response.blob();
      const file = new File(
        [blob],
        `${imageData.publicId}.${imageData.format}`,
        {
          type: `image/${imageData.format}`,
        }
      );

      const newImage = await predefinedImagesService.addPredefinedImage(
        file,
        newImageData.name,
        newImageData.category,
        newImageData.description
      );

      setPredefinedImages((prev) => [newImage, ...prev]);
      setSaveMessage("تم إضافة الشعار الجاهز بنجاح");
      setNewImageData({
        name: "",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      });
      addImageModal.closeModal();
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setImagesError(
        error instanceof Error ? error.message : "فشل في إضافة الشعار الجاهز"
      );
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
          category: selectedImageForEdit.category,
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <AnimatePresence>
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 shadow-sm"
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-medium">{saveMessage}</span>
          </motion.div>
        )}

        {imagesError && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-sm"
          >
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 font-medium">{imagesError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            الشعارات الجاهزة
          </h2>
          <p className="text-gray-600">إدارة مكتبة الشعارات الجاهزة للعملاء</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <button
            onClick={addImageModal.openModal}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4" />
            إضافة شعار جديد
          </button>
          <button
            onClick={loadPredefinedImages}
            disabled={isLoadingImages}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50"
          >
            {isLoadingImages ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            تحديث القائمة
          </button>
        </div>
      </div>

      {isLoadingImages ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#563660] mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              جاري تحميل الشعارات الجاهزة...
            </p>
          </div>
        </div>
      ) : predefinedImages.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900">
              الشعارات المتاحة
            </h3>
            <span className="bg-[#563660] text-white px-4 py-2 rounded-xl font-semibold">
              {predefinedImages.length} شعار
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {predefinedImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative group bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200"
              >
                <div className="aspect-square p-4">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                <div className="p-4 border-t border-gray-200 bg-white">
                  <h4 className="text-sm font-semibold text-gray-900 truncate mb-1">
                    {image.name}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {image.category}
                  </p>
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
                    className="w-7 h-7 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors shadow-md"
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
                    className="w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50 shadow-md"
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
        <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            لا توجد شعارات جاهزة
          </h3>
          <p className="text-gray-600 mb-6">
            ابدأ بإضافة شعارات جاهزة للمجموعة
          </p>
          <button
            onClick={addImageModal.openModal}
            className="px-6 py-3 bg-[#563660] text-white rounded-xl hover:bg-[#4b2e55] transition-colors font-semibold"
          >
            إضافة شعار جديد
          </button>
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

      <Modal
        isOpen={addImageModal.isOpen}
        shouldRender={addImageModal.shouldRender}
        onClose={addImageModal.closeModal}
        title="إضافة شعار جديد"
        size="lg"
        options={addImageModal.options}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                اسم الشعار *
              </label>
              <input
                type="text"
                value={newImageData.name}
                onChange={(e) =>
                  setNewImageData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all"
                placeholder="مثال: شعار الشركة"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الفئة
              </label>
              <input
                type="text"
                value={newImageData.category}
                onChange={(e) =>
                  setNewImageData((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all"
                placeholder="وصف مختصر للشعار"
              />
            </div>
          </div>

          <CloudinaryImageUpload
            onImageSelect={handleAddPredefinedImage}
            acceptedFormats={[
              "image/jpeg",
              "image/jpg",
              "image/png",
              "image/webp",
            ]}
            maxFileSize={5}
            placeholder="اسحب الشعار هنا أو انقر للاختيار"
            aspectRatio={1}
            cropTitle="اقتطاع الشعار الجاهز"
            autoAddToLibrary={false}
          />

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-amber-800 font-semibold mb-1">
                  ملاحظات مهمة:
                </p>
                <ul className="text-amber-700 space-y-1">
                  <li>• الحد الأقصى لحجم الملف: 5MB</li>
                  <li>• الأنواع المدعومة: JPG, PNG, WEBP</li>
                  <li>• يفضل أن تكون الصورة مربعة الشكل</li>
                  <li>• سيتم تحسين الصورة تلقائياً للاستخدام</li>
                </ul>
              </div>
            </div>
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
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={selectedImageForEdit.url}
                  alt={selectedImageForEdit.name}
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <p className="text-sm text-gray-600">
                معرف الصورة: {selectedImageForEdit.publicId}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الفئة
                </label>
                <input
                  type="text"
                  value={selectedImageForEdit.category}
                  onChange={(e) =>
                    setSelectedImageForEdit((prev) =>
                      prev ? { ...prev, category: e.target.value } : null
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الوصف
                </label>
                <textarea
                  value={selectedImageForEdit.description || ""}
                  onChange={(e) =>
                    setSelectedImageForEdit((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all resize-none"
                  placeholder="وصف مختصر للشعار"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleEditImage}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#563660] text-white font-semibold rounded-xl hover:bg-[#4b2e55] transition-colors"
              >
                <Save className="w-4 h-4" />
                حفظ التغييرات
              </button>
              <button
                onClick={() => {
                  editImageModal.closeModal();
                  setSelectedImageForEdit(null);
                }}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default PredefinedImagesManagement;
