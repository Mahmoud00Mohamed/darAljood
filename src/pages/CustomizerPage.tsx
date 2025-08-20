import React, { useEffect } from "react";
import JacketCustomizer from "../components/customizer/JacketCustomizer";
import { initialState, useJacket } from "../context/JacketContext";

const CustomizerPage: React.FC = () => {
  const { setJacketState } = useJacket();

  useEffect(() => {
    // استعادة النسخة الاحتياطية من sessionStorage
    const backupJson =
      sessionStorage.getItem("customizerBackup") ||
      sessionStorage.getItem("tempEditBackup");

    if (backupJson) {
      try {
        const backupState = JSON.parse(backupJson);
        // الخطوة الأهم: تحديث حالة الـ Provider مباشرةً في الذاكرة
        setJacketState(backupState);
      } catch {
        // في حال وجود خطأ، العودة للحالة الافتراضية
        setJacketState(initialState);
      }
    } else {
      // إذا لم تكن هناك نسخة احتياطية (مثلاً عند فتح المصمم لأول مرة)
      // حاول تحميل الحالة العادية من localStorage
      const regularStateJson = localStorage.getItem("jacketState");
      if (regularStateJson) {
        try {
          setJacketState(JSON.parse(regularStateJson));
        } catch {
          setJacketState(initialState);
        }
      } else {
        // إذا لم يوجد أي شيء، ابدأ من الحالة الافتراضية
        setJacketState(initialState);
      }
    }

    // تنظيف جميع بيانات التعديل والنسخ الاحتياطية
    localStorage.removeItem("orderEditJacketState");
    localStorage.removeItem("orderEditCart");
    localStorage.removeItem("temporaryOrderEditJacketState");
    localStorage.removeItem("temporaryOrderEditCart");

    sessionStorage.removeItem("customizerBackup");
    sessionStorage.removeItem("customizerCartBackup");
    sessionStorage.removeItem("tempEditBackup");
    sessionStorage.removeItem("tempEditCartBackup");

    // استخدام setJacketState في مصفوفة الاعتماديات لضمان التنفيذ مرة واحدة
  }, [setJacketState]);

  return <JacketCustomizer />;
};

export default CustomizerPage;
