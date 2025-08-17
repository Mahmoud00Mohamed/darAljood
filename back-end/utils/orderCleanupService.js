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

    console.log(`🚀 بدء عملية الحذف الشاملة للطلب ${orderData.orderNumber}`);

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
          console.log(
            `✅ الخطوة 1: تم حذف ${imageDeleteResult.deletedCount} صورة بنجاح`
          );
        } else {
          deletionLog.summary.failedSteps++;
          deletionLog.summary.errors.push(
            `فشل في حذف الصور: ${imageDeleteResult.error}`
          );
          console.error(`❌ الخطوة 1: فشل في حذف الصور`);
        }
      } catch (error) {
        deletionLog.steps[0].endTime = new Date();
        deletionLog.steps[0].success = false;
        deletionLog.steps[0].error = error.message;
        deletionLog.summary.failedSteps++;
        deletionLog.summary.errors.push(`خطأ في حذف الصور: ${error.message}`);
        console.error(`❌ الخطوة 1: خطأ في حذف الصور:`, error);
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
        console.log(`✅ الخطوة 2: تم حذف ${deletedLinksCount} رابط مؤقت بنجاح`);
      } catch (error) {
        deletionLog.steps[1].endTime = new Date();
        deletionLog.steps[1].success = false;
        deletionLog.steps[1].error = error.message;
        deletionLog.summary.failedSteps++;
        deletionLog.summary.errors.push(
          `خطأ في حذف الروابط المؤقتة: ${error.message}`
        );
        console.error(`❌ الخطوة 2: خطأ في حذف الروابط المؤقتة:`, error);
      }

      // الخطوة 3: تنظيف أي بيانات إضافية (للمستقبل)
      deletionLog.steps.push({
        step: 3,
        name: "تنظيف البيانات الإضافية",
        startTime: new Date(),
      });

      try {
        // هنا يمكن إضافة أي عمليات تنظيف إضافية في المستقبل
        // مثل: حذف ملفات PDF مؤقتة، تنظيف cache، إلخ

        deletionLog.steps[2].endTime = new Date();
        deletionLog.steps[2].success = true;
        deletionLog.steps[2].details = {
          message: "لا توجد بيانات إضافية للتنظيف حالياً",
        };

        deletionLog.summary.successfulSteps++;
        console.log(`✅ الخطوة 3: تم تنظيف البيانات الإضافية`);
      } catch (error) {
        deletionLog.steps[2].endTime = new Date();
        deletionLog.steps[2].success = false;
        deletionLog.steps[2].error = error.message;
        deletionLog.summary.failedSteps++;
        deletionLog.summary.warnings.push(
          `تحذير في تنظيف البيانات الإضافية: ${error.message}`
        );
        console.warn(`⚠️ الخطوة 3: تحذير في تنظيف البيانات الإضافية:`, error);
      }

      // إنهاء السجل
      deletionLog.endTime = new Date();
      deletionLog.summary.totalSteps = deletionLog.steps.length;
      deletionLog.summary.duration =
        deletionLog.endTime.getTime() - deletionLog.startTime.getTime();

      // طباعة ملخص العملية
      console.log(
        `🎯 ملخص عملية الحذف الشاملة للطلب ${orderData.orderNumber}:`
      );
      console.log(`   ⏱️ المدة: ${deletionLog.summary.duration}ms`);
      console.log(`   ✅ خطوات نجحت: ${deletionLog.summary.successfulSteps}`);
      console.log(`   ❌ خطوات فشلت: ${deletionLog.summary.failedSteps}`);
      console.log(`   ⚠️ تحذيرات: ${deletionLog.summary.warnings.length}`);

      if (deletionLog.summary.errors.length > 0) {
        console.error(`❌ أخطاء حدثت:`, deletionLog.summary.errors);
      }

      if (deletionLog.summary.warnings.length > 0) {
        console.warn(`⚠️ تحذيرات:`, deletionLog.summary.warnings);
      }

      return {
        success: deletionLog.summary.failedSteps === 0,
        log: deletionLog,
        hasWarnings: deletionLog.summary.warnings.length > 0,
      };
    } catch (error) {
      deletionLog.endTime = new Date();
      deletionLog.summary.errors.push(`خطأ عام: ${error.message}`);

      console.error(
        `❌ فشل في عملية الحذف الشاملة للطلب ${orderData.orderNumber}:`,
        error
      );

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

    console.log(`🚀 بدء عملية الحذف الشاملة لـ ${ordersData.length} طلب`);

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

        // تأخير قصير بين الطلبات لتجنب إرهاق النظام
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ خطأ في حذف الطلب ${orderData.orderNumber}:`, error);
        bulkLog.failedDeletions++;
        bulkLog.processedOrders++;
      }
    }

    bulkLog.endTime = new Date();
    bulkLog.duration = bulkLog.endTime.getTime() - bulkLog.startTime.getTime();

    console.log(`🎯 ملخص عملية الحذف الشاملة:`);
    console.log(`   📊 إجمالي الطلبات: ${bulkLog.totalOrders}`);
    console.log(`   ✅ نجح حذفها: ${bulkLog.successfulDeletions}`);
    console.log(`   ❌ فشل حذفها: ${bulkLog.failedDeletions}`);
    console.log(`   ⏱️ إجمالي المدة: ${bulkLog.duration}ms`);

    return bulkLog;
  }

  /**
   * تنظيف الطلبات القديمة تلقائياً (للمستقبل)
   */
  async cleanupOldOrders(daysOld = 365) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      console.log(
        `🧹 بدء تنظيف الطلبات الأقدم من ${daysOld} يوم (قبل ${cutoffDate.toISOString()})`
      );

      // هذه الوظيفة للمستقبل - يمكن تطويرها لحذف الطلبات القديمة تلقائياً
      // حالياً نكتفي بالتسجيل

      console.log(`ℹ️ وظيفة التنظيف التلقائي غير مفعلة حالياً`);

      return {
        success: true,
        message: "وظيفة التنظيف التلقائي غير مفعلة حالياً",
        cleanedCount: 0,
      };
    } catch (error) {
      console.error("Error in automatic cleanup:", error);
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
      // إحصائيات عامة عن عمليات التنظيف
      return {
        lastCleanup: new Date().toISOString(),
        totalOrdersProcessed: 0, // يمكن تطويرها لاحقاً
        totalImagesDeleted: 0,
        totalLinksDeleted: 0,
        totalSpaceSaved: 0, // بالميجابايت
      };
    } catch (error) {
      console.error("Error getting cleanup stats:", error);
      return null;
    }
  }
}

export default new OrderCleanupService();
