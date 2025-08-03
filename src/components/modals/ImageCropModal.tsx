import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  X,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Crop as CropIcon,
  RefreshCw,
  Check,
  Square,
  Circle,
  Maximize,
  RotateCcw,
} from "lucide-react";

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  onCropComplete: (croppedImageUrl: string, originalFile: File) => void;
  aspectRatio?: number;
  title?: string;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  imageFile,
  onCropComplete,
  aspectRatio,
  title = "اقتطاع الصورة",
}) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropMode, setCropMode] = useState<"free" | "square" | "circle">(
    "free"
  );
  const [isMobile, setIsMobile] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<number>(1);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 400,
    height: 400,
  });

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // تحديد ما إذا كان الجهاز محمولاً
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // منع Pull-to-Refresh وتفعيل التغطية الكاملة للشاشة
  useEffect(() => {
    const preventPullToRefresh = (e: TouchEvent) => {
      if (isOpen && isMobile) {
        e.preventDefault();
      }
    };

    const preventContextMenu = (e: Event) => {
      e.preventDefault();
    };

    if (isOpen && isMobile) {
      document.addEventListener("touchmove", preventPullToRefresh, {
        passive: false,
      });
      document.addEventListener("contextmenu", preventContextMenu);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("touchmove", preventPullToRefresh);
      document.removeEventListener("contextmenu", preventContextMenu);
      document.body.style.overflow = "";
    };
  }, [isOpen, isMobile]);

  // تحميل الصورة عند فتح المودال
  useEffect(() => {
    if (isOpen && imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setScale(1);
        setRotate(0);
        setCrop(undefined);
        setCompletedCrop(undefined);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [isOpen, imageFile]);

  // حساب أبعاد الحاوية بناءً على نسبة أبعاد الصورة
  const calculateContainerDimensions = useCallback(
    (aspectRatio: number) => {
      const baseSize = isMobile ? 280 : 400;
      const maxHeight = isMobile ? 350 : 500;

      if (aspectRatio > 1) {
        // صورة عريضة
        return {
          width: baseSize,
          height: Math.min(baseSize / aspectRatio, maxHeight),
        };
      } else if (aspectRatio < 0.6) {
        // صورة طويلة جداً - تكيف الحاوية
        return {
          width: baseSize * 0.7,
          height: maxHeight,
        };
      } else {
        // صورة مربعة أو طويلة قليلاً
        return {
          width: baseSize,
          height: Math.min(baseSize / aspectRatio, maxHeight),
        };
      }
    },
    [isMobile]
  );

  // تحديد الاقتطاع الافتراضي عند تحميل الصورة
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const { width, height } = e.currentTarget;
      const aspectRatio = width / height;

      setImageAspectRatio(aspectRatio);

      // حساب أبعاد الحاوية الجديدة
      const newDimensions = calculateContainerDimensions(aspectRatio);
      setContainerDimensions(newDimensions);

      let newCrop: Crop;

      if (cropMode === "square") {
        newCrop = centerCrop(
          makeAspectCrop({ unit: "%", width: 80 }, 1, width, height),
          width,
          height
        );
      } else if (aspectRatio !== undefined) {
        newCrop = centerCrop(
          makeAspectCrop({ unit: "%", width: 80 }, aspectRatio, width, height),
          width,
          height
        );
      } else {
        newCrop = centerCrop(
          { unit: "%", width: 80, height: 80 },
          width,
          height
        );
      }

      setCrop(newCrop);
    },
    [cropMode, calculateContainerDimensions]
  );

  // تغيير نمط الاقتطاع
  const handleCropModeChange = (mode: "free" | "square" | "circle") => {
    setCropMode(mode);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      let newCrop: Crop;

      if (mode === "square") {
        newCrop = centerCrop(
          makeAspectCrop({ unit: "%", width: 80 }, 1, width, height),
          width,
          height
        );
      } else if (aspectRatio) {
        newCrop = centerCrop(
          makeAspectCrop({ unit: "%", width: 80 }, aspectRatio, width, height),
          width,
          height
        );
      } else {
        newCrop = centerCrop(
          { unit: "%", width: 80, height: 80 },
          width,
          height
        );
      }

      setCrop(newCrop);
    }
  };

  // تطبيق الاقتطاع
  const handleApplyCrop = async () => {
    if (!completedCrop || !imgRef.current || !imageFile) return;

    setIsProcessing(true);

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }

      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;

      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;

      const centerX = image.naturalWidth / 2;
      const centerY = image.naturalHeight / 2;

      ctx.save();
      ctx.translate(-cropX, -cropY);
      ctx.translate(centerX, centerY);
      ctx.rotate((rotate * Math.PI) / 180);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -centerY);

      ctx.drawImage(
        image,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight
      );

      ctx.restore();

      if (cropMode === "circle") {
        const radius = Math.min(canvas.width, canvas.height) / 2;
        ctx.globalCompositeOperation = "destination-in";
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, 2 * Math.PI);
        ctx.fill();
      }

      const croppedDataUrl = canvas.toDataURL("image/png", 0.9);
      onCropComplete(croppedDataUrl, imageFile);
      onClose();
    } catch (error) {
      console.error("Error applying crop:", error);
      alert("حدث خطأ أثناء اقتطاع الصورة. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsProcessing(false);
    }
  };

  // إعادة تعيين الإعدادات
  const handleReset = () => {
    setScale(1);
    setRotate(0);
    setCropMode("free");
    if (imgRef.current) {
      onImageLoad({ currentTarget: imgRef.current } as React.SyntheticEvent<
        HTMLImageElement,
        Event
      >);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-0 modal-portal"
        data-modal="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: isMobile ? "100vh" : "100dvh",
          zIndex: 9999,
          userSelect: "none",
          WebkitUserSelect: "none",
          touchAction: "none",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`bg-white w-full h-full overflow-hidden flex flex-col ${
            isMobile
              ? "rounded-none max-h-screen"
              : "max-w-5xl max-h-[95vh] rounded-2xl mx-4"
          }`}
          data-modal="true"
          onClick={(e) => e.stopPropagation()}
          ref={modalRef}
          style={{
            userSelect: "none",
            WebkitUserSelect: "none",
            ...(isMobile && {
              height: "calc(100dvh - env(safe-area-inset-bottom, 0px))",
              maxHeight: "calc(100dvh - env(safe-area-inset-bottom, 0px))",
            }),
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <CropIcon className="w-5 h-5 text-[#563660]" />
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Image Area */}
            <div className="flex-1 flex flex-col p-4 bg-gray-100 min-h-0">
              {/* Controls */}
              <div className="flex flex-wrap gap-2 mb-4 bg-white rounded-lg p-3 shadow-sm">
                {/* Crop Mode */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    نمط الاقتطاع:
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleCropModeChange("free")}
                      className={`p-2 rounded-lg transition-colors ${
                        cropMode === "free"
                          ? "bg-[#563660] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title="حر"
                    >
                      <Maximize className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCropModeChange("square")}
                      className={`p-2 rounded-lg transition-colors ${
                        cropMode === "square"
                          ? "bg-[#563660] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title="مربع"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCropModeChange("circle")}
                      className={`p-2 rounded-lg transition-colors ${
                        cropMode === "circle"
                          ? "bg-[#563660] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title="دائري"
                    >
                      <Circle className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    التكبير:
                  </span>
                  <button
                    onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={() => setScale(Math.min(3, scale + 0.1))}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                {/* Rotation Controls */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    الدوران:
                  </span>
                  <button
                    onClick={() => setRotate((rotate - 90) % 360)}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                    {rotate}°
                  </span>
                  <button
                    onClick={() => setRotate((rotate + 90) % 360)}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>

                {/* Reset Button */}
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors px-3 py-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">إعادة تعيين</span>
                </button>
              </div>

              {/* Image Container */}
              <div className="flex-1 flex items-center justify-center bg-gray-200 rounded-lg overflow-hidden min-h-0">
                {imageSrc && (
                  <div
                    className="relative bg-white rounded-lg shadow-lg overflow-hidden"
                    style={{
                      width: `${containerDimensions.width}px`,
                      height: `${containerDimensions.height}px`,
                      maxWidth: "100%",
                      maxHeight: "100%",
                    }}
                  >
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={
                        cropMode === "square"
                          ? 1
                          : cropMode === "circle"
                          ? 1
                          : aspectRatio
                      }
                      circularCrop={cropMode === "circle"}
                      className="w-full h-full"
                      style={{ touchAction: "none" }}
                    >
                      <img
                        ref={imgRef}
                        alt="اقتطاع"
                        src={imageSrc}
                        style={{
                          transform: `scale(${scale}) rotate(${rotate}deg)`,
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          userSelect: "none",
                          WebkitUserSelect: "none",
                        }}
                        onLoad={onImageLoad}
                        onContextMenu={(e) => e.preventDefault()}
                        draggable={false}
                      />
                    </ReactCrop>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Desktop Only */}
            {!isMobile && (
              <div className="w-80 border-l border-gray-200 bg-white p-6 flex flex-col">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  معلومات الاقتطاع
                </h3>

                {/* Image Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    معلومات الصورة
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>النسبة: {imageAspectRatio.toFixed(2)}</p>
                    <p>
                      النمط:{" "}
                      {cropMode === "free"
                        ? "حر"
                        : cropMode === "square"
                        ? "مربع"
                        : "دائري"}
                    </p>
                    {completedCrop && (
                      <>
                        <p>
                          الأبعاد: {Math.round(completedCrop.width)} ×{" "}
                          {Math.round(completedCrop.height)}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">
                    نصائح للاستخدام:
                  </h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• اسحب الزوايا لتغيير حجم منطقة الاقتطاع</li>
                    <li>• اسحب المنطقة لتحريكها</li>
                    <li>• استخدم أزرار التكبير والدوران للتحكم الدقيق</li>
                    <li>• اختر النمط المناسب لاستخدامك</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto space-y-3">
                  <button
                    onClick={handleApplyCrop}
                    disabled={!completedCrop || isProcessing}
                    className={`w-full flex items-center justify-center gap-2 py-3 font-medium rounded-lg transition-all duration-200 ${
                      completedCrop && !isProcessing
                        ? "bg-[#563660] text-white hover:bg-[#4b2e55]"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        جاري المعالجة...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        تطبيق الاقتطاع
                      </>
                    )}
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Footer */}
          {isMobile && (
            <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
              {/* Quick Info */}
              {completedCrop && (
                <div className="mb-3 text-center">
                  <p className="text-sm text-gray-600">
                    الأبعاد: {Math.round(completedCrop.width)} ×{" "}
                    {Math.round(completedCrop.height)} | النمط:{" "}
                    {cropMode === "free"
                      ? "حر"
                      : cropMode === "square"
                      ? "مربع"
                      : "دائري"}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleApplyCrop}
                  disabled={!completedCrop || isProcessing}
                  className={`w-full flex items-center justify-center gap-2 py-3 font-medium rounded-lg transition-all duration-200 ${
                    completedCrop && !isProcessing
                      ? "bg-[#563660] text-white hover:bg-[#4b2e55]"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      جاري المعالجة...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      تطبيق الاقتطاع
                    </>
                  )}
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: "none" }} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default ImageCropModal;
