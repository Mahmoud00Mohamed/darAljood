import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  Plus,
  Calendar,
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  FileText,
  MoreVertical,
  RefreshCw,
  Download,
  Link as LinkIcon,
  Copy,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";
import orderService, { OrderData, OrderStats } from "../../services/orderService";
import temporaryLinkService from "../../services/temporaryLinkService";
import authService from "../../services/authService";
import ConfirmationModal from "../ui/ConfirmationModal";
import Modal from "../ui/Modal";
import { useModal } from "../../hooks/useModal";

const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<OrderData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [tempLinkDuration, setTempLinkDuration] = useState(1);
  const [isCreatingTempLink, setIsCreatingTempLink] = useState(false);
  const [createdTempLink, setCreatedTempLink] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // استخدام useModal مع إعدادات مختلفة لكل نافذة
  const orderDetailsModal = useModal({
    zIndex: 9990,
    closeOnEscape: true,
    closeOnBackdropClick: true,
  });

  const deleteOrderModal = useModal({
    zIndex: 9995, // أعلى من نافذة التفاصيل
    closeOnEscape: !isDeleting,
    closeOnBackdropClick: !isDeleting,
  });

  const statusUpdateModal = useModal({
    zIndex: 9992,
    closeOnEscape: !isUpdatingStatus,
    closeOnBackdropClick: !isUpdatingStatus,
  });

  const tempLinkModal = useModal({
    zIndex: 9993,
    closeOnEscape: !isCreatingTempLink,
    closeOnBackdropClick: !isCreatingTempLink,
  });

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
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    setError("");
    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      const data = await orderService.getAllOrders(token, {
        includePending: !showPendingOnly,
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

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    setIsDeleting(true);
    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      await orderService.deleteOrder(orderToDelete.id, token);
      setOrders((prev) => prev.filter((order) => order.id !== orderToDelete.id));
      setSaveMessage("تم حذف الطلب بنجاح");
      setTimeout(() => setSaveMessage(""), 3000);
      
      // إعادة تحميل الإحصائيات
      loadStats();
    } catch (error) {
      setError(error instanceof Error ? error.message : "فشل في حذف الطلب");
    } finally {
      setIsDeleting(false);
      setOrderToDelete(null);
      deleteOrderModal.closeModal();
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

      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrder.id ? updatedOrder : order
        )
      );

      setSaveMessage("تم تحديث حالة الطلب بنجاح");
      setTimeout(() => setSaveMessage(""), 3000);
      
      // إعادة تحميل الإحصائيات
      loadStats();
    } catch (error) {
      setError(error instanceof Error ? error.message : "فشل في تحديث الحالة");
    } finally {
      setIsUpdatingStatus(false);
      setNewStatus("");
      setStatusNote("");
      statusUpdateModal.closeModal();
    }
  };

  const handleCreateTempLink = async () => {
    if (!selectedOrder) return;

    setIsCreatingTempLink(true);
    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      const tempLink = await temporaryLinkService.createTemporaryLink(
        selectedOrder.id,
        tempLinkDuration,
        token
      );

      setCreatedTempLink(tempLink.fullUrl);
      setSaveMessage("تم إنشاء الرابط المؤقت بنجاح");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "فشل في إنشاء الرابط المؤقت");
    } finally {
      setIsCreatingTempLink(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
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
    const matchesPendingFilter = !showPendingOnly || order.status !== "pending";

    return matchesSearch && matchesStatus && matchesPendingFilter;
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
            عرض وإدارة جميع طلبات العملاء
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

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">تم التسليم</p>
                <p className="text-2xl font-bold">{stats.delivered}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
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

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">الإيرادات</p>
                <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
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
                placeholder="البحث برقم الطلب، رمز التتبع، اسم العميل..."
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
                  ? "bg-amber-100 text-amber-800"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Filter className="w-4 h-4" />
              {showPendingOnly ? "إخفاء قيد المراجعة" : "إظهار قيد المراجعة"}
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    رقم الطلب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    العميل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    السعر
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {order.trackingCode}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customerInfo.name}
                        </div>
                        <div className="text-xs text-gray-500" dir="ltr">
                          {order.customerInfo.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${getStatusColor(order.status)}20`,
                          color: getStatusColor(order.status),
                        }}
                      >
                        {getStatusName(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(order.totalPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            orderDetailsModal.openModal();
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/admin/orders/${order.id}/edit`}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="تعديل"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setOrderToDelete(order);
                            deleteOrderModal.openModal();
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors"
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
              ? "لم نجد طلبات تطابق معايير البحث"
              : "لم يتم إنشاء أي طلبات بعد"}
          </p>
        </div>
      )}

      {/* Order Details Modal */}
      <Modal
        isOpen={orderDetailsModal.isOpen}
        shouldRender={orderDetailsModal.shouldRender}
        onClose={orderDetailsModal.closeModal}
        title="تفاصيل الطلب"
        size="lg"
        options={orderDetailsModal.options}
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    معلومات الطلب
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">رقم الطلب:</span>
                      <span className="font-medium">{selectedOrder.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">رمز التتبع:</span>
                      <span className="font-mono font-medium">
                        {selectedOrder.trackingCode}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الحالة:</span>
                      <span
                        className="font-medium"
                        style={{ color: getStatusColor(selectedOrder.status) }}
                      >
                        {getStatusName(selectedOrder.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    معلومات العميل
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{selectedOrder.customerInfo.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span dir="ltr">{selectedOrder.customerInfo.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setNewStatus(selectedOrder.status);
                  setStatusNote("");
                  orderDetailsModal.closeModal();
                  statusUpdateModal.openModal();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Edit3 className="w-4 h-4" />
                تحديث الحالة
              </button>

              <Link
                to={`/admin/orders/${selectedOrder.id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Edit3 className="w-4 h-4" />
                تعديل الطلب
              </Link>

              <button
                onClick={() => {
                  setTempLinkDuration(1);
                  setCreatedTempLink("");
                  orderDetailsModal.closeModal();
                  tempLinkModal.openModal();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <LinkIcon className="w-4 h-4" />
                إنشاء رابط تعديل
              </button>

              <a
                href={`https://wa.me/966536065766?text=${encodeURIComponent(
                  `مرحباً، بخصوص الطلب:\nرقم الطلب: ${selectedOrder.orderNumber}\nرمز التتبع: ${selectedOrder.trackingCode}\nالعميل: ${selectedOrder.customerInfo.name}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                واتساب العميل
              </a>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteOrderModal.isOpen}
        onClose={() => {
          if (!isDeleting) {
            deleteOrderModal.closeModal();
            setOrderToDelete(null);
          }
        }}
        onConfirm={handleDeleteOrder}
        title="تأكيد حذف الطلب"
        message={`هل أنت متأكد من حذف الطلب "${orderToDelete?.orderNumber}"؟ سيتم حذفه نهائياً ولن يمكن التراجع عن هذا الإجراء.`}
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
          if (!isUpdatingStatus) {
            statusUpdateModal.closeModal();
            setNewStatus("");
            setStatusNote("");
          }
        }}
        title="تحديث حالة الطلب"
        size="md"
        options={statusUpdateModal.options}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                الطلب: {selectedOrder.orderNumber}
              </h3>
              <p className="text-sm text-gray-600">
                العميل: {selectedOrder.customerInfo.name}
              </p>
              <p className="text-sm text-gray-600">
                الحالة الحالية:{" "}
                <span
                  style={{ color: getStatusColor(selectedOrder.status) }}
                  className="font-medium"
                >
                  {getStatusName(selectedOrder.status)}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة الجديدة
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-sm"
                required
              >
                <option value="">اختر الحالة الجديدة</option>
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
                onClick={handleUpdateStatus}
                disabled={!newStatus || isUpdatingStatus}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#563660] text-white font-medium rounded-lg hover:bg-[#4b2e55] transition-colors text-sm disabled:opacity-50"
              >
                {isUpdatingStatus ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {isUpdatingStatus ? "جاري التحديث..." : "تحديث الحالة"}
              </button>
              <button
                onClick={() => {
                  if (!isUpdatingStatus) {
                    statusUpdateModal.closeModal();
                    setNewStatus("");
                    setStatusNote("");
                  }
                }}
                disabled={isUpdatingStatus}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Temporary Link Modal */}
      <Modal
        isOpen={tempLinkModal.isOpen}
        shouldRender={tempLinkModal.shouldRender}
        onClose={() => {
          if (!isCreatingTempLink) {
            tempLinkModal.closeModal();
            setCreatedTempLink("");
            setTempLinkDuration(1);
          }
        }}
        title="إنشاء رابط تعديل مؤقت"
        size="md"
        options={tempLinkModal.options}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                الطلب: {selectedOrder.orderNumber}
              </h3>
              <p className="text-sm text-gray-600">
                العميل: {selectedOrder.customerInfo.name}
              </p>
            </div>

            {!createdTempLink ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مدة صلاحية الرابط (بالساعات)
                  </label>
                  <select
                    value={tempLinkDuration}
                    onChange={(e) => setTempLinkDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-sm"
                  >
                    <option value={0.5}>30 دقيقة</option>
                    <option value={1}>ساعة واحدة</option>
                    <option value={2}>ساعتان</option>
                    <option value={6}>6 ساعات</option>
                    <option value={12}>12 ساعة</option>
                    <option value={24}>24 ساعة</option>
                  </select>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-amber-800 font-medium mb-1">تنبيه:</p>
                      <ul className="text-amber-700 space-y-0.5 text-xs">
                        <li>• الرابط سيكون صالح لمدة {tempLinkDuration} ساعة فقط</li>
                        <li>• يمكن للعميل تعديل الطلب عبر هذا الرابط</li>
                        <li>• سيتم إلغاء الرابط تلقائياً بعد انتهاء المدة</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreateTempLink}
                    disabled={isCreatingTempLink}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#563660] text-white font-medium rounded-lg hover:bg-[#4b2e55] transition-colors text-sm disabled:opacity-50"
                  >
                    {isCreatingTempLink ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LinkIcon className="w-4 h-4" />
                    )}
                    {isCreatingTempLink ? "جاري الإنشاء..." : "إنشاء الرابط"}
                  </button>
                  <button
                    onClick={() => {
                      if (!isCreatingTempLink) {
                        tempLinkModal.closeModal();
                        setCreatedTempLink("");
                        setTempLinkDuration(1);
                      }
                    }}
                    disabled={isCreatingTempLink}
                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
                  >
                    إلغاء
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-medium text-green-800">
                      تم إنشاء الرابط بنجاح!
                    </h3>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 mb-1">الرابط:</p>
                        <p className="text-sm font-mono text-gray-900 break-all">
                          {createdTempLink}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(createdTempLink)}
                        className="flex-shrink-0 p-2 text-gray-500 hover:text-green-600 transition-colors"
                        title="نسخ الرابط"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">كيفية الاستخدام:</p>
                    <ul className="space-y-0.5 text-xs">
                      <li>• انسخ الرابط وأرسله للعميل</li>
                      <li>• يمكن للعميل تعديل الطلب عبر هذا الرابط</li>
                      <li>• الرابط صالح لمدة {tempLinkDuration} ساعة فقط</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <a
                    href={`https://wa.me/966536065766?text=${encodeURIComponent(
                      `مرحباً ${selectedOrder.customerInfo.name}،\n\nيمكنك تعديل طلبك رقم ${selectedOrder.orderNumber} من خلال الرابط التالي:\n\n${createdTempLink}\n\nالرابط صالح لمدة ${tempLinkDuration} ساعة فقط.\n\nشكراً لك - فريق دار الجود`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    إرسال عبر واتساب
                  </a>
                  <button
                    onClick={() => {
                      tempLinkModal.closeModal();
                      setCreatedTempLink("");
                      setTempLinkDuration(1);
                    }}
                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdersManagement;