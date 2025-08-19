/**
 * خدمة مزامنة صور الطلبات المتقدمة
 * تدير التغييرات في الشعارات أثناء تعديل الطلبات
 */

import cloudinary from "../config/cloudinary.js";
import OrderModel from "../models/Order.js";
import {
  extractImagePublicIdsFromJacketConfig,
  copyImageToOrderFolder,
  deleteOrderImages,
} from "./imageBackup.js";

class OrderImageSyncService {
  /**
   * مقارنة الشعارات القديمة والجديدة واستخراج التغييرات
   */
  analyzeImageChanges(oldJacketConfig, newJacketConfig) {
    const oldPublicIds = extractImagePublicIdsFromJacketConfig(oldJacketConfig);
    const newPublicIds = extractImagePublicIdsFromJacketConfig(newJacketConfig);

    const oldSet = new Set(oldPublicIds);
    const newSet = new Set(newPublicIds);

    const removedImages = oldPublicIds.filter((id) => !newSet.has(id));
    const addedImages = newPublicIds.filter((id) => !oldSet.has(id));
    const retainedImages = oldPublicIds.filter((id) => newSet.has(id));

    return {
      removed: removedImages,
      added: addedImages,
      retained: retainedImages,
      hasChanges: removedImages.length > 0 || addedImages.length > 0,
    };
  }

  /**
   * الحصول على قائمة الصور الموجودة في مجلد الطلب
   */
  async getOrderFolderImages(orderNumber) {
    try {
      const searchResult = await cloudinary.search
        .expression(`folder:dar-aljoud/orders/${orderNumber}`)
        .sort_by("public_id", "desc")
        .max_results(100)
        .execute();

      const folderImages = searchResult.resources.map((resource) => ({
        publicId: resource.public_id,
        url: resource.secure_url,
        originalPublicId: this.extractOriginalPublicId(resource.public_id),
        size: resource.bytes,
        format: resource.format,
        createdAt: resource.created_at,
      }));

      return {
        success: true,
        images: folderImages,
        totalCount: folderImages.length,
      };
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
   * استخراج الـ public ID الأصلي من الصورة المنسوخة
   */
  extractOriginalPublicId(backupPublicId) {
    try {
      const parts = backupPublicId.split("/");
      const fileName = parts[parts.length - 1];
      const nameWithoutExtension = fileName.split(".")[0];

      return nameWithoutExtension || fileName;
    } catch (error) {
      return backupPublicId;
    }
  }

  /**
   * حذف صور محددة من مجلد الطلب
   */
  async deleteSpecificImagesFromOrderFolder(orderNumber, publicIdsToDelete) {
    const deleteResults = [];

    for (const originalPublicId of publicIdsToDelete) {
      try {
        let backupPublicId = originalPublicId.includes("/")
          ? `dar-aljoud/orders/${orderNumber}/${originalPublicId
              .split("/")
              .pop()}`
          : `dar-aljoud/orders/${orderNumber}/${originalPublicId}`;

        try {
          await cloudinary.api.resource(backupPublicId);
        } catch (searchError) {
          const searchResult = await cloudinary.search
            .expression(`folder:dar-aljoud/orders/${orderNumber}`)
            .sort_by("public_id", "desc")
            .max_results(100)
            .execute();

          const fileName = originalPublicId.split("/").pop();
          const foundImage = searchResult.resources.find(
            (resource) =>
              resource.public_id.includes(fileName) ||
              resource.public_id.endsWith(fileName)
          );

          if (foundImage) {
            backupPublicId = foundImage.public_id;
          } else {
            deleteResults.push({
              originalPublicId,
              backupPublicId: `dar-aljoud/orders/${orderNumber}/${fileName}`,
              success: false,
              error: "الصورة غير موجودة في مجلد الطلب",
            });
            continue;
          }
        }

        const deleteResult = await cloudinary.uploader.destroy(backupPublicId);

        deleteResults.push({
          originalPublicId,
          backupPublicId,
          success: deleteResult.result === "ok",
          result: deleteResult.result,
        });

        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        deleteResults.push({
          originalPublicId,
          backupPublicId:
            backupPublicId ||
            `dar-aljoud/orders/${orderNumber}/${originalPublicId
              .split("/")
              .pop()}`,
          success: false,
          error: error.message,
        });
      }
    }

    const successfulDeletes = deleteResults.filter((r) => r.success);
    const failedDeletes = deleteResults.filter((r) => !r.success);

    return {
      success: failedDeletes.length === 0,
      deletedCount: successfulDeletes.length,
      totalCount: deleteResults.length,
      results: deleteResults,
      message: `تم حذف ${successfulDeletes.length} من أصل ${deleteResults.length} صورة`,
    };
  }

  /**
   * نسخ صور جديدة إلى مجلد الطلب
   */
  async copyNewImagesToOrderFolder(orderNumber, publicIdsToAdd) {
    const copyResults = [];

    for (const originalPublicId of publicIdsToAdd) {
      try {
        try {
          await cloudinary.api.resource(originalPublicId);
        } catch (checkError) {
          copyResults.push({
            success: false,
            originalPublicId,
            error: "الصورة الأصلية غير موجودة",
          });
          continue;
        }

        const copyResult = await copyImageToOrderFolder(
          originalPublicId,
          orderNumber
        );

        copyResults.push(copyResult);

        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        copyResults.push({
          success: false,
          originalPublicId,
          error: error.message,
        });
      }
    }

    const successfulCopies = copyResults.filter((r) => r.success);
    const failedCopies = copyResults.filter((r) => !r.success);

    return {
      success: failedCopies.length === 0,
      copiedCount: successfulCopies.length,
      totalCount: copyResults.length,
      results: copyResults,
      successfulCopies,
      failedCopies,
      message: `تم نسخ ${successfulCopies.length} من أصل ${copyResults.length} صورة`,
    };
  }

  /**
   * تحديث معلومات الصور المنسوخة في قاعدة البيانات
   */
  async updateOrderBackupImagesInDB(orderId, backupImagesInfo) {
    try {
      const updatedOrder = await OrderModel.updateOrderBackupImages(
        orderId,
        backupImagesInfo
      );

      return {
        success: true,
        updatedOrder,
        message: `تم تحديث معلومات ${backupImagesInfo.length} صورة في قاعدة البيانات`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "فشل في تحديث معلومات الصور في قاعدة البيانات",
      };
    }
  }

  /**
   * مزامنة شاملة لصور الطلب عند التعديل
   */
  async syncOrderImages(orderId, oldJacketConfig, newJacketConfig) {
    const syncLog = {
      orderId,
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
      syncLog.steps.push({
        step: 1,
        name: "الحصول على بيانات الطلب",
        startTime: new Date(),
      });

      const orders = await OrderModel.getOrders();
      const order = orders.find((o) => o.id === orderId);

      if (!order) {
        throw new Error("الطلب غير موجود");
      }

      syncLog.steps[0].endTime = new Date();
      syncLog.steps[0].success = true;
      syncLog.steps[0].details = {
        orderNumber: order.orderNumber,
        orderFound: true,
      };
      syncLog.summary.successfulSteps++;

      syncLog.steps.push({
        step: 2,
        name: "تحليل التغييرات في الصور",
        startTime: new Date(),
      });

      const imageChanges = this.analyzeImageChanges(
        oldJacketConfig,
        newJacketConfig
      );

      syncLog.steps[1].endTime = new Date();
      syncLog.steps[1].success = true;
      syncLog.steps[1].details = {
        removedCount: imageChanges.removed.length,
        addedCount: imageChanges.added.length,
        retainedCount: imageChanges.retained.length,
        hasChanges: imageChanges.hasChanges,
        removedImages: imageChanges.removed,
        addedImages: imageChanges.added,
      };
      syncLog.summary.successfulSteps++;

      if (!imageChanges.hasChanges) {
        syncLog.endTime = new Date();
        syncLog.summary.totalSteps = syncLog.steps.length;
        syncLog.summary.duration =
          syncLog.endTime.getTime() - syncLog.startTime.getTime();

        return {
          success: true,
          hasChanges: false,
          message: "لا توجد تغييرات في الصور",
          log: syncLog,
        };
      }

      if (imageChanges.removed.length > 0) {
        syncLog.steps.push({
          step: 3,
          name: "حذف الصور القديمة",
          startTime: new Date(),
        });

        try {
          const deleteResult = await this.deleteSpecificImagesFromOrderFolder(
            order.orderNumber,
            imageChanges.removed
          );

          syncLog.steps[2].endTime = new Date();
          syncLog.steps[2].success = deleteResult.success;
          syncLog.steps[2].details = {
            deletedCount: deleteResult.deletedCount,
            totalCount: deleteResult.totalCount,
            results: deleteResult.results,
          };

          if (deleteResult.success) {
            syncLog.summary.successfulSteps++;
          } else {
            syncLog.summary.failedSteps++;
            syncLog.summary.errors.push(`فشل في حذف بعض الصور القديمة`);
          }
        } catch (error) {
          syncLog.steps[2].endTime = new Date();
          syncLog.steps[2].success = false;
          syncLog.steps[2].error = error.message;
          syncLog.summary.failedSteps++;
          syncLog.summary.errors.push(
            `خطأ في حذف الصور القديمة: ${error.message}`
          );
        }
      }

      if (imageChanges.added.length > 0) {
        const stepIndex = syncLog.steps.length;
        syncLog.steps.push({
          step: stepIndex + 1,
          name: "نسخ الصور الجديدة",
          startTime: new Date(),
        });

        try {
          const copyResult = await this.copyNewImagesToOrderFolder(
            order.orderNumber,
            imageChanges.added
          );

          syncLog.steps[stepIndex].endTime = new Date();
          syncLog.steps[stepIndex].success = copyResult.success;
          syncLog.steps[stepIndex].details = {
            copiedCount: copyResult.copiedCount,
            totalCount: copyResult.totalCount,
            results: copyResult.results,
            successfulCopies: copyResult.successfulCopies,
          };

          if (copyResult.success) {
            syncLog.summary.successfulSteps++;
            if (copyResult.successfulCopies.length > 0) {
              const dbStepIndex = syncLog.steps.length;
              syncLog.steps.push({
                step: dbStepIndex + 1,
                name: "تحديث قاعدة البيانات",
                startTime: new Date(),
              });

              try {
                const dbUpdateResult = await this.updateOrderBackupImagesInDB(
                  orderId,
                  copyResult.successfulCopies
                );

                syncLog.steps[dbStepIndex].endTime = new Date();
                syncLog.steps[dbStepIndex].success = dbUpdateResult.success;
                syncLog.steps[dbStepIndex].details = {
                  updatedImagesCount: copyResult.successfulCopies.length,
                };

                if (dbUpdateResult.success) {
                  syncLog.summary.successfulSteps++;
                } else {
                  syncLog.summary.failedSteps++;
                  syncLog.summary.warnings.push(
                    "فشل في تحديث معلومات الصور في قاعدة البيانات"
                  );
                }
              } catch (error) {
                syncLog.steps[dbStepIndex].endTime = new Date();
                syncLog.steps[dbStepIndex].success = false;
                syncLog.steps[dbStepIndex].error = error.message;
                syncLog.summary.failedSteps++;
                syncLog.summary.warnings.push(
                  `خطأ في تحديث قاعدة البيانات: ${error.message}`
                );
              }
            }
          } else {
            syncLog.summary.failedSteps++;
            syncLog.summary.errors.push(`فشل في نسخ بعض الصور الجديدة`);
          }
        } catch (error) {
          syncLog.steps[stepIndex].endTime = new Date();
          syncLog.steps[stepIndex].success = false;
          syncLog.steps[stepIndex].error = error.message;
          syncLog.summary.failedSteps++;
          syncLog.summary.errors.push(
            `خطأ في نسخ الصور الجديدة: ${error.message}`
          );
        }
      }

      syncLog.endTime = new Date();
      syncLog.summary.totalSteps = syncLog.steps.length;
      syncLog.summary.duration =
        syncLog.endTime.getTime() - syncLog.startTime.getTime();

      return {
        success: syncLog.summary.failedSteps === 0,
        hasChanges: true,
        log: syncLog,
        imageChanges,
        hasWarnings: syncLog.summary.warnings.length > 0,
        message: `تم مزامنة صور الطلب: حذف ${imageChanges.removed.length} وإضافة ${imageChanges.added.length} صورة`,
      };
    } catch (error) {
      syncLog.endTime = new Date();
      syncLog.summary.errors.push(`خطأ عام: ${error.message}`);

      return {
        success: false,
        hasChanges: false,
        log: syncLog,
        error: error.message,
        message: `فشل في مزامنة صور الطلب: ${error.message}`,
      };
    }
  }

  /**
   * التحقق من تطابق الصور في مجلد الطلب مع التكوين الحالي
   */
  async validateOrderFolderSync(orderId) {
    try {
      const orders = await OrderModel.getOrders();
      const order = orders.find((o) => o.id === orderId);

      if (!order) {
        throw new Error("الطلب غير موجود");
      }

      const currentJacketConfig = order.items[0]?.jacketConfig;
      if (!currentJacketConfig) {
        throw new Error("تكوين الجاكيت غير موجود");
      }

      const expectedPublicIds =
        extractImagePublicIdsFromJacketConfig(currentJacketConfig);

      const folderImagesResult = await this.getOrderFolderImages(
        order.orderNumber
      );

      if (!folderImagesResult.success) {
        throw new Error(`فشل في فحص مجلد الطلب: ${folderImagesResult.error}`);
      }

      const actualPublicIds = folderImagesResult.images.map(
        (img) => img.originalPublicId
      );

      const expectedSet = new Set(expectedPublicIds);
      const actualSet = new Set(actualPublicIds);

      const missingImages = expectedPublicIds.filter(
        (id) => !actualSet.has(id)
      );
      const extraImages = actualPublicIds.filter((id) => !expectedSet.has(id));
      const matchingImages = expectedPublicIds.filter((id) =>
        actualSet.has(id)
      );

      const isInSync = missingImages.length === 0 && extraImages.length === 0;

      return {
        success: true,
        isInSync,
        orderNumber: order.orderNumber,
        expected: {
          count: expectedPublicIds.length,
          publicIds: expectedPublicIds,
        },
        actual: {
          count: actualPublicIds.length,
          publicIds: actualPublicIds,
          images: folderImagesResult.images,
        },
        differences: {
          missing: missingImages,
          extra: extraImages,
          matching: matchingImages,
        },
        message: isInSync
          ? "صور الطلب متطابقة مع التكوين الحالي"
          : `عدم تطابق: ${missingImages.length} مفقودة، ${extraImages.length} زائدة`,
      };
    } catch (error) {
      return {
        success: false,
        isInSync: false,
        error: error.message,
        message: `فشل في التحقق من تطابق الصور: ${error.message}`,
      };
    }
  }

  /**
   * إصلاح تلقائي لعدم التطابق في صور الطلب
   */
  async autoFixOrderImageSync(orderId) {
    try {
      const validationResult = await this.validateOrderFolderSync(orderId);

      if (!validationResult.success) {
        throw new Error(`فشل في التحقق من التطابق: ${validationResult.error}`);
      }

      if (validationResult.isInSync) {
        return {
          success: true,
          wasFixed: false,
          message: "صور الطلب متطابقة بالفعل",
          validationResult,
        };
      }

      const fixResults = {
        deletedExtra: { success: false, count: 0 },
        addedMissing: { success: false, count: 0 },
      };

      if (validationResult.differences.extra.length > 0) {
        const deleteResult = await this.deleteSpecificImagesFromOrderFolder(
          validationResult.orderNumber,
          validationResult.differences.extra
        );

        fixResults.deletedExtra = {
          success: deleteResult.success,
          count: deleteResult.deletedCount,
          details: deleteResult,
        };
      }

      if (validationResult.differences.missing.length > 0) {
        const copyResult = await this.copyNewImagesToOrderFolder(
          validationResult.orderNumber,
          validationResult.differences.missing
        );

        fixResults.addedMissing = {
          success: copyResult.success,
          count: copyResult.copiedCount,
          details: copyResult,
        };

        if (copyResult.success && copyResult.successfulCopies.length > 0) {
          await this.updateOrderBackupImagesInDB(
            orderId,
            copyResult.successfulCopies
          );
        }
      }

      const overallSuccess =
        (validationResult.differences.extra.length === 0 ||
          fixResults.deletedExtra.success) &&
        (validationResult.differences.missing.length === 0 ||
          fixResults.addedMissing.success);

      return {
        success: overallSuccess,
        wasFixed: true,
        validationResult,
        fixResults,
        message: overallSuccess
          ? `تم إصلاح تطابق الصور: حذف ${fixResults.deletedExtra.count} وإضافة ${fixResults.addedMissing.count}`
          : "فشل في إصلاح بعض مشاكل التطابق",
      };
    } catch (error) {
      return {
        success: false,
        wasFixed: false,
        error: error.message,
        message: `فشل في الإصلاح التلقائي: ${error.message}`,
      };
    }
  }

  /**
   * تقرير شامل عن حالة صور جميع الطلبات
   */
  async generateOrderImagesReport() {
    try {
      const orders = await OrderModel.getOrders();
      const report = {
        totalOrders: orders.length,
        checkedOrders: 0,
        syncedOrders: 0,
        unsyncedOrders: 0,
        ordersWithIssues: [],
        summary: {
          totalImages: 0,
          totalMissingImages: 0,
          totalExtraImages: 0,
        },
        generatedAt: new Date(),
      };

      for (const order of orders) {
        try {
          const validationResult = await this.validateOrderFolderSync(order.id);
          report.checkedOrders++;

          if (validationResult.success) {
            if (validationResult.isInSync) {
              report.syncedOrders++;
            } else {
              report.unsyncedOrders++;
              report.ordersWithIssues.push({
                orderId: order.id,
                orderNumber: order.orderNumber,
                issues: validationResult.differences,
                message: validationResult.message,
              });
            }

            report.summary.totalImages += validationResult.actual.count;
            report.summary.totalMissingImages +=
              validationResult.differences.missing.length;
            report.summary.totalExtraImages +=
              validationResult.differences.extra.length;
          }

          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (error) {
          report.ordersWithIssues.push({
            orderId: order.id,
            orderNumber: order.orderNumber,
            error: error.message,
          });
        }
      }

      return {
        success: true,
        report,
        message: `تم فحص ${report.checkedOrders} طلب: ${report.syncedOrders} متطابق، ${report.unsyncedOrders} غير متطابق`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `فشل في إنشاء التقرير: ${error.message}`,
      };
    }
  }
}

export default new OrderImageSyncService();
