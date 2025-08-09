import React from "react";
import LogoUploadSection from "./shared/LogoUploadSection";
import { LogoPosition } from "../../../context/JacketContext";

const BackLogoSection: React.FC = () => {
  const logoPositions: { id: LogoPosition; name: string }[] = [
    { id: "backCenter", name: "منتصف الظهر" },
  ];

  return (
    <div className="space-y-6">
      {/* قسم رفع الشعارات التقليدي */}
      <LogoUploadSection
        positions={logoPositions}
        title="إضافة الشعارات (خلفي)"
        view="back"
        showPredefinedLogos={true}
        pricingInfo={{
          description: "الشعار الخلفي مشمول في السعر الأساسي",
        }}
      />
    </div>
  );
};

export default BackLogoSection;
