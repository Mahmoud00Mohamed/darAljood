import React from "react";
import LogoUploadSection from "./shared/LogoUploadSection";
import { LogoPosition } from "../../../context/JacketContext";
import { useJacket } from "../../../context/JacketContext";
import { PRICING_CONFIG } from "../../../constants/pricing";

const FrontLogoSection: React.FC = () => {
  const { jacketState } = useJacket();

  const logoPositions: { id: LogoPosition; name: string }[] = [
    { id: "chestRight", name: "الصدر الأيمن" },
    { id: "chestLeft", name: "الصدر الأيسر" },
  ];

  // حساب عدد العناصر الأمامية الحالية
  const frontLogos = jacketState.logos.filter((logo) =>
    ["chestRight", "chestLeft"].includes(logo.position)
  ).length;

  const frontTexts = jacketState.texts.filter((text) =>
    ["chestRight", "chestLeft"].includes(text.position)
  ).length;

  const totalFrontItems = frontLogos + frontTexts;
  const isExtraItem =
    totalFrontItems >= PRICING_CONFIG.includedItems.frontItems;

  return (
    <div className="space-y-6">
      {/* قسم رفع الشعارات التقليدي */}
      <LogoUploadSection
        positions={logoPositions}
        title="إضافة الشعارات (أمامي)"
        view="front"
        showPredefinedLogos={false}
        pricingInfo={{
          isExtraItem,
          extraCost: PRICING_CONFIG.additionalCosts.frontExtraItem,
          includedCount: PRICING_CONFIG.includedItems.frontItems,
          description: `العنصر الأول في الأمام مشمول في السعر الأساسي، يتم إضافة ${PRICING_CONFIG.additionalCosts.frontExtraItem} ريال لكل عنصر إضافي`,
        }}
      />
    </div>
  );
};

export default FrontLogoSection;
