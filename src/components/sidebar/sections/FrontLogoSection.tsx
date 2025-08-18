import React from "react";
import LogoUploadSection from "./shared/LogoUploadSection";
import { LogoPosition } from "../../../context/JacketContext";
import { useJacket } from "../../../context/JacketContext";
import { usePricing } from "../../../hooks/usePricing";

const FrontLogoSection: React.FC = () => {
  const { jacketState } = useJacket();
  const { pricingData } = usePricing();

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
    totalFrontItems >= (pricingData?.includedItems.frontItems || 1);

  return (
    <div className="space-y-6 mb-20">
      {/* قسم رفع الشعارات التقليدي */}
      <LogoUploadSection
        positions={logoPositions}
        title="إضافة الشعارات (أمامي)"
        view="front"
        showPredefinedLogos={false}
        pricingInfo={{
          isExtraItem,
          extraCost: pricingData?.additionalCosts.frontExtraItem || 25,
          includedCount: pricingData?.includedItems.frontItems || 1,
          description: `العنصر الأول في الأمام مشمول في السعر الأساسي، يتم إضافة ${
            pricingData?.additionalCosts.frontExtraItem || 25
          } ريال لكل عنصر إضافي`,
        }}
      />
    </div>
  );
};

export default FrontLogoSection;
