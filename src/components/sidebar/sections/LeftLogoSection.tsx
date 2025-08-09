import React from "react";
import LogoUploadSection from "./shared/LogoUploadSection";
import { LogoPosition, useJacket } from "../../../context/JacketContext";
import { PRICING_CONFIG } from "../../../constants/pricing";

const LeftLogoSection: React.FC = () => {
  const { jacketState } = useJacket();

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

  return (
    <div className="space-y-6">
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
        enablePositionSelector={true}
      />
    </div>
  );
};

export default LeftLogoSection;
