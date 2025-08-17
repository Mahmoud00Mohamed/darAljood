import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Menu,
  X,
  User,
  Shield,
  Eye,
  EyeOff,
  Loader2,
  Settings,
  DollarSign,
  Image as ImageIcon,
  LogOut,
  Home,
  Activity,
  ChevronRight,
} from "lucide-react";
import authService, { LoginCredentials } from "../services/authService";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import { useModal } from "../hooks/useModal";
import PricingManagement from "../components/admin/PricingManagement";
import PredefinedImagesManagement from "../components/admin/PredefinedImagesManagement";
import OrdersManagement from "../components/admin/OrdersManagement";
import CategoryManagement from "../components/admin/CategoryManagement";

const AdminPanelPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "orders" | "pricing" | "images" | "categories"
  >("orders");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logoutConfirmModal = useModal();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isValid = await authService.verifySession();
        setIsAuthenticated(isValid);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      await authService.login(loginCredentials);
      setIsAuthenticated(true);
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "فشل في تسجيل الدخول"
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setLoginCredentials({ username: "", password: "" });
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navigationItems = [
    {
      id: "orders",
      name: "إدارة الطلبات",
      icon: Package,
      description: "عرض وإدارة طلبات العملاء",
    },
    {
      id: "pricing",
      name: "إدارة الأسعار",
      icon: DollarSign,
      description: "تعديل أسعار الخدمات والمنتجات",
    },
    {
      id: "images",
      name: "الشعارات الجاهزة",
      icon: ImageIcon,
      description: "إدارة مكتبة الشعارات الجاهزة",
    },
    {
      id: "categories",
      name: "إدارة التصنيفات",
      icon: Settings,
      description: "إنشاء وتنظيم تصنيفات مكتبة الصور",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 mobile-content-padding">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center bg-white rounded-xl p-6 shadow-lg max-w-xs w-full"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-[#563660] to-[#7e4a8c] rounded-lg flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            جاري التحقق من الهوية
          </h3>
          <p className="text-sm text-gray-600">يرجى الانتظار...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 mobile-content-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#563660] to-[#7e4a8c] p-6 text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white mb-2">
                لوحة التحكم
              </h1>
              <p className="text-sm text-white text-opacity-90">
                دار الجود - إدارة النظام
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="p-6 space-y-4">
              <AnimatePresence>
                {loginError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span className="text-red-700 text-sm">{loginError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم المستخدم
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={loginCredentials.username}
                      onChange={(e) =>
                        setLoginCredentials((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      className="w-full pr-10 pl-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-sm"
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
                    <Shield className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginCredentials.password}
                      onChange={(e) =>
                        setLoginCredentials((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="w-full pr-10 pl-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-sm"
                      placeholder="أدخل كلمة المرور"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  isLoggingIn ||
                  !loginCredentials.username ||
                  !loginCredentials.password
                }
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white font-medium rounded-lg hover:from-[#4b2e55] hover:to-[#6d3f7a] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 shadow-sm h-16">
        <div className="px-4 lg:px-6 h-full flex items-center justify-between">
          {/* Left side - Logo and title */}
          <div className="flex items-center gap-3">
            {/* زر المينيو في الموبايل */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#563660] to-[#7e4a8c] rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  لوحة التحكم
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  دار الجود
                </p>
              </div>
            </div>
          </div>

          {/* Right side - User actions */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-700 font-medium">متصل</span>
            </div>

            <button
              onClick={() => navigate("/")}
              className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              الموقع الرئيسي
            </button>

            <button
              onClick={logoutConfirmModal.openModal}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[100dvh] pt-16">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col`}
        >
          {/* Mobile sidebar header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-[#563660] to-[#7e4a8c] rounded-md flex items-center justify-center">
                <Settings className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium text-gray-900 text-sm">
                لوحة التحكم
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="mb-6">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 px-2">
                الإدارة
              </h3>
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as typeof activeTab);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                        isActive
                          ? "bg-[#563660] text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive ? "text-white" : "text-gray-500"
                        }`}
                      />
                      <div className="text-right flex-1 min-w-0">
                        <div
                          className={`font-medium truncate ${
                            isActive ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {item.name}
                        </div>
                        <div
                          className={`text-xs mt-0.5 truncate ${
                            isActive ? "text-white/80" : "text-gray-500"
                          }`}
                        >
                          {item.description}
                        </div>
                      </div>
                      {isActive && (
                        <ChevronRight className="w-4 h-4 text-white/80" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 px-2">
                التنقل السريع
              </h3>
              <button
                onClick={() => navigate("/")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200"
              >
                <Home className="w-4 h-4 text-gray-500" />
                <span>العودة للموقع</span>
              </button>
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600">النظام يعمل بشكل طبيعي</span>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 lg:p-6">
              <div className="max-w-7xl mx-auto">
                {/* Content Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[calc(100vh-200px)]">
                  <div className="p-4 lg:p-6">
                    <AnimatePresence mode="wait">
                      {activeTab === "orders" && (
                        <motion.div
                          key="orders"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <OrdersManagement />
                        </motion.div>
                      )}
                      {activeTab === "pricing" && (
                        <motion.div
                          key="pricing"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <PricingManagement />
                        </motion.div>
                      )}
                      {activeTab === "images" && (
                        <motion.div
                          key="images"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <PredefinedImagesManagement />
                        </motion.div>
                      )}
                      {activeTab === "categories" && (
                        <motion.div
                          key="categories"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CategoryManagement />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={logoutConfirmModal.isOpen}
        onClose={logoutConfirmModal.closeModal}
        onConfirm={handleLogout}
        title="تأكيد تسجيل الخروج"
        message="هل أنت متأكد من تسجيل الخروج من لوحة التحكم؟"
        confirmText="نعم، تسجيل الخروج"
        cancelText="إلغاء"
        type="warning"
      />
    </div>
  );
};

export default AdminPanelPage;
