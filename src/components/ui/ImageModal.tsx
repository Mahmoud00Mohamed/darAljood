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

  // إعادة تعيين الزوم والموضع عند إغلاق النافذة
  React.useEffect(() => {
    if (!isOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      shouldRender={shouldRender}
      onClose={onClose}
      size="full"
      showCloseButton={false}
      className="bg-black"
      contentClassName="bg-black"
    >
      <div className="relative w-full h-full flex flex-col">
        {/* Header Controls */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {showZoom && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-white bg-black bg-opacity-50 px-3 py-2 rounded-lg text-sm">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </>
            )}
            {showDownload && (
              <button
                onClick={handleDownload}
                className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Container */}
        <div
          className="flex-1 flex items-center justify-center overflow-hidden cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <motion.img
            src={imageUrl}
            alt={imageAlt}
            className="max-w-full max-h-full object-contain select-none"
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${
                position.y / zoom
              }px)`,
              cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
            }}
            animate={{
              scale: zoom,
            }}
            transition={{ duration: 0.2 }}
            draggable={false}
          />
        </div>

        {/* Footer Info */}
        {(title || description) && (
          <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
            {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}
            {description && <p className="text-sm opacity-90">{description}</p>}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImageModal;
