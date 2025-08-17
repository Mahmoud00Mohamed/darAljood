import {
  copyImagesToOrderFolder,
  extractImagePublicIdsFromJacketConfig,
  deleteOrderImages,
  getOrderImagesInfo,
} from "./imageBackup.js";
import OrderModel from "../models/Order.js";
import OrderImageSyncService from "./orderImageSyncService.js";

/**
 * معالج شامل لإدارة صور الطلبات
 */
class OrderImageManager {
  /**
   * نسخ جميع الصور المرتبطة بطلب جديد
   */
  async backupOrderImages(order) {
    try {
      console.log(`🖼️ بدء عملية نسخ الصور للطلب رقم ${order.orderNumber}...`);

      // استخراج جميع public IDs من جميع عناصر الطلب
      const allPublicIds = [];

      order.items.forEach((item, itemIndex) => {
        if (item.jacketConfig) {
          console.log(`📋 فحص العنصر ${itemIndex + 1} من الطلب...`);
          const itemPublicIds = extractImagePublicIdsFromJacketConfig(
            item.jacketConfig
          );

          if (itemPublicIds.length > 0) {
            console.log(
              `🔍 تم العثور على ${itemPublicIds.length} صورة في العنصر ${
                itemIndex + 1
              }`
            );
            allPublicIds.push(...itemPublicIds);
          }
        }
      });

      // إزالة المكررات
      const uniquePublicIds = [...new Set(allPublicIds)];

      if (uniquePublicIds.length === 0) {
        console.log(`ℹ️ لا توجد صور للنسخ في الطلب ${order.orderNumber}`);
        return {
          success: true,
          message: "لا توجد صور للنسخ",
          copiedCount: 0,
          failedCount: 0,
        };
      }

      console.log(`📊 إجمالي الصور الفريدة للنسخ: ${uniquePublicIds.length}`);

      // نسخ الصور
      const copyResults = await copyImagesToOrderFolder(
        uniquePublicIds,
        order.orderNumber
      );

      const successfulCopies = copyResults.filter((result) => result.success);
      const failedCopies = copyResults.filter((result) => !result.success);

      console.log(`✅ نجح نسخ ${successfulCopies.length} صورة`);

      if (failedCopies.length > 0) {
        console.warn(
          `⚠️ فشل في نسخ ${failedCopies.length} صورة:`,
          failedCopies.map((f) => ({
            publicId: f.originalPublicId,
            error: f.error,
          }))
        );
      }

      // حفظ معلومات الصور المنسوخة في قاعدة البيانات
      if (successfulCopies.length > 0) {
        try {
          await OrderModel.updateOrderBackupImages(order.id, successfulCopies);
          console.log(
            `💾 تم حفظ معلومات ${successfulCopies.length} صورة منسوخة في قاعدة البيانات`
          );
        } catch (dbError) {
          console.error(`❌ خطأ في حفظ معلومات الصور المنسوخة:`, dbError);
        }
      }

      return {
        success: true,
        message: `تم نسخ ${successfulCopies.length} من ${uniquePublicIds.length} صورة بنجاح`,
        copiedCount: successfulCopies.length,
        failedCount: failedCopies.length,
        details: {
          successful: successfulCopies,
          failed: failedCopies,
        },
      };
    } catch (error) {
      console.error(`❌ خطأ عام في نسخ صور الطلب ${order.orderNumber}:`, error);
      return {
        success: false,
        message: "فشل في نسخ صور الطلب",
        error: error.message,
        copiedCount: 0,
        failedCount: 0,
      };
    }
  }

  /**
   * حذف جميع الصور المرتبطة بطلب
   */
  async deleteOrderImages(orderNumber) {
    try {
      console.log(`🗑️ بدء حذف صور الطلب رقم ${orderNumber}...`);

      const deleteResult = await deleteOrderImages(orderNumber);

      if (deleteResult.success) {
        console.log(
          `✅ تم حذف ${deleteResult.deletedCount} من أصل ${deleteResult.totalCount} صورة من مجلد الطلب رقم ${orderNumber}`
        );

        // إضافة تفاصيل أكثر عن عملية الحذف
        if (deleteResult.results && deleteResult.results.length > 0) {
          const successfulDeletes = deleteResult.results.filter(
            (r) => r.success
          );
          const failedDeletes = deleteResult.results.filter((r) => !r.success);

          if (successfulDeletes.length > 0) {
            console.log(
              `   ✅ نجح حذف: ${successfulDeletes
                .map((r) => r.publicId)
                .join(", ")}`
            );
          }

          if (failedDeletes.length > 0) {
            console.warn(
              `   ❌ فشل حذف: ${failedDeletes
                .map((r) => `${r.publicId} (${r.error})`)
                .join(", ")}`
            );
          }
        }
      } else {
        console.warn(
          `⚠️ فشل في حذف صور الطلب رقم ${orderNumber}:`,
          deleteResult.error
        );
      }

      return deleteResult;
    } catch (error) {
      console.error(`❌ خطأ في حذف صور الطلب رقم ${orderNumber}:`, error);
      return {
        success: false,
        error: error.message,
        deletedCount: 0,
        totalCount: 0,
      };
    }
  }

  /**
   * الحصول على معلومات صور الطلب
   */
  async getOrderImagesInfo(orderNumber) {
    try {
      return await getOrderImagesInfo(orderNumber);
    } catch (error) {
      console.error(
        `❌ خطأ في الحصول على معلومات صور الطلب رقم ${orderNumber}:`,
        error
      );
      return {
        success: false,
        error: error.message,
        images: [],
        totalCount: 0,
      };
    }
  }

  /**
   * التحقق من وجود صور منسوخة للطلب
   */
  async hasBackupImages(orderNumber) {
    try {
      const imagesInfo = await getOrderImagesInfo(orderNumber);
      return imagesInfo.success && imagesInfo.totalCount > 0;
    } catch (error) {
      console.error(
        `❌ خطأ في التحقق من وجود صور للطلب رقم ${orderNumber}:`,
        error
      );
      return false;
    }
  }

  /**
   * مزامنة صور الطلب عند التعديل
   */
  async syncOrderImagesOnUpdate(orderId, oldJacketConfig, newJacketConfig) {
    try {
      console.log(`🔄 بدء مزامنة صور الطلب ${orderId} عند التعديل...`);

      const syncResult = await OrderImageSyncService.syncOrderImages(
        orderId,
        oldJacketConfig,
        newJacketConfig
      );

      if (syncResult.success) {
        console.log(`✅ تم مزامنة صور الطلب بنجاح: ${syncResult.message}`);
      } else {
        console.error(`❌ فشل في مزامنة صور الطلب: ${syncResult.message}`);
      }

      return syncResult;
    } catch (error) {
      console.error(`❌ خطأ في مزامنة صور الطلب ${orderId}:`, error);
      return {
        success: false,
        hasChanges: false,
        error: error.message,
        message: `فشل في مزامنة الصور: ${error.message}`,
      };
    }
  }

  /**
   * التحقق من تطابق صور الطلب
   */
  async validateOrderImageSync(orderId) {
    try {
      return await OrderImageSyncService.validateOrderFolderSync(orderId);
    } catch (error) {
      console.error(`❌ خطأ في التحقق من تطابق صور الطلب ${orderId}:`, error);
      return {
        success: false,
        isInSync: false,
        error: error.message,
        message: `فشل في التحقق من التطابق: ${error.message}`,
      };
    }
  }

  /**
   * إصلاح تلقائي لتطابق صور الطلب
   */
  async autoFixOrderImageSync(orderId) {
    try {
      return await OrderImageSyncService.autoFixOrderImageSync(orderId);
    } catch (error) {
      console.error(`❌ خطأ في الإصلاح التلقائي للطلب ${orderId}:`, error);
      return {
        success: false,
        wasFixed: false,
        error: error.message,
        message: `فشل في الإصلاح التلقائي: ${error.message}`,
      };
    }
  }
}

export default new OrderImageManager();
