import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Package,
  CreditCard,
  Truck,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { JacketState } from "../context/JacketContext";
import OrderSummaryModal from "../components/modals/OrderSummaryModal";
import JacketImageCapture, {
  JacketImageCaptureRef,
} from "../components/jacket/JacketImageCapture";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import {
  generateOrderPDFWithImages,
  PDFGenerationOptions,
} from "../utils/pdfGenerator";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import { useModal } from "../hooks/useModal";
import fontPreloader from "../utils/fontPreloader";

const CartPage: React.FC = () => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    getTotalItems,
    getItemImages,
  } = useCart();

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [loadingStage, setLoadingStage] = useState<
    "capturing" | "generating" | "completed"
  >("capturing");
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [orderInfo, setOrderInfo] = useState<{
    orderNumber: string;
    trackingCode: string;
  } | null>(null);

  const jacketImageCaptureRef = useRef<JacketImageCaptureRef>(null);

  const deleteConfirmModal = useModal();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
    }).format(price);
  };

  const getJacketDescription = (jacketConfig: JacketState) => {
    const colors = Object.entries(jacketConfig.colors)
      .filter(([key]) => key === "body" || key === "sleeves")
      .map(([key, value]) => {
        const colorName =
          value === "#141414"
            ? "أسود"
            : value === "#1B263B"
            ? "كحلي"
            : value === "#F5F6F5"
            ? "أبيض"
            : "ملون";
        const partName = key === "body" ? "الجسم" : "الأكمام";
        return `${partName}: ${colorName}`;
      });

    return `${colors.join(" | ")} | المقاس: ${jacketConfig.size}`;
  };

  const handleDeleteClick = (itemId: string) => {
    setDeleteItemId(itemId);
    deleteConfirmModal.openModal();
  };

  const handleConfirmDelete = () => {
    if (deleteItemId) {
      removeFromCart(deleteItemId);
      setDeleteItemId(null);
      deleteConfirmModal.closeModal();
    }
  };

  const handleGeneratePDF = async (customerInfo: {
    name: string;
    phone: string;
    orderNumber?: string;
  }) => {
    setIsGeneratingPDF(true);
    setShowLoadingOverlay(true);
    setLoadingStage("capturing");

    try {
      // التأكد من تحميل الخطوط قبل بدء العملية
      await fontPreloader.preloadAllFonts();

      let jacketImages: string[] = [];

      // استخدام الصور المحفوظة في السلة إذا كانت متوفرة
      if (items.length > 0) {
        jacketImages = getItemImages(items[0].id);

        if (jacketImages.length > 0) {
          // الانتقال مباشرة لمرحلة إنشاء PDF مع تأخير مختصر
          await new Promise((resolve) => setTimeout(resolve, 500));
          setLoadingStage("generating");
        } else {
          // إذا لم تكن الصور محفوظة، التقط صور جديدة
          if (!jacketImageCaptureRef.current) {
            throw new Error("Jacket image capture ref not available");
          }

          // التقاط الصور مع إظهار التقدم
          jacketImages = await jacketImageCaptureRef.current.captureFromConfig(
            items[0].jacketConfig
          );

          // الانتقال لمرحلة إنشاء PDF
          setLoadingStage("generating");
        }
      }

      // تأخير مختصر لإظهار مرحلة إنشاء PDF
      await new Promise((resolve) => setTimeout(resolve, 800));

      const pdfOptions: PDFGenerationOptions = {
        cartItems: items,
        totalPrice: getTotalPrice(),
        customerInfo,
        orderNumber: customerInfo.orderNumber,
      };

      const pdfBlob = await generateOrderPDFWithImages(
        pdfOptions,
        jacketImages
      );

      // مرحلة الإكمال
      setLoadingStage("completed");
      setPdfGenerated(true);

      // تأخير قصير قبل تحميل الملف لإظهار رسالة النجاح
      await new Promise((resolve) => setTimeout(resolve, 500));

      // تحميل الملف
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `طلب-جاكيت-دار-الجود-${
        customerInfo.name
      }-${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setShowLoadingOverlay(false);
      alert("حدث خطأ أثناء إنشاء ملف PDF. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleLoadingComplete = () => {
    setShowLoadingOverlay(false);
  };

  const handleSendWhatsApp = () => {
    const phoneNumber = "966536065766";

    let message = `مرحباً، أرغب في طلب جاكيت مخصص من دار الجود.\n\n`;

    if (orderInfo) {
      message += `رقم الطلب: ${orderInfo.orderNumber}\n`;
      message += `رمز التتبع: ${orderInfo.trackingCode}\n\n`;
    }

    message += `تفاصيل الطلب:\n`;
    message += `• عدد القطع: ${getTotalItems()}\n`;
    message += `• الإجمالي: ${formatPrice(getTotalPrice())}\n\n`;
    message += `تم إرفاق ملف PDF يحتوي على جميع التفاصيل والصور.\n\n`;
    message += `أرجو التواصل معي لتأكيد الطلب وترتيب عملية الدفع والتسليم.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleCompleteOrder = () => {
    setShowOrderModal(true);
    setPdfGenerated(false);
    setOrderInfo(null);
  };

  const handleOrderCreated = (orderNumber: string, trackingCode: string) => {
    setOrderInfo({ orderNumber, trackingCode });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12 mobile-content-padding">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-3xl font-light text-gray-900 mb-4">
              عربة التسوق فارغة
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              لم تقم بإضافة أي منتجات إلى عربة التسوق بعد
            </p>
            <Link
              to="/customizer"
              className="inline-flex items-center px-8 py-3 bg-[#563660] text-white font-medium rounded-lg hover:bg-[#4b2e55] transition-colors duration-200"
            >
              ابدأ التصميم الآن
              <ArrowRight className="mr-2 w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 mobile-content-padding">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center mb-8">
            <ShoppingCart className="w-6 h-6 text-[#563660] mr-3" />
            <h1 className="text-3xl font-light text-gray-900">
              عربة التسوق ({getTotalItems()} منتج)
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {items.map((item, index) => {
                const itemImages = getItemImages(item.id);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-32 h-32 bg-gray-200 rounded-xl flex items-center justify-center">
                        {itemImages.length > 0 ? (
                          <img
                            src={itemImages[0]}
                            alt="معاينة الجاكيت"
                            className="w-full h-full object-contain rounded-xl"
                            loading="lazy"
                          />
                        ) : (
                          <Package className="w-10 h-10 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          جاكيت مخصص
                        </h3>
                        <p className="text-gray-600 mb-3 text-sm">
                          {getJacketDescription(item.jacketConfig)}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {item.jacketConfig.logos.length > 0 && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {item.jacketConfig.logos.length} شعار
                            </span>
                          )}
                          {item.jacketConfig.texts.length > 0 && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {item.jacketConfig.texts.length} نص
                            </span>
                          )}
                          {itemImages.length > 0 && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              {itemImages.length} صورة محفوظة
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          أُضيف في:{" "}
                          {(() => {
                            const date = item.addedAt;
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(
                              2,
                              "0"
                            );
                            const day = String(date.getDate()).padStart(2, "0");
                            return `${year}/${month}/${day}`;
                          })()}
                        </div>
                      </div>
                      <div className="flex flex-col justify-between items-end">
                        <div className="text-xl font-medium text-[#563660] mb-4">
                          {formatPrice(item.price)}
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                          <button
                            onClick={() => {
                              if (item.quantity === 1) {
                                handleDeleteClick(item.id);
                              } else {
                                updateQuantity(item.id, item.quantity - 1);
                              }
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="text-lg font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleDeleteClick(item.id)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors text-sm"
                        >
                          <Trash2 size={14} />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-gray-50 rounded-2xl p-6 sticky top-6"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-6">
                  ملخص الطلب
                </h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">المجموع الفرعي:</span>
                    <span className="font-medium">
                      {formatPrice(getTotalPrice())}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">الشحن:</span>
                    <span className="font-medium text-green-600">مجاني</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-medium">
                      <span>الإجمالي:</span>
                      <span className="text-[#563660]">
                        {formatPrice(getTotalPrice())}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <Truck className="w-4 h-4" />
                    <span>شحن مجاني لجميع أنحاء المملكة</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <Package className="w-4 h-4" />
                    <span>مدة الإنتاج: شهر إلى 45 يوم</span>
                  </div>
                </div>
                <button
                  onClick={handleCompleteOrder}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#563660] text-white font-medium rounded-lg hover:bg-[#4b2e55] transition-colors duration-200 mb-4"
                >
                  <CreditCard className="w-4 h-4" />
                  إتمام الطلب
                </button>
                <Link
                  to="/customizer"
                  className="w-full flex items-center justify-center gap-2 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  استبدل بمنتج آخر
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={deleteConfirmModal.closeModal}
        onConfirm={handleConfirmDelete}
        title="تأكيد الحذف"
        message="سيتم حذف هذا المنتج من عربة التسوق نهائياً. لا يمكن التراجع عن هذا الإجراء."
        confirmText="نعم، احذف"
        cancelText="إلغاء"
        type="danger"
      />

      {/* Hidden Jacket Image Capture Component - للحالات الطارئة فقط */}
      <div style={{ position: "fixed", top: "-9999px", left: "-9999px" }}>
        <JacketImageCapture ref={jacketImageCaptureRef} />
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={showLoadingOverlay}
        stage={loadingStage}
        onComplete={handleLoadingComplete}
      />

      {/* Order Summary Modal */}
      <OrderSummaryModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        cartItems={items}
        totalPrice={getTotalPrice()}
        onGeneratePDF={handleGeneratePDF}
        onSendWhatsApp={handleSendWhatsApp}
        isGeneratingPDF={isGeneratingPDF}
        pdfGenerated={pdfGenerated}
        onOrderCreated={handleOrderCreated}
      />
    </div>
  );
};

export default CartPage;
