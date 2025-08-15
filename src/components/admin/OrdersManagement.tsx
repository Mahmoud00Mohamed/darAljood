import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  User,
  Phone,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  Loader2,
  RefreshCw,
  DollarSign,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import orderService, {
  OrderData,
  OrderStats,
} from "../../services/orderService";
import authService from "../../services/authService";
import ConfirmationModal from "../ui/ConfirmationModal";
import Modal from "../ui/Modal";
import { useModal } from "../../hooks/useModal";
import { generateOrderPDFWithImages } from "../../utils/pdfGenerator";
import JacketImageCapture, {
  JacketImageCaptureRef,
} from "../jacket/JacketImageCapture";
import LoadingOverlay from "../ui/LoadingOverlay";
import fontPreloader from "../../utils/fontPreloader";
import { JacketState, JacketMaterial } from "../../context/JacketContext";

const OrdersManagement: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [pendingOrders, setPendingOrders] = useState<OrderData[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPendingOrders, setTotalPendingOrders] = useState(0);
  const [ordersPerPage] = useState(10); // عدد الطلبات في كل صفحة
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<OrderData | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfLoadingStage, setPdfLoadingStage] = useState<
    "capturing" | "generating" | "completed"
  >("capturing");
  const [showPdfLoadingOverlay, setShowPdfLoadingOverlay] = useState(false);
  const [activeTab, setActiveTab] = useState<"confirmed" | "pending">(
    "confirmed"
  );

  const jacketImageCaptureRef = React.useRef<JacketImageCaptureRef>(null);
  const orderDetailsModal = useModal();
  const deleteOrderModal = useModal();
  const updateStatusModal = useModal();

  const orderStatuses = [
    { value: "pending", name: "قيد المراجعة", color: "text-amber-600" },
    { value: "confirmed", name: "تم التأكيد", color: "text-blue-600" },
    { value: "in_production", name: "قيد التنفيذ", color: "text-purple-600" },
    { value: "quality_check", name: "فحص الجودة", color: "text-cyan-600" },
    { value: "ready_to_ship", name: "جاهز للشحن", color: "text-emerald-600" },
    { value: "shipped", name: "تم الشحن", color: "text-green-600" },
    { value: "delivered", name: "تم التسليم", color: "text-green-700" },
    { value: "cancelled", name: "ملغي", color: "text-red-600" },
    { value: "returned", name: "مُرجع", color: "text-orange-600" },
  ];

  const loadOrders = async () => {
    setIsLoading(true);
    setError("");
    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      const result = await orderService.getAllOrders(token, {
        page: currentPage,
        limit: ordersPerPage,
        search: searchTerm,
        status: statusFilter,
        includePending: false, // استبعاد الطلبات قيد المراجعة
      });
      setOrders(result.orders);
      setTotalPages(result.pagination.totalPages);
      setTotalOrders(result.pagination.totalOrders);
    } catch (error) {
      setError(error instanceof Error ? error.message : "فشل في تحميل الطلبات");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPendingOrders = async () => {
    setIsLoadingPending(true);
    setError("");
    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      const result = await orderService.getAllOrders(token, {
        page: pendingCurrentPage,
        limit: ordersPerPage,
        status: "pending", // فقط الطلبات قيد المراجعة
        includePending: true,
      });
      setPendingOrders(result.orders);
      setPendingTotalPages(result.pagination.totalPages);
      setTotalPendingOrders(result.pagination.totalOrders);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "فشل في تحميل الطلبات قيد المراجعة"
      );
    } finally {
      setIsLoadingPending(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const statsData = await orderService.getOrderStats(token);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "confirmed") {
      loadOrders();
    } else {
      loadPendingOrders();
    }
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pendingCurrentPage, activeTab]);
  const handleSearch = () => {
    if (activeTab === "confirmed") {
      setCurrentPage(1); // إعادة تعيين الصفحة للأولى عند البحث
      loadOrders();
    } else {
      setPendingCurrentPage(1);
      loadPendingOrders();
    }
  };

  const handlePageChange = (page: number) => {
    if (activeTab === "confirmed" && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    } else if (
      activeTab === "pending" &&
      page >= 1 &&
      page <= pendingTotalPages
    ) {
      setPendingCurrentPage(page);
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    if (activeTab === "confirmed") {
      setCurrentPage(1); // إعادة تعيين الصفحة للأولى عند تغيير الفلتر
    } else {
      setPendingCurrentPage(1);
    }
  };
  const handleViewOrder = (order: OrderData) => {
    setSelectedOrder(order);
    orderDetailsModal.openModal();
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      await orderService.deleteOrder(orderToDelete.id, token);

      // حذف من القائمة المناسبة
      if (orderToDelete.status === "pending") {
        setPendingOrders((prev) =>
          prev.filter((order) => order.id !== orderToDelete.id)
        );
      } else {
        setOrders((prev) =>
          prev.filter((order) => order.id !== orderToDelete.id)
        );
      }

      await loadStats();

      // إذا كانت الصفحة الحالية فارغة بعد الحذف، انتقل للصفحة السابقة
      if (activeTab === "confirmed" && orders.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else if (
        activeTab === "pending" &&
        pendingOrders.length === 1 &&
        pendingCurrentPage > 1
      ) {
        setPendingCurrentPage(pendingCurrentPage - 1);
      } else {
        // إعادة تحميل الطلبات لتحديث العدد
        if (activeTab === "confirmed") {
          loadOrders();
        } else {
          loadPendingOrders();
        }
      }

      deleteOrderModal.closeModal();
      setOrderToDelete(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "فشل في حذف الطلب");
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    setIsUpdatingStatus(true);
    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      const updatedOrder = await orderService.updateOrderStatus(
        selectedOrder.id,
        newStatus,
        statusNote,
        token
      );

      // إذا تم تأكيد طلب كان قيد المراجعة، انقله من قائمة المراجعة إلى الطلبات المؤكدة
      if (selectedOrder.status === "pending" && newStatus === "confirmed") {
        // إزالة من قائمة المراجعة
        setPendingOrders((prev) =>
          prev.filter((order) => order.id !== selectedOrder.id)
        );
        // إضافة إلى الطلبات المؤكدة (سيتم تحديثها في التحميل التالي)
        if (activeTab === "confirmed") {
          loadOrders();
        }
      } else {
        // تحديث في القائمة المناسبة
        if (selectedOrder.status === "pending") {
          setPendingOrders((prev) =>
            prev.map((order) =>
              order.id === selectedOrder.id ? updatedOrder : order
            )
          );
        } else {
          setOrders((prev) =>
            prev.map((order) =>
              order.id === selectedOrder.id ? updatedOrder : order
            )
          );
        }
      }

      setSelectedOrder(updatedOrder);
      await loadStats();

      updateStatusModal.closeModal();
      setNewStatus("");
      setStatusNote("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "فشل في تحديث حالة الطلب"
      );
    } finally {
      setIsUpdatingStatus(false);
    }
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

  // Convert JacketConfig to JacketState for PDF generation
  const convertToJacketState = (
    jacketConfig: OrderData["items"][0]["jacketConfig"]
  ): JacketState => {
    return {
      colors: jacketConfig.colors,
      materials: {
        body: jacketConfig.materials.body as JacketMaterial,
        sleeves: jacketConfig.materials.sleeves as JacketMaterial,
        trim: jacketConfig.materials.body as JacketMaterial, // Use body material as fallback for trim
      },
      size: jacketConfig.size as
        | "XS"
        | "S"
        | "M"
        | "L"
        | "XL"
        | "2XL"
        | "3XL"
        | "4XL",
      logos: jacketConfig.logos.map((logo) => ({
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
      texts: jacketConfig.texts.map((text) => ({
        ...text,
        position: text.position as "chestRight" | "chestLeft" | "backBottom",
      })),
      currentView: jacketConfig.currentView as
        | "front"
        | "back"
        | "right"
        | "left",
      totalPrice: jacketConfig.totalPrice,
      isCapturing: jacketConfig.isCapturing || false,
      uploadedImages: jacketConfig.uploadedImages || [],
    };
  };
  const handleDownloadPDF = async (order: OrderData) => {
    setIsGeneratingPDF(true);
    setShowPdfLoadingOverlay(true);
    setPdfLoadingStage("capturing");

    try {
      // التأكد من تحميل الخطوط قبل بدء العملية
      await fontPreloader.preloadAllFonts();

      let jacketImages: string[] = [];

      // التقاط صور الجاكيت من التكوين المحفوظ
      if (jacketImageCaptureRef.current && order.items.length > 0) {
        try {
          const convertedConfig = convertToJacketState(
            order.items[0].jacketConfig
          );
          jacketImages = await jacketImageCaptureRef.current.captureFromConfig(
            convertedConfig
          );
        } catch (captureError) {
          console.warn("فشل في التقاط الصور:", captureError);
          jacketImages = [];
        }
      }

      // الانتقال لمرحلة إنشاء PDF
      setPdfLoadingStage("generating");
      await new Promise((resolve) => setTimeout(resolve, 800));

      // إنشاء PDF
      const pdfBlob = await generateOrderPDFWithImages(
        {
          cartItems: order.items.map((item) => ({
            id: item.id,
            jacketConfig: convertToJacketState(item.jacketConfig),
            quantity: item.quantity,
            price: item.price,
            addedAt: new Date(order.createdAt),
          })),
          totalPrice: order.totalPrice,
          customerInfo: order.customerInfo,
          orderNumber: order.orderNumber,
        },
        jacketImages
      );

      // مرحلة الإكمال
      setPdfLoadingStage("completed");
      await new Promise((resolve) => setTimeout(resolve, 500));

      // تحميل الملف
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `طلب-${order.orderNumber}-${order.customerInfo.name}.pdf`;
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

  const handlePdfLoadingComplete = () => {
    setShowPdfLoadingOverlay(false);
  };
  const getStatusColor = (status: string) => {
    const statusObj = orderStatuses.find((s) => s.value === status);
    return statusObj?.color || "text-gray-600";
  };

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      pending: <Clock className="w-4 h-4" />,
      confirmed: <CheckCircle className="w-4 h-4" />,
      in_production: <Package className="w-4 h-4" />,
      quality_check: <CheckCircle className="w-4 h-4" />,
      ready_to_ship: <Package className="w-4 h-4" />,
      shipped: <Truck className="w-4 h-4" />,
      delivered: <CheckCircle className="w-4 h-4" />,
      cancelled: <AlertCircle className="w-4 h-4" />,
      returned: <Package className="w-4 h-4" />,
    };
    return icons[status] || <Package className="w-4 h-4" />;
  };

  // مكون Pagination
  const PaginationComponent = ({
    currentPageProp,
    totalPagesProp,
    totalOrdersProp,
    onPageChange,
  }: {
    currentPageProp: number;
    totalPagesProp: number;
    totalOrdersProp: number;
    onPageChange: (page: number) => void;
  }) => {
    if (totalPagesProp <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;

      if (totalPagesProp <= maxVisiblePages) {
        for (let i = 1; i <= totalPagesProp; i++) {
          pages.push(i);
        }
      } else {
        if (currentPageProp <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPagesProp);
        } else if (currentPageProp >= totalPagesProp - 2) {
          pages.push(1);
          pages.push("...");
          for (let i = totalPagesProp - 3; i <= totalPagesProp; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push("...");
          for (let i = currentPageProp - 1; i <= currentPageProp + 1; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPagesProp);
        }
      }

      return pages;
    };

    return (
      <div className="flex items-center justify-between mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>
            عرض {(currentPageProp - 1) * ordersPerPage + 1} إلى{" "}
            {Math.min(currentPageProp * ordersPerPage, totalOrdersProp)} من{" "}
            {totalOrdersProp} طلب
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* الذهاب للصفحة الأولى */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPageProp === 1}
            className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="الصفحة الأولى"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>

          {/* الصفحة السابقة */}
          <button
            onClick={() => onPageChange(currentPageProp - 1)}
            disabled={currentPageProp === 1}
            className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="الصفحة السابقة"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* أرقام الصفحات */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === "..." ? (
                  <span className="px-3 py-2 text-gray-500">...</span>
                ) : (
                  <button
                    onClick={() => onPageChange(page as number)}
                    className={`px-3 py-2 rounded-lg border transition-colors ${
                      currentPageProp === page
                        ? "bg-[#563660] text-white border-[#563660]"
                        : "border-gray-300 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* الصفحة التالية */}
          <button
            onClick={() => onPageChange(currentPageProp + 1)}
            disabled={currentPageProp === totalPagesProp}
            className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="الصفحة التالية"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* الذهاب للصفحة الأخيرة */}
          <button
            onClick={() => onPageChange(totalPagesProp)}
            disabled={currentPageProp === totalPagesProp}
            className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="الصفحة الأخيرة"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#563660]" />
            إدارة الطلبات
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            عرض وإدارة جميع طلبات العملاء
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={activeTab === "confirmed" ? loadOrders : loadPendingOrders}
            disabled={isLoading || isLoadingPending}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 text-sm"
          >
            {isLoading || isLoadingPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            تحديث
          </button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">الطلبات المؤكدة</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">قيد المراجعة</p>
                <p className="text-2xl font-bold">
                  {stats.pendingReview.total}
                </p>
              </div>
              <Clock className="w-8 h-8 text-amber-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">الإيرادات</p>
                <p className="text-xl font-bold">
                  {formatPrice(stats.totalRevenue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">قيد التنفيذ</p>
                <p className="text-2xl font-bold">{stats.inProduction}</p>
              </div>
              <Package className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>
      )}

      {/* تبويبات الطلبات */}
      {/* تبويبات الطلبات */}
      <div className="bg-white rounded-lg border border-gray-200 p-1">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab("confirmed")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              activeTab === "confirmed"
                ? "bg-[#563660] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            الطلبات المؤكدة ({totalOrders})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              activeTab === "pending"
                ? "bg-amber-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Clock className="w-4 h-4" />
            قيد المراجعة ({totalPendingOrders})
          </button>
        </div>
      </div>

      {/* أدوات البحث والفلترة */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="ابحث برقم الطلب، رمز التتبع، اسم العميل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {activeTab === "confirmed" && (
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-sm"
              >
                <option value="">جميع الحالات</option>
                {orderStatuses
                  .filter((status) => status.value !== "pending")
                  .map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.name}
                    </option>
                  ))}
              </select>
            )}

            <button
              onClick={handleSearch}
              disabled={isLoading || isLoadingPending}
              className="flex items-center gap-2 px-4 py-2 bg-[#563660] text-white font-medium rounded-lg hover:bg-[#4b2e55] transition-all duration-200 disabled:opacity-50 text-sm"
            >
              <Filter className="w-4 h-4" />
              فلترة
            </button>
          </div>
        </div>
      </div>

      {/* عرض الأخطاء */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-red-700 font-medium text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Jacket Image Capture Component */}
      <div style={{ position: "fixed", top: "-9999px", left: "-9999px" }}>
        <JacketImageCapture ref={jacketImageCaptureRef} />
      </div>

      {/* PDF Loading Overlay */}
      <LoadingOverlay
        isVisible={showPdfLoadingOverlay}
        stage={pdfLoadingStage}
        onComplete={handlePdfLoadingComplete}
      />

      {/* قائمة الطلبات */}
      {isLoading || isLoadingPending ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#563660] mx-auto mb-4" />
            <p className="text-gray-600 text-sm">
              جاري تحميل{" "}
              {activeTab === "confirmed"
                ? "الطلبات المؤكدة"
                : "الطلبات قيد المراجعة"}
              ...
            </p>
          </div>
        </div>
      ) : (activeTab === "confirmed" ? orders : pendingOrders).length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden space-y-0">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">
                {activeTab === "confirmed"
                  ? `الطلبات المؤكدة (${totalOrders} طلب)`
                  : `الطلبات قيد المراجعة (${totalPendingOrders} طلب)`}
              </h3>
              {activeTab === "pending" && (
                <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">
                  لا تُحتسب في الإيرادات
                </div>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    رقم الطلب
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    العميل
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجمالي
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(activeTab === "confirmed" ? orders : pendingOrders).map(
                  (order, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 text-[#563660] mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.orderNumber}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              {order.trackingCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.customerInfo.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.customerInfo.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )} bg-opacity-10 border`}
                        >
                          {getStatusIcon(order.status)}
                          {order.statusName}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex flex-col">
                          <span>{formatPrice(order.totalPrice)}</span>
                          {activeTab === "pending" && (
                            <span className="text-xs text-amber-600">
                              غير محتسب
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/admin/orders/${order.id}/edit`)
                            }
                            className="text-purple-600 hover:text-purple-800 transition-colors"
                            title="تعديل الطلب"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(order)}
                            disabled={isGeneratingPDF}
                            className="text-green-600 hover:text-green-800 transition-colors disabled:opacity-50"
                            title="تحميل PDF"
                          >
                            {isGeneratingPDF ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setNewStatus(order.status);
                              updateStatusModal.openModal();
                            }}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="تحديث الحالة"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setOrderToDelete(order);
                              deleteOrderModal.openModal();
                            }}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <PaginationComponent
            currentPageProp={
              activeTab === "confirmed" ? currentPage : pendingCurrentPage
            }
            totalPagesProp={
              activeTab === "confirmed" ? totalPages : pendingTotalPages
            }
            totalOrdersProp={
              activeTab === "confirmed" ? totalOrders : totalPendingOrders
            }
            onPageChange={handlePageChange}
          />
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {activeTab === "confirmed"
              ? "لا توجد طلبات مؤكدة"
              : "لا توجد طلبات قيد المراجعة"}
          </h3>
          <p className="text-sm text-gray-600">
            {searchTerm || statusFilter
              ? `لا توجد ${
                  activeTab === "confirmed"
                    ? "طلبات مؤكدة"
                    : "طلبات قيد المراجعة"
                } تطابق معايير البحث`
              : `لا توجد ${
                  activeTab === "confirmed"
                    ? "طلبات مؤكدة"
                    : "طلبات قيد المراجعة"
                } حالياً`}
          </p>
        </div>
      )}

      {/* نافذة تفاصيل الطلب */}
      {selectedOrder && (
        <Modal
          isOpen={orderDetailsModal.isOpen}
          shouldRender={orderDetailsModal.shouldRender}
          onClose={orderDetailsModal.closeModal}
          title={`تفاصيل الطلب ${selectedOrder.orderNumber}`}
          size="lg"
          options={orderDetailsModal.options}
        >
          <div className="space-y-3 max-h-[70vh] sm:max-h-[80vh] overflow-y-auto">
            {/* معلومات مضغوطة للجوال */}
            <div className="grid grid-cols-1 gap-3">
              {/* بطاقة معلومات الطلب */}
              <div className="bg-gradient-to-r from-[#563660] to-[#4b2e55] rounded-lg p-3 sm:p-4 text-white">
                <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-purple-100 block text-xs">
                      رقم الطلب
                    </span>
                    <span className="font-medium text-sm sm:text-base">
                      {selectedOrder.orderNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-purple-100 block text-xs">
                      الإجمالي
                    </span>
                    <span className="font-bold text-sm sm:text-lg">
                      {formatPrice(selectedOrder.totalPrice)}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-purple-100 block text-xs">
                      الحالة
                    </span>
                    <span className="font-medium text-sm">
                      {selectedOrder.statusName}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-purple-100 block text-xs">
                      رمز التتبع
                    </span>
                    <span className="font-mono text-xs">
                      {selectedOrder.trackingCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* معلومات العميل والتاريخ */}
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-blue-800">
                    <User className="w-3 h-3" />
                    <span className="font-medium truncate">
                      {selectedOrder.customerInfo.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-700">
                    <Phone className="w-3 h-3" />
                    <span className="truncate">
                      {selectedOrder.customerInfo.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <Calendar className="w-3 h-3" />
                    <span className="text-xs">
                      {(() => {
                        const date = new Date(selectedOrder.createdAt);
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0"
                        );
                        const day = String(date.getDate()).padStart(2, "0");
                        const hours = String(date.getHours()).padStart(2, "0");
                        const minutes = String(date.getMinutes()).padStart(
                          2,
                          "0"
                        );
                        return `${year}/${month}/${day} ${hours}:${minutes}`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* عناصر الطلب مضغوطة */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#563660]" />
                العناصر ({selectedOrder.items.length})
              </h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg p-2 sm:p-3 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#563660] text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 text-xs sm:text-sm block">
                            جاكيت مخصص
                          </span>
                          <span className="text-xs text-gray-600">
                            {item.jacketConfig.size} | ك{item.quantity}
                          </span>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-[#563660] text-xs sm:text-sm block">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => handleDownloadPDF(selectedOrder)}
                          disabled={isGeneratingPDF}
                          className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors disabled:opacity-50 mt-1"
                        >
                          {isGeneratingPDF ? "..." : "PDF"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* تاريخ الحالات مضغوط جداً للجوال */}
            <div className="bg-amber-50 rounded-lg p-3 sm:p-4 border border-amber-100">
              <h3 className="text-sm sm:text-base font-semibold text-amber-900 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                الحالات ({selectedOrder.statusHistory.length})
              </h3>
              <div className="max-h-24 sm:max-h-32 overflow-y-auto space-y-1">
                {selectedOrder.statusHistory
                  .slice()
                  .reverse()
                  .slice(0, 3) // عرض آخر 3 حالات فقط في الجوال
                  .map((history, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white rounded p-2 border border-amber-100"
                    >
                      <div
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusColor(
                          history.status
                        )} bg-opacity-20`}
                      >
                        {React.cloneElement(
                          getStatusIcon(history.status) as React.ReactElement,
                          { className: "w-2 h-2 sm:w-3 sm:h-3" }
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                            {history.statusName}
                          </span>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-1">
                            {(() => {
                              const date = new Date(history.timestamp);
                              const year = date.getFullYear();
                              const month = String(
                                date.getMonth() + 1
                              ).padStart(2, "0");
                              const day = String(date.getDate()).padStart(
                                2,
                                "0"
                              );
                              return `${year}/${month}/${day}`;
                            })()}
                          </span>
                        </div>
                        {history.note && (
                          <p className="text-xs text-gray-600 truncate sm:line-clamp-1">
                            {history.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                {selectedOrder.statusHistory.length > 3 && (
                  <div className="text-center text-xs text-gray-500 py-1">
                    +{selectedOrder.statusHistory.length - 3} حالات أخرى
                  </div>
                )}
              </div>
            </div>

            {/* أزرار مضغوطة للجوال */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => {
                  setNewStatus(selectedOrder.status);
                  orderDetailsModal.closeModal();
                  updateStatusModal.openModal();
                }}
                className="flex items-center justify-center gap-1 py-2 px-2 bg-blue-50 text-blue-700 text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">تحديث</span>
                <span className="sm:hidden">حالة</span>
              </button>
              <button
                onClick={() => handleDownloadPDF(selectedOrder)}
                disabled={isGeneratingPDF}
                className="flex items-center justify-center gap-1 py-2 px-2 bg-green-50 text-green-700 text-xs sm:text-sm font-medium rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
              >
                {isGeneratingPDF ? (
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                ) : (
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
                <span>PDF</span>
              </button>
              <button
                onClick={() =>
                  navigate(`/admin/orders/${selectedOrder.id}/edit`)
                }
                className="flex items-center justify-center gap-1 py-2 px-2 bg-purple-50 text-purple-700 text-xs sm:text-sm font-medium rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">تعديل</span>
                <span className="sm:hidden">طلب</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* نافذة تحديث الحالة */}
      {selectedOrder && (
        <Modal
          isOpen={updateStatusModal.isOpen}
          shouldRender={updateStatusModal.shouldRender}
          onClose={updateStatusModal.closeModal}
          title={`تحديث حالة الطلب ${selectedOrder.orderNumber}`}
          size="md"
          options={updateStatusModal.options}
        >
          <div className="space-y-4">
            {/* تنبيه خاص للطلبات قيد المراجعة */}
            {selectedOrder.status === "pending" && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-amber-800 font-medium mb-1">
                      ملاحظة مهمة
                    </h4>
                    <p className="text-amber-700 text-sm">
                      هذا الطلب قيد المراجعة ولا يُحتسب ضمن الإيرادات أو
                      الإحصائيات. عند تأكيده، سيتم نقله تلقائياً إلى الطلبات
                      المؤكدة.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة الجديدة
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all"
              >
                {orderStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.name}
                  </option>
                ))}
              </select>
              {selectedOrder.status === "pending" &&
                newStatus === "confirmed" && (
                  <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    سيتم نقل الطلب إلى الطلبات المؤكدة وإدراجه في الحسابات
                  </p>
                )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظة (اختيارية)
              </label>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all resize-none"
                placeholder="أضف ملاحظة حول تحديث الحالة..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus || !newStatus}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#563660] text-white font-medium rounded-lg hover:bg-[#4b2e55] transition-colors disabled:opacity-50"
              >
                {isUpdatingStatus ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {selectedOrder.status === "pending" && newStatus === "confirmed"
                  ? "تأكيد الطلب ونقله"
                  : "تحديث الحالة"}
              </button>
              <button
                onClick={updateStatusModal.closeModal}
                disabled={isUpdatingStatus}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* نافذة تأكيد الحذف */}
      <ConfirmationModal
        isOpen={deleteOrderModal.isOpen}
        onClose={() => {
          deleteOrderModal.closeModal();
          setOrderToDelete(null);
        }}
        onConfirm={handleDeleteOrder}
        title="تأكيد حذف الطلب"
        message={`هل أنت متأكد من حذف الطلب رقم "${orderToDelete?.orderNumber}"؟ سيتم حذفه نهائياً ولا يمكن التراجع عن هذا الإجراء.`}
        confirmText="نعم، احذف"
        cancelText="إلغاء"
        type="danger"
      />
    </div>
  );
};

export default OrdersManagement;
