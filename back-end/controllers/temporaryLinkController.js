import TemporaryLinkModel from "../models/TemporaryLink.js";
import OrderModel from "../models/Order.js";
import { STATUS_NAMES } from "../models/Order.js";
import OrderImageSyncService from "../utils/orderImageSyncService.js";

// إنشاء رابط مؤقت لتعديل الطلب (يتطلب مصادقة المدير)
export const createTemporaryLink = async (req, res) => {
  try {
    // التحقق الإضافي من صلاحيات المدير
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بإنشاء روابط مؤقتة",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const { orderId } = req.params;
    const { durationHours = 1 } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "معرف الطلب مطلوب",
        error: "ORDER_ID_REQUIRED",
      });
    }

    // التحقق من وجود الطلب
    const orders = await OrderModel.getOrders();
    const order = orders.find((o) => o.id === orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على الطلب",
        error: "ORDER_NOT_FOUND",
      });
    }

    // التحقق من صحة مدة الصلاحية
    if (durationHours < 0.5 || durationHours > 24) {
      return res.status(400).json({
        success: false,
        message: "مدة الصلاحية يجب أن تكون بين 30 دقيقة و 24 ساعة",
        error: "INVALID_DURATION",
      });
    }

    // إنشاء الرابط المؤقت
    const temporaryLink = await TemporaryLinkModel.createTemporaryLink(
      orderId,
      req.admin?.username || "admin",
      durationHours
    );

    // إنشاء الرابط الكامل
    const baseUrl =
      process.env.FRONTEND_URL || "https://dar-algood.netlify.app";
    const fullUrl = `${baseUrl}/edit-order/${temporaryLink.token}`;

    res.status(201).json({
      success: true,
      message: "تم إنشاء الرابط المؤقت بنجاح",
      data: {
        ...temporaryLink,
        fullUrl,
        expiresIn: `${durationHours} ساعة`,
        validUntil: temporaryLink.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error creating temporary link:", error);

    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء إنشاء الرابط المؤقت",
      error: "CREATE_TEMPORARY_LINK_FAILED",
    });
  }
};

// التحقق من صحة الرابط المؤقت (عام - بدون مصادقة)
export const validateTemporaryLink = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "رمز الرابط مطلوب",
        error: "TOKEN_REQUIRED",
      });
    }

    // الحصول على معلومات إضافية للتتبع
    const userAgent = req.get("User-Agent") || "";
    const ipAddress = req.ip || req.connection.remoteAddress || "";

    const validation = await TemporaryLinkModel.validateTemporaryLink(
      token,
      userAgent,
      ipAddress
    );

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        error: validation.reason,
      });
    }

    // الحصول على بيانات الطلب
    const orders = await OrderModel.getOrders();
    const order = orders.find((o) => o.id === validation.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على الطلب المرتبط بالرابط",
        error: "ORDER_NOT_FOUND",
      });
    }

    res.status(200).json({
      success: true,
      message: "الرابط صحيح وصالح للاستخدام",
      data: {
        orderId: validation.orderId,
        orderNumber: order.orderNumber,
        customerInfo: order.customerInfo,
        link: validation.link,
        remainingTime: Math.max(
          0,
          Math.floor(
            (new Date(validation.link.expiresAt).getTime() - Date.now()) /
              (1000 * 60)
          )
        ), // بالدقائق
      },
    });
  } catch (error) {
    console.error("Error validating temporary link:", error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء التحقق من الرابط",
      error: "VALIDATION_FAILED",
    });
  }
};

// الحصول على بيانات الطلب عبر الرابط المؤقت (عام - بدون مصادقة)
export const getOrderByTemporaryLink = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "رمز الرابط مطلوب",
        error: "TOKEN_REQUIRED",
      });
    }

    // التحقق من صحة الرابط
    const userAgent = req.get("User-Agent") || "";
    const ipAddress = req.ip || req.connection.remoteAddress || "";

    const validation = await TemporaryLinkModel.validateTemporaryLink(
      token,
      userAgent,
      ipAddress
    );

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        error: validation.reason,
      });
    }

    // الحصول على بيانات الطلب
    const orders = await OrderModel.getOrders();
    const order = orders.find((o) => o.id === validation.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على الطلب",
        error: "ORDER_NOT_FOUND",
      });
    }

    // إرجاع بيانات الطلب مع معلومات الرابط
    res.status(200).json({
      success: true,
      message: "تم الحصول على بيانات الطلب بنجاح",
      data: {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          trackingCode: order.trackingCode,
          customerInfo: order.customerInfo,
          items: order.items,
          totalPrice: order.totalPrice,
          status: order.status,
          statusName: order.statusName,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
        linkInfo: {
          token: validation.link.token,
          expiresAt: validation.link.expiresAt,
          remainingTime: Math.max(
            0,
            Math.floor(
              (new Date(validation.link.expiresAt).getTime() - Date.now()) /
                (1000 * 60)
            )
          ),
          accessCount: validation.link.accessCount,
        },
      },
    });
  } catch (error) {
    console.error("Error getting order by temporary link:", error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء الحصول على بيانات الطلب",
      error: "GET_ORDER_FAILED",
    });
  }
};

// تحديث الطلب عبر الرابط المؤقت (عام - بدون مصادقة)
export const updateOrderByTemporaryLink = async (req, res) => {
  try {
    const { token } = req.params;
    const { customerInfo, jacketConfig, quantity, totalPrice } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "رمز الرابط مطلوب",
        error: "TOKEN_REQUIRED",
      });
    }

    // التحقق من صحة الرابط
    const userAgent = req.get("User-Agent") || "";
    const ipAddress = req.ip || req.connection.remoteAddress || "";

    const validation = await TemporaryLinkModel.validateTemporaryLink(
      token,
      userAgent,
      ipAddress
    );

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        error: validation.reason,
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
    const orders = await OrderModel.getOrders();
    const existingOrder = orders.find((o) => o.id === validation.orderId);
    const oldJacketConfig = existingOrder?.items?.[0]?.jacketConfig;

    // مزامنة صور الطلب إذا تغير التكوين
    let imageSyncResult = null;
    if (oldJacketConfig && jacketConfig) {
      console.log(
        `🔄 بدء مزامنة صور الطلب ${validation.orderId} عبر الرابط المؤقت...`
      );
      console.log(
        `📋 التكوين القديم - عدد الشعارات: ${
          oldJacketConfig.logos?.length || 0
        }`
      );
      console.log(
        `📋 التكوين الجديد - عدد الشعارات: ${jacketConfig.logos?.length || 0}`
      );

      imageSyncResult = await OrderImageSyncService.syncOrderImages(
        validation.orderId,
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

    // تحديث الطلب
    const updatedOrder = await OrderModel.updateOrder(
      validation.orderId,
      {
        customerInfo,
        jacketConfig,
        quantity: quantity || 1,
        totalPrice: totalPrice || 0,
      },
      "customer_via_temp_link"
    );

    // لا نقوم بتعيين الرابط كمستخدم - نتركه صالح حتى انتهاء المدة المحددة
    // فقط نحديث عدد مرات الوصول
    await TemporaryLinkModel.incrementAccessCount(token);

    // إعداد الاستجابة
    const responseData = {
      success: true,
      message: "تم تحديث الطلب بنجاح",
      data: {
        order: {
          ...updatedOrder,
          statusHistory: updatedOrder.statusHistory.map((history) => ({
            ...history,
            statusName: STATUS_NAMES[history.status],
          })),
        },
        linkUsed: false, // الرابط لا يزال صالحاً
        remainingTime: Math.max(
          0,
          Math.floor(
            (new Date(validation.link.expiresAt).getTime() - Date.now()) /
              (1000 * 60)
          )
        ), // الوقت المتبقي بالدقائق
      },
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
    console.error("Error updating order by temporary link:", error);

    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء تحديث الطلب",
      error: "UPDATE_ORDER_FAILED",
    });
  }
};

// الحصول على الروابط المؤقتة لطلب معين (يتطلب مصادقة المدير)
export const getOrderTemporaryLinks = async (req, res) => {
  try {
    // التحقق الإضافي من صلاحيات المدير
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بعرض الروابط المؤقتة",
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

    const links = await TemporaryLinkModel.getOrderLinks(orderId);

    // إضافة الرابط الكامل لكل رابط
    const baseUrl =
      process.env.FRONTEND_URL || "https://dar-algood.netlify.app";
    const linksWithUrls = links.map((link) => ({
      ...link,
      fullUrl: `${baseUrl}/edit-order/${link.token}`,
      isExpired: new Date(link.expiresAt) < new Date(),
      remainingTime: Math.max(
        0,
        Math.floor(
          (new Date(link.expiresAt).getTime() - Date.now()) / (1000 * 60)
        )
      ),
    }));

    res.status(200).json({
      success: true,
      message: "تم الحصول على الروابط المؤقتة بنجاح",
      data: linksWithUrls,
    });
  } catch (error) {
    console.error("Error getting order temporary links:", error);

    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء الحصول على الروابط المؤقتة",
      error: "GET_TEMPORARY_LINKS_FAILED",
    });
  }
};

// إلغاء رابط مؤقت (يتطلب مصادقة المدير)
export const invalidateTemporaryLink = async (req, res) => {
  try {
    // التحقق الإضافي من صلاحيات المدير
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بإلغاء الروابط المؤقتة",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "رمز الرابط مطلوب",
        error: "TOKEN_REQUIRED",
      });
    }

    const updatedLink = await TemporaryLinkModel.markLinkAsUsed(token);

    res.status(200).json({
      success: true,
      message: "تم إلغاء الرابط المؤقت بنجاح",
      data: updatedLink,
    });
  } catch (error) {
    console.error("Error invalidating temporary link:", error);

    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء إلغاء الرابط المؤقت",
      error: "INVALIDATE_LINK_FAILED",
    });
  }
};

// الحصول على إحصائيات الروابط المؤقتة (يتطلب مصادقة المدير)
export const getTemporaryLinkStats = async (req, res) => {
  try {
    // التحقق الإضافي من صلاحيات المدير
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بعرض إحصائيات الروابط المؤقتة",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const stats = await TemporaryLinkModel.getLinkStats();

    res.status(200).json({
      success: true,
      message: "تم الحصول على الإحصائيات بنجاح",
      data: stats,
    });
  } catch (error) {
    console.error("Error getting temporary link stats:", error);

    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء الحصول على الإحصائيات",
      error: "GET_STATS_FAILED",
    });
  }
};

// تنظيف الروابط المنتهية الصلاحية (يتطلب مصادقة المدير)
export const cleanupExpiredLinks = async (req, res) => {
  try {
    // التحقق الإضافي من صلاحيات المدير
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بتنظيف الروابط المؤقتة",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const deletedCount = await TemporaryLinkModel.cleanupExpiredLinks();

    res.status(200).json({
      success: true,
      message: `تم حذف ${deletedCount} رابط منتهي الصلاحية`,
      data: { deletedCount },
    });
  } catch (error) {
    console.error("Error cleaning up expired links:", error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تنظيف الروابط المنتهية الصلاحية",
      error: "CLEANUP_FAILED",
    });
  }
};
