import React, { useState, useEffect } from "react";
import { useJacket, LogoPosition } from "../../../context/JacketContext";
import { Upload, Trash2, AlertCircle, RefreshCw, X } from "lucide-react";
import { PRICING_CONFIG } from "../../../constants/pricing";
import ImageUploadWithCrop from "../../ImageUploadWithCrop";

const RightLogoSection: React.FC = () => {
  const {
    jacketState,
    addLogo,
    removeLogo,
    updateLogo,
    addUploadedImage,
    findExistingImage,
    getUploadedImages,
  } = useJacket();
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>(null);
  const [showExistingImages, setShowExistingImages] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadPosition, setUploadPosition] =
    useState<LogoPosition>("rightSide_top");

  const handleLogoUpload = (imageUrl: string, originalFile: File) => {
    if (!isPositionOccupied(uploadPosition)) {
      // البحث عن صورة مطابقة موجودة مسبقاً
      const existingImage = findExistingImage(imageUrl);

      if (existingImage) {
        // استخدام الصورة الموجودة
        console.log("استخدام صورة موجودة مسبقاً:", existingImage.name);
        const img = new Image();
        img.src = existingImage.url;
        img.onload = () => {
          const boxWidth = 50;
          const boxHeight = 25;
          const scaleX = boxWidth / img.width;
          const scaleY = boxHeight / img.height;
          const initialScale = Math.min(scaleX, scaleY);
          const newLogo = {
            id: `logo-${Date.now()}`,
            image: existingImage.url,
            position: uploadPosition,
            x: 0,
            y: 0,
            scale: initialScale,
          };
          addLogo(newLogo);
          setSelectedLogoId(newLogo.id);
        };
      } else {
        // إضافة صورة جديدة
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
          const boxWidth = 50;
          const boxHeight = 25;
          const scaleX = boxWidth / img.width;
          const scaleY = boxHeight / img.height;
          const initialScale = Math.min(scaleX, scaleY);

          // حفظ الصورة في قائمة الصور المرفوعة
          const newUploadedImage = {
            id: `uploaded-${Date.now()}`,
            url: imageUrl,
            name: originalFile.name,
            uploadedAt: new Date(),
          };
          addUploadedImage(newUploadedImage);

          const newLogo = {
            id: `logo-${Date.now()}`,
            image: imageUrl,
            position: uploadPosition,
            x: 0,
            y: 0,
            scale: initialScale,
          };
          addLogo(newLogo);
          setSelectedLogoId(newLogo.id);

          console.log("تم رفع صورة جديدة:", originalFile.name);
        };
      }
      setShowImageUpload(false);
    }
  };

  const handleExistingImageSelect = (
    imageUrl: string,
    position: LogoPosition
  ) => {
    if (!isPositionOccupied(position)) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        const boxWidth = 50;
        const boxHeight = 25;
        const scaleX = boxWidth / img.width;
        const scaleY = boxHeight / img.height;
        const initialScale = Math.min(scaleX, scaleY);
        const newLogo = {
          id: `logo-${Date.now()}`,
          image: imageUrl,
          position,
          x: 0,
          y: 0,
          scale: initialScale,
        };
        addLogo(newLogo);
        setSelectedLogoId(newLogo.id);
      };
      setShowExistingImages(false);
    }
  };

  const logoPositions: { id: LogoPosition; name: string }[] = [
    { id: "rightSide_top", name: "الجانب الأيمن - أعلى" },
    { id: "rightSide_middle", name: "الجانب الأيمن - وسط" },
    { id: "rightSide_bottom", name: "الجانب الأيمن - أسفل" },
  ];

  const isPositionOccupied = (pos: LogoPosition) => {
    return jacketState.logos.some((logo) => logo.position === pos);
  };

  const filteredLogos = jacketState.logos.filter((logo) =>
    ["rightSide_top", "rightSide_middle", "rightSide_bottom"].includes(
      logo.position
    )
  );

  const rightSideLogos = filteredLogos.length;
  const isThirdLogo =
    rightSideLogos >= PRICING_CONFIG.includedItems.rightSideLogos;

  useEffect(() => {
    if (
      selectedLogoId &&
      !filteredLogos.find((logo) => logo.id === selectedLogoId)
    ) {
      setSelectedLogoId(filteredLogos.length > 0 ? filteredLogos[0].id : null);
    } else if (!selectedLogoId && filteredLogos.length > 0) {
      setSelectedLogoId(filteredLogos[0].id);
    }
  }, [filteredLogos, selectedLogoId]);

  const selectedLogo = selectedLogoId
    ? jacketState.logos.find((logo) => logo.id === selectedLogoId)
    : filteredLogos.length > 0
    ? filteredLogos[0]
    : null;

  const uploadedImages = getUploadedImages();

  return (
    <div className="space-y-6 overflow-x-hidden">
      <h3 className="text-lg font-medium text-gray-900 mb-4 truncate">
        إضافة الشعارات (يمين)
      </h3>

      {isThirdLogo && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-amber-800 font-medium">تكلفة إضافية</p>
              <p className="text-amber-700">
                الشعار الثالث في الجهة اليمنى سيكلف{" "}
                {PRICING_CONFIG.additionalCosts.rightSideThirdLogo} ريال إضافي
              </p>
            </div>
          </div>
        </div>
      )}

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
            <div className="space-y-3">
              {logoPositions.map((pos) => (
                <div key={pos.id}>
                  <p className="text-xs text-gray-600 mb-2">{pos.name}:</p>
                  <div className="grid grid-cols-3 gap-2 p-2 bg-gray-50 rounded-lg">
                    {uploadedImages.map((image) => (
                      <button
                        key={`${pos.id}-${image.id}`}
                        onClick={() =>
                          handleExistingImageSelect(image.url, pos.id)
                        }
                        disabled={isPositionOccupied(pos.id)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          isPositionOccupied(pos.id)
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
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mb-4">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 truncate">
            الشعارات الحالية
          </span>
          <div className="flex gap-2">
            {logoPositions.map((pos) => (
              <div key={pos.id} className="relative flex-1">
                <button
                  onClick={() => {
                    setUploadPosition(pos.id);
                    setShowImageUpload(true);
                  }}
                  disabled={isPositionOccupied(pos.id)}
                  className={`block py-2 px-4 text-sm rounded-xl transition-all text-center ${
                    isPositionOccupied(pos.id)
                      ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white shadow-sm hover:from-[#7e4a8c] hover:to-[#563660]"
                  }`}
                >
                  {pos.name.split(" - ")[1]}
                </button>
              </div>
            ))}
          </div>
        </div>

        {filteredLogos.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500 truncate">
              قم بإضافة شعار لتخصيص الجاكيت
            </p>
            <p className="text-xs text-gray-400 truncate">
              أول شعارين مشمولين في السعر الأساسي
            </p>
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
      {showImageUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                رفع شعار -{" "}
                {logoPositions.find((p) => p.id === uploadPosition)?.name}
              </h3>
              <button
                onClick={() => setShowImageUpload(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <ImageUploadWithCrop
              onImageSelect={handleLogoUpload}
              acceptedFormats={[
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/webp",
              ]}
              maxFileSize={5}
              placeholder="اختر صورة الشعار"
              cropTitle={`اقتطاع شعار - ${
                logoPositions.find((p) => p.id === uploadPosition)?.name
              }`}
              className="mb-4"
            />

            <div className="text-xs text-gray-500 text-center">
              <p>• يمكنك اقتطاع الجزء المطلوب من الصورة</p>
              <p>• الحد الأقصى: 5MB | الأنواع: JPG, PNG, WEBP</p>
            </div>
          </div>
        </div>
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
          * أول شعارين مشمولين في السعر الأساسي، يتم إضافة{" "}
          {PRICING_CONFIG.additionalCosts.rightSideThirdLogo} ريال للشعار الثالث
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

export default RightLogoSection;
