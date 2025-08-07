import React from "react";
import LogoUploadSection from "./shared/LogoUploadSection";
import SelectedImagesSection from "./shared/SelectedImagesSection";
import { LogoPosition } from "../../../context/JacketContext";
import { useJacket } from "../../../context/JacketContext";

const BackLogoSection: React.FC = () => {
  const { jacketState, addLogo } = useJacket();

  const logoPositions: { id: LogoPosition; name: string }[] = [
    { id: "backCenter", name: "منتصف الظهر" },
  ];

  const handleSelectedImageUse = (imageUrl: string) => {
    const isPositionOccupied = jacketState.logos.some(
      (logo) => logo.position === "backCenter"
    );

    if (!isPositionOccupied) {
      const newLogo = {
        id: `logo-${Date.now()}`,
        image: imageUrl,
        position: "backCenter" as LogoPosition,
        x: 0,
        y: 0,
        scale: 1.5,
      };
      addLogo(newLogo);
    }
  };

  return (
    <div className="space-y-6">
      {/* قسم الصور المحددة من المكتبة */}
      <SelectedImagesSection
        onImageSelect={handleSelectedImageUse}
        title="الصور المحددة"
      />

      {/* قسم رفع الشعارات التقليدي */}
      <LogoUploadSection
        positions={logoPositions}
        title="إضافة الشعارات (خلفي)"
        view="back"
        showPredefinedLogos={true}
        pricingInfo={{
          description: "* الشعار الخلفي مشمول في السعر الأساسي",
        }}
      />
    </div>
  );
};

export default BackLogoSection;
