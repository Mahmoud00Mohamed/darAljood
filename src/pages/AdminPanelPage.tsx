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
  Trash2,
  Image as ImageIcon,
  Home,
  Menu,
  X,
  Plus,
  Edit3,
  Info,
  Calendar,
  Activity,
} from "lucide-react";
import authService, { LoginCredentials } from "../services/authService";
import pricingService, { PricingData } from "../services/pricingService";
import predefinedImagesService, {
  PredefinedImageData,
} from "../services/predefinedImagesService";
import CloudinaryImageUpload from "../components/forms/CloudinaryImageUpload";
import { CloudinaryImageData } from "../services/imageUploadService";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import { useModal } from "../hooks/useModal";
import Modal from "../components/ui/Modal";

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
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [pricingError, setPricingError] = useState("");
  const [predefinedImages, setPredefinedImages] = useState<
    PredefinedImageData[]
  >([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [imagesError, setImagesError] = useState("");
  const [activeTab, setActiveTab] = useState<"pricing" | "images">("pricing");
  const [newImageData, setNewImageData] = useState({
    name: "",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedImageForEdit, setSelectedImageForEdit] =
    useState<PredefinedImageData | null>(null);

  // Modal hooks
  const logoutConfirmModal = useModal();
  const resetPricingModal = useModal();
  const deleteImageModal = useModal();
  const editImageModal = useModal();
  const addImageModal = useModal();

  const [imageToDelete, setImageToDelete] =
    useState<PredefinedImageData | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isValid = await authService.verifySession();
        setIsAuthenticated(isValid);

        if (isValid) {
          await Promise.all([loadPricingData(), loadPredefinedImages()]);
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

  const loadPredefinedImages = async () => {
    setIsLoadingImages(true);
    setImagesError("");
    try {
      const images = await predefinedImagesService.loadPredefinedImages();
      setPredefinedImages(images);
    } catch (error) {
      setImagesError(
        error instanceof Error ? error.message : "فشل في تحميل الشعارات الجاهزة"
      );
    } finally {
      setIsLoadingImages(false);
    }
  };

  const handleAddPredefinedImage = async (imageData: CloudinaryImageData) => {
    if (!newImageData.name.trim()) {
      alert("اسم الشعار مطلوب");
      return;
    }

    try {
      const response = await fetch(imageData.url);
      const blob = await response.blob();
      const file = new File(
        [blob],
        `${imageData.publicId}.${imageData.format}`,
        {
          type: `image/${imageData.format}`,
        }
      );

      const newImage = await predefinedImagesService.addPredefinedImage(
        file,
        newImageData.name,
        newImageData.category,
        newImageData.description
      );

      setPredefinedImages((prev) => [newImage, ...prev]);
      setSaveMessage("تم إضافة الشعار الجاهز بنجاح");
      setNewImageData({
        name: "",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      });
      addImageModal.closeModal();
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setImagesError(
        error instanceof Error ? error.message : "فشل في إضافة الشعار الجاهز"
      );
    }
  };

  const handleDeletePredefinedImage = async () => {
    if (!imageToDelete) return;

    setIsLoadingImages(true);
    try {
      await predefinedImagesService.deletePredefinedImage(imageToDelete.id);
      setPredefinedImages((prev) =>
        prev.filter((img) => img.id !== imageToDelete.id)
      );
      setSaveMessage("تم حذف الشعار الجاهز بنجاح");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setImagesError(
        error instanceof Error ? error.message : "فشل في حذف الشعار الجاهز"
      );
    } finally {
      setIsLoadingImages(false);
      setImageToDelete(null);
      deleteImageModal.closeModal();
    }
  };

  const handleEditImage = async () => {
    if (!selectedImageForEdit) return;

    try {
      const updatedImage = await predefinedImagesService.updatePredefinedImage(
        selectedImageForEdit.id,
        {
          name: selectedImageForEdit.name,
          category: selectedImageForEdit.category,
          description: selectedImageForEdit.description,
        }
      );

      setPredefinedImages((prev) =>
        prev.map((img) =>
          img.id === selectedImageForEdit.id ? updatedImage : img
        )
      );

      setSaveMessage("تم تحديث الشعار بنجاح");
      setTimeout(() => setSaveMessage(""), 3000);
      editImageModal.closeModal();
      setSelectedImageForEdit(null);
    } catch (error) {
      setImagesError(
        error instanceof Error ? error.message : "فشل في تحديث الشعار"
      );
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      await authService.login(loginCredentials);
      setIsAuthenticated(true);
      await Promise.all([loadPricingData(), loadPredefinedImages()]);
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
      setPricingData(null);
      setPredefinedImages([]);
      setLoginCredentials({ username: "", password: "" });
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
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

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "غير محدد";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
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
                    <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
      {/* Mobile menu button */}
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

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transform fixed md:static inset-y-0 left-0 z-40 w-72 bg-white shadow-2xl border-r border-gray-100 transition-transform duration-300 ease-in-out`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">لوحة التحكم</h1>
                <p className="text-sm opacity-90">دار الجود</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-6 space-y-2">
            <button
              onClick={() => {
                setActiveTab("pricing");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "pricing"
                  ? "bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white shadow-lg"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <DollarSign className="w-5 h-5" />
              <span>إدارة الأسعار</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("images");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "images"
                  ? "bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white shadow-lg"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <ImageIcon className="w-5 h-5" />
              <span>الشعارات الجاهزة</span>
              <span className="mr-auto bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                {predefinedImages.length}
              </span>
            </button>

            <div className="border-t border-gray-200 pt-4 mt-6">
              <button
                onClick={() => navigate("/")}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
              >
                <Home className="w-5 h-5" />
                <span>العودة للموقع</span>
              </button>

              <button
                onClick={logoutConfirmModal.openModal}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 mt-2"
              >
                <LogOut className="w-5 h-5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="text-center">
              <div className="w-8 h-8 bg-gradient-to-r from-[#563660] to-[#7e4a8c] rounded-lg flex items-center justify-center mx-auto mb-2">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs text-gray-600">النظام يعمل بشكل طبيعي</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-0 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Status messages */}
            <AnimatePresence>
              {saveMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 shadow-sm"
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">
                    {saveMessage}
                  </span>
                </motion.div>
              )}

              {(pricingError || imagesError) && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-sm"
                >
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700 font-medium">
                    {pricingError || imagesError}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pricing Tab */}
            {activeTab === "pricing" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      إدارة الأسعار
                    </h2>
                    <p className="text-gray-600">
                      تعديل أسعار خدمات دار الجود وإدارة التكاليف
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !pricingData}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white font-semibold rounded-xl hover:from-[#4b2e55] hover:to-[#6d3f7a] transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      حفظ التغييرات
                    </button>
                    <button
                      onClick={resetPricingModal.openModal}
                      disabled={isSaving}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4" />
                      إعادة تعيين
                    </button>
                    <button
                      onClick={loadPricingData}
                      disabled={isLoadingPricing}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50"
                    >
                      {isLoadingPricing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RotateCcw className="w-4 h-4" />
                      )}
                      تحديث
                    </button>
                  </div>
                </div>

                {isLoadingPricing ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 animate-spin text-[#563660] mx-auto mb-4" />
                      <p className="text-gray-600 text-lg">
                        جاري تحميل بيانات التسعير...
                      </p>
                    </div>
                  </div>
                ) : pricingData ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Base Price Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <DollarSign className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            السعر الأساسي
                          </h3>
                          <p className="text-gray-600 text-sm">
                            السعر الأساسي للجاكيت المخصص
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
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
                              className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all bg-gray-50 hover:bg-white text-lg font-semibold"
                            />
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                              ريال
                            </span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                          <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5" />
                            يشمل السعر الأساسي:
                          </h4>
                          <ul className="text-blue-800 space-y-2">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                              شعار خلفي + نص خلفي
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                              شعارين في الجهة اليمنى
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                              شعارين في الجهة اليسرى
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                              شعار أو نص واحد في الأمام
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Additional Costs Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <TrendingUp className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            التكاليف الإضافية
                          </h3>
                          <p className="text-gray-600 text-sm">
                            أسعار الخدمات الإضافية
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
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
                              className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                            />
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                              ريال
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            شعار ثالث - جهة يمنى (ريال)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={
                                pricingData.additionalCosts.rightSideThirdLogo
                              }
                              onChange={(e) =>
                                updatePricingField(
                                  "additionalCosts.rightSideThirdLogo",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                            />
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                              ريال
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            شعار ثالث - جهة يسرى (ريال)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={
                                pricingData.additionalCosts.leftSideThirdLogo
                              }
                              onChange={(e) =>
                                updatePricingField(
                                  "additionalCosts.leftSideThirdLogo",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                            />
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                              ريال
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Summary Card */}
                    <div className="xl:col-span-2 bg-gradient-to-r from-[#563660] to-[#7e4a8c] rounded-2xl shadow-xl p-8 text-white">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">ملخص التسعير</h3>
                          <p className="text-white text-opacity-90 text-sm">
                            آخر تحديث:{" "}
                            {new Date(
                              pricingData.lastUpdated
                            ).toLocaleDateString("ar-SA")}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                          <div className="text-2xl font-bold mb-1">
                            {pricingData.basePrice} ريال
                          </div>
                          <div className="text-white text-opacity-80 text-sm">
                            السعر الأساسي
                          </div>
                        </div>
                        <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                          <div className="text-2xl font-bold mb-1">
                            {pricingData.additionalCosts.frontExtraItem} ريال
                          </div>
                          <div className="text-white text-opacity-80 text-sm">
                            عنصر أمامي إضافي
                          </div>
                        </div>
                        <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                          <div className="text-2xl font-bold mb-1">
                            {pricingData.additionalCosts.rightSideThirdLogo}{" "}
                            ريال
                          </div>
                          <div className="text-white text-opacity-80 text-sm">
                            شعار ثالث يمين
                          </div>
                        </div>
                        <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                          <div className="text-2xl font-bold mb-1">
                            {pricingData.additionalCosts.leftSideThirdLogo} ريال
                          </div>
                          <div className="text-white text-opacity-80 text-sm">
                            شعار ثالث يسار
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      فشل في تحميل بيانات التسعير
                    </h3>
                    <button
                      onClick={loadPricingData}
                      className="px-6 py-3 bg-[#563660] text-white rounded-xl hover:bg-[#4b2e55] transition-colors font-semibold"
                    >
                      إعادة المحاولة
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Images Tab */}
            {activeTab === "images" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      الشعارات الجاهزة
                    </h2>
                    <p className="text-gray-600">
                      إدارة مكتبة الشعارات الجاهزة للعملاء
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    <button
                      onClick={addImageModal.openModal}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة شعار جديد
                    </button>
                    <button
                      onClick={loadPredefinedImages}
                      disabled={isLoadingImages}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50"
                    >
                      {isLoadingImages ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RotateCcw className="w-4 h-4" />
                      )}
                      تحديث القائمة
                    </button>
                  </div>
                </div>

                {/* Images Grid */}
                {isLoadingImages ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 animate-spin text-[#563660] mx-auto mb-4" />
                      <p className="text-gray-600 text-lg">
                        جاري تحميل الشعارات الجاهزة...
                      </p>
                    </div>
                  </div>
                ) : predefinedImages.length > 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-bold text-gray-900">
                        الشعارات المتاحة
                      </h3>
                      <span className="bg-[#563660] text-white px-4 py-2 rounded-xl font-semibold">
                        {predefinedImages.length} شعار
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                      {predefinedImages.map((image, index) => (
                        <motion.div
                          key={image.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="relative group bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200"
                        >
                          <div className="aspect-square p-4">
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>

                          <div className="p-4 border-t border-gray-200 bg-white">
                            <h4 className="text-sm font-semibold text-gray-900 truncate mb-1">
                              {image.name}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">
                              {image.category}
                            </p>
                            {image.size && (
                              <p className="text-xs text-gray-400 mt-1">
                                {formatFileSize(image.size)}
                              </p>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => {
                                setSelectedImageForEdit(image);
                                editImageModal.openModal();
                              }}
                              className="w-7 h-7 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors shadow-md"
                              title="تعديل"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                setImageToDelete(image);
                                deleteImageModal.openModal();
                              }}
                              disabled={isLoadingImages}
                              className="w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50 shadow-md"
                              title="حذف"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
                    <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      لا توجد شعارات جاهزة
                    </h3>
                    <p className="text-gray-600 mb-6">
                      ابدأ بإضافة شعارات جاهزة للمجموعة
                    </p>
                    <button
                      onClick={addImageModal.openModal}
                      className="px-6 py-3 bg-[#563660] text-white rounded-xl hover:bg-[#4b2e55] transition-colors font-semibold"
                    >
                      إضافة شعار جديد
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation Modals */}
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

      <ConfirmationModal
        isOpen={deleteImageModal.isOpen}
        onClose={() => {
          deleteImageModal.closeModal();
          setImageToDelete(null);
        }}
        onConfirm={handleDeletePredefinedImage}
        title="تأكيد حذف الشعار"
        message={`هل أنت متأكد من حذف الشعار "${imageToDelete?.name}"؟ سيتم حذفه نهائياً من المجموعة ومن الخادم.`}
        confirmText="نعم، احذف"
        cancelText="إلغاء"
        type="danger"
        isLoading={isLoadingImages}
      />

      {/* Add Image Modal */}
      <Modal
        isOpen={addImageModal.isOpen}
        shouldRender={addImageModal.shouldRender}
        onClose={addImageModal.closeModal}
        title="إضافة شعار جديد"
        size="lg"
        options={addImageModal.options}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                اسم الشعار *
              </label>
              <input
                type="text"
                value={newImageData.name}
                onChange={(e) =>
                  setNewImageData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all"
                placeholder="مثال: شعار الشركة"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الفئة
              </label>
              <input
                type="text"
                value={newImageData.category}
                onChange={(e) =>
                  setNewImageData((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الوصف
              </label>
              <input
                type="text"
                value={newImageData.description}
                onChange={(e) =>
                  setNewImageData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all"
                placeholder="وصف مختصر للشعار"
              />
            </div>
          </div>

          <CloudinaryImageUpload
            onImageSelect={handleAddPredefinedImage}
            acceptedFormats={[
              "image/jpeg",
              "image/jpg",
              "image/png",
              "image/webp",
            ]}
            maxFileSize={5}
            placeholder="اسحب الشعار هنا أو انقر للاختيار"
            aspectRatio={1}
            cropTitle="اقتطاع الشعار الجاهز"
            autoAddToLibrary={false}
          />

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-amber-800 font-semibold mb-1">
                  ملاحظات مهمة:
                </p>
                <ul className="text-amber-700 space-y-1">
                  <li>• الحد الأقصى لحجم الملف: 5MB</li>
                  <li>• الأنواع المدعومة: JPG, PNG, WEBP</li>
                  <li>• يفضل أن تكون الصورة مربعة الشكل</li>
                  <li>• سيتم تحسين الصورة تلقائياً للاستخدام</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Image Modal */}
      <Modal
        isOpen={editImageModal.isOpen}
        shouldRender={editImageModal.shouldRender}
        onClose={() => {
          editImageModal.closeModal();
          setSelectedImageForEdit(null);
        }}
        title="تعديل معلومات الشعار"
        size="md"
        options={editImageModal.options}
      >
        {selectedImageForEdit && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={selectedImageForEdit.url}
                  alt={selectedImageForEdit.name}
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <p className="text-sm text-gray-600">
                معرف الصورة: {selectedImageForEdit.publicId}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  اسم الشعار *
                </label>
                <input
                  type="text"
                  value={selectedImageForEdit.name}
                  onChange={(e) =>
                    setSelectedImageForEdit((prev) =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الفئة
                </label>
                <input
                  type="text"
                  value={selectedImageForEdit.category}
                  onChange={(e) =>
                    setSelectedImageForEdit((prev) =>
                      prev ? { ...prev, category: e.target.value } : null
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الوصف
                </label>
                <textarea
                  value={selectedImageForEdit.description || ""}
                  onChange={(e) =>
                    setSelectedImageForEdit((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all resize-none"
                  placeholder="وصف مختصر للشعار"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleEditImage}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#563660] text-white font-semibold rounded-xl hover:bg-[#4b2e55] transition-colors"
              >
                <Save className="w-4 h-4" />
                حفظ التغييرات
              </button>
              <button
                onClick={() => {
                  editImageModal.closeModal();
                  setSelectedImageForEdit(null);
                }}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminPanelPage;
