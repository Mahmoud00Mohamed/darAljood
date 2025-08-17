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

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setRotate(0);
        setCrop(undefined);
        setCompletedCrop(undefined);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [isOpen, imageFile]);

  // إضافة دالة مساعدة لحساب completedCrop من crop
  const calculateCompletedCrop = useCallback(
    (cropData: Crop, imageWidth: number, imageHeight: number): PixelCrop => {
      return {
        x: (cropData.x / 100) * imageWidth,
        y: (cropData.y / 100) * imageHeight,
        width: (cropData.width / 100) * imageWidth,
        height: (cropData.height / 100) * imageHeight,
        unit: "px",
      };
    },
    []
  );

  // دالة لمحاكاة حركة صغيرة لتفعيل completedCrop
  const simulateSmallCropMovement = useCallback(
    (initialCrop: Crop) => {
      if (!imgRef.current) return;

      const { width, height } = imgRef.current;

      // حركة صغيرة جداً (0.1 بكسل تقريباً)
      const microMovement = (0.1 / Math.max(width, height)) * 100; // تحويل إلى نسبة مئوية

      // إنشاء crop بحركة صغيرة
      const movedCrop: Crop = {
        ...initialCrop,
        x: Math.max(
          0,
          Math.min(100 - initialCrop.width, initialCrop.x + microMovement)
        ),
        y: Math.max(
          0,
          Math.min(100 - initialCrop.height, initialCrop.y + microMovement)
        ),
      };

      // تطبيق الحركة مع تأخير قصير
      setTimeout(() => {
        setCrop(movedCrop);
        const completedCrop = calculateCompletedCrop(movedCrop, width, height);
        setCompletedCrop(completedCrop);

        // العودة للموضع الأصلي بعد تأخير قصير
        setTimeout(() => {
          setCrop(initialCrop);
          const originalCompletedCrop = calculateCompletedCrop(
            initialCrop,
            width,
            height
          );
          setCompletedCrop(originalCompletedCrop);
        }, 50);
      }, 100);
    },
    [calculateCompletedCrop]
  );

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

      // ⭐ محاكاة حركة صغيرة لتفعيل completedCrop تلقائياً
      simulateSmallCropMovement(newCrop);
    },
    [cropMode, aspectRatio, simulateSmallCropMovement]
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

      // ⭐ محاكاة حركة صغيرة لتفعيل completedCrop تلقائياً عند تغيير النمط
      simulateSmallCropMovement(newCrop);
    }
  };

  // ⭐ تعديل دالة onChange لضمان تحديث completedCrop
  const handleCropChange = useCallback(
    (_c: PixelCrop, percentCrop: Crop) => {
      setCrop(percentCrop);

      // إذا كان لدينا المرجع للصورة، احسب completedCrop فورًا
      if (imgRef.current && percentCrop.width && percentCrop.height) {
        const { width, height } = imgRef.current;
        const newCompletedCrop = calculateCompletedCrop(
          percentCrop,
          width,
          height
        );
        setCompletedCrop(newCompletedCrop);
      }
    },
    [calculateCompletedCrop]
  );

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
    setCropMode("flexible");
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
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-0 md:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full h-full md:max-w-6xl md:max-h-[95vh] bg-white flex flex-col overflow-hidden rounded-none md:rounded-2xl shadow-2xl"
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
                    : "text-gray-600 md:hover:bg-gray-100"
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
                    : "text-gray-600 md:hover:bg-gray-100"
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
                    : "text-gray-600 md:hover:bg-gray-100"
                }`}
                title="الصورة الكاملة"
              >
                <ImageIcon className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>

            {/* أدوات إضافية */}
            <div className="flex gap-1 md:gap-2">
              <button
                onClick={() => setRotate((rotate + 90) % 360)}
                className="p-1.5 md:p-2 bg-white border text-gray-600 rounded-lg md:hover:bg-gray-50 transition-colors"
              >
                <RotateCw className="w-3 h-3 md:w-4 md:h-4" />
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 md:p-2 bg-white border text-gray-600 rounded-lg md:hover:bg-gray-50 transition-colors"
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
            >
              <div className="relative bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-300 max-w-full max-h-full flex items-center justify-center">
                {cropMode === "full" ? (
                  <img
                    ref={imgRef}
                    alt="اقتطاع"
                    src={imageSrc}
                    style={{
                      ...getImageDisplayStyle(),
                      transform: `rotate(${rotate}deg)`,
                      userSelect: "none",
                      WebkitUserSelect: "none",
                      display: "block",
                      margin: "auto",
                    }}
                    onLoad={onImageLoad}
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                  />
                ) : (
                  <div className="relative">
                    <ReactCrop
                      crop={crop}
                      onChange={handleCropChange}
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
                      minWidth={80} // حد أدنى محسن للهواتف
                      minHeight={80}
                      // إعدادات محسنة للهواتف
                      disabled={false}
                      locked={false}
                    >
                      <img
                        ref={imgRef}
                        alt="اقتطاع"
                        src={imageSrc}
                        style={{
                          ...getImageDisplayStyle(),
                          transform: `rotate(${rotate}deg)`,
                          userSelect: "none",
                          WebkitUserSelect: "none",
                          display: "block",
                          margin: "auto",
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

        {/* أزرار الإجراءات */}
        <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleApplyCrop}
              disabled={(!completedCrop && cropMode !== "full") || isProcessing}
              className={`flex-1 flex items-center justify-center gap-2 py-3 font-medium rounded-xl transition-all duration-200 text-base ${
                (completedCrop || cropMode === "full") && !isProcessing
                  ? "bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white shadow-lg hover:shadow-xl"
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
                  تطبيق
                </>
              )}
            </motion.button>

            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl md:hover:bg-gray-50 transition-colors duration-200 text-base"
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
