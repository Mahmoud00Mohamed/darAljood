import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Save,
  RotateCcw,
  Loader2,
  TrendingUp,
  Info,
  CheckCircle,
  Calendar,
  AlertCircle,
} from "lucide-react";
import pricingService, { PricingData } from "../../services/pricingService";
import authService from "../../services/authService";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { useModal } from "../../hooks/useModal";

const PricingManagement: React.FC = () => {
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [pricingError, setPricingError] = useState("");
  const resetPricingModal = useModal();

  useEffect(() => {
    loadPricingData();
  }, []);

  const loadPricingData = async () => {
    setIsLoadingPricing(true);
    setPricingError("");
    try {
      const data = await pricingService.getPricing();
      setPricingData(data);
    } catch (error) {
      setPricingError(
        error instanceof Error ? error.message : "فشل في تحميل بيانات التسعير"
      );
    } finally {
      setIsLoadingPricing(false);
    }
  };

  const handleSave = async () => {
    if (!pricingData) return;

    setIsSaving(true);
    setSaveMessage("");
    setPricingError("");

    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      const updatedData = await pricingService.updatePricing(
        pricingData,
        token
      );
      setPricingData(updatedData);
      setSaveMessage("تم حفظ التغييرات بنجاح");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setPricingError(
        error instanceof Error ? error.message : "فشل في حفظ التغييرات"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsSaving(true);
    setPricingError("");

    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      const resetData = await pricingService.resetPricing(token);
      setPricingData(resetData);
      setSaveMessage("تم إعادة تعيين الأسعار بنجاح");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setPricingError(
        error instanceof Error ? error.message : "فشل في إعادة تعيين الأسعار"
      );
    } finally {
      setIsSaving(false);
      resetPricingModal.closeModal();
    }
  };

  const updatePricingField = (path: string, value: string | number) => {
    if (!pricingData) return;

    const pathArray = path.split(".");
    const newData = { ...pricingData };
    let current: Record<string, unknown> = newData;

    for (let i = 0; i < pathArray.length - 1; i++) {
      const currentKey = pathArray[i];
      current[currentKey] = {
        ...(current[currentKey] as Record<string, unknown>),
      };
      current = current[currentKey] as Record<string, unknown>;
    }

    current[pathArray[pathArray.length - 1]] = value;
    setPricingData(newData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <AnimatePresence>
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 shadow-sm"
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-medium">{saveMessage}</span>
          </motion.div>
        )}

        {pricingError && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-sm"
          >
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 font-medium">{pricingError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            إدارة الأسعار
          </h2>
          <p className="text-gray-600">
            تعديل أسعار خدمات دار الجود وإدارة التكاليف
          </p>
        </div>
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <button
            onClick={handleSave}
            disabled={isSaving || !pricingData}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white font-semibold rounded-xl hover:from-[#4b2e55] hover:to-[#6d3f7a] transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            حفظ التغييرات
          </button>
          <button
            onClick={resetPricingModal.openModal}
            disabled={isSaving}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            إعادة تعيين
          </button>
          <button
            onClick={loadPricingData}
            disabled={isLoadingPricing}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50"
          >
            {isLoadingPricing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            تحديث
          </button>
        </div>
      </div>

      {isLoadingPricing ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#563660] mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              جاري تحميل بيانات التسعير...
            </p>
          </div>
        </div>
      ) : pricingData ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  السعر الأساسي
                </h3>
                <p className="text-gray-600 text-sm">
                  السعر الأساسي للجاكيت المخصص
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  السعر الأساسي (ريال سعودي)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={pricingData.basePrice}
                    onChange={(e) =>
                      updatePricingField(
                        "basePrice",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all bg-gray-50 hover:bg-white text-lg font-semibold"
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    ريال
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  يشمل السعر الأساسي:
                </h4>
                <ul className="text-blue-800 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    شعار خلفي + نص خلفي
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    شعارين في الجهة اليمنى
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    شعارين في الجهة اليسرى
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    شعار أو نص واحد في الأمام
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  التكاليف الإضافية
                </h3>
                <p className="text-gray-600 text-sm">أسعار الخدمات الإضافية</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  عنصر إضافي في الأمام (ريال)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={pricingData.additionalCosts.frontExtraItem}
                    onChange={(e) =>
                      updatePricingField(
                        "additionalCosts.frontExtraItem",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    ريال
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  شعار ثالث - جهة يمنى (ريال)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={pricingData.additionalCosts.rightSideThirdLogo}
                    onChange={(e) =>
                      updatePricingField(
                        "additionalCosts.rightSideThirdLogo",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    ريال
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  شعار ثالث - جهة يسرى (ريال)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={pricingData.additionalCosts.leftSideThirdLogo}
                    onChange={(e) =>
                      updatePricingField(
                        "additionalCosts.leftSideThirdLogo",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    ريال
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-2 bg-gradient-to-r from-[#563660] to-[#7e4a8c] rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">ملخص التسعير</h3>
                <p className="text-white text-opacity-90 text-sm">
                  آخر تحديث:{" "}
                  {new Date(pricingData.lastUpdated).toLocaleDateString(
                    "ar-SA"
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold mb-1">
                  {pricingData.basePrice} ريال
                </div>
                <div className="text-white text-opacity-80 text-sm">
                  السعر الأساسي
                </div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold mb-1">
                  {pricingData.additionalCosts.frontExtraItem} ريال
                </div>
                <div className="text-white text-opacity-80 text-sm">
                  عنصر أمامي إضافي
                </div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold mb-1">
                  {pricingData.additionalCosts.rightSideThirdLogo} ريال
                </div>
                <div className="text-white text-opacity-80 text-sm">
                  شعار ثالث يمين
                </div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold mb-1">
                  {pricingData.additionalCosts.leftSideThirdLogo} ريال
                </div>
                <div className="text-white text-opacity-80 text-sm">
                  شعار ثالث يسار
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            فشل في تحميل بيانات التسعير
          </h3>
          <button
            onClick={loadPricingData}
            className="px-6 py-3 bg-[#563660] text-white rounded-xl hover:bg-[#4b2e55] transition-colors font-semibold"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      <ConfirmationModal
        isOpen={resetPricingModal.isOpen}
        onClose={resetPricingModal.closeModal}
        onConfirm={handleReset}
        title="إعادة تعيين الأسعار"
        message="هل أنت متأكد من إعادة تعيين جميع الأسعار إلى القيم الافتراضية؟ سيتم فقدان جميع التعديلات الحالية."
        confirmText="نعم، إعادة تعيين"
        cancelText="إلغاء"
        type="danger"
        isLoading={isSaving}
      />
    </motion.div>
  );
};

export default PricingManagement;
