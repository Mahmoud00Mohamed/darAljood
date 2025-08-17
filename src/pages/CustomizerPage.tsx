import React, { useEffect } from "react";
import JacketCustomizer from "../components/customizer/JacketCustomizer";

const CustomizerPage: React.FC = () => {
  // تنظيف بيانات صفحة التعديل عند دخول صفحة التخصيص
  useEffect(() => {
    // مسح بيانات صفحات التعديل عند دخول صفحة التخصيص
    localStorage.removeItem("orderEditJacketState");
    localStorage.removeItem("orderEditCart");
    localStorage.removeItem("temporaryOrderEditJacketState");
    localStorage.removeItem("temporaryOrderEditCart");

    // مسح النسخ الاحتياطية إذا كانت موجودة
    sessionStorage.removeItem("customizerBackup");
    sessionStorage.removeItem("customizerCartBackup");
    sessionStorage.removeItem("tempEditBackup");
    sessionStorage.removeItem("tempEditCartBackup");
  }, []);

  return <JacketCustomizer />;
};

export default CustomizerPage;
