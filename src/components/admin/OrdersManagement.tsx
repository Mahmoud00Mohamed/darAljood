import React, { useState, useEffect, useCallback } from "react";
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
  ExternalLink,
  Link as LinkIcon,
  Copy,
  Check,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
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
  const [pendingOrders, setPendingOrders] = useState<OrderData[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"confirmed" | "pending">("confirmed");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<OrderData | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [newNote, setNewNote] = useState("");
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [linkDuration, setLinkDuration] = useState(1);
  const [createdLink, setCreatedLink] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const viewOrderModal = useModal();
  const deleteOrderModal = useModal();
  const updateStatusModal = useModal();
  const addNoteModal = useModal();
  const linkCreatedModal = useModal();

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

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      const data = await orderService.getAllOrders(token, {
        includePending: false,
      });
      setOrders(data.orders);
    } catch (error) {
      setError(error instanceof Error ? error.message : "فشل في تحميل الطلبات");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPendingOrders = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      const data = await orderService.getAllOrders(token, {
        includePending: true,
      });
      setPendingOrders(data.orders.filter(order => order.status === "pending"));
    } catch (error) {
      setError(error instanceof Error ? error.message : "فشل في تحميل الطلبات قيد المراجعة");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      const statsData = await orderService.getOrderStats(token);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadOrders();
    loadPendingOrders();
  }, [loadStats, loadOrders, loadPendingOrders]);

  useEffect(() => {
    if (activeTab === "confirmed") {
      loadOrders();
    }
  }, [activeTab, loadOrders]);

  useEffect(() => {
    if (activeTab === "pending") {
      loadPendingOrders();
    }
  }, [activeTab, loadPendingOrders]);

  const handleUpdateStatus = async () => {
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

      setPendingOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrder.id ? updatedOrder : order
        )
      );

      setSaveMessage("تم تحديث حالة الطلب بنجاح");
      setNewStatus("");
      setStatusNote("");
      setSelectedOrder(null);
      updateStatusModal.closeModal();
      setTimeout(() => setSaveMessage(""), 3000);
      loadStats();
    } catch (error) {
      setError(error instanceof Error ? error.message : "فشل في تحديث الحالة");
    }
  };

  const handleAddNote = async () => {
    if (!selectedOrder || !newNote.trim()) return;

    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      const updatedOrder = await orderService.addOrderNote(
        selectedOrder.id,
        newNote,
        token
      );

      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrder.id ? updatedOrder : order
        )
      );

      setPendingOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrder.id ? updatedOrder : order
        )
      );

      setSaveMessage("تم إضافة الملاحظة بنجاح");
      setNewNote("");
      setSelectedOrder(null);
      addNoteModal.closeModal();
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "فشل في إضافة الملاحظة");
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      await orderService.deleteOrder(orderToDelete.id, token);

      setOrders((prev) => prev.filter((order) => order.id !== orderToDelete.id));
      setPendingOrders((prev) => prev.filter((order) => order.id !== orderToDelete.id));

      setSaveMessage("تم حذف الطلب بنجاح");
      setOrderToDelete(null);
      deleteOrderModal.closeModal();
      setTimeout(() => setSaveMessage(""), 3000);
      loadStats();
    } catch (error) {
      setError(error instanceof Error ? error.message : "فشل في حذف الطلب");
    }
  };

  const handleCreateTemporaryLink = async (order: OrderData) => {
    setIsCreatingLink(true);
    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      const linkData = await temporaryLinkService.createTemporaryLink(
        order.id,
        linkDuration,
        token
      );

      setCreatedLink(linkData.fullUrl);
      linkCreatedModal.openModal();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "فشل في إنشاء الرابط المؤقت"
      );
    } finally {
      setIsCreatingLink(false);
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

  const currentOrders = activeTab === "confirmed" ? orders : pendingOrders;

  const filteredOrders = currentOrders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

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
            onClick={() => {
              loadOrders();
              loadPendingOrders();
              loadStats();
            }}
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
                <p className="text-blue-100 text-xs">جميع الطلبات</p>
              </div>
              <Package className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">تم التسليم</p>
                <p className="text-2xl font-bold">{stats.delivered}</p>
                <p className="text-green-100 text-xs">طلب مكتمل</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">قيد المراجعة</p>
                <p className="text-2xl font-bold">{stats.pendingReview.total}</p>
                <p className="text-amber-100 text-xs">يحتاج مراجعة</p>
              </div>
              <Clock className="w-8 h-8 text-amber-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">الإيرادات</p>
                <p className="text-2xl font-bold">
                  {Math.round(stats.totalRevenue).toLocaleString()}
                </p>
                <p className="text-purple-100 text-xs">ريال سعودي</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-1">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("confirmed")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all text-sm ${
              activeTab === "confirmed"
                ? "bg-[#563660] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            الطلبات المؤكدة ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all text-sm ${
              activeTab === "pending"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Clock className="w-4 h-4" />
            قيد المراجعة ({pendingOrders.length})
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث برقم الطلب، رمز التتبع، اسم العميل، أو رقم الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-sm bg-white"
              >
                <option value="all">جميع الحالات</option>
                {availableStatuses
                  .filter((status) =>
                    activeTab === "confirmed"
                      ? status.value !== "pending"
                      : status.value === "pending"
                  )
                  .map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
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
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    معلومات الطلب
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    العميل
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    السعر
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{order.orderNumber}
                        </div>
                        <div className="text-sm text-gray-500 font-mono">
                          {order.trackingCode}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-400" />
                          {order.customerInfo.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {order.customerInfo.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(order.totalPrice)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} قطعة
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            viewOrderModal.openModal();
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <Link
                          to={`/admin/orders/${order.id}/edit`}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleCreateTemporaryLink(order)}
                          disabled={isCreatingLink}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                          title="إنشاء رابط تعديل مؤقت"
                        >
                          {isCreatingLink ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <LinkIcon className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setOrderToDelete(order);
                            deleteOrderModal.openModal();
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          <p className="text-sm text-gray-600 mb-4">
            {activeTab === "confirmed"
              ? "لا توجد طلبات مؤكدة حالياً"
              : "لا توجد طلبات قيد المراجعة"}
          </p>
        </div>
      )}

      {/* View Order Modal */}
      <Modal
        isOpen={viewOrderModal.isOpen}
        shouldRender={viewOrderModal.shouldRender}
        onClose={viewOrderModal.closeModal}
        title="تفاصيل الطلب"
        size="lg"
        options={viewOrderModal.options}
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
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
                    <div className="flex justify-between">
                      <span className="text-gray-600">الإجمالي:</span>
                      <span className="font-medium">
                        {formatPrice(selectedOrder.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    معلومات العميل
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{selectedOrder.customerInfo.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedOrder.customerInfo.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                عناصر الطلب
              </h3>
              <div className="space-y-4">
                {selectedOrder.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">
                        جاكيت مخصص {index + 1}
                      </h4>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-[#563660]">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        <div className="text-sm text-gray-600">
                          الكمية: {item.quantity}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">المقاس:</span>
                        <span className="mr-2">{item.jacketConfig.size}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">لون الجسم:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{
                              backgroundColor: item.jacketConfig.colors.body,
                            }}
                          />
                          <span>{item.jacketConfig.colors.body}</span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">لون الأكمام:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{
                              backgroundColor: item.jacketConfig.colors.sleeves,
                            }}
                          />
                          <span>{item.jacketConfig.colors.sleeves}</span>
                        </div>
                      </div>
                    </div>

                    {(item.jacketConfig.logos.length > 0 ||
                      item.jacketConfig.texts.length > 0) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap gap-2">
                          {item.jacketConfig.logos.length > 0 && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {item.jacketConfig.logos.length} شعار
                            </span>
                          )}
                          {item.jacketConfig.texts.length > 0 && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {item.jacketConfig.texts.length} نص
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Status History */}
            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  تاريخ الحالات
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedOrder.statusHistory
                    .slice()
                    .reverse()
                    .map((history, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div
                          className="w-3 h-3 rounded-full mt-1"
                          style={{ backgroundColor: getStatusColor(history.status) }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900">
                              {history.statusName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(history.timestamp)}
                            </span>
                          </div>
                          {history.note && (
                            <p className="text-sm text-gray-600">{history.note}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            بواسطة: {history.updatedBy}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  viewOrderModal.closeModal();
                  setNewStatus(selectedOrder.status);
                  updateStatusModal.openModal();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Activity className="w-4 h-4" />
                تحديث الحالة
              </button>

              <button
                onClick={() => {
                  viewOrderModal.closeModal();
                  addNoteModal.openModal();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                إضافة ملاحظة
              </button>

              <Link
                to={`/admin/orders/${selectedOrder.id}/edit`}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-[#563660] text-white rounded-lg hover:bg-[#4b2e55] transition-colors text-sm"
                onClick={viewOrderModal.closeModal}
              >
                <Edit3 className="w-4 h-4" />
                تعديل الطلب
              </Link>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={updateStatusModal.isOpen}
        shouldRender={updateStatusModal.shouldRender}
        onClose={updateStatusModal.closeModal}
        title="تحديث حالة الطلب"
        size="md"
        options={updateStatusModal.options}
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
              onClick={handleUpdateStatus}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-[#563660] text-white font-medium rounded-lg hover:bg-[#4b2e55] transition-colors text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              تحديث الحالة
            </button>
            <button
              onClick={updateStatusModal.closeModal}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Note Modal */}
      <Modal
        isOpen={addNoteModal.isOpen}
        shouldRender={addNoteModal.shouldRender}
        onClose={addNoteModal.closeModal}
        title="إضافة ملاحظة"
        size="md"
        options={addNoteModal.options}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الملاحظة
            </label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all resize-none text-sm"
              placeholder="اكتب ملاحظتك هنا..."
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-[#563660] text-white font-medium rounded-lg hover:bg-[#4b2e55] transition-colors text-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              إضافة الملاحظة
            </button>
            <button
              onClick={addNoteModal.closeModal}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>

      {/* Link Created Modal */}
      <Modal
        isOpen={linkCreatedModal.isOpen}
        shouldRender={linkCreatedModal.shouldRender}
        onClose={linkCreatedModal.closeModal}
        title="تم إنشاء الرابط المؤقت"
        size="md"
        options={linkCreatedModal.options}
      >
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">
                تم إنشاء الرابط بنجاح!
              </span>
            </div>
            <p className="text-sm text-green-700">
              يمكن للعميل استخدام هذا الرابط لتعديل طلبه لمدة {linkDuration} ساعة
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الرابط المؤقت
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={createdLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm font-mono"
              />
              <button
                onClick={() => copyToClipboard(createdLink)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="نسخ"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="text-amber-800 font-medium mb-1">تنبيه:</p>
                <ul className="text-amber-700 space-y-1">
                  <li>• الرابط صالح لمدة {linkDuration} ساعة فقط</li>
                  <li>• يمكن استخدامه مرة واحدة فقط</li>
                  <li>• أرسل الرابط للعميل عبر واتساب أو الإيميل</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                const whatsappMessage = `مرحباً، يمكنك تعديل طلبك رقم ${selectedOrder?.orderNumber} من خلال الرابط التالي:\n\n${createdLink}\n\nالرابط صالح لمدة ${linkDuration} ساعة فقط.`;
                const whatsappUrl = `https://wa.me/${selectedOrder?.customerInfo.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`;
                window.open(whatsappUrl, "_blank");
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              إرسال عبر واتساب
            </button>
            <button
              onClick={linkCreatedModal.closeModal}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              إغلاق
            </button>
          </div>
        </div>
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
        message={`هل أنت متأكد من حذف الطلب رقم "${orderToDelete?.orderNumber}"؟ سيتم حذفه نهائياً ولن يمكن التراجع عن هذا الإجراء.`}
        confirmText="نعم، احذف"
        cancelText="إلغاء"
        type="danger"
      />
    </div>
  );
};

export default OrdersManagement;