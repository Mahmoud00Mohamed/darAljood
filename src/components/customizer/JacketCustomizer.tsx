import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CustomizationSidebar from "../sidebar/CustomizationSidebar";
import JacketViewer from "../jacket/JacketViewer";
import JacketImageCapture, {
  JacketImageCaptureRef,
} from "../jacket/JacketImageCapture";
import TopBar from "../ui/TopBar";
import { useJacket } from "../../context/JacketContext";
import { useCart } from "../../context/CartContext";
import {
  Minus,
  Plus,
  X,
  ShoppingCart,
  ArrowLeft,
  Info,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { usePricing } from "../../hooks/usePricing";
import ConfirmationModal from "../ui/ConfirmationModal";
import { useModal } from "../../hooks/useModal";
import fontPreloader from "../../utils/fontPreloader";

const JacketCustomizer: React.FC = () => {
  const [quantity, setQuantity] = useState(1);
  const { jacketState } = useJacket();
  const { addToCart, items } = useCart();
  const { calculatePrice } = usePricing();
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPricingDetails, setShowPricingDetails] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isCapturingImages, setIsCapturingImages] = useState(false);
  const [pricingBreakdown, setPricingBreakdown] = useState<{
    basePrice: number;
    additionalCosts: Array<{
      item: string;
      cost: number;
      quantity: number;
    }>;
    totalPrice: number;
    appliedDiscount: {
      type: string;
      percentage: number;
      amount: number;
    } | null;
    finalPrice: number;
  } | null>(null);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);

  const jacketImageCaptureRef = useRef<JacketImageCaptureRef>(null);

  const replaceConfirmModal = useModal();

  // تنظيف بيانات صفحة التعديل عند دخول صفحة التخصيص
  useEffect(() => {
    // مسح بيانات صفحة تعديل الطلب
    localStorage.removeItem("orderEditJacketState");
    localStorage.removeItem("orderEditCart");
  }, []);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = async () => {
    if (items.length > 0) {
      replaceConfirmModal.openModal();
    } else {
      await addToCartWithImages();
    }
  };

  const addToCartWithImages = async () => {
    setIsCapturingImages(true);
    try {
      // التأكد من تحميل الخطوط قبل بدء التقاط الصور
      await fontPreloader.preloadAllFonts();

      // التقاط صور الجاكيت الحالي
      let jacketImages: string[] = [];

      // تأخير مختصر للتأكد من تحديث العرض
      await new Promise((resolve) => setTimeout(resolve, 200));

      try {
        if (jacketImageCaptureRef.current) {
          jacketImages = await jacketImageCaptureRef.current.captureAllViews();
        }
      } catch (captureError) {
        console.warn(
          "فشل في التقاط الصور، سيتم المتابعة بدون صور:",
          captureError
        );
        // المتابعة بدون صور في حالة فشل التقاط الصور
        jacketImages = [];
      }

      // إضافة إلى السلة مع الصور
      addToCart(jacketState, quantity, jacketImages);
      setShowMobileDetails(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Error capturing images:", error);
      // إضافة إلى السلة بدون صور في حالة الخطأ
      addToCart(jacketState, quantity);
      setShowMobileDetails(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } finally {
      setIsCapturingImages(false);
    }
  };

  const handleConfirmReplace = async () => {
    replaceConfirmModal.closeModal();
    await addToCartWithImages();
  };

  const toggleMobileDetails = () => {
    setShowMobileDetails((prev) => !prev);
  };

  // حساب تفاصيل التسعير من الباك إند
  useEffect(() => {
    const loadPricingBreakdown = async () => {
      setIsLoadingPricing(true);
      try {
        // فلترة الشعارات مع إزالة المكررات
        const uniqueLogos = jacketState.logos.filter(
          (logo, index, self) =>
            index === self.findIndex((l) => l.id === logo.id)
        );

        const uniqueTexts = jacketState.texts.filter(
          (text, index, self) =>
            index === self.findIndex((t) => t.id === text.id)
        );

        const frontLogos = uniqueLogos.filter((logo) =>
          ["chestRight", "chestLeft"].includes(logo.position)
        ).length;

        const frontTexts = uniqueTexts.filter((text) =>
          ["chestRight", "chestLeft"].includes(text.position)
        ).length;

        const rightSideLogos = uniqueLogos.filter((logo) =>
          ["rightSide_top", "rightSide_middle", "rightSide_bottom"].includes(
            logo.position
          )
        ).length;

        const leftSideLogos = uniqueLogos.filter((logo) =>
          ["leftSide_top", "leftSide_middle", "leftSide_bottom"].includes(
            logo.position
          )
        ).length;

        const result = await calculatePrice(
          frontLogos,
          frontTexts,
          rightSideLogos,
          leftSideLogos,
          quantity
        );

        setPricingBreakdown(result.breakdown);
      } catch (error) {
        console.error("Error loading pricing breakdown:", error);
        // استخدام القيم الافتراضية في حالة الخطأ
        setPricingBreakdown({
          basePrice: 220,
          additionalCosts: [],
          totalPrice: 220,
          appliedDiscount: null,
          finalPrice: 220 * quantity,
        });
      } finally {
        setIsLoadingPricing(false);
      }
    };

    loadPricingBreakdown();
  }, [jacketState.logos, jacketState.texts, quantity, calculatePrice]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-white jacket-customizer-container">
      {/* الشريط العلوي */}
      <TopBar />

      {/* المحتوى الرئيسي */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Hidden Jacket Image Capture Component */}
        <div style={{ position: "fixed", top: "-9999px", left: "-9999px" }}>
          <JacketImageCapture ref={jacketImageCaptureRef} />
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {showSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-[34px] left-1/2 transform -translate-x-1/2 z-[100] gold-gradient text-white px-3 py-2 lg:px-6 lg:py-3 rounded-lg shadow-gold flex items-center gap-2 text-sm lg:text-base max-w-[90vw] lg:max-w-none"
            >
              <CheckCircle size={16} className="lg:hidden" />
              <CheckCircle size={20} className="hidden lg:block" />
              <span className="text-xs lg:text-base whitespace-nowrap overflow-hidden text-ellipsis">
                تمت الإضافة إلى السلة بنجاح!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Replace Confirmation Modal */}
        <ConfirmationModal
          isOpen={replaceConfirmModal.isOpen}
          onClose={replaceConfirmModal.closeModal}
          onConfirm={handleConfirmReplace}
          title="استبدال المنتج في السلة"
          message="يوجد منتج واحد في السلة بالفعل. هل تريد استبداله بالتصميم الجديد؟"
          confirmText={isCapturingImages ? "جاري الحفظ..." : "نعم، استبدل"}
          cancelText="إلغاء"
          type="warning"
          isLoading={isCapturingImages}
        />

        {/* Mobile Back to Home Button */}
        <Link
          to="/"
          className="lg:hidden fixed top-[34px] right-4 z-60 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            العودة للرئيسية
          </span>
        </Link>

        {/* Sidebar for Desktop */}
        <div
          className={`${
            window.innerWidth > 1250 ? "block" : "hidden"
          } w-[380px]`}
        >
          <CustomizationSidebar setIsSidebarOpen={setIsSidebarOpen} />
        </div>

        {/* Jacket Viewer - Adjusted for mobile */}
        <div
          className={`flex-1 flex items-center justify-center p-4 lg:p-8 bg-gray-50 transition-all duration-300 ${
            window.innerWidth <= 1250 && isSidebarOpen
              ? "fixed top-[30px] left-0 right-0 z-20"
              : "min-h-screen lg:min-h-auto"
          }`}
          style={{
            height:
              window.innerWidth <= 1250 && isSidebarOpen
                ? "calc(100vh - 40vh - 8rem - 30px)"
                : window.innerWidth <= 1250
                ? "calc(100vh - 4rem - 30px)"
                : "auto",
            display: "flex",
            alignItems: window.innerWidth > 1250 ? "flex-start" : "center",
            justifyContent: "center",
            paddingTop: window.innerWidth > 1250 ? "14rem" : "0",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`w-full max-w-[400px] lg:max-w-[500px] relative ${
              isSidebarOpen && window.innerWidth <= 1250 ? "z-40" : "z-10"
            }`}
          >
            <JacketViewer isSidebarOpen={isSidebarOpen} />
          </motion.div>
        </div>

        {/* Desktop Details Panel */}
        <div
          className={`${
            window.innerWidth > 1250 ? "flex" : "hidden"
          } w-80 bg-white shadow-xl p-6 flex-col border-l border-gray-200 rounded-l-2xl overflow-y-auto max-h-screen`}
        >
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 flex-1 flex flex-col"
          >
            <h2 className="text-2xl font-light text-gray-900 gold-text-gradient">
              تخصيص الجاكيت
            </h2>

            {/* عرض المقاس المحدد */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  المقاس المحدد
                </span>
              </div>
              <div className="text-lg font-semibold text-[#563660]">
                {jacketState.size}
              </div>
            </div>

            {/* تفاصيل التسعير */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  تفاصيل السعر
                </span>
                {isLoadingPricing && (
                  <Loader2 className="w-4 h-4 animate-spin text-[#563660]" />
                )}
                <button
                  onClick={() => setShowPricingDetails(!showPricingDetails)}
                  className="text-xs text-[#563660] hover:text-[#4b2e55] transition-colors flex items-center gap-1"
                >
                  <Info size={12} />
                  {showPricingDetails ? "إخفاء" : "عرض"} التفاصيل
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">السعر الأساسي:</span>
                  <span className="font-medium">
                    {pricingBreakdown?.basePrice ?? 220} ريال
                  </span>
                </div>

                <AnimatePresence>
                  {showPricingDetails && pricingBreakdown && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 border-t pt-2"
                    >
                      <div className="p-3 bg-yellow-50 rounded-lg text-xs text-yellow-800 border border-yellow-200 space-y-1">
                        <div className="font-semibold mb-1">
                          السعر الأساسي يشمل:
                        </div>
                        <div>• شعار خلفي + نص خلفي</div>
                        <div>• شعارين في الجهة اليمنى</div>
                        <div>• شعارين في الجهة اليسرى</div>
                        <div>• شعار أو نص واحد في الأمام</div>
                      </div>

                      {pricingBreakdown.additionalCosts?.length > 0 && (
                        <>
                          <div className="text-xs text-gray-500 mt-3 mb-2">
                            التكاليف الإضافية:
                          </div>
                          {pricingBreakdown.additionalCosts.map(
                            (cost, index) => (
                              <div
                                key={index}
                                className="flex justify-between text-xs"
                              >
                                <span className="text-gray-600">
                                  {cost.item} ({cost.quantity}×)
                                </span>
                                <span className="font-medium">
                                  {cost.cost * cost.quantity} ريال
                                </span>
                              </div>
                            )
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                  <span>الإجمالي:</span>
                  <span className="gold-text-gradient">
                    {pricingBreakdown?.finalPrice ?? jacketState.totalPrice}{" "}
                    ريال
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الكمية
              </label>
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="w-10 h-10 flex items-center justify-center gold-gradient rounded-full shadow-gold transition-all duration-300 hover:brightness-110"
                >
                  <Minus size={16} className="text-white" />
                </button>
                <span className="text-xl font-semibold text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="w-10 h-10 flex items-center justify-center gold-gradient rounded-full shadow-gold transition-all duration-300 hover:brightness-110"
                >
                  <Plus size={16} className="text-white" />
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>الإجمالي:</span>
                <span className="gold-text-gradient">
                  {pricingBreakdown?.finalPrice ??
                    jacketState.totalPrice * quantity}{" "}
                  ريال
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">شامل الشحن</p>
            </div>

            <div className="space-y-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
              <div className="flex justify-between">
                <span>مدة الإنتاج:</span>
                <span className="font-medium">شهر إلى 45 يوم</span>
              </div>
              <div className="flex justify-between">
                <span>الحد الأدنى:</span>
                <span className="font-medium">1 وحدة</span>
              </div>
              <div className="flex justify-between">
                <span>الشحن إلى:</span>
                <span className="font-medium">السعودية فقط</span>
              </div>
            </div>

            <div className="space-y-3 mt-auto relative z-10">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={isCapturingImages}
                className="w-full py-3 gold-gradient text-white rounded-xl font-semibold shadow-gold transition-all duration-300 hover:brightness-110 disabled:opacity-50 "
              >
                {isCapturingImages
                  ? "جاري الحفظ..."
                  : items.length > 0
                  ? "استبدال في السلة"
                  : "أضف إلى السلة"}
              </motion.button>

              {/* زر الانتقال إلى عربة التسوق */}
              <Link
                to="/cart"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-md hover:bg-gray-50 transition-all duration-300 text-gray-700 font-medium "
              >
                <ShoppingCart className="w-4 h-4" />
                الذهاب إلى السلة
              </Link>

              {/* زر العودة للرئيسية */}
              <Link
                to="/"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-md hover:bg-gray-50 transition-all duration-300 text-gray-700 font-medium  "
              >
                <ArrowLeft className="w-4 h-4" />
                العودة للرئيسية
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Mobile Cart Button */}
        <motion.div
          className={`${
            window.innerWidth <= 1250 ? "block" : "hidden"
          } fixed top-[34px] left-4 z-60`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <button
            onClick={toggleMobileDetails}
            className="p-2 gold-gradient rounded-full shadow-md transition-all"
            title="سلة"
          >
            <ShoppingCart size={18} className="text-white" />
          </button>
        </motion.div>

        {/* Mobile Details Panel */}
        <AnimatePresence>
          {showMobileDetails && window.innerWidth <= 1250 && (
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed top-[30px] left-0 right-0 bottom-0 bg-white shadow-xl z-70 p-4 mobile-details-panel overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-0 p-4">
                <h2 className="text-lg font-bold text-gray-900 gold-text-gradient">
                  تخصيص الجاكيت
                </h2>
                <button
                  onClick={toggleMobileDetails}
                  className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  <X size={16} className="text-gray-600" />
                </button>
              </div>

              <div className="space-y-2 p-4">
                {/* عرض المقاس المحدد للموبايل */}
                <div className="bg-gray-50 p-3 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      المقاس المحدد
                    </span>
                  </div>
                  <div className="text-base font-semibold text-[#563660]">
                    {jacketState.size}
                  </div>
                </div>

                {/* تفاصيل التسعير للموبايل */}
                <div className="bg-gray-50 p-3 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      تفاصيل السعر
                    </span>
                    <button
                      onClick={() => setShowPricingDetails(!showPricingDetails)}
                      className="text-xs text-[#563660] hover:text-[#4b2e55] transition-colors flex items-center gap-1"
                    >
                      <Info size={12} />
                      {showPricingDetails ? "إخفاء" : "عرض"} التفاصيل
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">السعر الأساسي:</span>
                      <span className="font-medium">
                        {pricingBreakdown?.basePrice ?? 220} ريال
                      </span>
                    </div>

                    <AnimatePresence>
                      {showPricingDetails && pricingBreakdown && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 border-t pt-2"
                        >
                          <div className="p-3 bg-yellow-50 rounded-lg text-xs text-yellow-800 border border-yellow-200 space-y-1">
                            <div className="font-semibold mb-1">
                              السعر الأساسي يشمل:
                            </div>
                            <div>• شعار خلفي + نص خلفي</div>
                            <div>• شعارين في الجهة اليمنى</div>
                            <div>• شعارين في الجهة اليسرى</div>
                            <div>• شعار أو نص واحد في الأمام</div>
                          </div>

                          {pricingBreakdown.additionalCosts?.length > 0 && (
                            <>
                              <div className="text-xs text-gray-500 mt-3 mb-2">
                                التكاليف الإضافية:
                              </div>
                              {pricingBreakdown.additionalCosts.map(
                                (
                                  cost: {
                                    item: string;
                                    cost: number;
                                    quantity: number;
                                  },
                                  index: number
                                ) => (
                                  <div
                                    key={index}
                                    className="flex justify-between text-xs"
                                  >
                                    <span className="text-gray-600">
                                      {cost.item} ({cost.quantity}×)
                                    </span>
                                    <span className="font-medium">
                                      {cost.cost * cost.quantity} ريال
                                    </span>
                                  </div>
                                )
                              )}
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex justify-between items-center text-base font-semibold border-t pt-2">
                      <span>الإجمالي:</span>
                      <span className="gold-text-gradient">
                        {pricingBreakdown?.finalPrice ?? jacketState.totalPrice}{" "}
                        ريال
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl">
                  <span className="block text-sm text-gray-600 mb-2">
                    الكمية:
                  </span>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleQuantityChange(-1)}
                      className="w-8 h-8 flex items-center justify-center gold-gradient rounded-full shadow-gold"
                    >
                      <Minus size={14} className="text-white" />
                    </motion.button>
                    <span className="font-semibold text-gray-900">
                      {quantity}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleQuantityChange(1)}
                      className="w-8 h-8 flex items-center justify-center gold-gradient rounded-full shadow-gold"
                    >
                      <Plus size={14} className="text-white" />
                    </motion.button>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                  <span className="text-sm text-gray-600">
                    الإجمالي النهائي:
                  </span>
                  <span className="text-base font-semibold gold-text-gradient">
                    {pricingBreakdown?.finalPrice ??
                      jacketState.totalPrice * quantity}{" "}
                    ريال
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                  <div className="flex justify-between">
                    <span>مدة الإنتاج:</span>
                    <span className="font-medium">شهر إلى 45 يوم </span>
                  </div>
                  <div className="flex justify-between">
                    <span>الحد الأدنى:</span>
                    <span className="font-medium">1 وحدة</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الشحن إلى:</span>
                    <span className="font-medium">السعودية فقط</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    disabled={isCapturingImages}
                    className="w-full py-2 px-3 gold-gradient text-white rounded-xl text-sm font-semibold shadow-gold hover-lift disabled:opacity-50"
                  >
                    {isCapturingImages
                      ? "جاري الحفظ..."
                      : items.length > 0
                      ? "استبدال في السلة"
                      : "أضف إلى السلة"}
                  </motion.button>

                  {/* زر الانتقال إلى عربة التسوق */}
                  <Link
                    to="/cart"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-md hover:bg-gray-50 transition-all duration-300 text-gray-700 text-sm font-medium"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    الذهاب إلى السلة
                  </Link>

                  {/* زر العودة للرئيسية */}
                  <Link
                    to="/"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-md hover:bg-gray-50 transition-all duration-300 text-gray-700 text-sm font-medium relative z-10 pointer-events-auto"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    العودة للرئيسية
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Sidebar - Fixed at bottom */}
        <div
          className={`${
            window.innerWidth <= 1250 ? "block" : "hidden"
          } fixed bottom-0 left-0 right-0 z-40 mobile-sidebar transition-all duration-300`}
        >
          <CustomizationSidebar
            isMobile
            setIsSidebarOpen={setIsSidebarOpen}
            onAddToCart={handleAddToCart}
            isCapturingImages={isCapturingImages}
          />
        </div>
      </div>
    </div>
  );
};

export default JacketCustomizer;
