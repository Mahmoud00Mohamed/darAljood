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
  Grid,
  BarChart3,
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
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#563660]" />
            إدارة الأسعار
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            تحديث وإدارة أسعار الخدمات والمنتجات
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving || !pricingData}
            className="flex items-center gap-2 px-4 py-2 bg-[#563660] text-white font-medium rounded-lg hover:bg-[#4b2e55] transition-all duration-200 disabled:opacity-50 text-sm"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            حفظ
          </button>
          <button
            onClick={resetPricingModal.openModal}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            إعادة تعيين
          </button>
        </div>
      </div>

      <AnimatePresence>
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-green-700 font-medium text-sm">
              {saveMessage}
            </span>
          </motion.div>
        )}

        {pricingError && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-red-700 font-medium text-sm">
              {pricingError}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoadingPricing ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#563660] mx-auto mb-4" />
            <p className="text-gray-600 text-sm">
              جاري تحميل بيانات التسعير...
            </p>
          </div>
        </div>
      ) : pricingData ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">السعر الأساسي</p>
                  <p className="text-2xl font-bold">{pricingData.basePrice}</p>
                  <p className="text-blue-100 text-xs">ريال سعودي</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">عنصر أمامي إضافي</p>
                  <p className="text-2xl font-bold">
                    {pricingData.additionalCosts.frontExtraItem}
                  </p>
                  <p className="text-orange-100 text-xs">ريال سعودي</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">شعار ثالث يمين</p>
                  <p className="text-2xl font-bold">
                    {pricingData.additionalCosts.rightSideThirdLogo}
                  </p>
                  <p className="text-green-100 text-xs">ريال سعودي</p>
                </div>
                <Grid className="w-8 h-8 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">شعار ثالث يسار</p>
                  <p className="text-2xl font-bold">
                    {pricingData.additionalCosts.leftSideThirdLogo}
                  </p>
                  <p className="text-purple-100 text-xs">ريال سعودي</p>
                </div>
                <Grid className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>

          {/* Pricing Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Base Price Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    السعر الأساسي
                  </h3>
                  <p className="text-sm text-gray-600">
                    السعر الأساسي للجاكيت المخصص
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all bg-white text-lg font-medium"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
                      ريال
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2 text-sm">
                    <Info className="w-4 h-4" />
                    يشمل السعر الأساسي:
                  </h4>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-blue-600 flex-shrink-0" />
                      شعار خلفي + نص خلفي
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-blue-600 flex-shrink-0" />
                      شعارين في الجهة اليمنى
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-blue-600 flex-shrink-0" />
                      شعارين في الجهة اليسرى
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-blue-600 flex-shrink-0" />
                      شعار أو نص واحد في الأمام
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Additional Costs Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    التكاليف الإضافية
                  </h3>
                  <p className="text-sm text-gray-600">
                    أسعار الخدمات الإضافية
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all bg-white text-sm"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
                      ريال
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all bg-white text-sm"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
                      ريال
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all bg-white text-sm"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
                      ريال
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Last Updated Info */}
          <div className="bg-gradient-to-r from-[#563660] to-[#7e4a8c] rounded-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">معلومات التحديث</h3>
                <p className="text-white text-opacity-90 text-sm">
                  آخر تحديث:{" "}
                  {new Date(pricingData.lastUpdated).toLocaleDateString(
                    "ar-SA"
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white bg-opacity-10 rounded-lg p-3">
                <div className="text-lg font-bold mb-1">
                  {pricingData.basePrice}
                </div>
                <div className="text-white text-opacity-80 text-xs">
                  السعر الأساسي (ريال)
                </div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-3">
                <div className="text-lg font-bold mb-1">
                  {pricingData.additionalCosts.frontExtraItem}
                </div>
                <div className="text-white text-opacity-80 text-xs">
                  عنصر أمامي إضافي (ريال)
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white border-opacity-20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white text-opacity-80">
                  تم التحديث بواسطة:
                </span>
                <span className="font-medium">{pricingData.updatedBy}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            فشل في تحميل بيانات التسعير
          </h3>
          <button
            onClick={loadPricingData}
            className="px-4 py-2 bg-[#563660] text-white rounded-lg hover:bg-[#4b2e55] transition-colors font-medium text-sm"
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
    </div>
  );
};

export default PricingManagement;
