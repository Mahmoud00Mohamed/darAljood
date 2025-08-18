import React from "react";
import LogoUploadSection from "./shared/LogoUploadSection";
import { LogoPosition, useJacket } from "../../../context/JacketContext";
import { usePricing } from "../../../hooks/usePricing";

const LeftLogoSection: React.FC = () => {
  const { jacketState } = useJacket();
  const { pricingData } = usePricing();

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
    leftSideLogos >= (pricingData?.includedItems.leftSideLogos || 2);

  return (
    <div className="space-y-6 mb-20">
      {/* قسم رفع الشعارات التقليدي */}
      <LogoUploadSection
        positions={logoPositions}
        title="إضافة الشعارات (يسار)"
        view="left"
        showPredefinedLogos={false}
        pricingInfo={{
          isExtraItem: isThirdLogo,
          extraCost: pricingData?.additionalCosts.leftSideThirdLogo || 25,
          includedCount: pricingData?.includedItems.leftSideLogos || 2,
          description: `أول شعارين مشمولين في السعر الأساسي ، يتم إضافة ${
            pricingData?.additionalCosts.leftSideThirdLogo || 25
          } ريال للشعار الثالث`,
        }}
        enablePositionSelector={true}
      />
    </div>
  );
};

export default LeftLogoSection;
