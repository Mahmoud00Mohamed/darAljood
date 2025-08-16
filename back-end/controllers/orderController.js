import OrderModel, { ORDER_STATUSES, STATUS_NAMES } from "../models/Order.js";

// إنشاء طلب جديد (عام - بدون مصادقة)
export const createOrder = async (req, res) => {
  try {
    const { customerInfo, items, totalPrice } = req.body;

    // التحقق من البيانات المطلوبة
    if (!customerInfo || !customerInfo.name || !customerInfo.phone) {
      return res.status(400).json({
        success: false,
        message: "معلومات العميل مطلوبة (الاسم ورقم الهاتف)",
        error: "MISSING_CUSTOMER_INFO",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "عناصر الطلب مطلوبة",
        error: "MISSING_ORDER_ITEMS",
      });
    }

    if (!totalPrice || totalPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "السعر الإجمالي مطلوب ويجب أن يكون أكبر من صفر",
        error: "INVALID_TOTAL_PRICE",
      });
    }

    const phoneRegex =
      /^(05|5|\+9665|9665|\+966[0-9]|966[0-9]|\+66[0-9]|66[0-9])[0-9]{8,10}$/;
    if (!phoneRegex.test(customerInfo.phone.replace(/[\s()-]/g, ""))) {
      return res.status(400).json({
        success: false,
        message: "رقم الهاتف غير صحيح. يجب أن يكون رقم سعودي أو تايلندي صحيح",
        error: "INVALID_PHONE_NUMBER",
      });
    }

    // إنشاء الطلب
    const newOrder = await OrderModel.createOrder({
      customerInfo: {
        name: customerInfo.name.trim(),
        phone: customerInfo.phone.trim(),
      },
      items,
      totalPrice,
    });

    res.status(201).json({
      success: true,
      message: "تم إنشاء الطلب بنجاح",
      data: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);

    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء إنشاء الطلب",
      error: "CREATE_ORDER_FAILED",
    });
  }
};

// تتبع الطلب بواسطة رمز التتبع (عام - بدون مصادقة)
export const trackOrderByCode = async (req, res) => {
  try {
    const { searchValue } = req.params;

    if (!searchValue) {
      return res.status(400).json({
        success: false,
        message: "رمز التتبع أو رقم الطلب مطلوب",
        error: "SEARCH_VALUE_REQUIRED",
      });
    }

    // تنظيف القيمة المدخلة
    const cleanSearchValue = searchValue.trim().toUpperCase();

    // تحديد نوع البحث تلقائياً
    let order = null;

    // محاولة البحث برمز التتبع أولاً
    if (/^[A-Z0-9]{8}$/.test(cleanSearchValue)) {
      order = await OrderModel.getOrderByTrackingCode(cleanSearchValue);
    }

    // إذا لم نجد نتيجة، محاولة البحث برقم الطلب
    if (!order && /^\d{9}$/.test(cleanSearchValue)) {
      order = await OrderModel.getOrderByNumber(cleanSearchValue);
    }

    // إذا لم نجد نتيجة، محاولة البحث في كلا الحقلين
    if (!order) {
      order =
        (await OrderModel.getOrderByTrackingCode(cleanSearchValue)) ||
        (await OrderModel.getOrderByNumber(cleanSearchValue));
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على طلب بهذا الرمز أو الرقم",
        error: "ORDER_NOT_FOUND",
      });
    }

    // إرجاع معلومات محدودة للعميل (بدون معلومات حساسة)
    const publicOrderInfo = {
      orderNumber: order.orderNumber,
      trackingCode: order.trackingCode,
      status: order.status,
      statusName: STATUS_NAMES[order.status],
      createdAt: order.createdAt,
      estimatedDelivery: order.estimatedDelivery,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      statusHistory: order.statusHistory.map((history) => ({
        status: history.status,
        statusName: STATUS_NAMES[history.status],
        timestamp: history.timestamp,
        note: history.note,
      })),
      totalPrice: order.totalPrice,
      itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    };

    res.status(200).json({
      success: true,
      message: "تم العثور على الطلب",
      data: publicOrderInfo,
    });
  } catch (error) {
    console.error("Error tracking order:", error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء البحث عن الطلب",
      error: "SEARCH_ORDER_FAILED",
    });
  }
};

// تتبع الطلب بواسطة رمز التتبع (للتوافق مع النسخة القديمة)
export const trackOrder = trackOrderByCode;

// الحصول على جميع الطلبات (يتطلب مصادقة المدير)
export const getAllOrders = async (req, res) => {
  try {
    // التحقق الإضافي من صلاحيات المدير
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بعرض الطلبات",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const {
      page = 1,
      limit = 20,
      status,
      search,
      dateFrom,
      dateTo,
      includePending = false, // معامل جديد لتحديد ما إذا كان يجب تضمين الطلبات قيد المراجعة
    } = req.query;

    // إعداد الفلاتر
    const filters = {};
    if (status) filters.status = status;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    // البحث والفلترة
    const allOrders = await OrderModel.searchOrders(search || "", filters);

    // فلترة الطلبات حسب معامل includePending
    const filteredOrders =
      includePending === "true"
        ? allOrders
        : allOrders.filter((order) => order.status !== "pending");

    // تطبيق pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    // إضافة أسماء الحالات
    const ordersWithStatusNames = paginatedOrders.map((order) => ({
      ...order,
      statusName: STATUS_NAMES[order.status],
      statusHistory: order.statusHistory.map((history) => ({
        ...history,
        statusName: STATUS_NAMES[history.status],
      })),
    }));

    res.status(200).json({
      success: true,
      message: "تم الحصول على الطلبات بنجاح",
      data: {
        orders: ordersWithStatusNames,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredOrders.length / parseInt(limit)),
          totalOrders: filteredOrders.length,
          hasNext: endIndex < filteredOrders.length,
          hasPrev: startIndex > 0,
        },
      },
    });
  } catch (error) {
    console.error("Error getting orders:", error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء الحصول على الطلبات",
      error: "GET_ORDERS_FAILED",
    });
  }
};

// الحصول على طلب واحد (يتطلب مصادقة المدير)
export const getOrderById = async (req, res) => {
  try {
    // التحقق الإضافي من صلاحيات المدير
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بعرض تفاصيل الطلب",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "معرف الطلب مطلوب",
        error: "ORDER_ID_REQUIRED",
      });
    }

    const orders = await OrderModel.getOrders();
    const order = orders.find((o) => o.id === orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على الطلب",
        error: "ORDER_NOT_FOUND",
      });
    }

    // إضافة أسماء الحالات
    const orderWithStatusNames = {
      ...order,
      statusName: STATUS_NAMES[order.status],
      statusHistory: order.statusHistory.map((history) => ({
        ...history,
        statusName: STATUS_NAMES[history.status],
      })),
    };

    res.status(200).json({
      success: true,
      message: "تم العثور على الطلب",
      data: orderWithStatusNames,
    });
  } catch (error) {
    console.error("Error getting order:", error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء الحصول على الطلب",
      error: "GET_ORDER_FAILED",
    });
  }
};

// تحديث بيانات الطلب (يتطلب مصادقة المدير)
export const updateOrder = async (req, res) => {
  try {
    // التحقق الإضافي من صلاحيات المدير
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بتحديث الطلب",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const { orderId } = req.params;
    const { customerInfo, jacketConfig, quantity, totalPrice } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "معرف الطلب مطلوب",
        error: "ORDER_ID_REQUIRED",
      });
    }

    // التحقق من البيانات المطلوبة
    if (!customerInfo || !jacketConfig) {
      return res.status(400).json({
        success: false,
        message: "بيانات العميل وتكوين الجاكيت مطلوبة",
        error: "MISSING_REQUIRED_DATA",
      });
    }

    const updatedOrder = await OrderModel.updateOrder(
      orderId,
      {
        customerInfo,
        jacketConfig,
        quantity: quantity || 1,
        totalPrice: totalPrice || 0,
      },
      req.admin.username
    );

    // إضافة أسماء الحالات
    const orderWithStatusNames = {
      ...updatedOrder,
      statusName: STATUS_NAMES[updatedOrder.status],
      statusHistory: updatedOrder.statusHistory.map((history) => ({
        ...history,
        statusName: STATUS_NAMES[history.status],
      })),
    };

    res.status(200).json({
      success: true,
      message: "تم تحديث الطلب بنجاح",
      data: orderWithStatusNames,
    });
  } catch (error) {
    console.error("Error updating order:", error);

    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء تحديث الطلب",
      error: "UPDATE_ORDER_FAILED",
    });
  }
};
// تحديث حالة الطلب (يتطلب مصادقة المدير)
export const updateOrderStatus = async (req, res) => {
  try {
    // التحقق الإضافي من صلاحيات المدير
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بتحديث حالة الطلب",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const { orderId } = req.params;
    const { status, note } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "معرف الطلب مطلوب",
        error: "ORDER_ID_REQUIRED",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "حالة الطلب الجديدة مطلوبة",
        error: "STATUS_REQUIRED",
      });
    }

    // التحقق من صحة الحالة
    if (!Object.values(ORDER_STATUSES).includes(status)) {
      return res.status(400).json({
        success: false,
        message: "حالة الطلب غير صحيحة",
        error: "INVALID_STATUS",
        availableStatuses: Object.values(ORDER_STATUSES),
      });
    }

    const updatedOrder = await OrderModel.updateOrderStatus(
      orderId,
      status,
      note,
      req.admin.username
    );

    // إضافة أسماء الحالات
    const orderWithStatusNames = {
      ...updatedOrder,
      statusName: STATUS_NAMES[updatedOrder.status],
      statusHistory: updatedOrder.statusHistory.map((history) => ({
        ...history,
        statusName: STATUS_NAMES[history.status],
      })),
    };

    res.status(200).json({
      success: true,
      message: "تم تحديث حالة الطلب بنجاح",
      data: orderWithStatusNames,
    });
  } catch (error) {
    console.error("Error updating order status:", error);

    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء تحديث حالة الطلب",
      error: "UPDATE_ORDER_STATUS_FAILED",
    });
  }
};

// إضافة ملاحظة للطلب (يتطلب مصادقة المدير)
export const addOrderNote = async (req, res) => {
  try {
    // التحقق الإضافي من صلاحيات المدير
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بإضافة ملاحظات للطلب",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const { orderId } = req.params;
    const { note } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "معرف الطلب مطلوب",
        error: "ORDER_ID_REQUIRED",
      });
    }

    if (!note || !note.trim()) {
      return res.status(400).json({
        success: false,
        message: "نص الملاحظة مطلوب",
        error: "NOTE_REQUIRED",
      });
    }

    const updatedOrder = await OrderModel.addOrderNote(
      orderId,
      note.trim(),
      req.admin.username
    );

    res.status(200).json({
      success: true,
      message: "تم إضافة الملاحظة بنجاح",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error adding order note:", error);

    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء إضافة الملاحظة",
      error: "ADD_NOTE_FAILED",
    });
  }
};

// الحصول على إحصائيات الطلبات (يتطلب مصادقة المدير)
export const getOrderStats = async (req, res) => {
  try {
    // التحقق الإضافي من صلاحيات المدير
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بعرض إحصائيات الطلبات",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const stats = await OrderModel.getOrderStats();

    res.status(200).json({
      success: true,
      message: "تم الحصول على الإحصائيات بنجاح",
      data: stats,
    });
  } catch (error) {
    console.error("Error getting order stats:", error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء الحصول على الإحصائيات",
      error: "GET_STATS_FAILED",
    });
  }
};

// حذف طلب (يتطلب مصادقة المدير)
export const deleteOrder = async (req, res) => {
  try {
    // التحقق الإضافي من صلاحيات المدير
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بحذف الطلبات",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "معرف الطلب مطلوب",
        error: "ORDER_ID_REQUIRED",
      });
    }

    await OrderModel.deleteOrder(orderId);

    res.status(200).json({
      success: true,
      message: "تم حذف الطلب بنجاح",
      data: { orderId },
    });
  } catch (error) {
    console.error("Error deleting order:", error);

    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء حذف الطلب",
      error: "DELETE_ORDER_FAILED",
    });
  }
};

// الحصول على حالات الطلب المتاحة (عام)
export const getOrderStatuses = async (req, res) => {
  try {
    const statuses = Object.entries(STATUS_NAMES).map(([key, name]) => ({
      value: key,
      name,
      color: require("../models/Order.js").STATUS_COLORS[key],
    }));

    res.status(200).json({
      success: true,
      message: "تم الحصول على حالات الطلب بنجاح",
      data: statuses,
    });
  } catch (error) {
    console.error("Error getting order statuses:", error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء الحصول على حالات الطلب",
      error: "GET_STATUSES_FAILED",
    });
  }
};
