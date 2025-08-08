import React from "react";
import LogoUploadSection from "./shared/LogoUploadSection";
import { LogoPosition } from "../../../context/JacketContext";
import { useJacket } from "../../../context/JacketContext";
import { PRICING_CONFIG } from "../../../constants/pricing";

const RightLogoSection: React.FC = () => {
  const { jacketState, addLogo } = useJacket();

  const logoPositions: { id: LogoPosition; name: string }[] = [
    { id: "rightSide_top", name: "الجانب الأيمن - أعلى" },
    { id: "rightSide_middle", name: "الجانب الأيمن - وسط" },
    { id: "rightSide_bottom", name: "الجانب الأيمن - أسفل" },
  ];

  const filteredLogos = jacketState.logos.filter((logo) =>
    ["rightSide_top", "rightSide_middle", "rightSide_bottom"].includes(
      logo.position
    )
  );

  const rightSideLogos = filteredLogos.length;
  const isThirdLogo =
    rightSideLogos >= PRICING_CONFIG.includedItems.rightSideLogos;

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
      {/* قسم رفع الشعارات التقليدي */}
      <LogoUploadSection
        positions={logoPositions}
        title="إضافة الشعارات (يمين)"
        view="right"
        showPredefinedLogos={false}
        pricingInfo={{
          isExtraItem: isThirdLogo,
          extraCost: PRICING_CONFIG.additionalCosts.rightSideThirdLogo,
          includedCount: PRICING_CONFIG.includedItems.rightSideLogos,
          description: `* أول شعارين مشمولين في السعر الأساسي، يتم إضافة ${PRICING_CONFIG.additionalCosts.rightSideThirdLogo} ريال للشعار الثالث`,
        }}
      />
    </div>
  );
};

export default RightLogoSection;
