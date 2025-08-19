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
      const allPublicIds = [];

      order.items.forEach((item) => {
        if (item.jacketConfig) {
          const itemPublicIds = extractImagePublicIdsFromJacketConfig(
            item.jacketConfig
          );
          allPublicIds.push(...itemPublicIds);
        }
      });

      const uniquePublicIds = [...new Set(allPublicIds)];

      if (uniquePublicIds.length === 0) {
        return {
          success: true,
          message: "لا توجد صور للنسخ",
          copiedCount: 0,
          failedCount: 0,
        };
      }

      const copyResults = await copyImagesToOrderFolder(
        uniquePublicIds,
        order.orderNumber
      );

      const successfulCopies = copyResults.filter((result) => result.success);
      const failedCopies = copyResults.filter((result) => !result.success);

      if (successfulCopies.length > 0) {
        try {
          await OrderModel.updateOrderBackupImages(order.id, successfulCopies);
        } catch (dbError) {
          // لا نرمي خطأ، فقط نسجل
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
      return {
        success: true,
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
      const deleteResult = await deleteOrderImages(orderNumber);
      return deleteResult;
    } catch (error) {
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
      return false;
    }
  }

  /**
   * مزامنة صور الطلب عند التعديل
   */
  async syncOrderImagesOnUpdate(orderId, oldJacketConfig, newJacketConfig) {
    try {
      const syncResult = await OrderImageSyncService.syncOrderImages(
        orderId,
        oldJacketConfig,
        newJacketConfig
      );
      return syncResult;
    } catch (error) {
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
