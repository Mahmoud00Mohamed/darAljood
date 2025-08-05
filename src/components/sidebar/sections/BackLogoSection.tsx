import React, { useState } from "react";
import { useJacket, LogoPosition } from "../../../context/JacketContext";
import { Trash2, Move, Upload, RefreshCw, X, Crop } from "lucide-react";
import CloudinaryImageUpload from "../../forms/CloudinaryImageUpload";
import { CloudinaryImageData } from "../../../services/imageUploadService";
import { Gallery } from "../../../gallery-system/src";
import type { Photo } from "../../../gallery-system/src/types";
import Modal from "../../ui/Modal";
import { useModal } from "../../../hooks/useModal";

const BackLogoSection: React.FC = () => {
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
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showExistingImages, setShowExistingImages] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [logoSource, setLogoSource] = useState<"predefined" | "upload">(
    "predefined"
  );

  const galleryModal = useModal();
  const uploadModal = useModal();

  const logoPositions: { id: LogoPosition; name: string }[] = [
    { id: "backCenter", name: "منتصف الظهر" },
  ];

  const availableLogos = [
    {
      id: "logo1",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924691/16_ubbdbh.png",
      name: "شعار 1",
    },
    {
      id: "logo2",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924689/15_l0llk1.png",
      name: "شعار 2",
    },
    {
      id: "logo3",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924688/14_htk85j.png",
      name: "شعار 3",
    },
    {
      id: "logo4",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924676/21_swow6t.png",
      name: "شعار 4",
    },
    {
      id: "logo5",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924675/22_c9rump.png",
      name: "شعار 5",
    },
    {
      id: "logo6",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924671/24_x6nvyt.png",
      name: "شعار 6",
    },
    {
      id: "logo7",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924669/20_guvnha.png",
      name: "شعار 7",
    },
    {
      id: "logo8",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924661/23_rroabu.png",
      name: "شعار 8",
    },
    {
      id: "logo9",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924658/18_cpbs4b.png",
      name: "شعار 9",
    },
    {
      id: "logo10",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924657/19_kxggs4.png",
      name: "شعار 10",
    },
    {
      id: "logo11",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924650/17_k8axov.png",
      name: "شعار 11",
    },
    {
      id: "logo12",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924644/12_woyybb.png",
      name: "شعار 12",
    },
    {
      id: "logo13",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924644/13_mvqmgk.png",
      name: "شعار 13",
    },
    {
      id: "logo14",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924636/11_revnd6.png",
      name: "شعار 14",
    },
    {
      id: "logo15",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924629/9_ysz5vg.png",
      name: "شعار 15",
    },
    {
      id: "logo16",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924627/7_ptxh2b.png",
      name: "شعار 16",
    },
    {
      id: "logo17",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924622/10_yhvn0o.png",
      name: "شعار 17",
    },
    {
      id: "logo18",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924621/2_vobopy.png",
      name: "شعار 18",
    },
    {
      id: "logo19",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924621/1_kqcgdh.png",
      name: "شعار 19",
    },
    {
      id: "logo20",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924621/8_yoay91.png",
      name: "شعار 20",
    },
    {
      id: "logo21",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924610/6_xfyebx.png",
      name: "شعار 21",
    },
    {
      id: "logo22",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924609/5_oupz1k.png",
      name: "شعار 22",
    },
    {
      id: "logo23",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924603/3_k7zsjo.png",
      name: "شعار 23",
    },
    {
      id: "logo24",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924602/4_v07jhi.png",
      name: "شعار 24",
    },
  ];

  React.useEffect(() => {
    availableLogos.forEach((logo) => {
      const img = new Image();
      img.src = logo.url;
    });
  }, []);

  // تحويل الشعارات المتاحة إلى تنسيق Gallery
  const galleryPhotos: Photo[] = availableLogos.map((logo) => ({
    id: logo.id,
    src: logo.url,
    title: logo.name,
    category: "شعارات جاهزة",
    description: `شعار جاهز للاستخدام - ${logo.name}`,
    alt: logo.name,
  }));

  const galleryCategories = ["الكل", "شعارات جاهزة"];

  const isPositionOccupied = (pos: LogoPosition) => {
    return jacketState.logos.some((logo) => logo.position === pos);
  };

  const handleGalleryPhotoSelect = (photo: Photo) => {
    const selectedLogo = availableLogos.find((logo) => logo.id === photo.id);
    if (selectedLogo && !isPositionOccupied("backCenter")) {
      handlePredefinedLogoSelect(selectedLogo.url, "backCenter");
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
        scale: 1.5,
      };
      addLogo(newLogo);
      setSelectedLogoId(newLogo.id);
    }
  };

  const handleLogoUpload = (imageData: CloudinaryImageData) => {
    if (!isPositionOccupied("backCenter")) {
      // البحث عن صورة مطابقة موجودة مسبقاً باستخدام publicId
      const existingImage = findExistingImage(imageData.url);

      if (existingImage) {
        // استخدام الصورة الموجودة
        console.log("استخدام صورة موجودة مسبقاً:", imageData.publicId);
        const newLogo = {
          id: `logo-${Date.now()}`,
          image: existingImage.url,
          position: "backCenter" as LogoPosition,
          x: 0,
          y: 0,
          scale: 1.5,
        };
        addLogo(newLogo);
        setSelectedLogoId(newLogo.id);
      } else {
        // إضافة صورة جديدة
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
          position: "backCenter" as LogoPosition,
          x: 0,
          y: 0,
          scale: 1.5,
        };
        addLogo(newLogo);
        setSelectedLogoId(newLogo.id);

        console.log("تم رفع صورة جديدة:", imageData.publicId);
      }
      uploadModal.closeModal();
    }
  };

  const handleExistingImageSelect = (imageUrl: string) => {
    if (!isPositionOccupied("backCenter")) {
      const newLogo = {
        id: `logo-${Date.now()}`,
        image: imageUrl,
        position: "backCenter" as LogoPosition,
        x: 0,
        y: 0,
        scale: 1.5,
      };
      addLogo(newLogo);
      setSelectedLogoId(newLogo.id);
      setShowExistingImages(false);
    }
  };

  const filteredLogos = jacketState.logos.filter(
    (logo) => logo.position === "backCenter"
  );

  const selectedLogo = selectedLogoId
    ? jacketState.logos.find((logo) => logo.id === selectedLogoId)
    : filteredLogos.length > 0
    ? filteredLogos[0]
    : null;

  React.useEffect(() => {
    if (!selectedLogoId && filteredLogos.length > 0) {
      setSelectedLogoId(filteredLogos[0].id);
    } else if (
      selectedLogoId &&
      !filteredLogos.find((logo) => logo.id === selectedLogoId)
    ) {
      setSelectedLogoId(filteredLogos.length > 0 ? filteredLogos[0].id : null);
    }
  }, [filteredLogos, selectedLogoId]);

  const uploadedImages = getUploadedImages();

  return (
    <div className="space-y-6 overflow-x-hidden">
      <h3 className="text-lg font-medium text-gray-900 mb-4 truncate">
        إضافة الشعارات (خلفي)
      </h3>

      {/* Logo Source Selection */}
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
            <span className="text-xs text-gray-500 mt-1">اختر من المجموعة</span>
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
            <span className="text-xs text-gray-500 mt-1">ارفع شعارك الخاص</span>
          </button>
        </div>
      </div>

      {/* عرض الصور المرفوعة سابقاً - للشعارات المخصصة فقط */}
      {logoSource === "upload" && uploadedImages.length > 0 && (
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
            <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
              {uploadedImages.map((image) => (
                <button
                  key={image.id}
                  onClick={() => handleExistingImageSelect(image.url)}
                  disabled={isPositionOccupied("backCenter")}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    isPositionOccupied("backCenter")
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
          {logoSource === "upload" && (
            <button
              onClick={() => setShowImageUpload(true)}
              disabled={isPositionOccupied("backCenter")}
              className={`flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded transition-colors ${
                isPositionOccupied("backCenter")
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <Crop size={14} />
              <span>رفع شعار</span>
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-40 overflow-y-auto">
          {filteredLogos.map((logo) => (
            <div
              key={logo.id}
              onClick={() => setSelectedLogoId(logo.id)}
              className={`flex items-center p-2 cursor-pointer rounded-full ${
                selectedLogoId === logo.id ? "bg-gray-100" : "hover:bg-gray-50"
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
                <p className="text-sm truncate">
                  {logoPositions.find((pos) => pos.id === logo.position)
                    ?.name || logo.position}
                </p>
                {/* عرض ما إذا كانت الصورة مُعاد استخدامها */}
                {uploadedImages.some((img) => img.url === logo.image) && (
                  <p className="text-xs text-green-600">صورة مُعاد استخدامها</p>
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

        {filteredLogos.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 mt-4">
            <p className="mt-2 text-sm text-gray-500 truncate">
              {logoSource === "predefined"
                ? "قم باختيار شعار من المجموعة المتوفرة"
                : "قم برفع شعارك الخاص لتخصيص الجاكيت"}
            </p>
            <p className="text-xs text-gray-400 truncate">
              الشعار الخلفي مشمول في السعر الأساسي
            </p>

            {logoSource === "predefined" ? (
              <div className="mt-3">
                <button
                  onClick={galleryModal.openModal}
                  disabled={isPositionOccupied("backCenter")}
                  className={`inline-flex items-center gap-2 text-sm bg-[#563660] hover:bg-[#7e4a8c] text-white py-3 px-6 rounded-xl transition-colors w-full justify-center ${
                    isPositionOccupied("backCenter")
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
                  onClick={uploadModal.openModal}
                  disabled={isPositionOccupied("backCenter")}
                  className={`inline-flex items-center gap-1 text-sm bg-[#563660] hover:bg-[#7e4a8c] text-white py-2 px-4 rounded transition-colors w-full justify-center md:w-auto ${
                    isPositionOccupied("backCenter")
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
        )}
      </div>

      {/* مودال معرض الشعارات */}
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

      {/* مودال رفع الصورة مع الاقتطاع */}
      <Modal
        isOpen={uploadModal.isOpen}
        shouldRender={uploadModal.shouldRender}
        onClose={uploadModal.closeModal}
        title="رفع شعار خلفي"
        size="sm"
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
          placeholder="اختر صورة الشعار الخلفي"
          className="mb-4"
          aspectRatio={1}
          cropTitle="اقتطاع شعار خلفي"
        />

        <div className="text-xs text-gray-500 text-center">
          <p>• سيتم رفع الصورة مباشرة إلى Cloudinary</p>
          <p>• الحد الأقصى: 5MB | الأنواع: JPG, PNG, WEBP</p>
        </div>
      </Modal>

      {selectedLogo && (
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3 truncate">
            تخصيص الشعار
          </h4>

          <div className="mb-3">
            <div className="flex justify-between items-center mb-1 flex-wrap gap-2">
              <label className="text-xs text-gray-600">ضبط الموقع</label>
              <span className="text-xs text-gray-400 flex items-center">
                <Move size={12} className="ml-1" />
                اسحب للتعديل
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">رأسي</label>
                <input
                  type="range"
                  min="-30"
                  max="0"
                  value={selectedLogo.y}
                  onChange={(e) =>
                    updateLogo(selectedLogo.id, { y: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">الحجم</label>
            <input
              type="range"
              min="0.3"
              max="1.5"
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
        <p>* الشعار الخلفي مشمول في السعر الأساسي</p>
        {logoSource === "upload" && uploadedImages.length > 0 && (
          <p className="mt-1">
            * يتم إعادة استخدام الصور المرفوعة سابقاً تلقائياً لتوفير المساحة
          </p>
        )}
      </div>
    </div>
  );
};

export default BackLogoSection;
