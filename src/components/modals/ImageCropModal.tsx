import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
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
  Check,
  Circle,
  RefreshCw,
  Image as ImageIcon,
  Crop as CropIcon,
} from "lucide-react";

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  onCropComplete: (croppedImageUrl: string, originalFile: File) => void;
  aspectRatio?: number;
  title?: string;
}

interface TouchState {
  initialDistance: number;
  initialScale: number;
  center: { x: number; y: number };
}

// تعريف نوع البيانات بشكل صريح
type CropMode = "flexible" | "circle" | "full";

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
  // استخدام النوع المُعرّف صراحة
  const [cropMode, setCropMode] = useState<CropMode>("flexible");

  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchState, setTouchState] = useState<TouchState | null>(null);
  const [isZooming, setIsZooming] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setScale(1);
        setRotate(0);
        setCrop(undefined);
        setCompletedCrop(undefined);
        setImagePosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(imageFile);
    }
  }, [isOpen, imageFile]);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const { width, height } = e.currentTarget;
      setImagePosition({ x: 0, y: 0 });

      if (cropMode === "full") {
        // للصورة الكاملة، لا نحتاج إلى crop
        setCrop(undefined);
        setCompletedCrop({
          x: 0,
          y: 0,
          width: width,
          height: height,
          unit: "px",
        });
        return;
      }

      const cropSize = 80; // حجم أكبر للاقتصاص المرن
      let targetAspectRatio;

      // تحديد نسبة العرض إلى الارتفاع حسب نمط الاقتصاص
      if (cropMode === "circle") {
        targetAspectRatio = 1; // دائري
      } else if (cropMode === "flexible") {
        targetAspectRatio = undefined; // اقتصاص حر ومرن من جميع الجهات
      } else {
        targetAspectRatio = aspectRatio; // حسب ما يحدده المطور
      }

      const newCrop = centerCrop(
        makeAspectCrop(
          { unit: "%", width: cropSize },
          targetAspectRatio || width / height, // إذا لم تكن هناك نسبة محددة، استخدم نسبة الصورة
          width,
          height
        ),
        width,
        height
      );

      setCrop(newCrop);
    },
    [cropMode, aspectRatio]
  );

  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getCenter = (touch1: React.Touch, touch2: React.Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setScale((prev) => Math.max(0.3, Math.min(5, prev + delta)));
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === imgRef.current) {
        setIsDragging(true);
        setDragStart({
          x: e.clientX - imagePosition.x,
          y: e.clientY - imagePosition.y,
        });
        e.preventDefault();
      }
    },
    [imagePosition]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        setImagePosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({
          x: touch.clientX - imagePosition.x,
          y: touch.clientY - imagePosition.y,
        });
      } else if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = getDistance(touch1, touch2);
        const center = getCenter(touch1, touch2);

        setTouchState({
          initialDistance: distance,
          initialScale: scale,
          center,
        });
        setIsZooming(true);
        setIsDragging(false);
      }
    },
    [imagePosition, scale]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 1 && isDragging && !isZooming) {
        const touch = e.touches[0];
        setImagePosition({
          x: touch.clientX - dragStart.x,
          y: touch.clientY - dragStart.y,
        });
      } else if (e.touches.length === 2 && touchState && isZooming) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = getDistance(touch1, touch2);
        const scaleChange = distance / touchState.initialDistance;
        const newScale = Math.max(
          0.3,
          Math.min(5, touchState.initialScale * scaleChange)
        );

        setScale(newScale);
      }
    },
    [isDragging, dragStart, touchState, isZooming]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 0) {
        setIsDragging(false);
        setIsZooming(false);
        setTouchState(null);
      } else if (e.touches.length === 1 && isZooming) {
        setIsZooming(false);
        setTouchState(null);

        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({
          x: touch.clientX - imagePosition.x,
          y: touch.clientY - imagePosition.y,
        });
      }
    },
    [isZooming, imagePosition]
  );

  const handleCropModeChange = (mode: CropMode) => {
    setCropMode(mode);
    if (imgRef.current) {
      const { width, height } = imgRef.current;

      if (mode === "full") {
        setCrop(undefined);
        setCompletedCrop({
          x: 0,
          y: 0,
          width: width,
          height: height,
          unit: "px",
        });
        return;
      }

      let targetAspectRatio;

      // تحديد نسبة العرض إلى الارتفاع حسب نمط الاقتصاص
      if (mode === "circle") {
        targetAspectRatio = 1; // دائري
      } else if (mode === "flexible") {
        targetAspectRatio = undefined; // اقتصاص حر ومرن من جميع الجهات
      } else {
        targetAspectRatio = aspectRatio; // حسب ما يحدده المطور
      }

      const newCrop = centerCrop(
        makeAspectCrop(
          { unit: "%", width: 70 },
          targetAspectRatio || width / height, // إذا لم تكن هناك نسبة محددة، استخدم نسبة الصورة
          width,
          height
        ),
        width,
        height
      );

      setCrop(newCrop);
    }
  };

  const handleApplyCrop = async () => {
    if (
      (!completedCrop && cropMode !== "full") ||
      !imgRef.current ||
      !imageFile
    )
      return;

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

      if (cropMode === "full") {
        // للصورة الكاملة، نستخدم الأبعاد الطبيعية للصورة
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        const centerX = image.naturalWidth / 2;
        const centerY = image.naturalHeight / 2;

        ctx.save();
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
      } else {
        // للاقتطاع العادي
        canvas.width = completedCrop!.width * scaleX;
        canvas.height = completedCrop!.height * scaleY;

        const cropX = completedCrop!.x * scaleX;
        const cropY = completedCrop!.y * scaleY;

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
      }

      const croppedDataUrl = canvas.toDataURL("image/png", 0.95);
      onCropComplete(croppedDataUrl, imageFile);
      onClose();
    } catch (error) {
      console.error("Error applying crop:", error);
      alert("حدث خطأ أثناء اقتطاع الصورة. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setScale(1);
    setRotate(0);
    setCropMode("flexible");
    setImagePosition({ x: 0, y: 0 });
    if (imgRef.current) {
      onImageLoad({ currentTarget: imgRef.current } as React.SyntheticEvent<
        HTMLImageElement,
        Event
      >);
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(5, prev + 0.1));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.3, prev - 0.1));
  };

  const getImageDisplayStyle = () => {
    if (!containerRef.current) {
      return {
        maxWidth: "100%",
        maxHeight: "100%",
        width: "auto",
        height: "auto",
      };
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width - 40;
    const containerHeight = containerRect.height - 40;

    return {
      maxWidth: `${containerWidth}px`,
      maxHeight: `${containerHeight}px`,
      width: "auto",
      height: "auto",
      objectFit: "contain" as const,
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full h-full max-w-6xl max-h-[95vh] bg-white flex flex-col overflow-hidden rounded-none md:rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 bg-white flex-shrink-0">
          <h3 className="text-sm md:text-base font-semibold text-gray-900">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-3 md:p-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between gap-2 md:gap-4 flex-wrap">
            {/* نمط الاقتطاع */}
            <div className="flex gap-1 bg-white rounded-lg p-1 border shadow-sm">
              <button
                onClick={() => handleCropModeChange("flexible")}
                className={`p-1.5 md:p-2 rounded-md transition-all ${
                  cropMode === "flexible"
                    ? "bg-[#563660] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                title="اقتصاص مرن من جميع الجهات"
              >
                <CropIcon className="w-3 h-3 md:w-4 md:h-4" />
              </button>
              <button
                onClick={() => handleCropModeChange("circle")}
                className={`p-1.5 md:p-2 rounded-md transition-all ${
                  cropMode === "circle"
                    ? "bg-[#563660] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                title="اقتصاص دائري"
              >
                <Circle className="w-3 h-3 md:w-4 md:h-4" />
              </button>
              <button
                onClick={() => handleCropModeChange("full")}
                className={`p-1.5 md:p-2 rounded-md transition-all ${
                  cropMode === "full"
                    ? "bg-[#563660] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                title="الصورة الكاملة"
              >
                <ImageIcon className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>

            {/* أدوات التحكم */}
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={handleZoomOut}
                className="p-1.5 md:p-2 bg-white border text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={scale <= 0.3}
              >
                <ZoomOut className="w-3 h-3 md:w-4 md:h-4" />
              </button>
              <span className="text-xs md:text-sm text-gray-700 min-w-[2.5rem] md:min-w-[3rem] text-center font-medium">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 md:p-2 bg-white border text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={scale >= 5}
              >
                <ZoomIn className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>

            {/* أدوات إضافية */}
            <div className="flex gap-1 md:gap-2">
              <button
                onClick={() => setRotate((rotate + 90) % 360)}
                className="p-1.5 md:p-2 bg-white border text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCw className="w-3 h-3 md:w-4 md:h-4" />
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 md:p-2 bg-white border text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* منطقة الصورة الرئيسية */}
        <div className="flex-1 flex items-center justify-center bg-gray-100 relative overflow-hidden">
          {imageSrc && (
            <div
              ref={containerRef}
              className="relative w-full h-full flex items-center justify-center p-2 md:p-4"
              style={{
                cursor:
                  cropMode === "full"
                    ? isDragging
                      ? "grabbing"
                      : "grab"
                    : "default",
                touchAction: "none",
                userSelect: "none",
              }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="relative bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-300 max-w-full max-h-full flex items-center justify-center">
                {cropMode === "full" ? (
                  <img
                    ref={imgRef}
                    alt="اقتطاع"
                    src={imageSrc}
                    style={{
                      ...getImageDisplayStyle(),
                      transform: `scale(${scale}) rotate(${rotate}deg) translate(${
                        imagePosition.x / scale
                      }px, ${imagePosition.y / scale}px)`,
                      userSelect: "none",
                      WebkitUserSelect: "none",
                      cursor:
                        cropMode === "full"
                          ? isDragging
                            ? "grabbing"
                            : "grab"
                          : "default",
                      transition:
                        isDragging || isZooming
                          ? "none"
                          : "transform 0.1s ease",
                      display: "block",
                      margin: "auto",
                    }}
                    onLoad={onImageLoad}
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                  />
                ) : (
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={cropMode === "circle" ? 1 : undefined}
                    circularCrop={cropMode === "circle"}
                    className="flex items-center justify-center crop-container"
                    style={{
                      touchAction: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    ruleOfThirds={true}
                    keepSelection={true}
                    minWidth={20}
                    minHeight={20}
                  >
                    <img
                      ref={imgRef}
                      alt="اقتطاع"
                      src={imageSrc}
                      style={{
                        ...getImageDisplayStyle(),
                        transform: `scale(${scale}) rotate(${rotate}deg) translate(${
                          imagePosition.x / scale
                        }px, ${imagePosition.y / scale}px)`,
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        cursor: isDragging
                          ? "grabbing"
                          : isZooming
                          ? "zoom-in"
                          : "grab",
                        transition:
                          isDragging || isZooming
                            ? "none"
                            : "transform 0.1s ease",
                        display: "block",
                        margin: "auto",
                      }}
                      onLoad={onImageLoad}
                      onContextMenu={(e) => e.preventDefault()}
                      draggable={false}
                    />
                  </ReactCrop>
                )}
              </div>
            </div>
          )}
        </div>

        {/* أزرار الإجراءات */}
        <div className="p-3 md:p-4 bg-white border-t border-gray-200 flex-shrink-0">
          <div className="flex gap-2 md:gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleApplyCrop}
              disabled={(!completedCrop && cropMode !== "full") || isProcessing}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 md:py-3 font-medium rounded-xl transition-all duration-200 text-sm md:text-base ${
                (completedCrop || cropMode === "full") && !isProcessing
                  ? "bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white shadow-lg hover:shadow-xl"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <Check className="w-3 h-3 md:w-4 md:h-4" />
                  تطبيق
                </>
              )}
            </motion.button>

            <button
              onClick={onClose}
              className="flex-1 py-2.5 md:py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-200 text-sm md:text-base"
            >
              إلغاء
            </button>
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </motion.div>
    </div>
  );
};

export default ImageCropModal;
