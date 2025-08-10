import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  DollarSign,
  Save,
  RotateCcw,
  LogOut,
  Eye,
  EyeOff,
  User,
  Lock,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
  TrendingUp,
  Percent,
} from "lucide-react";
import authService, { LoginCredentials } from "../services/authService";
import pricingService, { PricingData } from "../services/pricingService";
import { useNavigate } from "react-router-dom";

const AdminPanelPage: React.FC = () => {
  const navigate = useNavigate();

  // حالة المصادقة
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // حالة التسعير
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [pricingError, setPricingError] = useState("");

  // التحقق من المصادقة عند تحميل الصفحة
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isValid = await authService.verifySession();
        setIsAuthenticated(isValid);

        if (isValid) {
          await loadPricingData();
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // تحميل بيانات التسعير
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

  // تسجيل الدخول
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      await authService.login(loginCredentials);
      setIsAuthenticated(true);
      await loadPricingData();
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "فشل في تسجيل الدخول"
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  // تسجيل الخروج
  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setPricingData(null);
      setLoginCredentials({ username: "", password: "" });
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // حفظ التغييرات
  const handleSave = async () => {
    if (!pricingData) return;

    setIsSaving(true);
    setSaveMessage("");
    setPricingError("");

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("رمز المصادقة غير موجود");
      }

      const updatedData = await pricingService.updatePricing(
        pricingData,
        token
      );
      setPricingData(updatedData);
      setSaveMessage("تم حفظ التغييرات بنجاح");

      // إخفاء رسالة النجاح بعد 3 ثوان
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setPricingError(
        error instanceof Error ? error.message : "فشل في حفظ التغييرات"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // إعادة تعيين إلى القيم الافتراضية
  const handleReset = async () => {
    if (
      !confirm("هل أنت متأكد من إعادة تعيين جميع الأسعار إلى القيم الافتراضية؟")
    ) {
      return;
    }

    setIsSaving(true);
    setPricingError("");

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("رمز المصادقة غير موجود");
      }

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
    }
  };

  // تحديث قيمة في بيانات التسعير
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

  // شاشة التحميل
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#563660] mx-auto mb-4" />
          <p className="text-gray-600">جاري التحقق من الهوية...</p>
        </div>
      </div>
    );
  }

  // شاشة تسجيل الدخول
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#563660] to-[#7e4a8c] p-6 text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                لوحة التحكم
              </h1>
              <p className="text-white text-opacity-90 text-sm">
                دار الجود - إدارة الأسعار
              </p>
            </div>

            <form onSubmit={handleLogin} className="p-6 space-y-6">
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{loginError}</span>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المستخدم
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={loginCredentials.username}
                    onChange={(e) =>
                      setLoginCredentials((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all"
                    placeholder="أدخل اسم المستخدم"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginCredentials.password}
                    onChange={(e) =>
                      setLoginCredentials((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="w-full pr-10 pl-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all"
                    placeholder="أدخل كلمة المرور"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  isLoggingIn ||
                  !loginCredentials.username ||
                  !loginCredentials.password
                }
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white font-medium rounded-lg hover:from-[#4b2e55] hover:to-[#6d3f7a] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    تسجيل الدخول
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // لوحة التحكم الرئيسية
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#563660] to-[#7e4a8c] rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  لوحة التحكم
                </h1>
                <p className="text-sm text-gray-600">إدارة أسعار دار الجود</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#563660] transition-colors"
              >
                العودة للموقع
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* رسائل الحالة */}
        <AnimatePresence>
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-700">{saveMessage}</span>
            </motion.div>
          )}

          {pricingError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700">{pricingError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* أزرار التحكم */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={handleSave}
            disabled={isSaving || !pricingData}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white font-medium rounded-lg hover:from-[#4b2e55] hover:to-[#6d3f7a] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                حفظ التغييرات
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-5 h-5" />
            إعادة تعيين
          </button>

          <button
            onClick={loadPricingData}
            disabled={isLoadingPricing}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isLoadingPricing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RotateCcw className="w-5 h-5" />
            )}
            إعادة تحميل
          </button>
        </div>

        {isLoadingPricing ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#563660] mx-auto mb-4" />
              <p className="text-gray-600">جاري تحميل بيانات التسعير...</p>
            </div>
          </div>
        ) : pricingData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* السعر الأساسي */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  السعر الأساسي
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السعر الأساسي (ريال)
                  </label>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    السعر الأساسي يشمل:
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• شعار خلفي + نص خلفي</li>
                    <li>• شعارين في الجهة اليمنى</li>
                    <li>• شعارين في الجهة اليسرى</li>
                    <li>• شعار أو نص واحد في الأمام</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* التكاليف الإضافية */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  التكاليف الإضافية
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عنصر إضافي في الأمام (ريال)
                  </label>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    شعار ثالث - جهة يمنى (ريال)
                  </label>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    شعار ثالث - جهة يسرى (ريال)
                  </label>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </motion.div>

            {/* خصومات الكمية */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Percent className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  خصومات الكمية
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    خصم 25 قطعة فأكثر (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={Math.round(
                      (pricingData.discounts?.quantity25 || 0) * 100
                    )}
                    onChange={(e) =>
                      updatePricingField(
                        "discounts.quantity25",
                        (parseInt(e.target.value) || 0) / 100
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    خصم 50 قطعة فأكثر (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={Math.round(
                      (pricingData.discounts?.quantity50 || 0) * 100
                    )}
                    onChange={(e) =>
                      updatePricingField(
                        "discounts.quantity50",
                        (parseInt(e.target.value) || 0) / 100
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    خصم 100 قطعة فأكثر (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={Math.round(
                      (pricingData.discounts?.quantity100 || 0) * 100
                    )}
                    onChange={(e) =>
                      updatePricingField(
                        "discounts.quantity100",
                        (parseInt(e.target.value) || 0) / 100
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              فشل في تحميل بيانات التسعير
            </h3>
            <p className="text-gray-600 mb-4">حدث خطأ أثناء تحميل البيانات</p>
            <button
              onClick={loadPricingData}
              className="px-6 py-3 bg-[#563660] text-white rounded-lg hover:bg-[#4b2e55] transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* معلومات آخر تحديث */}
        {pricingData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 bg-gray-100 rounded-xl p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              معلومات آخر تحديث
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">آخر تحديث:</span>
                <p className="text-gray-600">
                  {new Date(pricingData.lastUpdated).toLocaleString("ar-SA")}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  تم التحديث بواسطة:
                </span>
                <p className="text-gray-600">{pricingData.updatedBy}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminPanelPage;
