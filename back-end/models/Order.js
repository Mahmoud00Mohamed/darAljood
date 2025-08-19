import OrderSchema from "./schemas/OrderSchema.js";

// حالات الطلب المتاحة
export const ORDER_STATUSES = {
  PENDING: "pending", // قيد المراجعة
  CONFIRMED: "confirmed", // تم التأكيد
  IN_PRODUCTION: "in_production", // قيد التنفيذ
  QUALITY_CHECK: "quality_check", // فحص الجودة
  READY_TO_SHIP: "ready_to_ship", // جاهز للشحن
  SHIPPED: "shipped", // تم الشحن
  DELIVERED: "delivered", // تم التسليم
  CANCELLED: "cancelled", // ملغي
  RETURNED: "returned", // مُرجع
};

// أسماء الحالات بالعربية
export const STATUS_NAMES = {
  [ORDER_STATUSES.PENDING]: "قيد المراجعة",
  [ORDER_STATUSES.CONFIRMED]: "تم التأكيد",
  [ORDER_STATUSES.IN_PRODUCTION]: "قيد التنفيذ",
  [ORDER_STATUSES.QUALITY_CHECK]: "فحص الجودة",
  [ORDER_STATUSES.READY_TO_SHIP]: "جاهز للشحن",
  [ORDER_STATUSES.SHIPPED]: "تم الشحن",
  [ORDER_STATUSES.DELIVERED]: "تم التسليم",
  [ORDER_STATUSES.CANCELLED]: "ملغي",
  [ORDER_STATUSES.RETURNED]: "مُرجع",
};

// ألوان الحالات
export const STATUS_COLORS = {
  [ORDER_STATUSES.PENDING]: "#f59e0b",
  [ORDER_STATUSES.CONFIRMED]: "#3b82f6",
  [ORDER_STATUSES.IN_PRODUCTION]: "#8b5cf6",
  [ORDER_STATUSES.QUALITY_CHECK]: "#06b6d4",
  [ORDER_STATUSES.READY_TO_SHIP]: "#10b981",
  [ORDER_STATUSES.SHIPPED]: "#059669",
  [ORDER_STATUSES.DELIVERED]: "#16a34a",
  [ORDER_STATUSES.CANCELLED]: "#ef4444",
  [ORDER_STATUSES.RETURNED]: "#f97316",
};

class OrderModel {
  /**
   * توليد رقم طلب فريد وبسيط
   */
  generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    // استخدام آخر 6 أرقام من timestamp + 3 أرقام عشوائية
    const orderNumber = `${timestamp.toString().slice(-6)}${random
      .toString()
      .padStart(3, "0")}`;
    return orderNumber;
  }

  /**
   * توليد رمز تتبع فريد
   */
  generateTrackingCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * إنشاء طلب جديد
   */
  async createOrder(orderData) {
    try {
      const orderNumber = this.generateOrderNumber();
      const trackingCode = this.generateTrackingCode();

      const newOrder = new OrderSchema({
        id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        orderNumber,
        trackingCode,
        customerInfo: {
          name: orderData.customerInfo.name,
          phone: orderData.customerInfo.phone,
        },
        items: orderData.items.map((item) => ({
          id: item.id,
          jacketConfig: item.jacketConfig,
          quantity: item.quantity,
          price: item.price,
        })),
        totalPrice: orderData.totalPrice,
        status: ORDER_STATUSES.PENDING,
        statusHistory: [
          {
            status: ORDER_STATUSES.PENDING,
            timestamp: new Date(),
            note: "تم إنشاء الطلب",
            updatedBy: "system",
          },
        ],
        estimatedDelivery: this.calculateEstimatedDelivery(),
        notes: [],
        backupImages: [],
      });

      const savedOrder = await newOrder.save();

      return {
        ...savedOrder.toObject(),
        _id: undefined,
      };
    } catch (error) {
      throw new Error("فشل في إنشاء الطلب");
    }
  }

  /**
   * تحديث معلومات الصور المنسوخة للطلب باستخدام معرف الطلب
   */
  async updateOrderBackupImages(orderId, backupImagesInfo) {
    try {
      const order = await OrderSchema.findOne({ id: orderId });

      if (!order) {
        throw new Error("الطلب غير موجود");
      }

      order.backupImages = backupImagesInfo.map((info) => ({
        originalPublicId: info.originalPublicId,
        backupPublicId: info.newPublicId,
        backupUrl: info.newUrl,
        copiedAt: new Date(),
        size: info.size,
        format: info.format,
      }));

      order.updatedAt = new Date();

      const updatedOrder = await order.save();

      return {
        ...updatedOrder.toObject(),
        _id: undefined,
      };
    } catch (error) {
      throw new Error("فشل في تحديث معلومات الصور المنسوخة");
    }
  }
  /**
   * الحصول على طلب بواسطة رقم الطلب
   */
  async getOrderByNumber(orderNumber) {
    try {
      const order = await OrderSchema.findOne({ orderNumber }).lean();

      if (!order) {
        return null;
      }

      return {
        ...order,
        _id: undefined,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * الحصول على طلب بواسطة رمز التتبع
   */
  async getOrderByTrackingCode(trackingCode) {
    try {
      const order = await OrderSchema.findOne({ trackingCode }).lean();

      if (!order) {
        return null;
      }

      return {
        ...order,
        _id: undefined,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * الحصول على جميع الطلبات
   */
  async getOrders() {
    try {
      const orders = await OrderSchema.find().sort({ createdAt: -1 }).lean();
      return orders.map((order) => ({
        ...order,
        _id: undefined,
      }));
    } catch (error) {
      throw new Error("فشل في الحصول على الطلبات");
    }
  }

  /**
   * تحديث حالة الطلب
   */
  async updateOrderStatus(orderId, newStatus, note = "", updatedBy = "admin") {
    try {
      const order = await OrderSchema.findOne({ id: orderId });

      if (!order) {
        throw new Error("الطلب غير موجود");
      }

      if (!Object.values(ORDER_STATUSES).includes(newStatus)) {
        throw new Error("حالة الطلب غير صحيحة");
      }

      order.status = newStatus;
      order.updatedAt = new Date();

      order.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        note: note || STATUS_NAMES[newStatus],
        updatedBy,
      });

      if (newStatus === ORDER_STATUSES.SHIPPED) {
        order.shippedAt = new Date();
        order.estimatedDelivery = this.calculateDeliveryDate();
      }

      if (newStatus === ORDER_STATUSES.DELIVERED) {
        order.deliveredAt = new Date();
      }

      const updatedOrder = await order.save();

      return {
        ...updatedOrder.toObject(),
        _id: undefined,
      };
    } catch (error) {
      throw new Error(error.message || "فشل في تحديث حالة الطلب");
    }
  }

  /**
   * تحديث بيانات الطلب
   */
  async updateOrder(orderId, updateData, updatedBy = "admin") {
    try {
      const order = await OrderSchema.findOne({ id: orderId });

      if (!order) {
        throw new Error("الطلب غير موجود");
      }

      if (updateData.customerInfo) {
        order.customerInfo = {
          ...order.customerInfo,
          ...updateData.customerInfo,
        };
      }

      if (updateData.jacketConfig && order.items.length > 0) {
        order.items[0].jacketConfig = {
          ...order.items[0].jacketConfig,
          ...updateData.jacketConfig,
        };
      }

      if (updateData.quantity && order.items.length > 0) {
        order.items[0].quantity = updateData.quantity;
        order.items[0].price = updateData.totalPrice || order.items[0].price;
      }

      if (updateData.totalPrice) {
        order.totalPrice = updateData.totalPrice;
      }

      order.updatedAt = new Date();

      order.statusHistory.push({
        status: order.status,
        timestamp: new Date(),
        note: "تم تعديل بيانات الطلب",
        updatedBy,
      });

      const updatedOrder = await order.save();

      return {
        ...updatedOrder.toObject(),
        _id: undefined,
      };
    } catch (error) {
      throw new Error(error.message || "فشل في تحديث الطلب");
    }
  }

  /**
   * إضافة ملاحظة للطلب
   */
  async addOrderNote(orderId, note, addedBy = "admin") {
    try {
      const order = await OrderSchema.findOne({ id: orderId });

      if (!order) {
        throw new Error("الطلب غير موجود");
      }

      order.notes = order.notes || [];
      order.notes.push({
        id: `note-${Date.now()}`,
        content: note,
        addedBy,
        addedAt: new Date(),
      });

      order.updatedAt = new Date();

      const updatedOrder = await order.save();

      return {
        ...updatedOrder.toObject(),
        _id: undefined,
      };
    } catch (error) {
      throw new Error("فشل في إضافة الملاحظة");
    }
  }

  /**
   * حساب التاريخ المتوقع للتسليم (30-45 يوم من تاريخ الإنشاء)
   */
  calculateEstimatedDelivery() {
    const now = new Date();
    const estimatedDays = 35; // متوسط 35 يوم
    const estimatedDate = new Date(
      now.getTime() + estimatedDays * 24 * 60 * 60 * 1000
    );
    return estimatedDate;
  }

  /**
   * حساب تاريخ التسليم المتوقع بعد الشحن (2-3 أيام)
   */
  calculateDeliveryDate() {
    const now = new Date();
    const deliveryDays = 3; // 3 أيام للتسليم
    const deliveryDate = new Date(
      now.getTime() + deliveryDays * 24 * 60 * 60 * 1000
    );
    return deliveryDate;
  }

  /**
   * البحث في الطلبات
   */
  async searchOrders(query, filters = {}) {
    try {
      let searchQuery = {};

      if (filters.status) {
        searchQuery.status = filters.status;
      }

      if (filters.dateFrom || filters.dateTo) {
        searchQuery.createdAt = {};
        if (filters.dateFrom) {
          searchQuery.createdAt.$gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          searchQuery.createdAt.$lte = new Date(filters.dateTo);
        }
      }

      if (query) {
        const searchRegex = new RegExp(query, "i");
        searchQuery.$or = [
          { orderNumber: searchRegex },
          { trackingCode: searchRegex },
          { "customerInfo.name": searchRegex },
          { "customerInfo.phone": searchRegex },
        ];
      }

      const orders = await OrderSchema.find(searchQuery)
        .sort({ createdAt: -1 })
        .lean();

      return orders.map((order) => ({
        ...order,
        _id: undefined,
      }));
    } catch (error) {
      throw new Error("فشل في البحث عن الطلبات");
    }
  }
  /**
   * الحصول على إحصائيات الطلبات
   */
  async getOrderStats() {
    try {
      const totalOrders = await OrderSchema.countDocuments();

      const statusStats = await OrderSchema.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalValue: { $sum: "$totalPrice" },
          },
        },
      ]);

      const stats = {
        total: totalOrders,
        pending: 0,
        confirmed: 0,
        inProduction: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        thisMonth: 0,
        lastMonth: 0,
        pendingReview: {
          total: 0,
          totalValue: 0,
          thisMonth: 0,
        },
      };

      statusStats.forEach((stat) => {
        switch (stat._id) {
          case ORDER_STATUSES.PENDING:
            stats.pending = stat.count;
            stats.pendingReview.total = stat.count;
            stats.pendingReview.totalValue = stat.totalValue;
            break;
          case ORDER_STATUSES.CONFIRMED:
            stats.confirmed = stat.count;
            stats.totalRevenue += stat.totalValue;
            break;
          case ORDER_STATUSES.IN_PRODUCTION:
            stats.inProduction = stat.count;
            stats.totalRevenue += stat.totalValue;
            break;
          case ORDER_STATUSES.SHIPPED:
            stats.shipped = stat.count;
            stats.totalRevenue += stat.totalValue;
            break;
          case ORDER_STATUSES.DELIVERED:
            stats.delivered = stat.count;
            stats.totalRevenue += stat.totalValue;
            break;
          case ORDER_STATUSES.CANCELLED:
            stats.cancelled = stat.count;
            break;
        }
      });

      const validOrdersCount = totalOrders - stats.pending - stats.cancelled;
      stats.averageOrderValue =
        validOrdersCount > 0 ? stats.totalRevenue / validOrdersCount : 0;

      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const thisMonthCount = await OrderSchema.countDocuments({
        createdAt: { $gte: thisMonthStart },
        status: { $ne: ORDER_STATUSES.PENDING },
      });

      const lastMonthCount = await OrderSchema.countDocuments({
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
        status: { $ne: ORDER_STATUSES.PENDING },
      });

      const pendingThisMonth = await OrderSchema.countDocuments({
        createdAt: { $gte: thisMonthStart },
        status: ORDER_STATUSES.PENDING,
      });

      stats.thisMonth = thisMonthCount;
      stats.lastMonth = lastMonthCount;
      stats.pendingReview.thisMonth = pendingThisMonth;

      return stats;
    } catch (error) {
      throw new Error("فشل في الحصول على إحصائيات الطلبات");
    }
  }

  /**
   * حذف طلب
   */
  async deleteOrder(orderId) {
    try {
      const result = await OrderSchema.deleteOne({ id: orderId });

      if (result.deletedCount === 0) {
        throw new Error("الطلب غير موجود");
      }

      return true;
    } catch (error) {
      throw new Error("فشل في حذف الطلب");
    }
  }
}

export default new OrderModel();
