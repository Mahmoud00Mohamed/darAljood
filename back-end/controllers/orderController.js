import OrderModel, { ORDER_STATUSES, STATUS_NAMES } from "../models/Order.js";
import OrderImageManager from "../utils/orderImageManager.js";
import TemporaryLinkModel from "../models/TemporaryLink.js";
import OrderCleanupService from "../utils/orderCleanupService.js";
import OrderImageSyncService from "../utils/orderImageSyncService.js";

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

    // نسخ الصور في الخلفية بدون انتظار (لا نريد تأخير استجابة إنشاء الطلب)
    setImmediate(async () => {
      try {
        console.log(
          `🔄 بدء نسخ صور الطلب ${newOrder.orderNumber} في الخلفية...`
        );
        const imageBackupResult = await OrderImageManager.backupOrderImages(
          newOrder
        );

        if (imageBackupResult.success) {
          console.log(`📸 ${imageBackupResult.message}`);
        } else {
          console.error(
            `❌ فشل في نسخ صور الطلب: ${imageBackupResult.message}`
          );
        }
      } catch (error) {
        console.error(
          `❌ خطأ في نسخ صور الطلب ${newOrder.orderNumber}:`,
          error
        );
      }
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

    // الحصول على التكوين القديم للمقارنة
    const orders = await OrderModel.getOrders();
    const existingOrder = orders.find((o) => o.id === orderId);

    if (!existingOrder) {
      return res.status(400).json({
        success: false,
        message: "الطلب غير موجود",
        error: "ORDER_NOT_FOUND",
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

    // الحصول على التكوين القديم للمقارنة
    const oldJacketConfig = existingOrder.items[0]?.jacketConfig;

    // مزامنة صور الطلب إذا تغير التكوين
    let imageSyncResult = null;
    if (oldJacketConfig && jacketConfig) {
      console.log(`🔄 بدء مزامنة صور الطلب ${orderId} بعد التعديل...`);
      console.log(
        `📋 التكوين القديم - عدد الشعارات: ${
          oldJacketConfig.logos?.length || 0
        }`
      );
      console.log(
        `📋 التكوين الجديد - عدد الشعارات: ${jacketConfig.logos?.length || 0}`
      );

      imageSyncResult = await OrderImageSyncService.syncOrderImages(
        orderId,
        oldJacketConfig,
        jacketConfig
      );

      if (imageSyncResult.success) {
        console.log(`✅ ${imageSyncResult.message}`);

        // طباعة تفاصيل المزامنة
        if (imageSyncResult.imageChanges) {
          console.log(`📊 تفاصيل المزامنة:`);
          console.log(
            `   🗑️ صور محذوفة: ${imageSyncResult.imageChanges.removed.length}`
          );
          console.log(
            `   ➕ صور مضافة: ${imageSyncResult.imageChanges.added.length}`
          );
          console.log(
            `   ✅ صور محتفظ بها: ${imageSyncResult.imageChanges.retained.length}`
          );
        }
      } else {
        console.error(`❌ فشل في مزامنة الصور: ${imageSyncResult.message}`);
        // نتابع العملية حتى لو فشلت المزامنة
      }
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

    // إضافة معلومات مزامنة الصور إلى الاستجابة
    const responseData = {
      success: true,
      message: "تم تحديث الطلب بنجاح",
      data: orderWithStatusNames,
    };

    // إضافة معلومات المزامنة إذا كانت متوفرة
    if (imageSyncResult) {
      responseData.imageSync = {
        success: imageSyncResult.success,
        hasChanges: imageSyncResult.hasChanges,
        message: imageSyncResult.message,
        hasWarnings: imageSyncResult.hasWarnings,
        ...(imageSyncResult.imageChanges && {
          changes: {
            removed: imageSyncResult.imageChanges.removed.length,
            added: imageSyncResult.imageChanges.added.length,
            retained: imageSyncResult.imageChanges.retained.length,
          },
        }),
      };
    }

    res.status(200).json(responseData);
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

    console.log(`🗑️ بدء عملية حذف شاملة للطلب: ${orderId}`);

    // الحصول على بيانات الطلب أولاً
    const orders = await OrderModel.getOrders();
    const orderToDelete = orders.find((o) => o.id === orderId);

    if (!orderToDelete) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على الطلب",
        error: "ORDER_NOT_FOUND",
      });
    }

    // استخدام خدمة التنظيف الشاملة
    const cleanupResult =
      await OrderCleanupService.performCompleteOrderDeletion(orderToDelete);

    // حذف الطلب من قاعدة البيانات (الخطوة الأخيرة)
    await OrderModel.deleteOrder(orderId);

    // إضافة خطوة حذف قاعدة البيانات للسجل
    cleanupResult.log.steps.push({
      step: cleanupResult.log.steps.length + 1,
      name: "حذف من قاعدة البيانات",
      startTime: new Date(),
      endTime: new Date(),
      success: true,
      details: { orderId, orderNumber: orderToDelete.orderNumber },
    });

    cleanupResult.log.summary.successfulSteps++;
    cleanupResult.log.summary.totalSteps++;

    res.status(200).json({
      success: true,
      message: cleanupResult.success
        ? `تم حذف الطلب وجميع البيانات المرتبطة به بنجاح`
        : `تم حذف الطلب مع بعض التحذيرات`,
      data: {
        orderId: orderId,
        orderNumber: orderToDelete.orderNumber,
        cleanupLog: cleanupResult.log,
        hasWarnings: cleanupResult.hasWarnings,
        summary: {
          totalSteps: cleanupResult.log.summary.totalSteps,
          successfulSteps: cleanupResult.log.summary.successfulSteps,
          failedSteps: cleanupResult.log.summary.failedSteps,
          duration: cleanupResult.log.summary.duration,
          warnings: cleanupResult.log.summary.warnings,
          errors: cleanupResult.log.summary.errors,
        },
      },
    });
  } catch (error) {
    console.error("Error deleting order:", error);

    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء حذف الطلب وبياناته المرتبطة",
      error: "DELETE_ORDER_FAILED",
    });
  }
};

// الحصول على صور الطلب (يتطلب مصادقة المدير)
export const getOrderImages = async (req, res) => {
  try {
    // التحقق الإضافي من صلاحيات المدير
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بعرض صور الطلبات",
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

    // الحصول على رقم الطلب أولاً
    const orders = await OrderModel.getOrders();
    const order = orders.find((o) => o.id === orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على الطلب",
        error: "ORDER_NOT_FOUND",
      });
    }

    const imagesInfo = await OrderImageManager.getOrderImagesInfo(
      order.orderNumber
    );

    if (!imagesInfo.success) {
      return res.status(500).json({
        success: false,
        message: "فشل في الحصول على صور الطلب",
        error: "GET_ORDER_IMAGES_FAILED",
        details: imagesInfo.error,
      });
    }

    res.status(200).json({
      success: true,
      message: "تم الحصول على صور الطلب بنجاح",
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        images: imagesInfo.images,
        totalCount: imagesInfo.totalCount,
      },
    });
  } catch (error) {
    console.error("Error getting order images:", error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء الحصول على صور الطلب",
      error: "GET_ORDER_IMAGES_FAILED",
    });
  }
};

// التحقق من تطابق صور الطلب (يتطلب مصادقة المدير)
export const validateOrderImageSync = async (req, res) => {
  try {
    // التحقق الإضافي من صلاحيات المدير
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بالتحقق من صور الطلبات",
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

    const validationResult =
      await OrderImageSyncService.validateOrderFolderSync(orderId);

    res.status(200).json({
      success: true,
      message: "تم التحقق من تطابق صور الطلب",
      data: validationResult,
    });
  } catch (error) {
    console.error("Error validating order image sync:", error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء التحقق من تطابق صور الطلب",
      error: "VALIDATE_ORDER_IMAGE_SYNC_FAILED",
    });
  }
};

// إصلاح تلقائي لتطابق صور الطلب (يتطلب مصادقة المدير)
export const autoFixOrderImageSync = async (req, res) => {
  try {
    // التحقق الإضافي من صلاحيات المدير
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بإصلاح صور الطلبات",
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

    const fixResult = await OrderImageSyncService.autoFixOrderImageSync(
      orderId
    );

    res.status(200).json({
      success: true,
      message: "تم إصلاح تطابق صور الطلب",
      data: fixResult,
    });
  } catch (error) {
    console.error("Error auto-fixing order image sync:", error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إصلاح تطابق صور الطلب",
      error: "AUTO_FIX_ORDER_IMAGE_SYNC_FAILED",
    });
  }
};

// تقرير شامل عن حالة صور جميع الطلبات (يتطلب مصادقة المدير)
export const getOrderImagesReport = async (req, res) => {
  try {
    // التحقق الإضافي من صلاحيات المدير
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بعرض تقارير صور الطلبات",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const reportResult =
      await OrderImageSyncService.generateOrderImagesReport();

    res.status(200).json({
      success: true,
      message: "تم إنشاء تقرير صور الطلبات بنجاح",
      data: reportResult,
    });
  } catch (error) {
    console.error("Error generating order images report:", error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إنشاء تقرير صور الطلبات",
      error: "GENERATE_ORDER_IMAGES_REPORT_FAILED",
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
