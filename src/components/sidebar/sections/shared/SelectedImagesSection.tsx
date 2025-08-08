import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Images,
  Eye,
  Plus,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Star,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useImageLibrary } from "../../../../context/ImageLibraryContext";
import ImageModal from "../../../ui/ImageModal";
import { useModal } from "../../../../hooks/useModal";

interface SelectedImagesSectionProps {
  onImageSelect?: (imageUrl: string) => void;
  title?: string;
  className?: string;
}

const SelectedImagesSection: React.FC<SelectedImagesSectionProps> = ({
  onImageSelect,
  title = "الصور المحددة",
  className = "",
}) => {
  const { selectedImages } = useImageLibrary();
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedImageForView, setSelectedImageForView] = useState<string>("");

  const imageModal = useModal();

  const handleImageClick = (imageUrl: string) => {
    if (onImageSelect) {
      onImageSelect(imageUrl);
    }
  };

  const handleViewImage = (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageForView(imageUrl);
    imageModal.openModal();
  };

  const predefinedImages = selectedImages.filter(
    (img) => img.source === "predefined"
  );
  const userImages = selectedImages.filter((img) => img.source === "user");

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#563660] transition-colors"
        >
          <Images className="w-4 h-4" />
          <span>
            {title} ({selectedImages.length})
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        <Link
          to="/image-library"
          className="flex items-center gap-1 text-xs text-[#563660] hover:text-[#4b2e55] transition-colors"
        >
          <Plus className="w-3 h-3" />
          المكتبة
        </Link>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {selectedImages.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <Images className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">لا توجد صور محددة</p>
                <p className="text-xs text-gray-500 mb-3">
                  اذهب إلى مكتبة الصور لتحديد الصور التي تريد استخدامها
                </p>
                <Link
                  to="/image-library"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#563660] text-white text-sm rounded-lg hover:bg-[#4b2e55] transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  فتح مكتبة الصور
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Predefined Images */}
                {predefinedImages.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-gray-700">
                        الشعارات الجاهزة ({predefinedImages.length})
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {predefinedImages.map((image) => (
                        <div
                          key={image.id}
                          className="relative group cursor-pointer"
                          onClick={() => handleImageClick(image.url)}
                        >
                          <div className="aspect-square bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[#563660] transition-colors">
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full h-full object-contain p-2"
                              loading="lazy"
                            />
                          </div>
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleViewImage(image.url, e)}
                              className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                              title="عرض"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                            {image.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* User Images */}
                {userImages.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">
                        صوري ({userImages.length})
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {userImages.map((image) => (
                        <div
                          key={image.id}
                          className="relative group cursor-pointer"
                          onClick={() => handleImageClick(image.url)}
                        >
                          <div className="aspect-square bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[#563660] transition-colors">
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full h-full object-contain p-2"
                              loading="lazy"
                            />
                          </div>
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleViewImage(image.url, e)}
                              className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                              title="عرض"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                            {image.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="pt-4 border-t border-gray-200">
                  <Link
                    to="/image-library"
                    className="w-full flex items-center justify-center gap-2 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    إدارة المكتبة
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image View Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        shouldRender={imageModal.shouldRender}
        onClose={imageModal.closeModal}
        imageUrl={selectedImageForView}
        showDownload={true}
        showZoom={true}
      />
    </div>
  );
};

export default SelectedImagesSection;
