import TemporaryLinkSchema from "./schemas/TemporaryLinkSchema.js";
import crypto from "crypto";

class TemporaryLinkModel {
  /**
   * توليد رمز آمن للرابط
   */
  generateSecureToken() {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * إنشاء رابط مؤقت جديد
   */
  async createTemporaryLink(orderId, createdBy = "admin", durationHours = 1) {
    try {
      // إلغاء أي روابط مؤقتة سابقة لنفس الطلب
      await this.invalidateOrderLinks(orderId);

      const token = this.generateSecureToken();
      const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);

      const newLink = new TemporaryLinkSchema({
        id: `temp-link-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        orderId,
        token,
        expiresAt,
        createdBy,
      });

      const savedLink = await newLink.save();

      return {
        ...savedLink.toObject(),
        _id: undefined,
      };
    } catch (error) {
      console.error("Error creating temporary link:", error);
      throw new Error("فشل في إنشاء الرابط المؤقت");
    }
  }

  /**
   * التحقق من صحة الرابط المؤقت
   */
  async validateTemporaryLink(token, userAgent = "", ipAddress = "") {
    try {
      const link = await TemporaryLinkSchema.findOne({
        token,
        isUsed: false,
        expiresAt: { $gt: new Date() },
      });

      if (!link) {
        return {
          isValid: false,
          reason: "INVALID_OR_EXPIRED",
          message: "الرابط غير صحيح أو منتهي الصلاحية",
        };
      }

      // تحديث إحصائيات الوصول
      await TemporaryLinkSchema.findOneAndUpdate(
        { _id: link._id },
        {
          $inc: { accessCount: 1 },
          $set: {
            lastAccessAt: new Date(),
            userAgent,
            ipAddress,
          },
        }
      );

      return {
        isValid: true,
        orderId: link.orderId,
        link: {
          ...link.toObject(),
          _id: undefined,
        },
      };
    } catch (error) {
      console.error("Error validating temporary link:", error);
      return {
        isValid: false,
        reason: "VALIDATION_ERROR",
        message: "حدث خطأ أثناء التحقق من الرابط",
      };
    }
  }

  /**
   * تعيين الرابط كمستخدم
   */
  async markLinkAsUsed(token) {
    try {
      const updatedLink = await TemporaryLinkSchema.findOneAndUpdate(
        { token },
        {
          isUsed: true,
          usedAt: new Date(),
        },
        { new: true, lean: true }
      );

      if (!updatedLink) {
        throw new Error("الرابط غير موجود");
      }

      return {
        ...updatedLink,
        _id: undefined,
      };
    } catch (error) {
      console.error("Error marking link as used:", error);
      throw new Error("فشل في تحديث حالة الرابط");
    }
  }

  /**
   * زيادة عدد مرات الوصول للرابط بدون تعيينه كمستخدم
   */
  async incrementAccessCount(token) {
    try {
      const updatedLink = await TemporaryLinkSchema.findOneAndUpdate(
        { token, isUsed: false, expiresAt: { $gt: new Date() } },
        {
          $inc: { accessCount: 1 },
          $set: { lastAccessAt: new Date() },
        },
        { new: true, lean: true }
      );

      if (!updatedLink) {
        throw new Error("الرابط غير موجود أو منتهي الصلاحية");
      }

      return {
        ...updatedLink,
        _id: undefined,
      };
    } catch (error) {
      console.error("Error incrementing access count:", error);
      throw new Error("فشل في تحديث عدد مرات الوصول");
    }
  }

  /**
   * إلغاء جميع الروابط المؤقتة لطلب معين
   */
  async invalidateOrderLinks(orderId) {
    try {
      const result = await TemporaryLinkSchema.updateMany(
        { orderId, isUsed: false },
        { isUsed: true, usedAt: new Date() }
      );

      console.log(
        `🔗 تم إلغاء ${result.modifiedCount} رابط مؤقت للطلب ${orderId}`
      );
      return result.modifiedCount;
      console.log(
        `🔗 تم إلغاء ${result.modifiedCount} رابط مؤقت للطلب ${orderId}`
      );
      return result.modifiedCount;
    } catch (error) {
      console.error("Error invalidating order links:", error);
      throw new Error("فشل في إلغاء الروابط المؤقتة");
    }
  }

  /**
   * حذف جميع الروابط المؤقتة لطلب معين نهائياً
   */
  async deleteOrderLinks(orderId) {
    try {
      const result = await TemporaryLinkSchema.deleteMany({ orderId });
      console.log(
        `🗑️ تم حذف ${result.deletedCount} رابط مؤقت للطلب ${orderId} نهائياً`
      );
      return result.deletedCount;
    } catch (error) {
      console.error("Error deleting order links:", error);
      throw new Error("فشل في حذف الروابط المؤقتة");
    }
  }
  /**
   * حذف جميع الروابط المؤقتة لطلب معين نهائياً
   */
  async deleteOrderLinks(orderId) {
    try {
      const result = await TemporaryLinkSchema.deleteMany({ orderId });
      console.log(
        `🗑️ تم حذف ${result.deletedCount} رابط مؤقت للطلب ${orderId} نهائياً`
      );
      return result.deletedCount;
    } catch (error) {
      console.error("Error deleting order links:", error);
      throw new Error("فشل في حذف الروابط المؤقتة");
    }
  }
  /**
   * الحصول على الروابط المؤقتة لطلب معين
   */
  async getOrderLinks(orderId) {
    try {
      const links = await TemporaryLinkSchema.find({ orderId })
        .sort({ createdAt: -1 })
        .lean();

      return links.map((link) => ({
        ...link,
        _id: undefined,
      }));
    } catch (error) {
      console.error("Error getting order links:", error);
      throw new Error("فشل في الحصول على الروابط المؤقتة");
    }
  }

  /**
   * تنظيف الروابط المنتهية الصلاحية
   */
  async cleanupExpiredLinks() {
    try {
      const result = await TemporaryLinkSchema.deleteMany({
        expiresAt: { $lt: new Date() },
      });

      console.log(`تم حذف ${result.deletedCount} رابط منتهي الصلاحية`);
      return result.deletedCount;
    } catch (error) {
      console.error("Error cleaning up expired links:", error);
      return 0;
    }
  }

  /**
   * الحصول على إحصائيات الروابط المؤقتة
   */
  async getLinkStats() {
    try {
      const totalLinks = await TemporaryLinkSchema.countDocuments();
      const activeLinks = await TemporaryLinkSchema.countDocuments({
        isUsed: false,
        expiresAt: { $gt: new Date() },
      });
      const usedLinks = await TemporaryLinkSchema.countDocuments({
        isUsed: true,
      });
      const expiredLinks = await TemporaryLinkSchema.countDocuments({
        isUsed: false,
        expiresAt: { $lt: new Date() },
      });

      return {
        total: totalLinks,
        active: activeLinks,
        used: usedLinks,
        expired: expiredLinks,
      };
    } catch (error) {
      console.error("Error getting link stats:", error);
      throw new Error("فشل في الحصول على إحصائيات الروابط");
    }
  }
}

export default new TemporaryLinkModel();
