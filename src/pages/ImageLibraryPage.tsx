import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Images,
  Upload,
  Trash2,
  CheckCircle,
  Circle,
  ArrowRight,
  Search,
  Eye,
  Loader2,
  AlertCircle,
  Star,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  useImageLibrary,
  PredefinedImage,
} from "../context/ImageLibraryContext";
import CloudinaryImageUpload from "../components/forms/CloudinaryImageUpload";
import { CloudinaryImageData } from "../services/imageUploadService";
import imageUploadService from "../services/imageUploadService";
import ImageModal from "../components/ui/ImageModal";
import { useModal } from "../hooks/useModal";
import ConfirmationModal from "../components/ui/ConfirmationModal";

const ImageLibraryPage: React.FC = () => {
  const {
    predefinedImages,
    userImages,
    selectedImages,
    selectImage,
    unselectImage,
    isImageSelected,
    addUserImage,
    removeUserImage,
    loadPredefinedImages,
    isLoading,
    error,
  } = useImageLibrary();

  const [activeTab, setActiveTab] = useState<"predefined" | "user">(
    "predefined"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImageForView, setSelectedImageForView] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const imageModal = useModal();
  const deleteConfirmModal = useModal();
  const [imageToDelete, setImageToDelete] =
    useState<CloudinaryImageData | null>(null);

  // تحديث صور المستخدم من الـ context الرئيسي
  useEffect(() => {
    // يمكن إضافة منطق لمزامنة صور المستخدم مع JacketContext إذا لزم الأمر
  }, []);

  const handleImageUpload = (imageData: CloudinaryImageData) => {
    addUserImage(imageData);
  };

  const handleDeleteUserImage = async (image: CloudinaryImageData) => {
    setImageToDelete(image);
    deleteConfirmModal.openModal();
  };

  const confirmDeleteImage = async () => {
    if (!imageToDelete) return;

    setIsDeleting(imageToDelete.publicId);
    try {
      const success = await imageUploadService.deleteImage(
        imageToDelete.publicId
      );
      if (success) {
        removeUserImage(imageToDelete.publicId);
      } else {
        alert("فشل في حذف الصورة من الخادم");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("حدث خطأ أثناء حذف الصورة");
    } finally {
      setIsDeleting(null);
      setImageToDelete(null);
      deleteConfirmModal.closeModal();
    }
  };

  const handleImageSelect = (
    image: PredefinedImage | CloudinaryImageData,
    source: "predefined" | "user"
  ) => {
    const imageId =
      source === "predefined"
        ? (image as PredefinedImage).id
        : (image as CloudinaryImageData).publicId;
    if (isImageSelected(imageId)) {
      unselectImage(imageId);
    } else {
      selectImage(image, source);
    }
  };

  const handleViewImage = (imageUrl: string) => {
    setSelectedImageForView(imageUrl);
    imageModal.openModal();
  };

  const filteredPredefinedImages = predefinedImages.filter(
    (image) =>
      image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (image.description &&
        image.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredUserImages = userImages.filter((image) =>
    image.publicId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#563660] rounded-xl flex items-center justify-center">
              <Images className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-light text-gray-900">
              مكتبة الصور
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            اختر الصور التي تريد استخدامها في تصميم جاكيتك من مجموعتنا الجاهزة
            أو ارفع صورك الخاصة
          </p>
        </motion.div>

        {/* Selected Images Summary */}
        {selectedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  تم تحديد {selectedImages.length} صورة للاستخدام في التصميم
                </span>
              </div>
              <Link
                to="/customizer"
                className="flex items-center gap-2 px-4 py-2 bg-[#563660] text-white rounded-lg hover:bg-[#4b2e55] transition-colors text-sm"
              >
                انتقل للتصميم
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث في الصور..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("predefined")}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "predefined"
                    ? "bg-[#563660] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Star className="w-4 h-4" />
                الشعارات الجاهزة ({predefinedImages.length})
              </button>
              <button
                onClick={() => setActiveTab("user")}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "user"
                    ? "bg-[#563660] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <User className="w-4 h-4" />
                صوري ({userImages.length})
              </button>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === "predefined" && (
                <motion.div
                  key="predefined"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-[#563660]" />
                      <span className="mr-3 text-gray-600">
                        جاري تحميل الصور...
                      </span>
                    </div>
                  ) : error ? (
                    <div className="text-center py-20">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        خطأ في التحميل
                      </h3>
                      <p className="text-gray-600 mb-4">{error}</p>
                      <button
                        onClick={loadPredefinedImages}
                        className="px-4 py-2 bg-[#563660] text-white rounded-lg hover:bg-[#4b2e55] transition-colors"
                      >
                        إعادة المحاولة
                      </button>
                    </div>
                  ) : filteredPredefinedImages.length === 0 ? (
                    <div className="text-center py-20">
                      <Images className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        لا توجد صور
                      </h3>
                      <p className="text-gray-600">لم نجد صور تطابق بحثك</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {filteredPredefinedImages.map((image, index) => (
                        <motion.div
                          key={image.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="relative group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
                        >
                          <div className="aspect-square p-4">
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          </div>

                          <div className="p-3 border-t border-gray-100">
                            <h3 className="font-medium text-gray-900 text-sm truncate mb-1">
                              {image.name}
                            </h3>
                            {image.description && (
                              <p className="text-xs text-gray-500 truncate">
                                {image.description}
                              </p>
                            )}
                          </div>

                          {/* Selection Overlay */}
                          <div className="absolute top-2 right-2">
                            <button
                              onClick={() =>
                                handleImageSelect(image, "predefined")
                              }
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                isImageSelected(image.id)
                                  ? "bg-[#563660] border-[#563660] text-white"
                                  : "bg-white border-gray-300 hover:border-[#563660]"
                              }`}
                            >
                              {isImageSelected(image.id) && (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                          {/* Action Buttons */}
                          <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleViewImage(image.url)}
                              className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                              title="عرض"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "user" && (
                <motion.div
                  key="user"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Upload Section */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Upload className="w-5 h-5 text-[#563660]" />
                      رفع صور جديدة
                    </h3>
                    <CloudinaryImageUpload
                      onImageSelect={handleImageUpload}
                      multiple={false}
                      placeholder="اسحب الصورة هنا أو انقر للاختيار"
                      acceptedFormats={[
                        "image/jpeg",
                        "image/jpg",
                        "image/png",
                        "image/webp",
                      ]}
                      maxFileSize={10}
                      aspectRatio={1}
                      cropTitle="اقتطاع الصورة"
                      autoAddToLibrary={false}
                    />
                  </div>

                  {/* User Images Grid */}
                  {userImages.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        لا توجد صور مرفوعة
                      </h3>
                      <p className="text-gray-600">
                        ابدأ برفع صورك الخاصة لاستخدامها في التصميم
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {filteredUserImages.map((image, index) => (
                        <motion.div
                          key={image.publicId}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="relative group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
                        >
                          <div className="aspect-square p-4">
                            <img
                              src={image.url}
                              alt={image.publicId}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          </div>

                          <div className="p-3 border-t border-gray-100">
                            <h3 className="font-medium text-gray-900 text-sm truncate mb-1">
                              {image.publicId.split("/").pop()}
                            </h3>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{image.format.toUpperCase()}</span>
                              <span>{formatFileSize(image.size)}</span>
                            </div>
                          </div>

                          {/* Selection Overlay */}
                          <div className="absolute top-2 right-2">
                            <button
                              onClick={() => handleImageSelect(image, "user")}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                isImageSelected(image.publicId)
                                  ? "bg-[#563660] border-[#563660] text-white"
                                  : "bg-white border-gray-300 hover:border-[#563660]"
                              }`}
                            >
                              {isImageSelected(image.publicId) && (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                          {/* Action Buttons */}
                          <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleViewImage(image.url)}
                              className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                              title="عرض"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteUserImage(image)}
                              disabled={isDeleting === image.publicId}
                              className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
                              title="حذف"
                            >
                              {isDeleting === image.publicId ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                الصور المحددة
              </h3>

              {selectedImages.length === 0 ? (
                <div className="text-center py-8">
                  <Circle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">لم تحدد أي صور بعد</p>
                  <p className="text-gray-500 text-xs mt-1">
                    انقر على الصور لتحديدها
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedImages.map((image) => (
                    <div
                      key={image.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-10 h-10 object-contain rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {image.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {image.source === "predefined"
                            ? "شعار جاهز"
                            : "صورة مرفوعة"}
                        </p>
                      </div>
                      <button
                        onClick={() => unselectImage(image.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {selectedImages.length > 0 && (
                <div className="mt-6 space-y-3">
                  <Link
                    to="/customizer"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#563660] text-white font-medium rounded-lg hover:bg-[#4b2e55] transition-colors"
                  >
                    استخدم في التصميم
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => {
                      selectedImages.forEach((image) =>
                        unselectImage(image.id)
                      );
                    }}
                    className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    مسح التحديد
                  </button>
                </div>
              )}

              {/* Statistics */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  إحصائيات
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">الشعارات الجاهزة:</span>
                    <span className="font-medium">
                      {predefinedImages.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">صوري:</span>
                    <span className="font-medium">{userImages.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">المحددة:</span>
                    <span className="font-medium text-[#563660]">
                      {selectedImages.length}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Image View Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        shouldRender={imageModal.shouldRender}
        onClose={imageModal.closeModal}
        imageUrl={selectedImageForView}
        showDownload={true}
        showZoom={true}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={deleteConfirmModal.closeModal}
        onConfirm={confirmDeleteImage}
        title="تأكيد حذف الصورة"
        message="سيتم حذف هذه الصورة نهائياً من مكتبتك ومن الخادم. لا يمكن التراجع عن هذا الإجراء."
        confirmText="نعم، احذف"
        cancelText="إلغاء"
        type="danger"
        isLoading={!!isDeleting}
      />
    </div>
  );
};

export default ImageLibraryPage;
