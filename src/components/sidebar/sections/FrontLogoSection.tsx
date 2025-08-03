import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useJacket, LogoPosition } from "../../../context/JacketContext";
import { Upload, Trash2, AlertCircle, RefreshCw, Crop, X } from "lucide-react";
import { PRICING_CONFIG } from "../../../constants/pricing";
import CloudinaryImageUpload from "../../forms/CloudinaryImageUpload";
import { CloudinaryImageData } from "../../../services/imageUploadService";

const FrontLogoSection: React.FC = () => {
  const {
    jacketState,
    addLogo,
    updateLogo,
    removeLogo,
    addUploadedImage,
    findExistingImage,
    getUploadedImages,
  } = useJacket();
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>(null);
  const [position, setPosition] = useState<LogoPosition>("chestRight");
  const [showExistingImages, setShowExistingImages] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const logoPositions: { id: LogoPosition; name: string }[] = [
    { id: "chestRight", name: "الصدر الأيمن" },
    { id: "chestLeft", name: "الصدر الأيسر" },
  ];

  const isPositionOccupied = (pos: LogoPosition) => {
    return (
      jacketState.logos.some((logo) => logo.position === pos) ||
      jacketState.texts.some((text) => text.position === pos)
    );
  };

  const frontLogos = jacketState.logos.filter((logo) =>
    ["chestRight", "chestLeft"].includes(logo.position)
  ).length;

  const frontTexts = jacketState.texts.filter((text) =>
    ["chestRight", "chestLeft"].includes(text.position)
  ).length;

  const totalFrontItems = frontLogos + frontTexts;
  const isExtraItem =
    totalFrontItems >= PRICING_CONFIG.includedItems.frontItems;

  useEffect(() => {
    const occupiedPositions = [
      ...jacketState.logos.map((logo) => logo.position),
      ...jacketState.texts.map((text) => text.position),
    ];
    if (
      occupiedPositions.includes("chestRight") &&
      !occupiedPositions.includes("chestLeft")
    ) {
      setPosition("chestLeft");
    } else if (!occupiedPositions.includes("chestRight")) {
      setPosition("chestRight");
    }
  }, [jacketState.logos, jacketState.texts]);

  const handleLogoUpload = (imageData: CloudinaryImageData) => {
    if (!isPositionOccupied(position)) {
      // البحث عن صورة مطابقة موجودة مسبقاً باستخدام publicId
      const existingImage = findExistingImage(imageData.url);

      if (existingImage) {
        // استخدام الصورة الموجودة
        console.log("استخدام صورة موجودة مسبقاً:", imageData.publicId);
        const img = new Image();
        img.src = existingImage.url;
        img.onload = () => {
          const boxWidth = position === "chestRight" ? 70 : 70;
          const boxHeight = position === "chestRight" ? 70 : 70;
          const scaleX = boxWidth / img.width;
          const scaleY = boxHeight / img.height;
          const initialScale = Math.min(scaleX, scaleY);
          addLogo({
            id: `logo-${Date.now()}`,
            image: existingImage.url,
            position,
            x: 0,
            y: 0,
            scale: initialScale,
          });
        };
      } else {
        // إضافة صورة جديدة
        const img = new Image();
        img.src = imageData.url;
        img.onload = () => {
          const boxWidth = position === "chestRight" ? 70 : 70;
          const boxHeight = position === "chestRight" ? 70 : 70;
          const scaleX = boxWidth / img.width;
          const scaleY = boxHeight / img.height;
          const initialScale = Math.min(scaleX, scaleY);

          // حفظ الصورة في قائمة الصور المرفوعة
          const newUploadedImage = {
            id: `uploaded-${Date.now()}`,
            url: imageData.url,
            name: imageData.publicId.split("/").pop() || "صورة مرفوعة",
            uploadedAt: new Date(),
          };
          addUploadedImage(newUploadedImage);

          addLogo({
            id: `logo-${Date.now()}`,
            image: imageData.url,
            position,
            x: 0,
            y: 0,
            scale: initialScale,
          });

          console.log("تم رفع صورة جديدة:", imageData.publicId);
        };
      }
      setShowImageUpload(false);
    }
  };

  const handleExistingImageSelect = (imageUrl: string) => {
    if (!isPositionOccupied(position)) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        const boxWidth = position === "chestRight" ? 70 : 70;
        const boxHeight = position === "chestRight" ? 70 : 70;
        const scaleX = boxWidth / img.width;
        const scaleY = boxHeight / img.height;
        const initialScale = Math.min(scaleX, scaleY);
        addLogo({
          id: `logo-${Date.now()}`,
          image: imageUrl,
          position,
          x: 0,
          y: 0,
          scale: initialScale,
        });
      };
      setShowExistingImages(false);
    }
  };

  const filteredLogos = jacketState.logos.filter((logo) =>
    ["chestRight", "chestLeft"].includes(logo.position)
  );

  const selectedLogo = selectedLogoId
    ? jacketState.logos.find((logo) => logo.id === selectedLogoId)
    : null;

  const uploadedImages = getUploadedImages();

  return (
    <div className="space-y-6 overflow-x-hidden">
      <h3 className="text-lg font-medium text-gray-900 mb-4 truncate">
        إضافة الشعارات (أمامي)
      </h3>

      {isExtraItem && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-amber-800 font-medium">تكلفة إضافية</p>
              <p className="text-amber-700">
                إضافة شعار أو نص إضافي في الأمام سيكلف{" "}
                {PRICING_CONFIG.additionalCosts.frontExtraItem} ريال
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الموقع
        </label>
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value as LogoPosition)}
          className="w-full p-2 border border-gray-300 rounded text-sm"
        >
          {logoPositions.map((pos) => (
            <option
              key={pos.id}
              value={pos.id}
              disabled={isPositionOccupied(pos.id)}
            >
              {pos.name}
            </option>
          ))}
        </select>
      </div>

      {/* عرض الصور المرفوعة سابقاً */}
      {uploadedImages.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              الصور المرفوعة سابقاً ({uploadedImages.length})
            </span>
            <button
              onClick={() => setShowExistingImages(!showExistingImages)}
              className="flex items-center gap-1 text-xs text-[#563660] hover:text-[#4b2e55] transition-colors"
            >
              <RefreshCw size={12} />
              {showExistingImages ? "إخفاء" : "عرض"}
            </button>
          </div>

          {showExistingImages && (
            <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
              {uploadedImages.map((image) => (
                <button
                  key={image.id}
                  onClick={() => handleExistingImageSelect(image.url)}
                  disabled={isPositionOccupied(position)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    isPositionOccupied(position)
                      ? "opacity-50 cursor-not-allowed border-gray-200"
                      : "hover:border-[#563660] border-gray-200"
                  }`}
                  title={`${
                    image.name
                  } - ${image.uploadedAt.toLocaleDateString()}`}
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                    {image.name}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 truncate">
            الشعارات الحالية
          </span>
          <button
            onClick={() => setShowImageUpload(true)}
            disabled={isPositionOccupied(position)}
            className={`flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded transition-colors ${
              isPositionOccupied(position)
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <Crop size={14} />
            <span>إضافة شعار</span>
          </button>
        </div>

        {filteredLogos.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500 truncate">
              قم بإضافة شعار لتخصيص الجاكيت
            </p>
            <p className="text-xs text-gray-400 ">
              العنصر الأول في الأمام مشمول في السعر الأساسي
            </p>
            <div className="mt-3">
              <button
                onClick={() => setShowImageUpload(true)}
                disabled={isPositionOccupied(position)}
                className={`inline-flex items-center gap-1 text-sm bg-[#563660] hover:bg-[#7e4a8c] text-white py-2 px-4 rounded transition-colors w-full justify-center md:w-auto ${
                  isPositionOccupied(position)
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <Crop size={16} />
                <span>رفع شعار</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {filteredLogos.map((logo) => (
              <div
                key={logo.id}
                onClick={() => setSelectedLogoId(logo.id)}
                className={`flex items-center p-2 rounded cursor-pointer ${
                  selectedLogoId === logo.id
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                }`}
              >
                {logo.image && (
                  <img
                    src={logo.image}
                    alt="شعار"
                    className="w-10 h-10 mr-3 object-contain flex-shrink-0"
                    loading="eager"
                    decoding="async"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">
                    {logoPositions.find((pos) => pos.id === logo.position)
                      ?.name || logo.position}
                  </p>
                  {/* عرض ما إذا كانت الصورة مُعاد استخدامها */}
                  {uploadedImages.some((img) => img.url === logo.image) && (
                    <p className="text-xs text-green-600">
                      صورة مُعاد استخدامها
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLogo(logo.id);
                    if (selectedLogoId === logo.id) {
                      setSelectedLogoId(null);
                    }
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* مودال رفع الصورة مع الاقتطاع */}
      {showImageUpload &&
        createPortal(
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 modal-portal"
            data-modal="true"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 9999,
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowImageUpload(false);
              }
            }}
          >
            <div
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              data-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  رفع شعار جديد
                </h3>
                <button
                  onClick={() => setShowImageUpload(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <CloudinaryImageUpload
                onImageSelect={handleLogoUpload}
                acceptedFormats={[
                  "image/jpeg",
                  "image/jpg",
                  "image/png",
                  "image/webp",
                ]}
                maxFileSize={5}
                placeholder="اختر صورة الشعار"
                className="mb-4"
                aspectRatio={1}
                cropTitle="اقتطاع شعار أمامي"
              />

              <div className="text-xs text-gray-500 text-center">
                <p>• سيتم رفع الصورة مباشرة إلى Cloudinary</p>
                <p>• الحد الأقصى: 5MB | الأنواع: JPG, PNG, WEBP</p>
              </div>
            </div>
          </div>,
          document.body
        )}

      {selectedLogo && (
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3 truncate">
            تخصيص الشعار
          </h4>

          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">الحجم</label>
            <input
              type="range"
              min="0.5"
              max="6"
              step="0.1"
              value={selectedLogo.scale}
              onChange={(e) =>
                updateLogo(selectedLogo.id, {
                  scale: parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
          </div>
        </div>
      )}

      <div className="p-3 bg-purple-50 rounded-lg text-xs text-purple-700 border border-purple-200">
        <p>
          * العنصر الأول في الأمام مشمول في السعر الأساسي، يتم إضافة{" "}
          {PRICING_CONFIG.additionalCosts.frontExtraItem} ريال لكل عنصر إضافي
        </p>
        {uploadedImages.length > 0 && (
          <p className="mt-1">
            * يتم إعادة استخدام الصور المرفوعة سابقاً تلقائياً لتوفير المساحة
          </p>
        )}
      </div>
    </div>
  );
};

export default FrontLogoSection;
