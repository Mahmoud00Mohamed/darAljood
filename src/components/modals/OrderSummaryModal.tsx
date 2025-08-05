import React, { useState } from "react";
import {
  Download,
  MessageCircle,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { CartItem } from "../../context/CartContext";
import Modal from "../ui/Modal";
import { useModal } from "../../hooks/useModal";

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
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
  });

  const [validationErrors, setValidationErrors] = useState({
    name: "",
    phone: "",
  });

  const [isValidating, setIsValidating] = useState(false);

  const modal = useModal({
    closeOnEscape: !isGeneratingPDF,
    closeOnBackdropClick: !isGeneratingPDF,
  });

  // التحقق من صحة رقم الهاتف السعودي
  const validatePhoneNumber = (phone: string): boolean => {
    // إزالة المسافات والرموز الخاصة
    const cleanPhone = phone.replace(/[\s()-]/g, "");

    // التحقق من الأنماط المقبولة للأرقام السعودية
    const saudiPhonePatterns = [
      /^05[0-9]{8}$/, // 05xxxxxxxx
      /^\+9665[0-9]{8}$/, // +9665xxxxxxxx
      /^9665[0-9]{8}$/, // 9665xxxxxxxx
      /^5[0-9]{8}$/, // 5xxxxxxxx
    ];

    return saudiPhonePatterns.some((pattern) => pattern.test(cleanPhone));
  };

  // التحقق من صحة الاسم
  const validateName = (name: string): boolean => {
    // التحقق من أن الاسم يحتوي على حروف عربية أو إنجليزية فقط
    const namePattern = /^[\u0600-\u06FFa-zA-Z\s]{2,50}$/;
    return namePattern.test(name.trim()) && name.trim().length >= 2;
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo((prev) => ({
      ...prev,
      [field]: value,
    }));

    // مسح رسائل الخطأ عند بدء الكتابة
    if (validationErrors[field as keyof typeof validationErrors]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    setIsValidating(true);
    const errors = {
      name: "",
      phone: "",
    };

    // التحقق من الاسم
    if (!customerInfo.name.trim()) {
      errors.name = "الاسم مطلوب";
    } else if (!validateName(customerInfo.name)) {
      errors.name =
        "يرجى إدخال اسم صحيح (حروف عربية أو إنجليزية فقط، 2-50 حرف)";
    }

    // التحقق من رقم الهاتف
    if (!customerInfo.phone.trim()) {
      errors.phone = "رقم الهاتف مطلوب";
    } else if (!validatePhoneNumber(customerInfo.phone)) {
      errors.phone = "يرجى إدخال رقم هاتف سعودي صحيح (مثال: 0512345678)";
    }

    setValidationErrors(errors);

    // إزالة حالة التحقق بعد ثانية واحدة
    setTimeout(() => setIsValidating(false), 1000);

    return !errors.name && !errors.phone;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
    }).format(price);
  };

  const handleGeneratePDF = async () => {
    if (!validateForm()) {
      return;
    }

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

  return (
    <Modal
      isOpen={isOpen}
      shouldRender={isOpen}
      onClose={onClose}
      title="تأكيد الطلب وإرساله"
      size="lg"
      className="max-h-[90vh] overflow-y-auto"
      options={modal.options}
    >
      <div className="space-y-6">
        {/* Customer Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            معلومات العميل <span className="text-red-500">*</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all ${
                  validationErrors.name
                    ? "border-red-300 bg-red-50"
                    : isValidating &&
                      customerInfo.name &&
                      validateName(customerInfo.name)
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300"
                }`}
                placeholder="أدخل اسمك الكامل"
                required
              />
              {validationErrors.name && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                  <AlertTriangle className="w-3 h-3" />
                  {validationErrors.name}
                </div>
              )}
              {isValidating &&
                customerInfo.name &&
                validateName(customerInfo.name) &&
                !validationErrors.name && (
                  <div className="flex items-center gap-1 mt-1 text-green-600 text-xs">
                    <CheckCircle className="w-3 h-3" />
                    الاسم صحيح
                  </div>
                )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all ${
                  validationErrors.phone
                    ? "border-red-300 bg-red-50"
                    : isValidating &&
                      customerInfo.phone &&
                      validatePhoneNumber(customerInfo.phone)
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300"
                }`}
                placeholder="05xxxxxxxx"
                required
                dir="ltr"
              />
              {validationErrors.phone && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                  <AlertTriangle className="w-3 h-3" />
                  {validationErrors.phone}
                </div>
              )}
              {isValidating &&
                customerInfo.phone &&
                validatePhoneNumber(customerInfo.phone) &&
                !validationErrors.phone && (
                  <div className="flex items-center gap-1 mt-1 text-green-600 text-xs">
                    <CheckCircle className="w-3 h-3" />
                    رقم الهاتف صحيح
                  </div>
                )}
              <p className="text-xs text-gray-500 mt-1">
                أمثلة صحيحة: 0512345678، +966512345678
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            * هذه المعلومات مطلوبة لإنشاء ملف PDF وستظهر في الطلب كمرجع
          </p>
        </div>

        {/* Order Summary */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">ملخص الطلب</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {cartItems.map((item, index) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">جاكيت مخصص {index + 1}</span>
                  <span className="text-gray-600 text-sm block">
                    الكمية: {item.quantity} | المقاس: {item.jacketConfig.size}
                  </span>
                </div>
                <span className="font-medium">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
            <div className="border-t pt-3 flex justify-between items-center text-lg font-medium">
              <span>الإجمالي:</span>
              <span className="text-[#563660]">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-medium text-amber-800 mb-2">ملاحظات مهمة:</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• مدة الإنتاج: شهر إلى 45 يوم</li>
            <li>• الحد الأدنى للطلب: قطعة واحدة</li>
            <li>• الشحن مجاني لجميع أنحاء المملكة</li>
            <li>• سيتم التواصل معك لتأكيد التفاصيل</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleGeneratePDF}
          disabled={isGeneratingPDF || !isFormValid}
          className={`w-full flex items-center justify-center gap-2 py-3 font-medium rounded-lg transition-all duration-200 ${
            isFormValid && !isGeneratingPDF
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isGeneratingPDF ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري إنشاء ملف PDF...
            </>
          ) : pdfGenerated ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              تم إنشاء ملف PDF
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              إنشاء ملف PDF للطلب
            </>
          )}
        </button>

        <button
          onClick={onSendWhatsApp}
          disabled={!pdfGenerated}
          className={`w-full flex items-center justify-center gap-2 py-3 font-medium rounded-lg transition-all duration-200 ${
            pdfGenerated
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          أرسل الطلب عبر واتساب
        </button>

        <p className="text-xs text-gray-500 text-center">
          سيتم فتح واتساب مع رسالة جاهزة. قم بإرفاق ملف PDF يدويًا في المحادثة.
        </p>
      </div>
    </Modal>
  );
};

export default OrderSummaryModal;
