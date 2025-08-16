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
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
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
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<OrderData | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showStatsDetails, setShowStatsDetails] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isCreatingLink, setIsCreatingLink] = useState<string | null>(null);

  const orderDetailsModal = useModal();
  const deleteOrderModal = useModal();
  const updateStatusModal = useModal();
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

  const handleCreateTemporaryLink = async (orderId: string) => {
    setIsCreatingLink(orderId);
    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      const linkData = await temporaryLinkService.createTemporaryLink(
        orderId,
        1, // ساعة واحدة افتراضياً
        token
      );

      // نسخ الرابط إلى الحافظة
      await navigator.clipboard.writeText(linkData.fullUrl);
      setCopiedLink(true);
      setSaveMessage("تم إنشاء الرابط المؤقت ونسخه إلى الحافظة بنجاح");
      
      setTimeout(() => {
        setSaveMessage("");
        setCopiedLink(false);
      }, 3000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "فشل في إنشاء الرابط المؤقت"
      );
    } finally {
      setIsCreatingLink(null);
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
      setSelectedOrder(null);
      setNewStatus("");
      setStatusNote("");
      updateStatusModal.closeModal();
      setTimeout(() => setSaveMessage(""), 3000);
      loadStats();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "فشل في تحديث حالة الطلب"
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      await orderService.deleteOrder(orderToDelete.id, token);
      setOrders((prev) => prev.filter((order) => order.id !== orderToDelete.id));
      setSaveMessage("تم حذف الطلب بنجاح");
      setOrderToDelete(null);
      deleteOrderModal.closeModal();
      setTimeout(() => setSaveMessage(""), 3000);
      loadStats();
    } catch (error) {
      setError(error instanceof Error ? error.message : "فشل في حذف الطلب");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.phone.includes(searchTerm);

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPendingFilter = showPendingOnly ? order.status !== "pending" : true;

    return matchesSearch && matchesStatus && matchesPendingFilter;
  });

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

          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">قيد المراجعة</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">الإيرادات</p>
                <p className="text-lg font-bold">
                  {formatPrice(stats.totalRevenue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-200" />
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
                placeholder="البحث في الطلبات..."
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

            <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <input
                type="checkbox"
                checked={showPendingOnly}
                onChange={(e) => setShowPendingOnly(e.target.checked)}
                className="rounded border-gray-300 text-[#563660] focus:ring-[#563660]"
              />
              <span>إخفاء قيد المراجعة</span>
            </label>
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
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
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-400" />
                          {order.customerInfo.name}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {order.customerInfo.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                        style={{
                          backgroundColor: getStatusColor(order.status) + "20",
                          borderColor: getStatusColor(order.status) + "40",
                          color: getStatusColor(order.status),
                        }}
                      >
                        {order.statusName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(order.totalPrice)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} قطعة
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        آخر تحديث: {formatDate(order.updatedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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

                        <button
                          onClick={() => handleCreateTemporaryLink(order.id)}
                          disabled={isCreatingLink === order.id}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                          title="إنشاء رابط مؤقت"
                        >
                          {isCreatingLink === order.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : copiedLink ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <LinkIcon className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewStatus(order.status);
                            updateStatusModal.openModal();
                          }}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="تحديث الحالة"
                        >
                          <RefreshCw className="w-4 h-4" />
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
        title="تفاصيل الطلب"
        size="lg"
        options={orderDetailsModal.options}
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    معلومات الطلب
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">رقم الطلب:</span>
                      <span className="text-sm font-medium">
                        {selectedOrder.orderNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">رمز التتبع:</span>
                      <span className="text-sm font-mono font-medium">
                        {selectedOrder.trackingCode}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">الحالة:</span>
                      <span
                        className="text-sm font-medium px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: getStatusColor(selectedOrder.status) + "20",
                          color: getStatusColor(selectedOrder.status),
                        }}
                      >
                        {selectedOrder.statusName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">السعر:</span>
                      <span className="text-sm font-medium">
                        {formatPrice(selectedOrder.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    معلومات العميل
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">الاسم:</span>
                      <span className="text-sm font-medium">
                        {selectedOrder.customerInfo.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">الهاتف:</span>
                      <span className="text-sm font-medium">
                        {selectedOrder.customerInfo.phone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  تاريخ الحالات
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-3">
                    {selectedOrder.statusHistory
                      .slice()
                      .reverse()
                      .map((history, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div
                            className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                            style={{
                              backgroundColor: getStatusColor(history.status),
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">
                                {history.statusName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(history.timestamp)}
                              </span>
                            </div>
                            {history.note && (
                              <p className="text-xs text-gray-600 mt-1">
                                {history.note}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Link
                to={`/admin/orders/${selectedOrder.id}/edit`}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#563660] text-white font-medium rounded-lg hover:bg-[#4b2e55] transition-colors text-sm"
              >
                <Edit3 className="w-4 h-4" />
                تعديل الطلب
              </Link>
              <button
                onClick={() => {
                  orderDetailsModal.closeModal();
                  setNewStatus(selectedOrder.status);
                  updateStatusModal.openModal();
                }}
                className="flex-1 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                تحديث الحالة
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={updateStatusModal.isOpen}
        shouldRender={updateStatusModal.shouldRender}
        onClose={() => {
          updateStatusModal.closeModal();
          setSelectedOrder(null);
          setNewStatus("");
          setStatusNote("");
        }}
        title="تحديث حالة الطلب"
        size="md"
        options={updateStatusModal.options}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                معلومات الطلب
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">رقم الطلب:</span>
                  <span className="font-medium">{selectedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">العميل:</span>
                  <span className="font-medium">
                    {selectedOrder.customerInfo.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الحالة الحالية:</span>
                  <span
                    className="font-medium px-2 py-1 rounded-full text-xs"
                    style={{
                      backgroundColor: getStatusColor(selectedOrder.status) + "20",
                      color: getStatusColor(selectedOrder.status),
                    }}
                  >
                    {selectedOrder.statusName}
                  </span>
                </div>
              </div>
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
                disabled={isUpdatingStatus || !newStatus}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#563660] text-white font-medium rounded-lg hover:bg-[#4b2e55] transition-colors text-sm disabled:opacity-50"
              >
                {isUpdatingStatus ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                تحديث الحالة
              </button>
              <button
                onClick={() => {
                  updateStatusModal.closeModal();
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
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteOrderModal.isOpen}
        onClose={() => {
          deleteOrderModal.closeModal();
          setOrderToDelete(null);
        }}
        onConfirm={handleDeleteOrder}
        title="تأكيد حذف الطلب"
        message={`هل أنت متأكد من حذف الطلب "${orderToDelete?.orderNumber}"؟ سيتم حذفه نهائياً ولن يمكن التراجع عن هذا الإجراء.`}
        confirmText="نعم، احذف"
        cancelText="إلغاء"
        type="danger"
      />
    </div>
  );
};

export default OrdersManagement;