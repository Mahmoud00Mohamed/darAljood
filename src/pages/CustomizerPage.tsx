import React, { useEffect } from "react";
import JacketCustomizer from "../components/customizer/JacketCustomizer";

const CustomizerPage: React.FC = () => {
  // تنظيف بيانات صفحة التعديل عند دخول صفحة التخصيص
  useEffect(() => {
    // مسح بيانات صفحة تعديل الطلب عند دخول صفحة التخصيص
    localStorage.removeItem("orderEditJacketState");

    // مسح النسخة الاحتياطية إذا كانت موجودة
    sessionStorage.removeItem("customizerBackup");
  }, []);

  return <JacketCustomizer />;
};

export default CustomizerPage;
