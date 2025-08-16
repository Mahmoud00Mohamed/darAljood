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
  Check,
  Circle,
  RefreshCw,
  Image as ImageIcon,
  Crop as CropIcon,
  Move,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  onCropComplete: (croppedImageUrl: string, originalFile: File) => void;
  aspectRatio?: number;
  title?: string;
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
  const [rotate, setRotate] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  // استخدام النوع المُعرّف صراحة
  const [cropMode, setCropMode] = useState<CropMode>("flexible");
  const [isMobile, setIsMobile] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showInstructions, setShowInstructions] = useState(true);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setRotate(0);
        setCrop(undefined);
        setCompletedCrop(undefined);
        setImageScale(1);
        setImagePosition({ x: 0, y: 0 });
        setShowInstructions(true);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [isOpen, imageFile]);

  // كشف وضع الهاتف المحمول
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // إخفاء التعليمات بعد 3 ثوان
  useEffect(() => {
    if (showInstructions && isMobile) {
      const timer = setTimeout(() => {
        setShowInstructions(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showInstructions, isMobile]);

  // معالجة اللمس للهواتف
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && imageScale > 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({
        x: touch.clientX - imagePosition.x,
        y: touch.clientY - imagePosition.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // منع التمرير
    
    if (e.touches.length === 1 && isDragging && imageScale > 1) {
      const touch = e.touches[0];
      setImagePosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    } else if (e.touches.length === 2) {
      // Pinch to zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      // حفظ المسافة الأولية إذا لم تكن محفوظة
      if (!dragStart.initialDistance) {
        setDragStart(prev => ({ ...prev, initialDistance: distance }));
      } else {
        const scaleChange = distance / dragStart.initialDistance;
        const newScale = Math.max(0.5, Math.min(3, imageScale * scaleChange));
        setImageScale(newScale);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setDragStart({ x: 0, y: 0 });
  };

  // معالجة الماوس للكمبيوتر
  const handleMouseDown = (e: React.MouseEvent) => {
    if (imageScale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && imageScale > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // أزرار التكبير والتصغير
  const handleZoomIn = () => {
    setImageScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setImageScale(prev => Math.max(prev - 0.25, 0.5));
  };

  // إعادة تعيين الصورة
  const handleResetImage = () => {
    setImageScale(1);
    setImagePosition({ x: 0, y: 0 });
  };
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const { width, height } = e.currentTarget;

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

      const cropSize = isMobile ? 85 : 80; // حجم أكبر للهواتف
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

  const handleCropModeChange = (mode: CropMode) => {
    setCropMode(mode);
    setShowInstructions(true);
    
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

      const cropSize = isMobile ? 85 : 70;
      const newCrop = centerCrop(
        makeAspectCrop(
          { unit: "%", width: cropSize },
          targetAspectRatio || width / height,
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
    setRotate(0);
    setImageScale(1);
    setImagePosition({ x: 0, y: 0 });
    setCropMode("flexible");
    setShowInstructions(true);
    if (imgRef.current) {
      onImageLoad({ currentTarget: imgRef.current } as React.SyntheticEvent<
        HTMLImageElement,
        Event
      >);
    }
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
    const containerWidth = containerRect.width - (isMobile ? 20 : 40);
    const containerHeight = containerRect.height - (isMobile ? 20 : 40);

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
        className={`w-full h-full bg-white flex flex-col overflow-hidden shadow-2xl ${
          isMobile ? "rounded-none" : "max-w-6xl max-h-[95vh] rounded-2xl"
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between border-b border-gray-200 bg-white flex-shrink-0 ${
          isMobile ? "p-4 pb-3" : "p-4"
        }`}>
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

        {/* تعليمات للهواتف */}
        {isMobile && showInstructions && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-50 border-b border-blue-200 p-3"
          >
            <div className="flex items-center gap-2 text-blue-800">
              <Move className="w-4 h-4" />
              <span className="text-sm font-medium">
                اسحب لتحريك • اقرص للتكبير • اسحب الزوايا للقص
              </span>
            </div>
          </motion.div>
        )}

        {/* Controls */}
        <div className={`bg-gray-50 border-b border-gray-200 flex-shrink-0 ${
          isMobile ? "p-3" : "p-4"
        }`}>
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

            {/* أدوات إضافية */}
            <div className="flex gap-1 md:gap-2">
              {/* أزرار التكبير للهواتف */}
              {isMobile && (
                <>
                  <button
                    onClick={handleZoomOut}
                    disabled={imageScale <= 0.5}
                    className="p-1.5 bg-white border text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <ZoomOut className="w-3 h-3" />
                  </button>
                  <div className="flex items-center px-2 bg-white border rounded-lg">
                    <span className="text-xs font-medium text-gray-700">
                      {Math.round(imageScale * 100)}%
                    </span>
                  </div>
                  <button
                    onClick={handleZoomIn}
                    disabled={imageScale >= 3}
                    className="p-1.5 bg-white border text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </button>
                </>
              )}
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
        <div 
          className="flex-1 flex items-center justify-center bg-gray-100 relative overflow-hidden"
          style={{
            touchAction: "none", // منع التمرير الافتراضي
          }}
        >
          {imageSrc && (
            <div
              ref={containerRef}
              className={`relative w-full h-full flex items-center justify-center ${
                isMobile ? "p-2" : "p-4"
              }`}
            >
              <div 
                ref={imageContainerRef}
                className={`relative bg-white shadow-lg overflow-hidden border-2 border-gray-300 max-w-full max-h-full flex items-center justify-center ${
                  isMobile ? "rounded-lg" : "rounded-lg"
                }`}
                style={{
                  cursor: imageScale > 1 ? (isDragging ? "grabbing" : "grab") : "default",
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {cropMode === "full" ? (
                  <img
                    ref={imgRef}
                    alt="اقتطاع"
                    src={imageSrc}
                    style={{
                      ...getImageDisplayStyle(),
                      transform: `rotate(${rotate}deg) scale(${imageScale}) translate(${imagePosition.x / imageScale}px, ${imagePosition.y / imageScale}px)`,
                      userSelect: "none",
                      WebkitUserSelect: "none",
                      display: "block",
                      margin: "auto",
                      transition: isDragging ? "none" : "transform 0.2s ease",
                    }}
                    onLoad={onImageLoad}
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                  />
                ) : (
                  <div className="relative">
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={cropMode === "circle" ? 1 : undefined}
                      circularCrop={cropMode === "circle"}
                      className="flex items-center justify-center crop-container"
                      style={{
                        touchAction: "manipulation",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      ruleOfThirds={true}
                      keepSelection={true}
                      minWidth={isMobile ? 80 : 50} // حد أدنى أكبر للهواتف
                      minHeight={isMobile ? 80 : 50}
                      // إعدادات محسنة للهواتف
                      disabled={false}
                      locked={false}
                      renderSelectionAddon={() => (
                        <div className="absolute inset-0 pointer-events-none">
                          {/* مقابض الزوايا - دائماً موجودة */}
                          <div className={`absolute -top-2 -left-2 bg-[#563660] border-2 border-white rounded-full shadow-lg ${
                            isMobile ? "w-8 h-8" : "w-6 h-6"
                          }`}></div>
                          <div className={`absolute -top-2 -right-2 bg-[#563660] border-2 border-white rounded-full shadow-lg ${
                            isMobile ? "w-8 h-8" : "w-6 h-6"
                          }`}></div>
                          <div className={`absolute -bottom-2 -left-2 bg-[#563660] border-2 border-white rounded-full shadow-lg ${
                            isMobile ? "w-8 h-8" : "w-6 h-6"
                          }`}></div>
                          <div className={`absolute -bottom-2 -right-2 bg-[#563660] border-2 border-white rounded-full shadow-lg ${
                            isMobile ? "w-8 h-8" : "w-6 h-6"
                          }`}></div>
                          {/* مقابض جانبية - تظهر فقط في أجهزة الكمبيوتر وليس في الاقتصاص الدائري */}
                          {!isMobile && cropMode !== "circle" && (
                            <>
                              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#563660] border-2 border-white rounded-full shadow-lg"></div>
                              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#563660] border-2 border-white rounded-full shadow-lg"></div>
                              <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-[#563660] border-2 border-white rounded-full shadow-lg"></div>
                              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-[#563660] border-2 border-white rounded-full shadow-lg"></div>
                            </>
                          )}
                        </div>
                      )}
                    >
                      <img
                        ref={imgRef}
                        alt="اقتطاع"
                        src={imageSrc}
                        style={{
                          ...getImageDisplayStyle(),
                          transform: `rotate(${rotate}deg) scale(${imageScale}) translate(${imagePosition.x / imageScale}px, ${imagePosition.y / imageScale}px)`,
                          userSelect: "none",
                          WebkitUserSelect: "none",
                          display: "block",
                          margin: "auto",
                          transition: isDragging ? "none" : "transform 0.2s ease",
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
          )}
        </div>

        {/* أدوات التحكم الإضافية للهواتف */}
        {isMobile && imageScale > 1 && (
          <div className="bg-white border-t border-gray-200 p-3 flex items-center justify-center gap-4">
            <button
              onClick={handleResetImage}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              إعادة تعيين العرض
            </button>
          </div>
        )}

        {/* أزرار الإجراءات */}
        <div className={`bg-white border-t border-gray-200 flex-shrink-0 ${
          isMobile ? "p-4" : "p-4"
        }`}>
          <div className="flex gap-2 md:gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleApplyCrop}
              disabled={(!completedCrop && cropMode !== "full") || isProcessing}
              className={`flex-1 flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 ${
                isMobile ? "py-3 text-base" : "py-2.5 md:py-3 text-sm md:text-base"
              } ${
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
              className={`flex-1 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-200 ${
                isMobile ? "py-3 text-base" : "py-2.5 md:py-3 text-sm md:text-base"
              }`}
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
