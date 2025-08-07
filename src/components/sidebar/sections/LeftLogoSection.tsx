import React from "react";
import LogoUploadSection from "./shared/LogoUploadSection";
import SelectedImagesSection from "./shared/SelectedImagesSection";
import { LogoPosition } from "../../../context/JacketContext";
import { useJacket } from "../../../context/JacketContext";
import { PRICING_CONFIG } from "../../../constants/pricing";

const LeftLogoSection: React.FC = () => {
  const { jacketState, addLogo } = useJacket();

  const logoPositions: { id: LogoPosition; name: string }[] = [
    { id: "leftSide_top", name: "الجانب الأيسر - أعلى" },
    { id: "leftSide_middle", name: "الجانب الأيسر - وسط" },
    { id: "leftSide_bottom", name: "الجانب الأيسر - أسفل" },
  ];

  const filteredLogos = jacketState.logos.filter((logo) =>
    ["leftSide_top", "leftSide_middle", "leftSide_bottom"].includes(
      logo.position
    )
  );

  const leftSideLogos = filteredLogos.length;
  const isThirdLogo =
    leftSideLogos >= PRICING_CONFIG.includedItems.leftSideLogos;

  const handleSelectedImageUse = (imageUrl: string) => {
    // البحث عن أول موقع متاح
    const availablePosition = logoPositions.find(
      (pos) => !jacketState.logos.some((logo) => logo.position === pos.id)
    );

    if (availablePosition) {
      const newLogo = {
        id: `logo-${Date.now()}`,
        image: imageUrl,
        position: availablePosition.id,
        x: 0,
        y: 0,
        scale: 1,
      };
      addLogo(newLogo);
    }
  };

  return (
    <div className="space-y-6">
      {/* قسم الصور المحددة من المكتبة */}
      <SelectedImagesSection
        onImageSelect={handleSelectedImageUse}
        title="الصور المحددة من المكتبة"
      />

      {/* قسم رفع الشعارات التقليدي */}
      <LogoUploadSection
        positions={logoPositions}
        title="إضافة الشعارات (يسار)"
        view="left"
        showPredefinedLogos={false}
        pricingInfo={{
          isExtraItem: isThirdLogo,
          extraCost: PRICING_CONFIG.additionalCosts.leftSideThirdLogo,
          includedCount: PRICING_CONFIG.includedItems.leftSideLogos,
          description: `* أول شعارين مشمولين في السعر الأساسي، يتم إضافة ${PRICING_CONFIG.additionalCosts.leftSideThirdLogo} ريال للشعار الثالث`,
        }}
      />
    </div>
  );
};

export default LeftLogoSection;
