import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  X,
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
import Modal from "../components/ui/Modal";

const ImageLibraryPage: React.FC = () => {
  const {
    predefinedImages,
    categories,
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
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImageForView, setSelectedImageForView] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showSelectedSidebar, setShowSelectedSidebar] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const imageModal = useModal();
  const deleteConfirmModal = useModal();
  const uploadModal = useModal({
    closeOnEscape: !isUploading,
    closeOnBackdropClick: !isUploading,
  });
  const [imageToDelete, setImageToDelete] =
    useState<CloudinaryImageData | null>(null);

  useEffect(() => {
    const preloadVisibleImages = async () => {
      const visiblePredefined = predefinedImages.slice(0, 12);
      const preloadPromises = visiblePredefined.map((image, index) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.loading = "eager";
        img.decoding = index < 6 ? "sync" : "async";
        img.fetchPriority = index < 6 ? "high" : "auto";
        img.src = image.url;
        return img;
      });

      await Promise.allSettled(
        preloadPromises.map((img) => {
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );
    };

    if (predefinedImages.length > 0) {
      preloadVisibleImages();
    }
  }, [predefinedImages]);

  const handleImageUpload = (imageData: CloudinaryImageData) => {
    addUserImage(imageData);
    selectImage(imageData, "user");
    uploadModal.closeModal();
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
        // حذف الصورة من المكتبة (سيتم حذفها من التصميم تلقائياً)
        removeUserImage(imageToDelete.publicId);

        // عرض رسالة تأكيد تتضمن معلومات الحذف من التصميم
        console.log(
          `Image ${imageToDelete.publicId} removed from library and design`
        );
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

  const filteredPredefinedImages = predefinedImages.filter((image) => {
    const matchesSearch =
      image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (image.description &&
        image.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategoryFilter === "all" ||
      image.categoryId === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

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

  const getIconComponent = (iconId: string) => {
    const iconMap: {
      [key: string]: React.ComponentType<{ className?: string }>;
    } = {
      folder: Images,
      star: Star,
      shapes: Images,
      type: User,
      image: Images,
    };
    return iconMap[iconId] || Images;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-4 sm:py-8 mobile-content-padding">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-4 sm:mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#563660] rounded-xl flex items-center justify-center">
              <Images className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-light text-gray-900">
              مكتبة الصور
            </h1>
          </div>
          <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            اختر الصور التي تريد استخدامها في تصميم جاكيتك من مجموعتنا الجاهزة
            أو ارفع صورك الخاصة
          </p>
        </motion.div>

        {selectedImages.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span className="text-sm sm:text-base text-green-800 font-medium">
                  تم تحديد {selectedImages.length} صورة للاستخدام في التصميم
                </span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowSelectedSidebar(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs sm:text-sm"
                >
                  عرض المحددة
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <Link
                  to="/customizer"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-[#563660] text-white rounded-lg hover:bg-[#4b2e55] transition-colors text-xs sm:text-sm"
                >
                  انتقل للتصميم
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:flex-1 lg:max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="ابحث في الصور..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 sm:pr-12 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-sm sm:text-base"
              />
            </div>

            <div className="flex gap-2 w-full lg:w-auto">
              <button
                onClick={() => setActiveTab("predefined")}
                className={`flex-1 lg:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                  activeTab === "predefined"
                    ? "bg-[#563660] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">الشعارات الجاهزة</span>
                <span className="sm:hidden">جاهزة</span>
                <span className="hidden sm:inline">
                  ({predefinedImages.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab("user")}
                className={`flex-1 lg:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                  activeTab === "user"
                    ? "bg-[#563660] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">صوري</span>
                <span className="sm:hidden">صوري</span>
                <span className="hidden sm:inline">({userImages.length})</span>
              </button>
            </div>
          </div>

          {activeTab === "predefined" && categories.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                فلترة حسب التصنيف
              </h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategoryFilter("all")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategoryFilter === "all"
                      ? "bg-[#563660] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Images className="w-4 h-4" />
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === "predefined" && (
                <div key="predefined">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12 sm:py-20">
                      <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-[#563660]" />
                      <span className="mr-2 sm:mr-3 text-sm sm:text-base text-gray-600">
                        جاري تحميل الصور...
                      </span>
                    </div>
                  ) : error ? (
                    <div className="text-center py-12 sm:py-20">
                      <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                        خطأ في التحميل
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">
                        {error}
                      </p>
                      <button
                        onClick={loadPredefinedImages}
                        className="px-4 py-2 bg-[#563660] text-white rounded-lg hover:bg-[#4b2e55] transition-colors text-sm sm:text-base"
                      >
                        إعادة المحاولة
                      </button>
                    </div>
                  ) : filteredPredefinedImages.length === 0 ? (
                    <div className="text-center py-12 sm:py-20">
                      <Images className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                        لا توجد صور
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 px-4">
                        لم نجد صور تطابق بحثك
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-6">
                      {filteredPredefinedImages.map((image) => (
                        <div
                          key={image.id}
                          className="relative group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
                        >
                          <div className="aspect-square p-2 sm:p-4">
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          </div>

                          <div className="p-2 sm:p-3 border-t border-gray-100">
                            <h3 className="font-medium text-gray-900 text-xs sm:text-sm truncate mb-1">
                              {image.name}
                            </h3>
                            <div className="flex items-center gap-1 mb-1">
                              {image.category && (
                                <>
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{
                                      backgroundColor: image.category.color,
                                    }}
                                  />
                                  <p className="text-xs text-gray-500 truncate">
                                    {image.category.name}
                                  </p>
                                </>
                              )}
                            </div>
                            {image.description && (
                              <p className="text-xs text-gray-400 truncate">
                                {image.description}
                              </p>
                            )}
                          </div>

                          <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
                            <button
                              onClick={() =>
                                handleImageSelect(image, "predefined")
                              }
                              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                isImageSelected(image.id)
                                  ? "bg-[#563660] border-[#563660] text-white"
                                  : "bg-white border-gray-300 hover:border-[#563660]"
                              }`}
                            >
                              {isImageSelected(image.id) && (
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                              )}
                            </button>
                          </div>

                          <div className="absolute top-1 sm:top-2 left-1 sm:left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleViewImage(image.url)}
                              className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                              title="عرض"
                            >
                              <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "user" && (
                <div key="user" className="space-y-6">
                  <div className="bg-gradient-to-r from-[#563660] to-[#7e4a8c] rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 text-white">
                    <h3 className="text-lg sm:text-xl font-semibold mb-6 flex items-center gap-3">
                      <Upload className="w-6 h-6 sm:w-7 sm:h-7" />
                      رفع صور جديدة
                    </h3>
                    <div className="text-center">
                      <p className="text-sm sm:text-base mb-4 opacity-90">
                        اسحب صورتك هنا أو انقر لاختيار ملف من جهازك
                      </p>
                      <button
                        onClick={uploadModal.openModal}
                        className="w-full sm:w-64 py-3 bg-white text-[#563660] rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base font-medium shadow-md"
                      >
                        اختر صورة للرفع
                      </button>
                      <p className="text-xs mt-4 opacity-80">
                        الحد الأقصى: 10MB | الأنواع: JPG, PNG, WEBP
                      </p>
                    </div>
                    <Modal
                      isOpen={uploadModal.isOpen}
                      shouldRender={uploadModal.shouldRender}
                      onClose={isUploading ? () => {} : uploadModal.closeModal}
                      title="رفع شعار"
                      size="sm"
                      showCloseButton={!isUploading}
                    >
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
                        onUploadStateChange={setIsUploading}
                        autoAddToLibrary={true}
                      />
                      <div className="text-xs text-gray-500 text-center">
                        <p>• الحد الأقصى: 10MB | الأنواع: JPG, PNG, WEBP</p>
                      </div>
                    </Modal>
                  </div>

                  {userImages.length === 0 ? (
                    <div className="text-center py-12 sm:py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                      <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                        لا توجد صور مرفوعة
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 px-4">
                        ابدأ برفع صورك الخاصة لاستخدامها في التصميم
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-6">
                      {filteredUserImages.map((image) => (
                        <div
                          key={image.publicId}
                          className="relative group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
                        >
                          <div className="aspect-square p-2 sm:p-4">
                            <img
                              src={image.url}
                              alt={image.publicId}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          </div>

                          <div className="p-2 sm:p-3 border-t border-gray-100">
                            <h3 className="font-medium text-gray-900 text-xs sm:text-sm truncate mb-1">
                              {image.publicId.split("/").pop()}
                            </h3>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{image.format.toUpperCase()}</span>
                              <span>{formatFileSize(image.size)}</span>
                            </div>
                          </div>

                          <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
                            <button
                              onClick={() => handleImageSelect(image, "user")}
                              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                isImageSelected(image.publicId)
                                  ? "bg-[#563660] border-[#563660] text-white"
                                  : "bg-white border-gray-300 hover:border-[#563660]"
                              }`}
                            >
                              {isImageSelected(image.publicId) && (
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                              )}
                            </button>
                          </div>

                          <div className="absolute top-1 sm:top-2 left-1 sm:left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleViewImage(image.url)}
                              className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                              title="عرض"
                            >
                              <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteUserImage(image)}
                              disabled={isDeleting === image.publicId}
                              className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
                              title="حذف"
                            >
                              {isDeleting === image.publicId ? (
                                <Loader2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
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
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showSelectedSidebar && (
            <div className="fixed inset-y-0 right-0 w-4/5 sm:w-80 bg-white z-50 overflow-y-auto shadow-lg">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-medium text-gray-900">
                    المحددة ({selectedImages.length})
                  </h3>
                  <button
                    onClick={() => setShowSelectedSidebar(false)}
                    className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {selectedImages.length === 0 ? (
                  <div className="text-center py-8">
                    <Circle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">لم تحدد أي صور بعد</p>
                    <p className="text-gray-500 text-xs mt-1">
                      انقر على الصور لتحديدها
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {selectedImages.map((image) => (
                        <div
                          key={image.id}
                          className="bg-gray-50 rounded-lg overflow-hidden"
                        >
                          <div className="aspect-square p-2">
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="p-2 border-t border-gray-200">
                            <p className="text-xs font-medium text-gray-900 truncate mb-1">
                              {image.name}
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500">
                                {image.source === "predefined"
                                  ? "جاهز"
                                  : "مرفوعة"}
                              </p>
                              <button
                                onClick={() => unselectImage(image.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Link
                        to="/customizer"
                        className="w-full flex items-center justify-center gap-2 py-2 bg-[#563660] text-white font-medium rounded-lg hover:bg-[#4b2e55] transition-colors text-sm"
                        onClick={() => setShowSelectedSidebar(false)}
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
                  </>
                )}

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    إحصائيات
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-sm font-bold text-[#563660]">
                        {predefinedImages.length}
                      </div>
                      <div className="text-xs text-gray-600">جاهزة</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-sm font-bold text-[#563660]">
                        {userImages.length}
                      </div>
                      <div className="text-xs text-gray-600">صوري</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-sm font-bold text-[#563660]">
                        {selectedImages.length}
                      </div>
                      <div className="text-xs text-gray-600">محددة</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-sm font-bold text-[#563660]">
                        {categories.length}
                      </div>
                      <div className="text-xs text-gray-600">تصنيف</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>

        <ImageModal
          isOpen={imageModal.isOpen}
          shouldRender={imageModal.shouldRender}
          onClose={imageModal.closeModal}
          imageUrl={selectedImageForView}
          showDownload={true}
          showZoom={true}
        />

        <ConfirmationModal
          isOpen={deleteConfirmModal.isOpen}
          onClose={deleteConfirmModal.closeModal}
          onConfirm={confirmDeleteImage}
          title="تأكيد حذف الصورة"
          message="سيتم حذف هذه الصورة نهائياً من مكتبتك ومن الخادم، وسيتم إزالتها تلقائياً من أي تصميم يستخدمها حالياً. لا يمكن التراجع عن هذا الإجراء."
          confirmText="نعم، احذف"
          cancelText="إلغاء"
          type="danger"
          isLoading={!!isDeleting}
        />
      </div>
    </div>
  );
};

export default ImageLibraryPage;
