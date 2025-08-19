/**
 * خدمة تنظيف شاملة للطلبات المحذوفة
 * تضمن حذف جميع البيانات والملفات المرتبطة بالطلب
 */

import OrderImageManager from "./orderImageManager.js";
import TemporaryLinkModel from "../models/TemporaryLink.js";
import { deleteOrderImages } from "./imageBackup.js";

class OrderCleanupService {
  /**
   * حذف شامل لطلب واحد مع جميع بياناته المرتبطة
   */
  async performCompleteOrderDeletion(orderData) {
    const deletionLog = {
      orderId: orderData.id,
      orderNumber: orderData.orderNumber,
      startTime: new Date(),
      steps: [],
      summary: {
        totalSteps: 0,
        successfulSteps: 0,
        failedSteps: 0,
        warnings: [],
        errors: [],
      },
    };

    try {
      // الخطوة 1: حذف صور الطلب من Cloudinary
      deletionLog.steps.push({
        step: 1,
        name: "حذف صور Cloudinary",
        startTime: new Date(),
      });

      try {
        const imageDeleteResult = await OrderImageManager.deleteOrderImages(
          orderData.orderNumber
        );

        deletionLog.steps[0].endTime = new Date();
        deletionLog.steps[0].success = imageDeleteResult.success;
        deletionLog.steps[0].details = {
          deletedCount: imageDeleteResult.deletedCount || 0,
          totalCount: imageDeleteResult.totalCount || 0,
          savedSpace: imageDeleteResult.statistics?.totalSizeDeletedMB || 0,
        };

        if (imageDeleteResult.success) {
          deletionLog.summary.successfulSteps++;
        } else {
          deletionLog.summary.failedSteps++;
          deletionLog.summary.errors.push(
            `فشل في حذف الصور: ${imageDeleteResult.error}`
          );
        }
      } catch (error) {
        deletionLog.steps[0].endTime = new Date();
        deletionLog.steps[0].success = false;
        deletionLog.steps[0].error = error.message;
        deletionLog.summary.failedSteps++;
        deletionLog.summary.errors.push(`خطأ في حذف الصور: ${error.message}`);
      }

      // الخطوة 2: حذف الروابط المؤقتة
      deletionLog.steps.push({
        step: 2,
        name: "حذف الروابط المؤقتة",
        startTime: new Date(),
      });

      try {
        const deletedLinksCount = await TemporaryLinkModel.deleteOrderLinks(
          orderData.id
        );

        deletionLog.steps[1].endTime = new Date();
        deletionLog.steps[1].success = true;
        deletionLog.steps[1].details = {
          deletedCount: deletedLinksCount,
        };

        deletionLog.summary.successfulSteps++;
      } catch (error) {
        deletionLog.steps[1].endTime = new Date();
        deletionLog.steps[1].success = false;
        deletionLog.steps[1].error = error.message;
        deletionLog.summary.failedSteps++;
        deletionLog.summary.errors.push(
          `خطأ في حذف الروابط المؤقتة: ${error.message}`
        );
      }

      // الخطوة 3: تنظيف أي بيانات إضافية
      deletionLog.steps.push({
        step: 3,
        name: "تنظيف البيانات الإضافية",
        startTime: new Date(),
      });

      try {
        deletionLog.steps[2].endTime = new Date();
        deletionLog.steps[2].success = true;
        deletionLog.steps[2].details = {
          message: "لا توجد بيانات إضافية للتنظيف حالياً",
        };

        deletionLog.summary.successfulSteps++;
      } catch (error) {
        deletionLog.steps[2].endTime = new Date();
        deletionLog.steps[2].success = false;
        deletionLog.steps[2].error = error.message;
        deletionLog.summary.failedSteps++;
        deletionLog.summary.warnings.push(
          `تحذير في تنظيف البيانات الإضافية: ${error.message}`
        );
      }

      deletionLog.endTime = new Date();
      deletionLog.summary.totalSteps = deletionLog.steps.length;
      deletionLog.summary.duration =
        deletionLog.endTime.getTime() - deletionLog.startTime.getTime();

      return {
        success: deletionLog.summary.failedSteps === 0,
        log: deletionLog,
        hasWarnings: deletionLog.summary.warnings.length > 0,
      };
    } catch (error) {
      deletionLog.endTime = new Date();
      deletionLog.summary.errors.push(`خطأ عام: ${error.message}`);

      return {
        success: false,
        log: deletionLog,
        error: error.message,
      };
    }
  }

  /**
   * تنظيف شامل لعدة طلبات
   */
  async performBulkOrderDeletion(ordersData) {
    const bulkLog = {
      startTime: new Date(),
      totalOrders: ordersData.length,
      processedOrders: 0,
      successfulDeletions: 0,
      failedDeletions: 0,
      orderLogs: [],
    };

    for (const orderData of ordersData) {
      try {
        const deletionResult = await this.performCompleteOrderDeletion(
          orderData
        );
        bulkLog.orderLogs.push(deletionResult.log);

        if (deletionResult.success) {
          bulkLog.successfulDeletions++;
        } else {
          bulkLog.failedDeletions++;
        }

        bulkLog.processedOrders++;
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        bulkLog.failedDeletions++;
        bulkLog.processedOrders++;
      }
    }

    bulkLog.endTime = new Date();
    bulkLog.duration = bulkLog.endTime.getTime() - bulkLog.startTime.getTime();

    return bulkLog;
  }

  /**
   * تنظيف الطلبات القديمة تلقائياً (للمستقبل)
   */
  async cleanupOldOrders(daysOld = 365) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      return {
        success: true,
        message: "وظيفة التنظيف التلقائي غير مفعلة حالياً",
        cleanedCount: 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        cleanedCount: 0,
      };
    }
  }

  /**
   * إحصائيات التنظيف والحذف
   */
  async getCleanupStats() {
    try {
      return {
        lastCleanup: new Date().toISOString(),
        totalOrdersProcessed: 0,
        totalImagesDeleted: 0,
        totalLinksDeleted: 0,
        totalSpaceSaved: 0,
      };
    } catch (error) {
      return null;
    }
  }
}

export default new OrderCleanupService();
