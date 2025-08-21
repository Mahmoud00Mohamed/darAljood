import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  User,
  Phone,
  Package,
  Edit3,
  X,
  Download,
} from "lucide-react";
import { JacketProvider, useJacket } from "../context/JacketContext";
import { CartProvider } from "../context/CartContext";
import { ImageLibraryProvider } from "../context/ImageLibraryContext";
import orderService, { OrderData } from "../services/orderService";
import authService from "../services/authService";
import JacketViewer from "../components/jacket/JacketViewer";
import CustomizationSidebar from "../components/sidebar/CustomizationSidebar";
import TopBar from "../components/ui/TopBar";
import JacketImageCapture, {
  JacketImageCaptureRef,
} from "../components/jacket/JacketImageCapture";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import { useModal } from "../hooks/useModal";
import fontPreloader from "../utils/fontPreloader";
import { cleanupJacketData, validateDataIntegrity } from "../utils/dataCleanup";
import { generateOrderPDFWithImages } from "../utils/pdfGenerator";

// دالة مساعدة لتحويل التاريخ إلى الصيغة المطلوبة YYYY/MM/DD
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};

const OrderEditContent: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const {
    jacketState,
    setColor,
    setMaterial,
    setSize,
    addLogo,
    addText,
    removeLogo,
    removeText,
    setCurrentView,
  } = useJacket();

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const jacketImageCaptureRef = useRef<JacketImageCaptureRef>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const saveConfirmModal = useModal();
  const exitConfirmModal = useModal();
  const pdfConfirmModal = useModal();

  // تم التعديل هنا: حذف دالة return()
  useEffect(() => {
    // حفظ نسخة احتياطية من بيانات الـ customizer
    const customizerState = localStorage.getItem("jacketState");
    const customizerCart = localStorage.getItem("cart");

    if (customizerState) {
      sessionStorage.setItem("customizerBackup", customizerState);
    }
    if (customizerCart) {
      sessionStorage.setItem("customizerCartBackup", customizerCart);
    }

    // مسح بيانات التعديل السابقة إذا كانت موجودة
    localStorage.removeItem("orderEditJacketState");
    localStorage.removeItem("orderEditCart");
  }, []);

  const loadOrderData = useCallback(async () => {
    // منع التحميل المتكرر
    if (isDataLoaded) return;

    if (!orderId) {
      setError("معرف الطلب مطلوب");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("رمز المصادقة غير موجود");
      }

      const order = await orderService.getOrderById(orderId, token);
      setOrderData(order);
      setCustomerInfo(order.customerInfo);

      // تحميل تكوين الجاكيت إلى الـ context
      if (order.items.length > 0) {
        const jacketConfig = order.items[0].jacketConfig;

        // تنظيف البيانات من التكرارات
        const cleanedConfig = cleanupJacketData(jacketConfig);

        // التحقق من سلامة البيانات
        const validation = validateDataIntegrity(cleanedConfig);
        if (!validation.isValid) {
          console.warn("Data integrity issues found:", validation.issues);
        }

        // مسح البيانات الحالية
        jacketState.logos.forEach((logo) => removeLogo(logo.id));
        jacketState.texts.forEach((text) => removeText(text.id));

        // تطبيق الألوان والخامات والمقاس
        setColor("body", jacketConfig.colors.body);
        setColor("sleeves", jacketConfig.colors.sleeves);
        setColor("trim", jacketConfig.colors.trim);
        setMaterial(
          "body",
          jacketConfig.materials.body as "leather" | "cotton"
        );
        setMaterial(
          "sleeves",
          jacketConfig.materials.sleeves as "leather" | "cotton"
        );
        setSize(
          jacketConfig.size as
            | "XS"
            | "S"
            | "M"
            | "L"
            | "XL"
            | "2XL"
            | "3XL"
            | "4XL"
        );

        // إضافة الشعارات المنظفة
        cleanedConfig.logos.forEach((logo) => {
          addLogo({
            id: logo.id,
            image: logo.image,
            position: logo.position as
              | "chestRight"
              | "chestLeft"
              | "backCenter"
              | "rightSide_top"
              | "rightSide_middle"
              | "rightSide_bottom"
              | "leftSide_top"
              | "leftSide_middle"
              | "leftSide_bottom",
            x: logo.x,
            y: logo.y,
            scale: logo.scale,
            rotation: logo.rotation,
          });
        });

        // إضافة النصوص المنظفة
        cleanedConfig.texts.forEach((text) => {
          addText({
            id: text.id,
            content: text.content,
            position: text.position as
              | "chestRight"
              | "chestLeft"
              | "backBottom",
            x: text.x,
            y: text.y,
            scale: text.scale,
            font: text.font,
            color: text.color,
            isConnected: text.isConnected,
            charStyles: text.charStyles,
          });
        });

        // تعيين العرض الحالي
        setCurrentView(
          jacketConfig.currentView as "front" | "back" | "right" | "left"
        );
      }

      setIsDataLoaded(true);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "فشل في تحميل بيانات الطلب"
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    orderId,
    isDataLoaded,
    jacketState.logos,
    jacketState.texts,
    removeLogo,
    removeText,
    setColor,
    setMaterial,
    setSize,
    addLogo,
    addText,
    setCurrentView,
  ]);

  useEffect(() => {
    if (!isDataLoaded) {
      loadOrderData();
    }
  }, [orderId, isDataLoaded, loadOrderData]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveMessage("");
    setError("");

    try {
      // حفظ التعديلات في الباك إند
      const token = authService.getToken();
      if (!token) {
        throw new Error("رمز المصادقة غير موجود");
      }

      const updateData = {
        customerInfo,
        jacketConfig: jacketState,
        quantity: orderData?.items[0]?.quantity || 1,
        totalPrice: jacketState.totalPrice,
      };

      const updateResult = await orderService.updateOrder(
        orderId!,
        updateData,
        token
      );

      // تحديث بيانات الطلب المحلية
      setOrderData(updateResult);

      // عرض رسالة مفصلة حسب نتيجة مزامنة الصور
      let message = "تم حفظ التغييرات في النظام بنجاح";

      if (updateResult.imageSync) {
        if (updateResult.imageSync.hasChanges) {
          if (updateResult.imageSync.success) {
            message += ` وتم تحديث الصور (${
              updateResult.imageSync.changes?.removed || 0
            } محذوفة، ${updateResult.imageSync.changes?.added || 0} مضافة)`;
          } else {
            message += " مع تحذيرات في مزامنة الصور";
          }
        }

        if (updateResult.imageSync.hasWarnings) {
          message += " (مع بعض التحذيرات)";
        }
      }

      setSaveMessage(message);
      setShowMobileDetails(false);
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "فشل في حفظ التغييرات");
    } finally {
      setIsSaving(false);
      saveConfirmModal.closeModal();
    }
  };

  const handleDownloadPDF = async () => {
    if (!orderData) return;

    setIsGeneratingPDF(true);

    try {
      // التأكد من تحميل الخطوط قبل بدء العملية
      await fontPreloader.preloadAllFonts();

      let jacketImages: string[] = [];

      // التقاط صور الجاكيت الحالي
      if (jacketImageCaptureRef.current) {
        try {
          jacketImages = await jacketImageCaptureRef.current.captureAllViews();
        } catch (captureError) {
          console.warn("فشل في التقاط الصور:", captureError);
          jacketImages = [];
        }
      }

      // إنشاء PDF
      const pdfBlob = await generateOrderPDFWithImages(
        {
          cartItems: orderData.items.map((item) => ({
            id: item.id,
            jacketConfig: {
              ...item.jacketConfig,
              colors: item.jacketConfig.colors,
              materials: {
                body: item.jacketConfig.materials.body as "leather" | "cotton",
                sleeves: item.jacketConfig.materials.sleeves as
                  | "leather"
                  | "cotton",
                trim: item.jacketConfig.materials.body as "leather" | "cotton",
              },
              size: item.jacketConfig.size as
                | "XS"
                | "S"
                | "M"
                | "L"
                | "XL"
                | "2XL"
                | "3XL"
                | "4XL",
              logos: item.jacketConfig.logos.map((logo) => ({
                ...logo,
                position: logo.position as
                  | "chestRight"
                  | "chestLeft"
                  | "backCenter"
                  | "rightSide_top"
                  | "rightSide_middle"
                  | "rightSide_bottom"
                  | "leftSide_top"
                  | "leftSide_middle"
                  | "leftSide_bottom",
              })),
              texts: item.jacketConfig.texts.map((text) => ({
                ...text,
                position: text.position as
                  | "chestRight"
                  | "chestLeft"
                  | "backBottom",
              })),
              currentView: item.jacketConfig.currentView as
                | "front"
                | "back"
                | "right"
                | "left",
              totalPrice: item.jacketConfig.totalPrice,
              isCapturing: false,
              uploadedImages: item.jacketConfig.uploadedImages || [],
            },
            quantity: item.quantity,
            price: item.price,
            addedAt: new Date(orderData.createdAt),
          })),
          totalPrice: orderData.totalPrice,
          customerInfo: customerInfo,
          orderNumber: orderData.orderNumber,
        },
        jacketImages
      );

      // تحميل الملف
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `طلب-${orderData.orderNumber}-${customerInfo.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("حدث خطأ أثناء إنشاء ملف PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCustomerInfoUpdate = (field: string, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleExit = () => {
    navigate("/x9qPzRwT3mY2kV8nL5jF6hD4cB");
  };

  const toggleMobileDetails = () => {
    setShowMobileDetails((prev) => !prev);
  };
  // إعادة تعيين حالة التحميل عند تغيير orderId
  useEffect(() => {
    setIsDataLoaded(false);
  }, [orderId]);
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#563660] mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل بيانات الطلب...</p>
        </div>
      </div>
    );
  }

  if (error && !orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            خطأ في تحميل الطلب
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/x9qPzRwT3mY2kV8nL5jF6hD4cB")}
            className="px-6 py-2 bg-[#563660] text-white rounded-lg hover:bg-[#4b2e55] transition-colors"
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    );
  }

  // ... ( باقي الكود JSX لم يتغير)
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-white jacket-customizer-container order-edit-page">
      {/* الشريط العلوي */}
      <TopBar />

      {/* شريط التنقل - مخفي في الهواتف */}
      <div className="hidden lg:block bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={exitConfirmModal.openModal}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة للوحة التحكم
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                تعديل الطلب {orderData?.orderNumber}
              </h1>
              <p className="text-sm text-gray-600">
                رمز التتبع: {orderData?.trackingCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={saveConfirmModal.openModal}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-[#563660] text-white font-medium rounded-lg hover:bg-[#4b2e55] transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              حفظ التغييرات
            </button>
          </div>
        </div>
      </div>

      {/* رسائل النجاح والخطأ */}
      <AnimatePresence>
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[34px] left-1/2 transform -translate-x-1/2 z-[100] bg-green-50 border border-green-200 text-green-700 px-3 py-2 lg:px-6 lg:py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm lg:text-base max-w-[90vw] lg:max-w-none"
          >
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="font-medium text-xs lg:text-base whitespace-nowrap overflow-hidden text-ellipsis">
              {saveMessage}
            </span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[34px] left-1/2 transform -translate-x-1/2 z-[100] bg-red-50 border border-red-200 text-red-700 px-3 py-2 lg:px-6 lg:py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm lg:text-base max-w-[90vw] lg:max-w-none"
          >
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="font-medium text-xs lg:text-base whitespace-nowrap overflow-hidden text-ellipsis">
              {error}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* المحتوى الرئيسي */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Hidden Jacket Image Capture Component */}
        <div style={{ position: "fixed", top: "-9999px", left: "-9999px" }}>
          <JacketImageCapture ref={jacketImageCaptureRef} />
        </div>

        {/* Mobile Back to Admin Button */}
        <button
          onClick={exitConfirmModal.openModal}
          className="lg:hidden fixed top-[34px] right-4 z-60 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            العودة للوحة التحكم
          </span>
        </button>
        {/* Sidebar for Desktop */}
        <div
          className={`${
            window.innerWidth > 1250 ? "block" : "hidden"
          } w-[380px] h-full`}
        >
          <div className="h-full">
            <CustomizationSidebar setIsSidebarOpen={setIsSidebarOpen} />
          </div>
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
          } w-80 bg-white shadow-xl p-6 flex-col border-l border-gray-200 rounded-l-2xl h-full overflow-y-auto`}
        >
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-0 flex-1 flex flex-col h-full"
          >
            <h2 className="text-2xl font-light text-gray-900 gold-text-gradient">
              تعديل الطلب
            </h2>

            {/* معلومات العميل */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-[#563660]" />
                <h3 className="text-lg font-semibold text-gray-900">
                  معلومات العميل
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم العميل
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) =>
                        handleCustomerInfoUpdate("name", e.target.value)
                      }
                      className="w-full pr-10 pl-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-sm"
                      placeholder="اسم العميل"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) =>
                        handleCustomerInfoUpdate("phone", e.target.value)
                      }
                      className="w-full pr-10 pl-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-sm"
                      placeholder="رقم الهاتف"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* معلومات الطلب */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-[#563660]" />
                <h3 className="text-lg font-semibold text-gray-900">
                  معلومات الطلب
                </h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">رقم الطلب:</span>
                  <span className="font-medium">{orderData?.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">رمز التتبع:</span>
                  <span className="font-mono font-medium">
                    {orderData?.trackingCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الحالة:</span>
                  <span className="font-medium text-[#563660]">
                    {orderData?.statusName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الكمية:</span>
                  <span className="font-medium">
                    {orderData?.items[0]?.quantity || 1}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">السعر:</span>
                  <span className="font-medium">
                    {orderData?.totalPrice} ريال
                  </span>
                </div>
              </div>
            </div>

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

            <div className="space-y-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
              <div className="flex justify-between">
                <span>تاريخ الإنشاء:</span>
                <span className="font-medium">
                  {orderData && formatDate(orderData.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>آخر تحديث:</span>
                <span className="font-medium">
                  {orderData && formatDate(orderData.updatedAt)}
                </span>
              </div>
            </div>

            <div className="space-y-3 mt-auto">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={saveConfirmModal.openModal}
                disabled={isSaving}
                className="w-full py-3 gold-gradient text-white rounded-xl font-semibold shadow-gold transition-all duration-300 hover:brightness-110 disabled:opacity-50 relative z-10"
              >
                {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
              </motion.button>

              <button
                onClick={exitConfirmModal.openModal}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-md hover:bg-gray-50 transition-all duration-300 text-gray-700 font-medium relative z-10"
              >
                <ArrowLeft className="w-4 h-4" />
                العودة للوحة التحكم
              </button>

              <button
                onClick={pdfConfirmModal.openModal}
                disabled={isGeneratingPDF}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-all duration-300 disabled:opacity-50 relative z-10"
              >
                {isGeneratingPDF ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isGeneratingPDF ? "جاري إنشاء PDF..." : "تحميل PDF"}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Mobile Edit Button */}
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
            title="تعديل الطلب"
          >
            <Edit3 size={18} className="text-white" />
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
                  تعديل الطلب {orderData?.orderNumber}
                </h2>
                <button
                  onClick={toggleMobileDetails}
                  className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  <X size={16} className="text-gray-600" />
                </button>
              </div>

              <div className="space-y-4 p-4">
                {/* معلومات العميل للموبايل */}
                <div className="bg-gray-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-[#563660]" />
                    <h3 className="text-base font-semibold text-gray-900">
                      معلومات العميل
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        اسم العميل
                      </label>
                      <div className="relative">
                        <User className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                        <input
                          type="text"
                          value={customerInfo.name}
                          onChange={(e) =>
                            handleCustomerInfoUpdate("name", e.target.value)
                          }
                          className="w-full pr-8 pl-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-sm"
                          placeholder="اسم العميل"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        رقم الهاتف
                      </label>
                      <div className="relative">
                        <Phone className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                        <input
                          type="tel"
                          value={customerInfo.phone}
                          onChange={(e) =>
                            handleCustomerInfoUpdate("phone", e.target.value)
                          }
                          className="w-full pr-8 pl-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-sm"
                          placeholder="رقم الهاتف"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* معلومات الطلب للموبايل */}
                <div className="bg-gray-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-[#563660]" />
                    <h3 className="text-base font-semibold text-gray-900">
                      معلومات الطلب
                    </h3>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">رقم الطلب:</span>
                      <span className="font-medium">
                        {orderData?.orderNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">رمز التتبع:</span>
                      <span className="font-mono font-medium">
                        {orderData?.trackingCode}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الحالة:</span>
                      <span className="font-medium text-[#563660]">
                        {orderData?.statusName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الكمية:</span>
                      <span className="font-medium">
                        {orderData?.items[0]?.quantity || 1}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">السعر:</span>
                      <span className="font-medium">
                        {orderData?.totalPrice} ريال
                      </span>
                    </div>
                  </div>
                </div>

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

                <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                  <div className="flex justify-between">
                    <span>تاريخ الإنشاء:</span>
                    <span className="font-medium">
                      {orderData && formatDate(orderData.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>آخر تحديث:</span>
                    <span className="font-medium">
                      {orderData && formatDate(orderData.updatedAt)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pb-24">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      saveConfirmModal.openModal();
                      setShowMobileDetails(false);
                    }}
                    disabled={isSaving}
                    className="w-full py-2 px-3 gold-gradient text-white rounded-xl text-sm font-semibold shadow-gold hover-lift disabled:opacity-50"
                  >
                    {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </motion.button>

                  <button
                    onClick={() => {
                      exitConfirmModal.openModal();
                      setShowMobileDetails(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-md hover:bg-gray-50 transition-all duration-300 text-gray-700 text-sm font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    العودة للوحة التحكم
                  </button>

                  <button
                    onClick={() => {
                      pdfConfirmModal.openModal();
                      setShowMobileDetails(false);
                    }}
                    disabled={isGeneratingPDF}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 transition-all duration-300 text-sm font-medium disabled:opacity-50"
                  >
                    {isGeneratingPDF ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {isGeneratingPDF ? "جاري إنشاء PDF..." : "تحميل PDF"}
                  </button>
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
            onAddToCart={() => {}} // تعطيل زر إضافة للسلة
            onSaveChanges={saveConfirmModal.openModal}
            isSaving={isSaving}
          />
        </div>
      </div>

      {/* نافذة تأكيد الحفظ */}
      <ConfirmationModal
        isOpen={saveConfirmModal.isOpen}
        onClose={saveConfirmModal.closeModal}
        onConfirm={handleSaveChanges}
        title="تأكيد حفظ التغييرات"
        message="سيتم حفظ جميع التعديلات التي أجريتها على الطلب. هل تريد المتابعة؟"
        confirmText={isSaving ? "جاري الحفظ..." : "نعم، احفظ"}
        cancelText="إلغاء"
        type="info"
        isLoading={isSaving}
      />

      {/* نافذة تأكيد تحميل PDF */}
      <ConfirmationModal
        isOpen={pdfConfirmModal.isOpen}
        onClose={pdfConfirmModal.closeModal}
        onConfirm={handleDownloadPDF}
        title="تحميل ملف PDF للطلب"
        message="سيتم إنشاء ملف PDF يحتوي على جميع تفاصيل الطلب والتصميم الحالي. هل تريد المتابعة؟"
        confirmText={isGeneratingPDF ? "جاري الإنشاء..." : "نعم، حمّل PDF"}
        cancelText="إلغاء"
        type="info"
        isLoading={isGeneratingPDF}
      />

      {/* نافذة تأكيد الخروج */}
      <ConfirmationModal
        isOpen={exitConfirmModal.isOpen}
        onClose={exitConfirmModal.closeModal}
        onConfirm={handleExit}
        title="تأكيد الخروج"
        message="هل أنت متأكد من الخروج؟ سيتم فقدان أي تغييرات غير محفوظة."
        confirmText="نعم، اخرج"
        cancelText="إلغاء"
        type="warning"
      />
    </div>
  );
};

const OrderEditPage: React.FC = () => {
  return (
    <JacketProvider>
      <CartProvider>
        <ImageLibraryProvider>
          <OrderEditContent />
        </ImageLibraryProvider>
      </CartProvider>
    </JacketProvider>
  );
};

export default OrderEditPage;
