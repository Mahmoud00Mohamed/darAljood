import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// مسار ملف البيانات
const DATA_FILE = path.join(__dirname, "../data/orders.json");

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
  constructor() {
    this.ensureDataDirectory();
    this.ensureDataFile();
  }

  // التأكد من وجود مجلد البيانات
  async ensureDataDirectory() {
    const dataDir = path.dirname(DATA_FILE);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
  }

  // التأكد من وجود ملف البيانات
  async ensureDataFile() {
    try {
      await fs.access(DATA_FILE);
    } catch {
      await this.saveOrders([]);
    }
  }

  // قراءة جميع الطلبات
  async getOrders() {
    try {
      const data = await fs.readFile(DATA_FILE, "utf8");
      const orders = JSON.parse(data);
      return Array.isArray(orders) ? orders : [];
    } catch (error) {
      console.error("Error reading orders data:", error);
      return [];
    }
  }

  // حفظ الطلبات
  async saveOrders(orders) {
    try {
      await fs.writeFile(DATA_FILE, JSON.stringify(orders, null, 2), "utf8");
      return orders;
    } catch (error) {
      console.error("Error saving orders data:", error);
      throw new Error("فشل في حفظ بيانات الطلبات");
    }
  }

  // توليد رقم طلب فريد وبسيط
  generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    // استخدام آخر 6 أرقام من timestamp + 3 أرقام عشوائية
    const orderNumber = `${timestamp.toString().slice(-6)}${random
      .toString()
      .padStart(3, "0")}`;
    return orderNumber;
  }

  // توليد رمز تتبع فريد
  generateTrackingCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // إنشاء طلب جديد
  async createOrder(orderData) {
    try {
      const orders = await this.getOrders();
      const orderNumber = this.generateOrderNumber();
      const trackingCode = this.generateTrackingCode();

      const newOrder = {
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
            timestamp: new Date().toISOString(),
            note: "تم إنشاء الطلب",
            updatedBy: "system",
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedDelivery: this.calculateEstimatedDelivery(),
        notes: [],
      };

      orders.push(newOrder);
      await this.saveOrders(orders);

      return newOrder;
    } catch (error) {
      console.error("Error creating order:", error);
      throw new Error("فشل في إنشاء الطلب");
    }
  }

  // الحصول على طلب بواسطة رقم الطلب
  async getOrderByNumber(orderNumber) {
    try {
      const orders = await this.getOrders();
      return orders.find((order) => order.orderNumber === orderNumber) || null;
    } catch (error) {
      console.error("Error getting order by number:", error);
      return null;
    }
  }

  // الحصول على طلب بواسطة رمز التتبع
  async getOrderByTrackingCode(trackingCode) {
    try {
      const orders = await this.getOrders();
      return (
        orders.find((order) => order.trackingCode === trackingCode) || null
      );
    } catch (error) {
      console.error("Error getting order by tracking code:", error);
      return null;
    }
  }

  // تحديث حالة الطلب
  async updateOrderStatus(orderId, newStatus, note = "", updatedBy = "admin") {
    try {
      const orders = await this.getOrders();
      const orderIndex = orders.findIndex((order) => order.id === orderId);

      if (orderIndex === -1) {
        throw new Error("الطلب غير موجود");
      }

      const order = orders[orderIndex];

      // التحقق من صحة الحالة الجديدة
      if (!Object.values(ORDER_STATUSES).includes(newStatus)) {
        throw new Error("حالة الطلب غير صحيحة");
      }

      // تحديث الحالة
      order.status = newStatus;
      order.updatedAt = new Date().toISOString();

      // إضافة إلى تاريخ الحالات
      order.statusHistory.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        note: note || STATUS_NAMES[newStatus],
        updatedBy,
      });

      // تحديث التاريخ المتوقع للتسليم إذا تم الشحن
      if (newStatus === ORDER_STATUSES.SHIPPED) {
        order.shippedAt = new Date().toISOString();
        order.estimatedDelivery = this.calculateDeliveryDate();
      }

      // تحديث تاريخ التسليم إذا تم التسليم
      if (newStatus === ORDER_STATUSES.DELIVERED) {
        order.deliveredAt = new Date().toISOString();
      }

      orders[orderIndex] = order;
      await this.saveOrders(orders);

      return order;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw new Error(error.message || "فشل في تحديث حالة الطلب");
    }
  }

  // تحديث بيانات الطلب
  async updateOrder(orderId, updateData, updatedBy = "admin") {
    try {
      const orders = await this.getOrders();
      const orderIndex = orders.findIndex((order) => order.id === orderId);

      if (orderIndex === -1) {
        throw new Error("الطلب غير موجود");
      }

      const order = orders[orderIndex];

      // تحديث معلومات العميل
      if (updateData.customerInfo) {
        order.customerInfo = {
          ...order.customerInfo,
          ...updateData.customerInfo,
        };
      }

      // تحديث تكوين الجاكيت
      if (updateData.jacketConfig && order.items.length > 0) {
        order.items[0].jacketConfig = {
          ...order.items[0].jacketConfig,
          ...updateData.jacketConfig,
        };
      }

      // تحديث الكمية والسعر
      if (updateData.quantity && order.items.length > 0) {
        order.items[0].quantity = updateData.quantity;
        order.items[0].price = updateData.totalPrice || order.items[0].price;
      }

      if (updateData.totalPrice) {
        order.totalPrice = updateData.totalPrice;
      }

      // تحديث تاريخ التعديل
      order.updatedAt = new Date().toISOString();

      // إضافة ملاحظة في تاريخ الحالات
      order.statusHistory.push({
        status: order.status,
        timestamp: new Date().toISOString(),
        note: "تم تعديل بيانات الطلب",
        updatedBy,
      });

      orders[orderIndex] = order;
      await this.saveOrders(orders);

      return order;
    } catch (error) {
      console.error("Error updating order:", error);
      throw new Error(error.message || "فشل في تحديث الطلب");
    }
  }
  // إضافة ملاحظة للطلب
  async addOrderNote(orderId, note, addedBy = "admin") {
    try {
      const orders = await this.getOrders();
      const orderIndex = orders.findIndex((order) => order.id === orderId);

      if (orderIndex === -1) {
        throw new Error("الطلب غير موجود");
      }

      const order = orders[orderIndex];
      order.notes = order.notes || [];
      order.notes.push({
        id: `note-${Date.now()}`,
        content: note,
        addedBy,
        addedAt: new Date().toISOString(),
      });

      order.updatedAt = new Date().toISOString();

      orders[orderIndex] = order;
      await this.saveOrders(orders);

      return order;
    } catch (error) {
      console.error("Error adding order note:", error);
      throw new Error("فشل في إضافة الملاحظة");
    }
  }

  // حساب التاريخ المتوقع للتسليم (30-45 يوم من تاريخ الإنشاء)
  calculateEstimatedDelivery() {
    const now = new Date();
    const estimatedDays = 35; // متوسط 35 يوم
    const estimatedDate = new Date(
      now.getTime() + estimatedDays * 24 * 60 * 60 * 1000
    );
    return estimatedDate.toISOString();
  }

  // حساب تاريخ التسليم المتوقع بعد الشحن (2-3 أيام)
  calculateDeliveryDate() {
    const now = new Date();
    const deliveryDays = 3; // 3 أيام للتسليم
    const deliveryDate = new Date(
      now.getTime() + deliveryDays * 24 * 60 * 60 * 1000
    );
    return deliveryDate.toISOString();
  }

  // البحث في الطلبات
  async searchOrders(query, filters = {}) {
    try {
      const orders = await this.getOrders();
      let filteredOrders = orders;

      // فلترة حسب الحالة
      if (filters.status) {
        filteredOrders = filteredOrders.filter(
          (order) => order.status === filters.status
        );
      }

      // فلترة حسب التاريخ
      if (filters.dateFrom) {
        filteredOrders = filteredOrders.filter(
          (order) => new Date(order.createdAt) >= new Date(filters.dateFrom)
        );
      }

      if (filters.dateTo) {
        filteredOrders = filteredOrders.filter(
          (order) => new Date(order.createdAt) <= new Date(filters.dateTo)
        );
      }

      // البحث النصي
      if (query) {
        const searchQuery = query.toLowerCase();
        filteredOrders = filteredOrders.filter(
          (order) =>
            order.orderNumber.toLowerCase().includes(searchQuery) ||
            order.trackingCode.toLowerCase().includes(searchQuery) ||
            order.customerInfo.name.toLowerCase().includes(searchQuery) ||
            order.customerInfo.phone.includes(searchQuery)
        );
      }

      return filteredOrders.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error("Error searching orders:", error);
      throw new Error("فشل في البحث عن الطلبات");
    }
  }

  // الحصول على إحصائيات الطلبات
  async getOrderStats() {
    try {
      const orders = await this.getOrders();

      // فصل الطلبات قيد المراجعة عن باقي الطلبات
      const pendingOrders = orders.filter(
        (o) => o.status === ORDER_STATUSES.PENDING
      );
      const confirmedOrders = orders.filter(
        (o) => o.status !== ORDER_STATUSES.PENDING
      );

      const stats = {
        total: confirmedOrders.length, // استبعاد الطلبات قيد المراجعة من العدد الإجمالي
        pending: orders.filter((o) => o.status === ORDER_STATUSES.PENDING)
          .length,
        confirmed: confirmedOrders.filter(
          (o) => o.status === ORDER_STATUSES.CONFIRMED
        ).length,
        inProduction: confirmedOrders.filter(
          (o) => o.status === ORDER_STATUSES.IN_PRODUCTION
        ).length,
        shipped: confirmedOrders.filter(
          (o) => o.status === ORDER_STATUSES.SHIPPED
        ).length,
        delivered: confirmedOrders.filter(
          (o) => o.status === ORDER_STATUSES.DELIVERED
        ).length,
        cancelled: confirmedOrders.filter(
          (o) => o.status === ORDER_STATUSES.CANCELLED
        ).length,
        totalRevenue: confirmedOrders
          .filter(
            (o) =>
              o.status !== ORDER_STATUSES.CANCELLED &&
              o.status !== ORDER_STATUSES.PENDING
          )
          .reduce((sum, order) => sum + order.totalPrice, 0),
        averageOrderValue: 0,
        thisMonth: 0,
        lastMonth: 0,
        // إضافة إحصائيات منفصلة للطلبات قيد المراجعة
        pendingReview: {
          total: pendingOrders.length,
          totalValue: pendingOrders.reduce(
            (sum, order) => sum + order.totalPrice,
            0
          ),
          thisMonth: pendingOrders.filter(
            (o) =>
              new Date(o.createdAt) >=
              new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          ).length,
        },
      };

      // حساب متوسط قيمة الطلب
      const validOrders = confirmedOrders.filter(
        (o) =>
          o.status !== ORDER_STATUSES.CANCELLED &&
          o.status !== ORDER_STATUSES.PENDING
      );
      stats.averageOrderValue =
        validOrders.length > 0 ? stats.totalRevenue / validOrders.length : 0;

      // حساب طلبات هذا الشهر والشهر الماضي
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      stats.thisMonth = confirmedOrders.filter(
        (o) => new Date(o.createdAt) >= thisMonthStart
      ).length;

      stats.lastMonth = confirmedOrders.filter(
        (o) =>
          new Date(o.createdAt) >= lastMonthStart &&
          new Date(o.createdAt) <= lastMonthEnd
      ).length;

      return stats;
    } catch (error) {
      console.error("Error getting order stats:", error);
      throw new Error("فشل في الحصول على إحصائيات الطلبات");
    }
  }

  // حذف طلب
  async deleteOrder(orderId) {
    try {
      const orders = await this.getOrders();
      const filteredOrders = orders.filter((order) => order.id !== orderId);

      if (filteredOrders.length === orders.length) {
        throw new Error("الطلب غير موجود");
      }

      await this.saveOrders(filteredOrders);
      return true;
    } catch (error) {
      console.error("Error deleting order:", error);
      throw new Error("فشل في حذف الطلب");
    }
  }
}

export default new OrderModel();
