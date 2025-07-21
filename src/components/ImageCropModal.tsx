import React, { useState, useRef, useCallback } from "react";
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
} from "lucide-react";

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  onCropComplete: (croppedImageUrl: string, originalFile: File) => void;
  aspectRatio?: number; // نسبة العرض إلى الارتفاع المطلوبة
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
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [cropMode, setCropMode] = useState<"free" | "square" | "circle">(
    "free"
  );
  const [isMobile, setIsMobile] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // تحديد ما إذا كان الجهاز محمولاً
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  // تحميل الصورة عند فتح المودال
  React.useEffect(() => {
    if (isOpen && imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setScale(1);
        setRotate(0);
        setCrop(undefined);
        setCompletedCrop(undefined);
        setPreviewUrl("");
      };
      reader.readAsDataURL(imageFile);
    }
  }, [isOpen, imageFile]);

  // تحديد الاقتطاع الافتراضي عند تحميل الصورة
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const { width, height } = e.currentTarget;

      let newCrop: Crop;

      if (cropMode === "square") {
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
    },
    [aspectRatio, cropMode]
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

  // إنشاء معاينة للاقتطاع
  const generatePreview = useCallback(async () => {
    // إخفاء المعاينة في الهواتف
    if (isMobile) return;

    if (!completedCrop || !imgRef.current || !canvasRef.current) return;

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelRatio = window.devicePixelRatio;
    canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = "high";

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

    // إنشاء دائرة للاقتطاع الدائري
    if (cropMode === "circle") {
      const radius = Math.min(canvas.width, canvas.height) / 2;
      ctx.globalCompositeOperation = "destination-in";
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, 2 * Math.PI);
      ctx.fill();
    }

    const previewDataUrl = canvas.toDataURL("image/png", 0.9);
    setPreviewUrl(previewDataUrl);
  }, [completedCrop, scale, rotate, cropMode, isMobile]);

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

      // تطبيق الاقتطاع الدائري
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

  // تحديث المعاينة عند تغيير الاقتطاع
  React.useEffect(() => {
    if (completedCrop) {
      generatePreview();
    }
  }, [generatePreview, completedCrop]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4 overflow-hidden"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`bg-white rounded-2xl shadow-xl w-full overflow-hidden ${
            isMobile
              ? "max-w-full max-h-[85vh] rounded-lg"
              : "max-w-6xl max-h-[95vh]"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between border-b border-gray-200 bg-gray-50 ${
              isMobile ? "p-3" : "p-6"
            }`}
          >
            <h2
              className={`font-medium text-gray-900 flex items-center gap-2 ${
                isMobile ? "text-base" : "text-xl"
              }`}
            >
              <CropIcon className="w-5 h-5 text-[#563660]" />
              {title}
            </h2>
            <button
              onClick={onClose}
              className={`hover:bg-gray-200 rounded-lg transition-colors ${
                isMobile ? "p-1" : "p-2"
              }`}
            >
              <X
                className={`text-gray-500 ${isMobile ? "w-4 h-4" : "w-5 h-5"}`}
              />
            </button>
          </div>

          <div
            className={`flex ${
              isMobile
                ? "flex-col"
                : "flex-col lg:flex-row h-[calc(95vh-120px)]"
            }`}
          >
            {/* Main Crop Area */}
            <div className={`flex-1 overflow-auto ${isMobile ? "p-2" : "p-6"}`}>
              <div className="flex flex-col h-full">
                {/* Controls */}
                <div
                  className={`flex flex-wrap mb-4 bg-gray-50 rounded-lg ${
                    isMobile ? "gap-1 p-2" : "gap-4 p-4 mb-6"
                  }`}
                >
                  {/* Crop Mode */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium text-gray-700 ${
                        isMobile ? "text-xs hidden" : "text-sm"
                      }`}
                    >
                      نمط الاقتطاع:
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleCropModeChange("free")}
                        className={`rounded-lg transition-colors ${
                          isMobile ? "p-1" : "p-2"
                        } ${
                          cropMode === "free"
                            ? "bg-[#563660] text-white"
                            : "bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                        title="حر"
                      >
                        <Maximize
                          className={isMobile ? "w-2.5 h-2.5" : "w-4 h-4"}
                        />
                      </button>
                      <button
                        onClick={() => handleCropModeChange("square")}
                        className={`rounded-lg transition-colors ${
                          isMobile ? "p-1" : "p-2"
                        } ${
                          cropMode === "square"
                            ? "bg-[#563660] text-white"
                            : "bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                        title="مربع"
                      >
                        <Square
                          className={isMobile ? "w-2.5 h-2.5" : "w-4 h-4"}
                        />
                      </button>
                      <button
                        onClick={() => handleCropModeChange("circle")}
                        className={`rounded-lg transition-colors ${
                          isMobile ? "p-1" : "p-2"
                        } ${
                          cropMode === "circle"
                            ? "bg-[#563660] text-white"
                            : "bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                        title="دائري"
                      >
                        <Circle
                          className={isMobile ? "w-2.5 h-2.5" : "w-4 h-4"}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Scale Control */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium text-gray-700 ${
                        isMobile ? "text-xs hidden" : "text-sm"
                      }`}
                    >
                      التكبير:
                    </span>
                    <button
                      onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                      className={`bg-white rounded hover:bg-gray-100 transition-colors ${
                        isMobile ? "p-0.5" : "p-1"
                      }`}
                    >
                      <ZoomOut
                        className={isMobile ? "w-2.5 h-2.5" : "w-4 h-4"}
                      />
                    </button>
                    <span
                      className={`text-gray-600 text-center ${
                        isMobile
                          ? "text-xs min-w-[2rem]"
                          : "text-sm min-w-[3rem]"
                      }`}
                    >
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      onClick={() => setScale(Math.min(3, scale + 0.1))}
                      className={`bg-white rounded hover:bg-gray-100 transition-colors ${
                        isMobile ? "p-0.5" : "p-1"
                      }`}
                    >
                      <ZoomIn
                        className={isMobile ? "w-2.5 h-2.5" : "w-4 h-4"}
                      />
                    </button>
                  </div>

                  {/* Rotation Control */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium text-gray-700 ${
                        isMobile ? "text-xs hidden" : "text-sm"
                      }`}
                    >
                      الدوران:
                    </span>
                    <button
                      onClick={() => setRotate((rotate - 90) % 360)}
                      className={`bg-white rounded hover:bg-gray-100 transition-colors ${
                        isMobile ? "p-0.5" : "p-1"
                      }`}
                    >
                      <RotateCw
                        className={`transform scale-x-[-1] ${
                          isMobile ? "w-2.5 h-2.5" : "w-4 h-4"
                        }`}
                      />
                    </button>
                    <span
                      className={`text-gray-600 text-center ${
                        isMobile
                          ? "text-xs min-w-[2rem]"
                          : "text-sm min-w-[3rem]"
                      }`}
                    >
                      {rotate}°
                    </span>
                    <button
                      onClick={() => setRotate((rotate + 90) % 360)}
                      className={`bg-white rounded hover:bg-gray-100 transition-colors ${
                        isMobile ? "p-0.5" : "p-1"
                      }`}
                    >
                      <RotateCw
                        className={isMobile ? "w-2.5 h-2.5" : "w-4 h-4"}
                      />
                    </button>
                  </div>

                  {/* Reset Button */}
                  <button
                    onClick={handleReset}
                    className={`flex items-center gap-1 bg-white text-gray-600 rounded hover:bg-gray-100 transition-colors ${
                      isMobile ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
                    }`}
                  >
                    <RefreshCw
                      className={isMobile ? "w-2.5 h-2.5" : "w-4 h-4"}
                    />
                    {isMobile ? "إعادة" : "إعادة تعيين"}
                  </button>
                </div>

                {/* Crop Area */}
                <div
                  className={`flex-1 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden ${
                    isMobile ? "min-h-[200px] max-h-[300px]" : ""
                  }`}
                >
                  {imageSrc && (
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
                      className="max-w-full max-h-full"
                    >
                      <img
                        ref={imgRef}
                        alt="اقتطاع"
                        src={imageSrc}
                        style={{
                          transform: `scale(${scale}) rotate(${rotate}deg)`,
                          maxWidth: "100%",
                          maxHeight: "100%",
                        }}
                        onLoad={onImageLoad}
                        className="max-w-full max-h-full object-contain"
                      />
                    </ReactCrop>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            {!isMobile && (
              <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-r border-gray-200 bg-gray-50 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  معاينة النتيجة
                </h3>

                <div className="bg-white rounded-lg p-4 mb-6">
                  {previewUrl ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={previewUrl}
                        alt="معاينة الاقتطاع"
                        className={`max-w-full max-h-48 object-contain ${
                          cropMode === "circle" ? "rounded-full" : "rounded-lg"
                        }`}
                      />
                      <div className="mt-3 text-sm text-gray-600 text-center">
                        <p>
                          الأبعاد: {completedCrop?.width || 0} ×{" "}
                          {completedCrop?.height || 0}
                        </p>
                        <p>
                          النمط:{" "}
                          {cropMode === "free"
                            ? "حر"
                            : cropMode === "square"
                            ? "مربع"
                            : "دائري"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                      <CropIcon className="w-12 h-12 mb-2" />
                      <p className="text-sm">قم بتحديد منطقة الاقتطاع</p>
                    </div>
                  )}
                </div>

                {/* Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">
                    نصائح:
                  </h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• اسحب الزوايا لتغيير حجم منطقة الاقتطاع</li>
                    <li>• اسحب المنطقة لتحريكها</li>
                    <li>• استخدم أزرار التكبير والدوران للتحكم الدقيق</li>
                    <li>• اختر النمط المناسب لاستخدامك</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
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

            {/* Mobile Action Buttons - تظهر فقط في الهواتف */}
            {isMobile && (
              <div className="p-3 bg-white border-t border-gray-200">
                <div className="space-y-2">
                  <button
                    onClick={handleApplyCrop}
                    disabled={!completedCrop || isProcessing}
                    className={`w-full flex items-center justify-center gap-2 py-2 font-medium rounded-lg transition-all duration-200 text-sm ${
                      completedCrop && !isProcessing
                        ? "bg-[#563660] text-white hover:bg-[#4b2e55]"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                    className="w-full py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
                  >
                    إلغاء
                  </button>
                </div>

                {/* معلومات مبسطة للهاتف */}
                {completedCrop && (
                  <div className="mt-2 text-center">
                    <p className="text-xs text-gray-600">
                      الأبعاد: {completedCrop.width} × {completedCrop.height} |
                      النمط:{" "}
                      {cropMode === "free"
                        ? "حر"
                        : cropMode === "square"
                        ? "مربع"
                        : "دائري"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hidden Canvas for Processing */}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageCropModal;
