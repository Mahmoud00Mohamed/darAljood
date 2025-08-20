import React, { useState, useEffect } from "react";
import { useJacket, LogoPosition } from "../../../../context/JacketContext";
import { Upload, Trash2, AlertCircle, Crop, Images } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import CloudinaryImageUpload from "../../../forms/CloudinaryImageUpload";
import { CloudinaryImageData } from "../../../../services/imageUploadService";
import { Gallery } from "../../../../gallery-system/src";
import type { Photo } from "../../../../gallery-system/src/types";
import SelectedImagesSection from "./SelectedImagesSection";
import Modal from "../../../ui/Modal";
import { useModal } from "../../../../hooks/useModal";
import { useImageLibrary } from "../../../../context/ImageLibraryContext";

interface LogoUploadSectionProps {
  positions: { id: LogoPosition; name: string }[];
  title: string;
  view: "front" | "back" | "right" | "left";
  showPredefinedLogos?: boolean;
  pricingInfo?: {
    isExtraItem?: boolean;
    extraCost?: number;
    includedCount?: number;
    description?: string;
  };
  enablePositionSelector?: boolean;
}

const LogoUploadSection: React.FC<LogoUploadSectionProps> = ({
  positions,
  title,
  view,
  showPredefinedLogos = false,
  pricingInfo,
  enablePositionSelector = false,
}) => {
  const location = useLocation();
  const {
    jacketState,
    addLogo,
    updateLogo,
    removeLogo,
    addUploadedImage,
    findExistingImage,
    getUploadedImages,
  } = useJacket();
  const { selectedImages, addUserImage, selectImage } = useImageLibrary();
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>(null);
  const [logoSource, setLogoSource] = useState<"predefined" | "upload">(
    showPredefinedLogos ? "predefined" : "upload"
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPosition, setUploadPosition] = useState<LogoPosition>(
    positions[0]?.id
  );

  const galleryModal = useModal();
  const uploadModal = useModal({
    closeOnEscape: !isUploading,
    closeOnBackdropClick: !isUploading,
  });

  // الشعارات الجاهزة - فقط للقسم الخلفي
  const availableLogos = [
    {
      id: "logo1",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078450/18_djpzcl.png",
      name: "شعار 1",
    },
    {
      id: "logo2",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078448/16_b1rjss.png",
      name: "شعار 2",
    },
    {
      id: "logo3",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078446/21_hq9kn2.png",
      name: "شعار 3",
    },
    {
      id: "logo4",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078445/24_ryr2b7.png",
      name: "شعار 4",
    },
    {
      id: "logo5",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078445/22_zdgy01.png",
      name: "شعار 5",
    },
    {
      id: "logo6",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078440/20_z76g1a.png",
      name: "شعار 6",
    },
    {
      id: "logo7",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078416/23_c30gr9.png",
      name: "شعار 7",
    },
    {
      id: "logo8",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078392/19_bsd1ci.png",
      name: "شعار 8",
    },
    {
      id: "logo9",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078378/15_v4cfc5.png",
      name: "شعار 9",
    },
    {
      id: "logo10",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078376/17_xeldqp.png",
      name: "شعار 10",
    },
    {
      id: "logo11",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078365/14_qqqwh1.png",
      name: "شعار 11",
    },
    {
      id: "logo12",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078327/13_hwchwt.png",
      name: "شعار 12",
    },
    {
      id: "logo13",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078315/2_ecj1mj.png",
      name: "شعار 13",
    },
    {
      id: "logo14",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078313/12_tg79xl.png",
      name: "شعار 14",
    },
    {
      id: "logo15",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078306/6_isqyzt.png",
      name: "شعار 15",
    },
    {
      id: "logo16",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078292/11_e4rp9f.png",
      name: "شعار 16",
    },
    {
      id: "logo17",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078280/7_sdntzs.png",
      name: "شعار 17",
    },
    {
      id: "logo18",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078273/9_ckkfuc.png",
      name: "شعار 18",
    },
    {
      id: "logo19",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078266/8_khcifj.png",
      name: "شعار 19",
    },
    {
      id: "logo20",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078261/10_nt80mg.png",
      name: "شعار 20",
    },
    {
      id: "logo21",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078234/5_ivza7n.png",
      name: "شعار 21",
    },
    {
      id: "logo22",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078229/4_emla2u.png",
      name: "شعار 22",
    },
    {
      id: "logo23",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078224/3_ohzsak.png",
      name: "شعار 23",
    },
    {
      id: "logo24",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078222/1_ucnpj9.png",
      name: "شعار 24",
    },
  ];

  // تحويل الشعارات المتاحة إلى تنسيق Gallery
  const galleryPhotos: Photo[] = availableLogos.map((logo) => ({
    id: logo.id,
    src: logo.url,
    title: logo.name,
    category: "شعارات",
    description: `شعار جاهز للاستخدام - ${logo.name}`,
    alt: logo.name,
  }));

  const galleryCategories = ["الكل", "شعارات"];

  // تحميل مسبق للشعارات المتاحة عند تحميل المكون
  useEffect(() => {
    if (showPredefinedLogos && logoSource === "predefined") {
      // تحميل أول 12 شعار فوراً
      const priorityLogos = availableLogos.slice(0, 12);
      priorityLogos.forEach((logo, index) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.loading = "eager";
        img.decoding = index < 6 ? "sync" : "async";
        img.fetchPriority = index < 6 ? "high" : "auto";
        img.src = logo.url;
      });

      // تحميل باقي الشعارات في الخلفية
      setTimeout(() => {
        const remainingLogos = availableLogos.slice(12);
        remainingLogos.forEach((logo, index) => {
          setTimeout(() => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.loading = "lazy";
            img.src = logo.url;
          }, index * 100);
        });
      }, 1000);
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPredefinedLogos, logoSource]);
  const isPositionOccupied = (pos: LogoPosition) => {
    return (
      jacketState.logos.some((logo) => logo.position === pos) ||
      (view === "front" &&
        jacketState.texts.some((text) => text.position === pos))
    );
  };

  const handleGalleryPhotoSelect = (photo: Photo) => {
    const selectedLogo = availableLogos.find((logo) => logo.id === photo.id);
    if (selectedLogo && !isPositionOccupied(uploadPosition)) {
      handlePredefinedLogoSelect(selectedLogo.url, uploadPosition);
      galleryModal.closeModal();
    }
  };

  const handlePredefinedLogoSelect = (
    logoUrl: string,
    position: LogoPosition
  ) => {
    if (!isPositionOccupied(position)) {
      const newLogo = {
        id: `logo-${Date.now()}`,
        image: logoUrl,
        position,
        x: 0,
        y: 0,
        scale: view === "back" ? 1.5 : view === "front" ? 1 : 1,
      };
      addLogo(newLogo);
      setSelectedLogoId(newLogo.id);
    }
  };

  const handleLogoUpload = (imageData: CloudinaryImageData) => {
    if (!isPositionOccupied(uploadPosition)) {
      // إضافة الصورة إلى مكتبة الصور تلقائياً
      addUserImage(imageData);

      // تحديد الصورة تلقائياً في المكتبة
      selectImage(imageData, "user");

      const existingImage = findExistingImage(imageData.url);

      if (existingImage) {
        const img = new Image();
        img.src = existingImage.url;
        img.onload = () => {
          const initialScale = getInitialScale(view);
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
        const img = new Image();
        img.src = imageData.url;
        img.onload = () => {
          const initialScale = getInitialScale(view);

          const newUploadedImage = {
            id: `uploaded-${Date.now()}`,
            url: imageData.url,
            name: imageData.publicId.split("/").pop() || "صورة مرفوعة",
            uploadedAt: new Date(),
          };
          addUploadedImage(newUploadedImage);

          const newLogo = {
            id: `logo-${Date.now()}`,
            image: imageData.url,
            position: uploadPosition,
            x: 0,
            y: 0,
            scale: initialScale,
          };
          addLogo(newLogo);
          setSelectedLogoId(newLogo.id);
        };
      }
      uploadModal.closeModal();
    }
  };

  const getInitialScale = (view: string): number => {
    if (view === "back") return 1.5;
    if (view === "front") {
      const boxWidth = 70;
      const boxHeight = 70;
      return Math.min(boxWidth / 100, boxHeight / 100);
    }
    // للجوانب
    const boxWidth = 50;
    const boxHeight = 25;
    return Math.min(boxWidth / 100, boxHeight / 100);
  };

  const handleExistingImageSelect = (
    imageUrl: string,
    targetPosition?: LogoPosition
  ) => {
    const finalPosition = targetPosition || uploadPosition;
    if (!isPositionOccupied(finalPosition)) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        const initialScale = getInitialScale(view);
        const newLogo = {
          id: `logo-${Date.now()}`,
          image: imageUrl,
          position: finalPosition,
          x: 0,
          y: 0,
          scale: initialScale,
        };
        addLogo(newLogo);
        setSelectedLogoId(newLogo.id);
      };
    }
  };

  const handleImageSelectWithPosition = (
    imageUrl: string,
    positionId?: string
  ) => {
    if (positionId) {
      const targetPosition = positionId as LogoPosition;
      if (!isPositionOccupied(targetPosition)) {
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
          const initialScale = getInitialScale(view);
          const newLogo = {
            id: `logo-${Date.now()}`,
            image: imageUrl,
            position: targetPosition,
            x: 0,
            y: 0,
            scale: initialScale,
          };
          addLogo(newLogo);
          setSelectedLogoId(newLogo.id);
        };
      }
    }
  };

  const filteredLogos = jacketState.logos.filter((logo) =>
    positions.some((pos) => pos.id === logo.position)
  );

  // إزالة التكرار من الشعارات المفلترة بشكل محسن
  const uniqueLogos = filteredLogos.filter((logo, index, self) => {
    const firstIndex = self.findIndex((l) => l.id === logo.id);
    if (firstIndex !== index) {
      console.warn(
        `Removing duplicate logo with ID: ${logo.id} at position: ${logo.position}`
      );
    }
    return firstIndex === index;
  });

  const selectedLogo = selectedLogoId
    ? uniqueLogos.find((logo) => logo.id === selectedLogoId)
    : uniqueLogos.length > 0
    ? uniqueLogos[0]
    : null;

  useEffect(() => {
    if (!selectedLogoId && uniqueLogos.length > 0) {
      setSelectedLogoId(uniqueLogos[0].id);
    } else if (
      selectedLogoId &&
      !uniqueLogos.find((logo) => logo.id === selectedLogoId)
    ) {
      setSelectedLogoId(uniqueLogos.length > 0 ? uniqueLogos[0].id : null);
    }
  }, [uniqueLogos, selectedLogoId]);

  // تحديث الموقع المحدد للرفع حسب المواقع المتاحة
  useEffect(() => {
    if (view === "front") {
      const occupiedPositions = [
        ...jacketState.logos.map((logo) => logo.position),
        ...jacketState.texts.map((text) => text.position),
      ];
      if (
        occupiedPositions.includes("chestRight") &&
        !occupiedPositions.includes("chestLeft")
      ) {
        setUploadPosition("chestLeft");
      } else if (!occupiedPositions.includes("chestRight")) {
        setUploadPosition("chestRight");
      }
    } else {
      setUploadPosition(positions[0]?.id);
    }
  }, [jacketState.logos, jacketState.texts, positions, view]);

  const uploadedImages = getUploadedImages();

  return (
    <div className="space-y-6 overflow-x-hidden">
      <h3 className="text-lg font-medium text-gray-900 mb-4 whitespace-normal break-words">
        {title}
      </h3>

      {/* تنبيه التكلفة الإضافية */}
      {pricingInfo?.isExtraItem && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-amber-800 font-medium">تكلفة إضافية</p>
              <p className="text-amber-700">{pricingInfo.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* اختيار مصدر الشعار - فقط للقسم الخلفي */}
      {showPredefinedLogos && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            مصدر الشعار
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setLogoSource("predefined")}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                logoSource === "predefined"
                  ? "border-[#563660] bg-[#563660]/5 text-[#563660]"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
              }`}
            >
              <Upload className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">شعارات جاهزة</span>
              <span className="text-xs text-gray-500 mt-1">
                اختر من المجموعة
              </span>
            </button>
            <button
              onClick={() => setLogoSource("upload")}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                logoSource === "upload"
                  ? "border-[#563660] bg-[#563660]/5 text-[#563660]"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
              }`}
            >
              <Crop className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">شعار مخصص</span>
              <span className="text-xs text-gray-500 mt-1">
                ارفع شعارك الخاص
              </span>
            </button>
          </div>
        </div>
      )}

      {/* اختيار الموقع - للأقسام الأمامية فقط */}
      {view === "front" && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الموقع
          </label>
          <select
            value={uploadPosition}
            onChange={(e) => setUploadPosition(e.target.value as LogoPosition)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          >
            {positions.map((pos) => (
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
      )}

      {/* عرض الصور المحددة من المكتبة */}
      {(!showPredefinedLogos || logoSource === "upload") &&
        selectedImages.length > 0 && (
          <div className="mb-4">
            <SelectedImagesSection
              onImageSelect={
                !enablePositionSelector
                  ? (imageUrl) => {
                      if (view === "front") {
                        handleExistingImageSelect(imageUrl);
                      } else if (view === "back") {
                        handleExistingImageSelect(imageUrl, positions[0].id);
                      } else {
                        handleExistingImageSelect(imageUrl, uploadPosition);
                      }
                    }
                  : undefined
              }
              onImageSelectWithPosition={
                enablePositionSelector
                  ? handleImageSelectWithPosition
                  : undefined
              }
              showPositionSelector={enablePositionSelector}
              availablePositions={
                enablePositionSelector
                  ? positions
                      .filter((pos) => !isPositionOccupied(pos.id))
                      .map((pos) => ({
                        id: pos.id,
                        name: pos.name,
                      }))
                  : []
              }
            />
          </div>
        )}

      <div className="mb-4 relative z-50">
        <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 truncate">
            الشعارات الحالية
          </span>
          {view === "front" ? (
            <div className="flex items-center gap-2">
              <Link
                to="/image-library"
                state={{ from: location.pathname }}
                className="flex items-center gap-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 py-1 px-2 rounded transition-colors"
              >
                <Images size={14} />
                <span>مكتبة الصور</span>
              </Link>
              <button
                onClick={uploadModal.openModal}
                disabled={isPositionOccupied(uploadPosition)}
                className={`flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded transition-colors ${
                  isPositionOccupied(uploadPosition)
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <Crop size={14} />
                <span>إضافة شعار</span>
              </button>
            </div>
          ) : view === "back" ? (
            <div className="flex items-center gap-2">
              <Link
                to="/image-library"
                state={{ from: location.pathname }}
                className="flex items-center gap-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 py-1 px-2 rounded transition-colors"
              >
                <Images size={14} />
                <span>مكتبة الصور</span>
              </Link>
              {(!showPredefinedLogos || logoSource === "upload") && (
                <button
                  onClick={uploadModal.openModal}
                  disabled={isPositionOccupied(positions[0].id)}
                  className={`flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded transition-colors ${
                    isPositionOccupied(positions[0].id)
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <Crop size={14} />
                  <span>رفع شعار</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2 w-full">
              <Link
                to="/image-library"
                state={{ from: location.pathname }}
                className="flex items-center justify-center gap-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 py-1 px-2 rounded transition-colors w-full"
              >
                <Images size={14} />
                <span>مكتبة الصور</span>
              </Link>
              <div className="flex gap-2">
                {positions.map((pos) => (
                  <div key={pos.id} className="relative flex-1">
                    <button
                      onClick={() => {
                        setUploadPosition(pos.id);
                        uploadModal.openModal();
                      }}
                      disabled={isPositionOccupied(pos.id)}
                      className={`block py-2 px-4 text-sm rounded-xl transition-all text-center w-full ${
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
          )}
        </div>

        {filteredLogos.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 mt-4">
            <p className="mt-2 text-sm text-gray-500 whitespace-normal break-words">
              {showPredefinedLogos && logoSource === "predefined"
                ? "قم باختيار شعار من المجموعة المتوفرة"
                : "قم برفع شعارك الخاص لتخصيص الجاكيت"}
            </p>
            <p className="text-xs text-gray-400 whitespace-normal break-words">
              {pricingInfo?.description || "شعار مخصص"}
            </p>

            {showPredefinedLogos && logoSource === "predefined" ? (
              <div className="mt-3">
                <button
                  onClick={() => {
                    setUploadPosition(positions[0].id);
                    galleryModal.openModal();
                  }}
                  disabled={isPositionOccupied(positions[0].id)}
                  className={`inline-flex items-center gap-2 text-sm bg-[#563660] hover:bg-[#7e4a8c] text-white py-3 px-6 rounded-xl transition-colors w-full justify-center ${
                    isPositionOccupied(positions[0].id)
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <Upload size={16} />
                  <span>تصفح الشعارات</span>
                </button>
              </div>
            ) : (
              <div className="mt-3">
                <button
                  onClick={() => {
                    if (view === "front") {
                      uploadModal.openModal();
                    } else if (view === "back") {
                      setUploadPosition(positions[0].id);
                      uploadModal.openModal();
                    } else {
                      setUploadPosition(positions[0].id);
                      uploadModal.openModal();
                    }
                  }}
                  disabled={
                    view === "front"
                      ? isPositionOccupied(uploadPosition)
                      : isPositionOccupied(positions[0].id)
                  }
                  className={`inline-flex items-center gap-1 text-sm bg-[#563660] hover:bg-[#7e4a8c] text-white py-2 px-4 rounded transition-colors w-full justify-center md:w-auto ${
                    (
                      view === "front"
                        ? isPositionOccupied(uploadPosition)
                        : isPositionOccupied(positions[0].id)
                    )
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <Crop size={16} />
                  <span>رفع شعار</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {uniqueLogos.map((logo) => (
              <div
                key={logo.id}
                onClick={() => setSelectedLogoId(logo.id)}
                className={`flex items-center p-2 cursor-pointer rounded-full ${
                  selectedLogoId === logo.id
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                }`}
              >
                {logo.image && (
                  <img
                    src={logo.image}
                    alt="شعار"
                    className="w-10 h-10 mr-3 object-contain rounded-full flex-shrink-0"
                    loading="eager"
                    decoding="async"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm whitespace-normal break-words">
                    {positions.find((pos) => pos.id === logo.position)?.name ||
                      logo.position}
                  </p>
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

      {/* مودال معرض الشعارات - فقط للقسم الخلفي */}
      {showPredefinedLogos && (
        <Modal
          isOpen={galleryModal.isOpen}
          shouldRender={galleryModal.shouldRender}
          onClose={galleryModal.closeModal}
          title="اختر شعار خلفي"
          size="md"
          className="max-h-[70vh] md:max-h-[80vh]"
          options={galleryModal.options}
        >
          <div className="overflow-y-auto max-h-[calc(70vh-120px)] md:max-h-[calc(80vh-120px)]">
            <Gallery
              photos={galleryPhotos}
              categories={galleryCategories}
              rtl={true}
              onPhotoClick={handleGalleryPhotoSelect}
              showCategories={false}
              columnsConfig={{
                mobile: 3,
                tablet: 4,
                desktop: 5,
              }}
              className="gallery-logos-container"
            />
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50 mt-4 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              انقر على أي شعار لإضافته إلى الجاكيت
            </p>
          </div>
        </Modal>
      )}

      {/* مودال رفع الصورة مع الاقتطاع */}
      <Modal
        isOpen={uploadModal.isOpen}
        shouldRender={uploadModal.shouldRender}
        onClose={isUploading ? () => {} : uploadModal.closeModal}
        title={`رفع شعار ${
          view === "front"
            ? "أمامي"
            : view === "back"
            ? "خلفي"
            : view === "right"
            ? "- " +
              (positions.find((p) => p.id === uploadPosition)?.name || "")
            : "- " +
              (positions.find((p) => p.id === uploadPosition)?.name || "")
        }`}
        size="sm"
        showCloseButton={!isUploading}
        options={uploadModal.options}
      >
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
          cropTitle={`اقتطاع شعار ${
            view === "front"
              ? "أمامي"
              : view === "back"
              ? "خلفي"
              : view === "right"
              ? "جانبي أيمن"
              : "جانبي أيسر"
          }`}
          onUploadStateChange={setIsUploading}
          autoAddToLibrary={true}
        />

        <div className="text-xs text-gray-500 text-center">
          <p>• الحد الأقصى: 5MB | الأنواع: JPG, PNG, WEBP</p>
        </div>
      </Modal>

      {/* تخصيص الشعار المحدد */}
      {selectedLogo && (
        <div className="border-t pt-4 mt-4 relative z-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3 truncate">
            تخصيص الشعار
          </h4>

          {view === "back" && (
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1 flex-wrap gap-2">
                <label className="text-xs text-gray-600">ضبط الموقع</label>
                <span className="text-xs text-gray-400 flex items-center">
                  <Upload size={12} className="ml-1" />
                  اسحب للتعديل
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    رأسي
                  </label>
                  <input
                    type="range"
                    min="-30"
                    max="0"
                    value={selectedLogo.y}
                    onChange={(e) =>
                      updateLogo(selectedLogo.id, {
                        y: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">الحجم</label>
            <input
              type="range"
              min={view === "back" ? "0.3" : "0.5"}
              max={view === "back" ? "1.5" : "6"}
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

      {/* معلومات التسعير */}
      <div className="p-3 bg-purple-50 rounded-lg text-xs text-purple-700 border border-purple-200">
        <p>{pricingInfo?.description || "* شعار مخصص"}</p>
      </div>
    </div>
  );
};

export default LogoUploadSection;
