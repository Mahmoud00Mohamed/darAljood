import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import authService, { LoginCredentials } from "../services/authService";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import { useModal } from "../hooks/useModal";
import PricingManagement from "../components/admin/PricingManagement";
import PredefinedImagesManagement from "../components/admin/PredefinedImagesManagement";
import Sidebar from "../components/admin/Sidebar";

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
  const [activeTab, setActiveTab] = useState<"pricing" | "images">("pricing");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center bg-white rounded-2xl p-8 shadow-xl"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-[#563660] to-[#7e4a8c] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            جاري التحقق من الهوية
          </h3>
          <p className="text-gray-600">يرجى الانتظار...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#563660] to-[#7e4a8c] p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black bg-opacity-10"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">
                  لوحة التحكم
                </h1>
                <p className="text-white text-opacity-90">
                  دار الجود - إدارة النظام
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="p-8 space-y-6">
              <AnimatePresence>
                {loginError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
                  >
                    <Shield className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span className="text-red-700 text-sm">{loginError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    اسم المستخدم
                  </label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={loginCredentials.username}
                      onChange={(e) =>
                        setLoginCredentials((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      className="w-full pr-12 pl-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                      placeholder="أدخل اسم المستخدم"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <Shield className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginCredentials.password}
                      onChange={(e) =>
                        setLoginCredentials((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="w-full pr-12 pl-14 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                      placeholder="أدخل كلمة المرور"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
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
                className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white font-semibold rounded-xl hover:from-[#4b2e55] hover:to-[#6d3f7a] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col md:flex-row">
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white rounded-2xl shadow-xl flex items-center justify-center hover:shadow-2xl transition-all"
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onLogout={logoutConfirmModal.openModal}
      />

      <main className="flex-1 pb-20 md:pb-0 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === "pricing" && <PricingManagement />}
            {activeTab === "images" && <PredefinedImagesManagement />}
          </div>
        </div>
      </main>

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
