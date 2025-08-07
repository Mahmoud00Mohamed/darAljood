import React, { useState } from "react";
import {
  Download,
  MessageCircle,
  Loader2,
  CheckCircle,
  AlertTriangle,
  User,
  Phone,
  Package,
  X,
} from "lucide-react";
import { CartItem } from "../../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

interface OrderSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  totalPrice: number;
  onGeneratePDF: (customerInfo: {
    name: string;
    phone: string;
  }) => Promise<void>;
  onSendWhatsApp: () => void;
  isGeneratingPDF: boolean;
  pdfGenerated: boolean;
}

const OrderSummaryModal: React.FC<OrderSummaryModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  totalPrice,
  onGeneratePDF,
  onSendWhatsApp,
  isGeneratingPDF,
  pdfGenerated,
}) => {
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "" });
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    phone: "",
  });

  const validatePhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/[\s()-]/g, "");
    const saudiPhonePatterns = [
      /^05[0-9]{8}$/,
      /^\+9665[0-9]{8}$/,
      /^9665[0-9]{8}$/,
      /^5[0-9]{8}$/,
    ];
    return saudiPhonePatterns.some((pattern) => pattern.test(cleanPhone));
  };

  const validateName = (name: string): boolean => {
    const namePattern = /^[\u0600-\u06FFa-zA-Z\s]{2,50}$/;
    const hasNumbers = /\d/.test(name);
    return (
      namePattern.test(name.trim()) && name.trim().length >= 2 && !hasNumbers
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
    const errors = { ...validationErrors };

    if (field === "name") {
      if (!value.trim()) {
        errors.name = "الاسم مطلوب";
      } else if (/\d/.test(value)) {
        errors.name = "الاسم لا يجب أن يحتوي على أرقام";
      } else if (!validateName(value)) {
        errors.name = "يرجى إدخال اسم صحيح (2-50 حرف)";
      } else {
        errors.name = "";
      }
    }

    if (field === "phone") {
      if (!value.trim()) {
        errors.phone = "رقم الهاتف مطلوب";
      } else if (!validatePhoneNumber(value)) {
        errors.phone = "يرجى إدخال رقم هاتف سعودي صحيح";
      } else {
        errors.phone = "";
      }
    }

    setValidationErrors(errors);
  };

  const validateForm = (): boolean => {
    const errors = { name: "", phone: "" };

    if (!customerInfo.name.trim()) {
      errors.name = "الاسم مطلوب";
    } else if (/\d/.test(customerInfo.name)) {
      errors.name = "الاسم لا يجب أن يحتوي على أرقام";
    } else if (!validateName(customerInfo.name)) {
      errors.name = "يرجى إدخال اسم صحيح (2-50 حرف)";
    }

    if (!customerInfo.phone.trim()) {
      errors.phone = "رقم الهاتف مطلوب";
    } else if (!validatePhoneNumber(customerInfo.phone)) {
      errors.phone = "يرجى إدخال رقم هاتف سعودي صحيح";
    }

    setValidationErrors(errors);
    return !errors.name && !errors.phone;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
    }).format(price);
  };

  const handleGeneratePDF = async () => {
    if (!validateForm()) return;
    try {
      await onGeneratePDF(customerInfo);
    } catch (error) {
      console.error("Error in PDF generation:", error);
    }
  };

  const isFormValid =
    customerInfo.name.trim() &&
    customerInfo.phone.trim() &&
    validateName(customerInfo.name) &&
    validatePhoneNumber(customerInfo.phone);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9997] bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-2xl lg:max-w-4xl max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <h2 className="text-base sm:text-xl font-semibold text-gray-900">
                تأكيد الطلب وإرساله
              </h2>
              <button
                onClick={onClose}
                disabled={isGeneratingPDF}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-6 border border-gray-100">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#563660] rounded-lg flex items-center justify-center">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <h3 className="text-sm sm:text-lg font-semibold text-gray-900">
                        معلومات العميل
                      </h3>
                      <span className="text-red-500 text-sm">*</span>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          الاسم الكامل <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                          <input
                            type="text"
                            value={customerInfo.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            className={`w-full pr-8 sm:pr-10 pl-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-xs sm:text-sm ${
                              validationErrors.name
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                            }`}
                            placeholder="أدخل اسمك الكامل"
                            required
                          />
                        </div>
                        {validationErrors.name && (
                          <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                            <AlertTriangle className="w-3 h-3" />
                            {validationErrors.name}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          رقم الهاتف <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                          <input
                            type="tel"
                            value={customerInfo.phone}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            className={`w-full pr-8 sm:pr-10 pl-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-xs sm:text-sm ${
                              validationErrors.phone
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                            }`}
                            placeholder="05xxxxxxxx"
                            required
                            dir="ltr"
                          />
                        </div>
                        {validationErrors.phone && (
                          <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                            <AlertTriangle className="w-3 h-3" />
                            {validationErrors.phone}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          أمثلة: 0512345678، +966512345678
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 sm:p-6 border border-gray-100">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#563660] rounded-lg flex items-center justify-center">
                        <Package className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <h3 className="text-sm sm:text-lg font-semibold text-gray-900">
                        ملخص الطلب
                      </h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      {cartItems.slice(0, 3).map((item, index) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-start bg-white rounded-lg p-3 sm:p-4 border border-gray-100"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-xs sm:text-sm text-gray-900 block">
                              جاكيت مخصص {index + 1}
                            </span>
                            <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                              <div>الكمية: {item.quantity}</div>
                              <div>المقاس: {item.jacketConfig.size}</div>
                            </div>
                          </div>
                          <div className="text-xs sm:text-sm font-semibold text-[#563660] flex-shrink-0">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                      {cartItems.length > 3 && (
                        <div className="text-center text-xs text-gray-500 py-2">
                          و {cartItems.length - 3} منتج إضافي
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-2 sm:pt-3 mt-2 sm:mt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm sm:text-base font-semibold text-gray-900">
                            الإجمالي:
                          </span>
                          <span className="text-base sm:text-lg font-bold text-[#563660]">
                            {formatPrice(totalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sm:block bg-amber-50 border border-amber-200 rounded-lg p-6">
                  <h4 className="font-semibold text-amber-800 mb-3 text-base flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    ملاحظات مهمة
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="text-sm text-amber-700">
                      • مدة الإنتاج: شهر إلى 45 يوم
                    </div>
                    <div className="text-sm text-amber-700">
                      • الحد الأدنى للطلب: قطعة واحدة
                    </div>
                    <div className="text-sm text-amber-700">
                      • الشحن مجاني لجميع أنحاء المملكة
                    </div>
                    <div className="text-sm text-amber-700">
                      • سيتم التواصل معك لتأكيد التفاصيل
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-3 sm:p-6 bg-white rounded-b-xl sm:rounded-b-2xl flex-shrink-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={handleGeneratePDF}
                  disabled={isGeneratingPDF || !isFormValid}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 sm:py-4 font-medium rounded-lg transition-all duration-200 text-xs sm:text-sm ${
                    isFormValid && !isGeneratingPDF
                      ? "bg-[#563660] text-white hover:bg-[#463050] border border-[#563660]"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isGeneratingPDF ? (
                    <>
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      جاري إنشاء ملف PDF...
                    </>
                  ) : pdfGenerated ? (
                    <>
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                      تم إنشاء ملف PDF
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      إنشاء ملف PDF للطلب
                    </>
                  )}
                </button>
                <button
                  onClick={onSendWhatsApp}
                  disabled={!pdfGenerated}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 sm:py-4 font-medium rounded-lg transition-all duration-200 text-xs sm:text-sm shadow-lg ${
                    pdfGenerated
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-xl"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  أرسل الطلب عبر واتساب
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center leading-relaxed px-2 mt-3 sm:mt-4">
                سيتم فتح واتساب مع رسالة جاهزة. قم بإرفاق ملف PDF يدويًا في
                المحادثة.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrderSummaryModal;
