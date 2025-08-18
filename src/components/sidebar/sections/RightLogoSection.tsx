import React from "react";
import LogoUploadSection from "./shared/LogoUploadSection";
import { LogoPosition, useJacket } from "../../../context/JacketContext";
import { usePricing } from "../../../hooks/usePricing";

const RightLogoSection: React.FC = () => {
  const { jacketState } = useJacket();
  const { pricingData } = usePricing();

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
    rightSideLogos >= (pricingData?.includedItems.rightSideLogos || 2);

  return (
    <div className="space-y-6 mb-20">
      {/* قسم رفع الشعارات التقليدي */}
      <LogoUploadSection
        positions={logoPositions}
        title="إضافة الشعارات (يمين)"
        view="right"
        showPredefinedLogos={false}
        pricingInfo={{
          isExtraItem: isThirdLogo,
          extraCost: pricingData?.additionalCosts.rightSideThirdLogo || 25,
          includedCount: pricingData?.includedItems.rightSideLogos || 2,
          description: `أول شعارين مشمولين في السعر الأساسي ، يتم إضافة ${
            pricingData?.additionalCosts.rightSideThirdLogo || 25
          } ريال للشعار الثالث`,
        }}
        enablePositionSelector={true}
      />
    </div>
  );
};

export default RightLogoSection;
