import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Package,
  Clock,
  CheckCircle,
  Truck,
  Calendar,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  MapPin,
  Phone,
  Star,
  TrendingUp,
  Shield,
} from "lucide-react";
import orderService, { PublicOrderInfo } from "../services/orderService";

const OrderTrackingPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const [orderInfo, setOrderInfo] = useState<PublicOrderInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSearchOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchValue.trim()) {
      setError("يرجى إدخال رمز التتبع أو رقم الطلب");
      return;
    }

    setIsLoading(true);
    setError("");
    setOrderInfo(null);

    try {
      const order = await orderService.searchOrder(searchValue.trim());
      setOrderInfo(order);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "فشل في البحث عن الطلب"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: "text-amber-600 bg-amber-50 border-amber-200",
      confirmed: "text-blue-600 bg-blue-50 border-blue-200",
      in_production: "text-purple-600 bg-purple-50 border-purple-200",
      quality_check: "text-cyan-600 bg-cyan-50 border-cyan-200",
      ready_to_ship: "text-emerald-600 bg-emerald-50 border-emerald-200",
      shipped: "text-green-600 bg-green-50 border-green-200",
      delivered: "text-green-700 bg-green-100 border-green-300",
      cancelled: "text-red-600 bg-red-50 border-red-200",
      returned: "text-orange-600 bg-orange-50 border-orange-200",
    };
    return colors[status] || "text-gray-600 bg-gray-50 border-gray-200";
  };

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      pending: <Clock className="w-5 h-5" />,
      confirmed: <CheckCircle className="w-5 h-5" />,
      in_production: <Package className="w-5 h-5" />,
      quality_check: <Shield className="w-5 h-5" />,
      ready_to_ship: <Package className="w-5 h-5" />,
      shipped: <Truck className="w-5 h-5" />,
      delivered: <CheckCircle className="w-5 h-5" />,
      cancelled: <AlertCircle className="w-5 h-5" />,
      returned: <Package className="w-5 h-5" />,
    };
    return icons[status] || <Package className="w-5 h-5" />;
  };

  const getProgressPercentage = (status: string) => {
    const statusProgress: { [key: string]: number } = {
      pending: 10,
      confirmed: 25,
      in_production: 50,
      quality_check: 75,
      ready_to_ship: 85,
      shipped: 95,
      delivered: 100,
      cancelled: 0,
      returned: 0,
    };
    return statusProgress[status] || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 mobile-content-padding">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-light">تتبع طلبك</h1>
            </div>
            <p className="text-xl opacity-90 max-w-2xl mx-auto leading-relaxed">
              ادخل رمز التتبع أو رقم الطلب لمعرفة حالة طلبك ومراحل التنفيذ
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8"
        >
          <form onSubmit={handleSearchOrder} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                ابحث عن طلبك
              </h2>
              <p className="text-gray-600">
                أدخل رمز التتبع أو رقم الطلب وسنعرض لك جميع التفاصيل
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
                  placeholder="رمز التتبع أو رقم الطلب"
                  className="block w-full pr-12 pl-4 py-4 text-lg text-center font-mono border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#563660]/20 focus:border-[#563660] transition-all duration-200 bg-gray-50 focus:bg-white"
                  maxLength={9}
                />
              </div>

              <div className="mt-3 text-center">
                <p className="text-sm text-gray-500">
                  مثال: ABC12345 (رمز التتبع) أو 123456789 (رقم الطلب)
                </p>
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={isLoading || !searchValue.trim()}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white font-semibold text-lg rounded-xl hover:from-[#4b2e55] hover:to-[#6d3f7a] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    جاري البحث...
                  </>
                ) : (
                  <>
                    <Search className="w-6 h-6" />
                    البحث عن الطلب
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3"
              >
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <span className="text-red-700 font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Order Information */}
        <AnimatePresence>
          {orderInfo && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Order Header Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#563660] to-[#7e4a8c] p-6 text-white">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        طلبك جاهز للمتابعة!
                      </h2>
                      <p className="opacity-90">
                        إليك جميع التفاصيل والمعلومات المحدثة
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className={`px-4 py-2 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm`}
                      >
                        <div className="flex items-center gap-2">
                          {getStatusIcon(orderInfo.status)}
                          <span className="font-semibold">
                            {orderInfo.statusName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      تقدم الطلب
                    </span>
                    <span className="text-sm font-bold text-[#563660]">
                      {getProgressPercentage(orderInfo.status)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#563660] to-[#7e4a8c]"
                      initial={{ width: "0%" }}
                      animate={{
                        width: `${getProgressPercentage(orderInfo.status)}%`,
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Info Card */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <Package className="w-6 h-6 text-[#563660]" />
                      معلومات الطلب
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">
                              رمز التتبع
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard(orderInfo.trackingCode)
                              }
                              className="p-1 text-gray-400 hover:text-[#563660] transition-colors"
                              title="نسخ"
                            >
                              {copied ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <p className="text-xl font-bold text-[#563660] font-mono">
                            {orderInfo.trackingCode}
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">
                              رقم الطلب
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard(orderInfo.orderNumber)
                              }
                              className="p-1 text-gray-400 hover:text-[#563660] transition-colors"
                              title="نسخ"
                            >
                              {copied ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <p className="text-xl font-bold text-gray-900 font-mono">
                            {orderInfo.orderNumber}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <span className="text-sm text-blue-700 font-medium">
                              تاريخ الطلب
                            </span>
                          </div>
                          <p className="text-lg font-semibold text-blue-900">
                            {formatDate(orderInfo.createdAt)}
                          </p>
                        </div>

                        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-green-700 font-medium">
                              الإجمالي
                            </span>
                          </div>
                          <p className="text-xl font-bold text-green-900">
                            {formatPrice(orderInfo.totalPrice)}
                          </p>
                          <p className="text-sm text-green-600 mt-1">
                            {orderInfo.itemsCount} قطعة
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status History */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <Clock className="w-6 h-6 text-[#563660]" />
                      تاريخ حالات الطلب
                    </h3>

                    <div className="space-y-4">
                      {orderInfo.statusHistory
                        .slice()
                        .reverse()
                        .map((history, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                          >
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${getStatusColor(
                                history.status
                              )}`}
                            >
                              {getStatusIcon(history.status)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900 text-lg">
                                  {history.statusName}
                                </h4>
                                <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                                  {formatDate(history.timestamp)}
                                </span>
                              </div>
                              {history.note && (
                                <p className="text-gray-600 bg-white p-3 rounded-lg">
                                  {history.note}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Delivery Info */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-[#563660]" />
                      معلومات التسليم
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-blue-700 font-medium">
                            التسليم المتوقع
                          </p>
                          <p className="text-blue-900 font-semibold">
                            {formatDate(orderInfo.estimatedDelivery)}
                          </p>
                        </div>
                      </div>

                      {orderInfo.shippedAt && (
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <Truck className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-sm text-green-700 font-medium">
                              تاريخ الشحن
                            </p>
                            <p className="text-green-900 font-semibold">
                              {formatDate(orderInfo.shippedAt)}
                            </p>
                          </div>
                        </div>
                      )}

                      {orderInfo.deliveredAt && (
                        <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                          <div>
                            <p className="text-sm text-emerald-700 font-medium">
                              تم التسليم
                            </p>
                            <p className="text-emerald-900 font-semibold">
                              {formatDate(orderInfo.deliveredAt)}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-600 font-medium">
                            منطقة التسليم
                          </p>
                          <p className="text-gray-900 font-semibold">
                            المملكة العربية السعودية
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Support */}
                  <div className="bg-gradient-to-br from-[#563660] to-[#7e4a8c] rounded-2xl p-6 text-white">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      تحتاج مساعدة؟
                    </h3>
                    <p className="text-sm mb-4 opacity-90">
                      فريق خدمة العملاء جاهز لمساعدتك على مدار الساعة
                    </p>
                    <a
                      href={`https://wa.me/966536065766?text=${encodeURIComponent(
                        `مرحباً، أريد الاستفسار عن طلبي:\nرقم الطلب: ${orderInfo.orderNumber}\nرمز التتبع: ${orderInfo.trackingCode}\nالحالة الحالية: ${orderInfo.statusName}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 w-full justify-center px-4 py-3 bg-white text-[#563660] rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                    >
                      <ExternalLink className="w-5 h-5" />
                      تواصل عبر واتساب
                    </a>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-[#563660]" />
                      ملخص الطلب
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {orderInfo.itemsCount}
                        </div>
                        <div className="text-sm text-blue-700">قطعة</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-xl">
                        <div className="text-lg font-bold text-green-600 mb-1">
                          {formatPrice(orderInfo.totalPrice)}
                        </div>
                        <div className="text-sm text-green-700">الإجمالي</div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span className="text-sm text-amber-700 font-medium">
                          مدة الإنتاج المتوقعة
                        </span>
                      </div>
                      <p className="text-amber-800 font-semibold">
                        شهر إلى 45 يوم
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              كيفية تتبع طلبك
            </h2>
            <p className="text-gray-600">
              معلومات مفيدة لمساعدتك في تتبع طلبك بسهولة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-[#563660]" />
                طرق البحث
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">رمز التتبع</p>
                    <p className="text-sm text-gray-600">
                      8 أحرف وأرقام (مثال: ABC12345)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">رقم الطلب</p>
                    <p className="text-sm text-gray-600">
                      9 أرقام (مثال: 123456789)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#563660]" />
                مراحل الطلب
              </h3>
              <div className="space-y-2">
                {[
                  { status: "قيد المراجعة", desc: "تم استلام طلبك" },
                  { status: "تم التأكيد", desc: "تأكيد الطلب وبدء التنفيذ" },
                  { status: "قيد التنفيذ", desc: "جاري تصنيع جاكيتك" },
                  { status: "فحص الجودة", desc: "فحص نهائي للجودة" },
                  { status: "جاهز للشحن", desc: "تم الانتهاء وجاهز للإرسال" },
                  { status: "تم الشحن", desc: "في الطريق إليك" },
                  { status: "تم التسليم", desc: "وصل إليك بنجاح" },
                ].map((stage, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-[#563660] rounded-full"></div>
                    <span className="font-medium text-gray-900">
                      {stage.status}:
                    </span>
                    <span className="text-gray-600">{stage.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-xl">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold text-blue-900">مدة التصنيع</p>
                <p className="text-sm text-blue-700">شهر إلى 45 يوم</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl">
                <Truck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-green-900">الشحن</p>
                <p className="text-sm text-green-700">
                  مجاني لجميع أنحاء المملكة
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <Phone className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="font-semibold text-purple-900">الدعم</p>
                <p className="text-sm text-purple-700">24/7 عبر واتساب</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
