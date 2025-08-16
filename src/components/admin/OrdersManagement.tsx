import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  Loader2,
  Calendar,
  User,
  Phone,
  MoreVertical,
  ExternalLink,
  Link as LinkIcon,
  Copy,
  Check,
  RefreshCw,
  Download,
  FileText,
  Plus,
  X,
} from "lucide-react";
import orderService, { OrderData, OrderStats } from "../../services/orderService";
import temporaryLinkService from "../../services/temporaryLinkService";
import authService from "../../services/authService";
import { Link } from "react-router-dom";
import ConfirmationModal from "../ui/ConfirmationModal";
import Modal from "../ui/Modal";
import { useModal } from "../../hooks/useModal";

const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // حالة منفصلة للحذف
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [orderToConfirm, setOrderToConfirm] = useState<OrderData | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<OrderData | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [copiedText, setCopiedText] = useState("");
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [linkDuration, setLinkDuration] = useState(1);

  const orderDetailsModal = useModal();
  const confirmOrderModal = useModal();
  const deleteOrderModal = useModal();
  const statusUpdateModal = useModal();
  const createLinkModal = useModal();

  const availableStatuses = [
    { value: "pending", name: "قيد المراجعة", color: "#f59e0b" },
    { value: "confirmed", name: "تم التأكيد", color: "#3b82f6" },
    { value: "in_production", name: "قيد التنفيذ", color: "#8b5cf6" },
    { value: "quality_check", name: "فحص الجودة", color: "#06b6d4" },
    { value: "ready_to_ship", name: "جاهز للشحن", color: "#10b981" },
    { value: "shipped", name: "تم الشحن", color: "#059669" },
    { value: "delivered", name: "تم التسليم", color: "#16a34a" },
    { value: "cancelled", name: "ملغي", color: "#ef4444" },
    { value: "returned", name: "مُرجع", color: "#f97316" },
  ];

  useEffect(() => {
    loadOrders();
    loadStats();
  }, [showPendingOnly]);

  const loadOrders = async () => {
    setIsLoading(true);
    setError("");
    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      const data = await orderService.getAllOrders(token, {
        includePending: showPendingOnly,
      });
      setOrders(data.orders);
    } catch (error) {
      setError(error instanceof Error ? error.message : "فشل في تحميل الطلبات");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      const statsData = await orderService.getOrderStats(token);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleConfirmOrder = async () => {
    if (!orderToConfirm) return;

    setIsConfirming(true);
    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      const updatedOrder = await orderService.updateOrderStatus(
        orderToConfirm.id,
        "confirmed",
        "تم تأكيد الطلب من قبل المدير",
        token
      );

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderToConfirm.id ? updatedOrder : order
        )
      );

      setSaveMessage("تم تأكيد الطلب بنجاح");
      setTimeout(() => setSaveMessage(""), 3000);
      loadStats();
    } catch (error) {
      setError(error instanceof Error ? error.message : "فشل في تأكيد الطلب");
    } finally {
      setIsConfirming(false);
      setOrderToConfirm(null);
      confirmOrderModal.closeModal();
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    setIsDeleting(true); // استخدام حالة منفصلة للحذف
    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      await orderService.deleteOrder(orderToDelete.id, token);
      setOrders((prev) => prev.filter((order) => order.id !== orderToDelete.id));

      setSaveMessage("تم حذف الطلب بنجاح");
      setTimeout(() => setSaveMessage(""), 3000);
      loadStats();
    } catch (error) {
      setError(error instanceof Error ? error.message : "فشل في حذف الطلب");
    } finally {
      setIsDeleting(false); // إعادة تعيين حالة الحذف
      setOrderToDelete(null);
      deleteOrderModal.closeModal();
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      const updatedOrder = await orderService.updateOrderStatus(
        selectedOrder.id,
        newStatus,
        statusNote,
        token
      );

      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrder.id ? updatedOrder : order
        )
      );

      setSaveMessage("تم تحديث حالة الطلب بنجاح");
      setTimeout(() => setSaveMessage(""), 3000);
      setNewStatus("");
      setStatusNote("");
      setSelectedOrder(null);
      statusUpdateModal.closeModal();
      loadStats();
    } catch (error) {
      setError(error instanceof Error ? error.message : "فشل في تحديث الحالة");
    }
  };

  const handleCreateTemporaryLink = async () => {
    if (!selectedOrder) return;

    setIsCreatingLink(true);
    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      const linkData = await temporaryLinkService.createTemporaryLink(
        selectedOrder.id,
        linkDuration,
        token
      );

      // نسخ الرابط إلى الحافظة
      await navigator.clipboard.writeText(linkData.fullUrl);
      setCopiedText(linkData.fullUrl);
      setTimeout(() => setCopiedText(""), 3000);

      setSaveMessage("تم إنشاء الرابط ونسخه إلى الحافظة بنجاح");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "فشل في إنشاء الرابط المؤقت"
      );
    } finally {
      setIsCreatingLink(false);
      createLinkModal.closeModal();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(""), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const formatDate = (dateString: string): string => {
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
    const statusConfig = availableStatuses.find((s) => s.value === status);
    return statusConfig?.color || "#6b7280";
  };

  const getStatusName = (status: string) => {
    const statusConfig = availableStatuses.find((s) => s.value === status);
    return statusConfig?.name || status;
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.phone.includes(searchTerm);

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-[#563660]" />
            إدارة الطلبات
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            عرض وإدارة طلبات العملاء وحالاتها
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadOrders}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            تحديث
          </button>
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-green-700 font-medium text-sm">
              {saveMessage}
            </span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-red-700 font-medium text-sm">{error}</span>
          </motion.div>
        )}

        {copiedText && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="text-blue-700 font-medium text-sm">
              تم نسخ الرابط إلى الحافظة
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">إجمالي الطلبات</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">قيد المراجعة</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">تم التسليم</p>
                <p className="text-2xl font-bold">{stats.delivered}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">الإيرادات</p>
                <p className="text-xl font-bold">{formatPrice(stats.totalRevenue)}</p>
              </div>
              <Package className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="البحث برقم الطلب، رمز التتبع، اسم العميل، أو رقم الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-sm"
            >
              <option value="all">جميع الحالات</option>
              {availableStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowPendingOnly(!showPendingOnly)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showPendingOnly
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
              }`}
            >
              <Filter className="w-4 h-4" />
              {showPendingOnly ? "إظهار الكل" : "المراجعة فقط"}
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#563660] mx-auto mb-4" />
            <p className="text-gray-600 text-sm">جاري تحميل الطلبات...</p>
          </div>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                    السعر
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
                {filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {order.orderNumber}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {order.trackingCode}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {order.customerInfo.name}
                        </div>
                        <div className="text-xs text-gray-500" dir="ltr">
                          {order.customerInfo.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                        style={{
                          backgroundColor: `${getStatusColor(order.status)}20`,
                          borderColor: `${getStatusColor(order.status)}40`,
                          color: getStatusColor(order.status),
                        }}
                      >
                        {getStatusName(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900 text-sm">
                        {formatPrice(order.totalPrice)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                        قطعة
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            orderDetailsModal.openModal();
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <Link
                          to={`/admin/orders/${order.id}/edit`}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>

                        {order.status === "pending" && (
                          <button
                            onClick={() => {
                              setOrderToConfirm(order);
                              confirmOrderModal.openModal();
                            }}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="تأكيد الطلب"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewStatus(order.status);
                            statusUpdateModal.openModal();
                          }}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="تحديث الحالة"
                        >
                          <Package className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            createLinkModal.openModal();
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="إنشاء رابط تعديل"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setOrderToDelete(order);
                            deleteOrderModal.openModal();
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            لا توجد طلبات
          </h3>
          <p className="text-sm text-gray-600">
            {searchTerm || statusFilter !== "all"
              ? "لا توجد طلبات تطابق معايير البحث"
              : "لم يتم إنشاء أي طلبات بعد"}
          </p>
        </div>
      )}

      {/* Order Details Modal */}
      <Modal
        isOpen={orderDetailsModal.isOpen}
        shouldRender={orderDetailsModal.shouldRender}
        onClose={orderDetailsModal.closeModal}
        title={`تفاصيل الطلب ${selectedOrder?.orderNumber}`}
        size="lg"
        options={orderDetailsModal.options}
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-[#563660]" />
                معلومات العميل
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    الاسم
                  </label>
                  <p className="text-gray-900">{selectedOrder.customerInfo.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    رقم الهاتف
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900" dir="ltr">
                      {selectedOrder.customerInfo.phone}
                    </p>
                    <button
                      onClick={() =>
                        copyToClipboard(selectedOrder.customerInfo.phone)
                      }
                      className="p-1 text-gray-400 hover:text-[#563660] transition-colors"
                    >
                      {copiedText === selectedOrder.customerInfo.phone ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#563660]" />
                معلومات الطلب
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block font-medium text-gray-700">
                    رقم الطلب
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 font-mono">
                      {selectedOrder.orderNumber}
                    </p>
                    <button
                      onClick={() => copyToClipboard(selectedOrder.orderNumber)}
                      className="p-1 text-gray-400 hover:text-[#563660] transition-colors"
                    >
                      {copiedText === selectedOrder.orderNumber ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-gray-700">
                    رمز التتبع
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 font-mono">
                      {selectedOrder.trackingCode}
                    </p>
                    <button
                      onClick={() => copyToClipboard(selectedOrder.trackingCode)}
                      className="p-1 text-gray-400 hover:text-[#563660] transition-colors"
                    >
                      {copiedText === selectedOrder.trackingCode ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-gray-700">الحالة</label>
                  <span
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border"
                    style={{
                      backgroundColor: `${getStatusColor(selectedOrder.status)}20`,
                      borderColor: `${getStatusColor(selectedOrder.status)}40`,
                      color: getStatusColor(selectedOrder.status),
                    }}
                  >
                    {getStatusName(selectedOrder.status)}
                  </span>
                </div>
                <div>
                  <label className="block font-medium text-gray-700">
                    السعر الإجمالي
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {formatPrice(selectedOrder.totalPrice)}
                  </p>
                </div>
                <div>
                  <label className="block font-medium text-gray-700">
                    تاريخ الإنشاء
                  </label>
                  <p className="text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <label className="block font-medium text-gray-700">
                    آخر تحديث
                  </label>
                  <p className="text-gray-900">{formatDate(selectedOrder.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Status History */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#563660]" />
                تاريخ الحالات
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedOrder.statusHistory
                  .slice()
                  .reverse()
                  .map((history, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-white rounded-lg"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                        style={{
                          backgroundColor: getStatusColor(history.status),
                        }}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900 text-sm">
                            {history.statusName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(history.timestamp)}
                          </span>
                        </div>
                        {history.note && (
                          <p className="text-sm text-gray-600">{history.note}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          بواسطة: {history.updatedBy}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                to={`/admin/orders/${selectedOrder.id}/edit`}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#563660] text-white font-medium rounded-lg hover:bg-[#4b2e55] transition-colors text-sm"
              >
                <Edit3 className="w-4 h-4" />
                تعديل الطلب
              </Link>
              <button
                onClick={() => {
                  setNewStatus(selectedOrder.status);
                  statusUpdateModal.openModal();
                }}
                className="flex-1 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                تحديث الحالة
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Order Modal */}
      <ConfirmationModal
        isOpen={confirmOrderModal.isOpen}
        onClose={() => {
          confirmOrderModal.closeModal();
          setOrderToConfirm(null);
        }}
        onConfirm={handleConfirmOrder}
        title="تأكيد الطلب"
        message={`هل أنت متأكد من تأكيد الطلب رقم "${orderToConfirm?.orderNumber}"؟ سيتم تغيير حالة الطلب إلى "تم التأكيد".`}
        confirmText={isConfirming ? "جاري التأكيد..." : "نعم، أكد الطلب"}
        cancelText="إلغاء"
        type="success"
        isLoading={isConfirming}
      />

      {/* Delete Order Modal */}
      <ConfirmationModal
        isOpen={deleteOrderModal.isOpen}
        onClose={() => {
          deleteOrderModal.closeModal();
          setOrderToDelete(null);
        }}
        onConfirm={handleDeleteOrder}
        title="تأكيد حذف الطلب"
        message={`هل أنت متأكد من حذف الطلب رقم "${orderToDelete?.orderNumber}"؟ سيتم حذفه نهائياً ولن يمكن التراجع عن هذا الإجراء.`}
        confirmText={isDeleting ? "جاري الحذف..." : "نعم، احذف"}
        cancelText="إلغاء"
        type="danger"
        isLoading={isDeleting}
      />

      {/* Status Update Modal */}
      <Modal
        isOpen={statusUpdateModal.isOpen}
        shouldRender={statusUpdateModal.shouldRender}
        onClose={() => {
          statusUpdateModal.closeModal();
          setSelectedOrder(null);
          setNewStatus("");
          setStatusNote("");
        }}
        title={`تحديث حالة الطلب ${selectedOrder?.orderNumber}`}
        size="md"
        options={statusUpdateModal.options}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحالة الجديدة
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-sm"
            >
              {availableStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظة (اختيارية)
            </label>
            <textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all resize-none text-sm"
              placeholder="أضف ملاحظة حول تحديث الحالة..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleStatusUpdate}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#563660] text-white font-medium rounded-lg hover:bg-[#4b2e55] transition-colors text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              تحديث الحالة
            </button>
            <button
              onClick={() => {
                statusUpdateModal.closeModal();
                setSelectedOrder(null);
                setNewStatus("");
                setStatusNote("");
              }}
              className="flex-1 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Temporary Link Modal */}
      <Modal
        isOpen={createLinkModal.isOpen}
        shouldRender={createLinkModal.shouldRender}
        onClose={createLinkModal.closeModal}
        title={`إنشاء رابط تعديل للطلب ${selectedOrder?.orderNumber}`}
        size="md"
        options={createLinkModal.options}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <LinkIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-800 font-medium mb-1">ملاحظة:</p>
                <p className="text-blue-700">
                  سيتم إنشاء رابط آمن يسمح للعميل بتعديل طلبه لفترة محدودة. الرابط
                  سينتهي تلقائياً بعد المدة المحددة.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مدة صلاحية الرابط (بالساعات)
            </label>
            <select
              value={linkDuration}
              onChange={(e) => setLinkDuration(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-sm"
            >
              <option value={0.5}>30 دقيقة</option>
              <option value={1}>ساعة واحدة</option>
              <option value={2}>ساعتان</option>
              <option value={4}>4 ساعات</option>
              <option value={8}>8 ساعات</option>
              <option value={12}>12 ساعة</option>
              <option value={24}>24 ساعة</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCreateTemporaryLink}
              disabled={isCreatingLink}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#563660] text-white font-medium rounded-lg hover:bg-[#4b2e55] transition-colors text-sm disabled:opacity-50"
            >
              {isCreatingLink ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {isCreatingLink ? "جاري الإنشاء..." : "إنشاء الرابط"}
            </button>
            <button
              onClick={createLinkModal.closeModal}
              className="flex-1 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrdersManagement;