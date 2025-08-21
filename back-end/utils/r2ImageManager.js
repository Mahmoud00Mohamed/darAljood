/**
 * مدير شامل لإدارة صور R2
 */

import {
  uploadToR2,
  deleteFromR2,
  generateFileKey,
} from "../config/cloudflareR2.js";
import {
  copyImagesToOrderFolder,
  extractImageKeysFromJacketConfig,
  deleteOrderImages,
  getOrderImagesInfo,
} from "./imageBackup.js";
import OrderModel from "../models/Order.js";

class R2ImageManager {
  /**
   * نسخ جميع الصور المرتبطة بطلب جديد
   */
  async backupOrderImages(order) {
    try {
      const allKeys = [];

      order.items.forEach((item) => {
        if (item.jacketConfig) {
          const itemKeys = extractImageKeysFromJacketConfig(
            item.jacketConfig
          );
          allKeys.push(...itemKeys);
        }
      });

      const uniqueKeys = [...new Set(allKeys)];

      if (uniqueKeys.length === 0) {
        return {
          success: true,
          message: "لا توجد صور للنسخ",
          copiedCount: 0,
          failedCount: 0,
        };
      }

      const copyResults = await copyImagesToOrderFolder(
        uniqueKeys,
        order.orderNumber
      );

      const successfulCopies = copyResults.filter((result) => result.success);
      const failedCopies = copyResults.filter((result) => !result.success);

      if (successfulCopies.length > 0) {
        try {
          await OrderModel.updateOrderBackupImages(order.id, successfulCopies);
        } catch (dbError) {
          console.warn("Failed to update backup images in DB:", dbError);
        }
      }

      return {
        success: true,
        message: `تم نسخ ${successfulCopies.length} من ${uniqueKeys.length} صورة بنجاح إلى R2`,
        copiedCount: successfulCopies.length,
        failedCount: failedCopies.length,
        details: {
          successful: successfulCopies,
          failed: failedCopies,
        },
      };
    } catch (error) {
      console.error("Error backing up order images to R2:", error);
      return {
        success: false,
        message: "فشل في نسخ صور الطلب إلى R2",
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
      console.error("Error deleting order images from R2:", error);
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
      console.error("Error getting order images info from R2:", error);
      return {
        success: false,
        error: error.message,
        images: [],
        totalCount: 0,
      };
    }
  }

  /**
   * رفع صورة جديدة إلى R2
   */
  async uploadImage(buffer, originalName, folder = "dar-aljoud/uploads", metadata = {}) {
    try {
      const fileKey = generateFileKey(originalName, folder);
      
      const uploadResult = await uploadToR2(
        buffer,
        fileKey,
        "image/jpeg", // يمكن تحديد النوع بناءً على الملف
        {
          originalName,
          uploadedAt: new Date().toISOString(),
          ...metadata,
        }
      );

      return {
        success: true,
        url: uploadResult.url,
        key: uploadResult.key,
        size: uploadResult.size,
        message: "تم رفع الصورة بنجاح إلى R2",
      };
    } catch (error) {
      console.error("Error uploading image to R2:", error);
      return {
        success: false,
        error: error.message,
        message: "فشل في رفع الصورة إلى R2",
      };
    }
  }

  /**
   * حذف صورة من R2
   */
  async deleteImage(key) {
    try {
      const deleteResult = await deleteFromR2(key);
      return {
        success: deleteResult.success,
        key: deleteResult.key,
        message: "تم حذف الصورة من R2 بنجاح",
      };
    } catch (error) {
      console.error("Error deleting image from R2:", error);
      return {
        success: false,
        error: error.message,
        message: "فشل في حذف الصورة من R2",
      };
    }
  }

  /**
   * نقل الصور من Cloudinary إلى R2 (للهجرة)
   */
  async migrateFromCloudinary(cloudinaryUrls, targetFolder = "dar-aljoud/migrated") {
    const migrationResults = [];

    for (const cloudinaryUrl of cloudinaryUrls) {
      try {
        // تحميل الصورة من Cloudinary
        const response = await fetch(cloudinaryUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch from Cloudinary: ${response.status}`);
        }

        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get("content-type") || "image/jpeg";
        
        // استخراج اسم الملف من URL
        const urlParts = cloudinaryUrl.split("/");
        const fileName = urlParts[urlParts.length - 1];
        
        // رفع إلى R2
        const uploadResult = await this.uploadImage(
          Buffer.from(imageBuffer),
          fileName,
          targetFolder,
          {
            migratedFrom: "cloudinary",
            originalUrl: cloudinaryUrl,
          }
        );

        migrationResults.push({
          originalUrl: cloudinaryUrl,
          newUrl: uploadResult.url,
          newKey: uploadResult.key,
          success: uploadResult.success,
          error: uploadResult.error,
        });

        // تأخير قصير بين العمليات
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Migration failed for ${cloudinaryUrl}:`, error);
        migrationResults.push({
          originalUrl: cloudinaryUrl,
          success: false,
          error: error.message,
        });
      }
    }

    const successfulMigrations = migrationResults.filter((r) => r.success);
    const failedMigrations = migrationResults.filter((r) => !r.success);

    return {
      success: failedMigrations.length === 0,
      total: migrationResults.length,
      successful: successfulMigrations.length,
      failed: failedMigrations.length,
      results: migrationResults,
      message: `تم نقل ${successfulMigrations.length} من أصل ${migrationResults.length} صورة إلى R2`,
    };
  }
}

export default new R2ImageManager();