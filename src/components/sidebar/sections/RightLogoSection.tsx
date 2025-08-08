import React from "react";
import LogoUploadSection from "./shared/LogoUploadSection";
import { LogoPosition } from "../../../context/JacketContext";
import { useJacket } from "../../../context/JacketContext";
import { PRICING_CONFIG } from "../../../constants/pricing";

const RightLogoSection: React.FC = () => {
  const { jacketState } = useJacket();

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
