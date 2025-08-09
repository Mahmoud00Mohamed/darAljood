import React from "react";
import { motion } from "framer-motion";
import { X, Download, ZoomIn, ZoomOut } from "lucide-react";
import Modal from "./Modal";

export interface ImageModalProps {
  isOpen: boolean;
  shouldRender: boolean;
  onClose: () => void;
  imageUrl: string;
  imageAlt?: string;
  title?: string;
  description?: string;
  showDownload?: boolean;
  showZoom?: boolean;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  shouldRender,
  onClose,
  imageUrl,
  imageAlt = "صورة",
  title,
  description,
  showDownload = false,
  showZoom = true,
}) => {
  const [zoom, setZoom] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageDimensions, setImageDimensions] = React.useState({
    width: 0,
    height: 0,
  });
  const imageRef = React.useRef<HTMLImageElement>(null);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = title || "image";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
    setImageLoaded(true);
  };

  const getResponsiveImageStyle = () => {
    if (!imageLoaded) {
      return {
        maxWidth: "90vw",
        maxHeight: "80vh",
        width: "auto",
        height: "auto",
      };
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const maxWidth = viewportWidth * 0.9; // 90% من عرض الشاشة
    const maxHeight = viewportHeight * 0.8; // 80% من ارتفاع الشاشة

    // حساب النسبة المناسبة للصورة
    const imageAspectRatio = imageDimensions.width / imageDimensions.height;
    const containerAspectRatio = maxWidth / maxHeight;

    let finalWidth, finalHeight;

    if (imageAspectRatio > containerAspectRatio) {
      // الصورة أعرض من الحاوية
      finalWidth = Math.min(maxWidth, imageDimensions.width);
      finalHeight = finalWidth / imageAspectRatio;
    } else {
      // الصورة أطول من الحاوية
      finalHeight = Math.min(maxHeight, imageDimensions.height);
      finalWidth = finalHeight * imageAspectRatio;
    }

    return {
      width: `${finalWidth}px`,
      height: `${finalHeight}px`,
      maxWidth: "90vw",
      maxHeight: "80vh",
    };
  };

  // إعادة تعيين الزوم والموضع عند إغلاق النافذة
  React.useEffect(() => {
    if (!isOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
      setImageLoaded(false);
      setImageDimensions({ width: 0, height: 0 });
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      shouldRender={shouldRender}
      onClose={onClose}
      size="full"
      showCloseButton={false}
      className="bg-black bg-opacity-90"
      contentClassName="bg-transparent flex items-center justify-center p-4"
    >
      <div className="relative w-full h-full flex flex-col max-w-7xl mx-auto">
        {/* Header Controls */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {showZoom && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 sm:p-2 bg-black bg-opacity-60 text-white rounded-lg hover:bg-opacity-80 transition-colors backdrop-blur-sm"
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <span className="text-white bg-black bg-opacity-60 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm backdrop-blur-sm">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 sm:p-2 bg-black bg-opacity-60 text-white rounded-lg hover:bg-opacity-80 transition-colors backdrop-blur-sm"
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </>
            )}
            {showDownload && (
              <button
                onClick={handleDownload}
                className="p-1.5 sm:p-2 bg-black bg-opacity-60 text-white rounded-lg hover:bg-opacity-80 transition-colors backdrop-blur-sm"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 bg-black bg-opacity-60 text-white rounded-lg hover:bg-opacity-80 transition-colors backdrop-blur-sm"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Image Container */}
        <div
          className="flex-1 flex items-center justify-center overflow-hidden p-4 sm:p-8"
          style={{
            cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="relative flex items-center justify-center w-full h-full">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <motion.img
              ref={imageRef}
              src={imageUrl}
              alt={imageAlt}
              className="object-contain select-none transition-opacity duration-300"
              style={{
                ...getResponsiveImageStyle(),
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${
                  position.y / zoom
                }px)`,
                opacity: imageLoaded ? 1 : 0,
              }}
              animate={{
                scale: zoom,
              }}
              transition={{ duration: 0.2 }}
              draggable={false}
              onLoad={handleImageLoad}
              onError={() => setImageLoaded(true)}
            />
          </div>
        </div>

        {/* Footer Info */}
        {(title || description) && (
          <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 bg-black bg-opacity-60 text-white p-3 sm:p-4 rounded-lg backdrop-blur-sm">
            {title && (
              <h3 className="text-sm sm:text-lg font-medium mb-1 sm:mb-2 truncate">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs sm:text-sm opacity-90 line-clamp-2">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImageModal;
