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

    console.log(`🔍 تحليل التغييرات في الصور:`);
    console.log(`   📋 الصور القديمة (${oldPublicIds.length}):`, oldPublicIds);
    console.log(`   📋 الصور الجديدة (${newPublicIds.length}):`, newPublicIds);
    const oldSet = new Set(oldPublicIds);
    const newSet = new Set(newPublicIds);

    // الصور المحذوفة (موجودة في القديم وليست في الجديد)
    const removedImages = oldPublicIds.filter((id) => !newSet.has(id));

    // الصور المضافة (موجودة في الجديد وليست في القديم)
    const addedImages = newPublicIds.filter((id) => !oldSet.has(id));

    // الصور المحتفظ بها (موجودة في كلاهما)
    const retainedImages = oldPublicIds.filter((id) => newSet.has(id));

    console.log(`📊 نتائج التحليل:`);
    console.log(`   🗑️ صور للحذف (${removedImages.length}):`, removedImages);
    console.log(`   ➕ صور للإضافة (${addedImages.length}):`, addedImages);
    console.log(
      `   ✅ صور محتفظ بها (${retainedImages.length}):`,
      retainedImages
    );
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
      console.log(`🔍 فحص مجلد الطلب رقم ${orderNumber}...`);

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

      console.log(`📊 تم العثور على ${folderImages.length} صورة في مجلد الطلب`);

      // طباعة تفاصيل الصور الموجودة
      if (folderImages.length > 0) {
        console.log(
          `📋 الصور الموجودة في المجلد:`,
          folderImages.map((img) => ({
            publicId: img.publicId,
            originalPublicId: img.originalPublicId,
            size: img.size,
            format: img.format,
          }))
        );
      }

      return {
        success: true,
        images: folderImages,
        totalCount: folderImages.length,
      };
    } catch (error) {
      console.error(`❌ خطأ في فحص مجلد الطلب ${orderNumber}:`, error);
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
    // مثال: dar-aljoud/orders/123456789/original_image_name
    // نريد استخراج: original_image_name
    try {
      const parts = backupPublicId.split("/");
      const fileName = parts[parts.length - 1];

      // إذا كان اسم الملف يحتوي على امتداد، أزله
      const nameWithoutExtension = fileName.split(".")[0];

      return nameWithoutExtension || fileName;
    } catch (error) {
      console.error(
        `خطأ في استخراج الـ public ID الأصلي من ${backupPublicId}:`,
        error
      );
      return backupPublicId;
    }
  }

  /**
   * حذف صور محددة من مجلد الطلب
   */
  async deleteSpecificImagesFromOrderFolder(orderNumber, publicIdsToDelete) {
    const deleteResults = [];

    console.log(
      `🗑️ بدء حذف ${publicIdsToDelete.length} صورة من مجلد الطلب ${orderNumber}...`
    );

    for (const originalPublicId of publicIdsToDelete) {
      try {
        // البحث عن الصورة في مجلد الطلب - تحسين البحث
        let backupPublicId;

        // إذا كان originalPublicId يحتوي على مسار كامل
        if (originalPublicId.includes("/")) {
          backupPublicId = `dar-aljoud/orders/${orderNumber}/${originalPublicId
            .split("/")
            .pop()}`;
        } else {
          // إذا كان مجرد اسم الملف
          backupPublicId = `dar-aljoud/orders/${orderNumber}/${originalPublicId}`;
        }

        // محاولة البحث عن الصورة أولاً للتأكد من وجودها
        try {
          await cloudinary.api.resource(backupPublicId);
        } catch (searchError) {
          // إذا لم توجد الصورة، جرب البحث بطرق أخرى
          console.log(
            `🔍 لم توجد الصورة ${backupPublicId}، محاولة البحث بطرق أخرى...`
          );

          // البحث في مجلد الطلب عن صور تحتوي على نفس الاسم
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
            console.log(`✅ تم العثور على الصورة: ${backupPublicId}`);
          } else {
            console.warn(
              `⚠️ لم يتم العثور على الصورة ${originalPublicId} في مجلد الطلب`
            );
            deleteResults.push({
              originalPublicId,
              backupPublicId: `dar-aljoud/orders/${orderNumber}/${fileName}`,
              success: false,
              error: "الصورة غير موجودة في مجلد الطلب",
            });
            continue;
          }
        }

        console.log(`   🗑️ حذف الصورة: ${backupPublicId}`);
        const deleteResult = await cloudinary.uploader.destroy(backupPublicId);

        deleteResults.push({
          originalPublicId,
          backupPublicId,
          success: deleteResult.result === "ok",
          result: deleteResult.result,
        });

        if (deleteResult.result === "ok") {
          console.log(`     ✅ نجح حذف: ${backupPublicId}`);
        } else {
          console.warn(
            `     ⚠️ فشل حذف: ${backupPublicId} - النتيجة: ${deleteResult.result}`
          );
        }
      } catch (error) {
        console.error(`     ❌ خطأ في حذف الصورة ${originalPublicId}:`, error);
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

      // تأخير قصير بين العمليات
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const successfulDeletes = deleteResults.filter((r) => r.success);
    const failedDeletes = deleteResults.filter((r) => !r.success);

    console.log(
      `📊 نتائج حذف الصور: ${successfulDeletes.length} نجح، ${failedDeletes.length} فشل`
    );

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

    console.log(
      `📋 بدء نسخ ${publicIdsToAdd.length} صورة جديدة إلى مجلد الطلب ${orderNumber}...`
    );

    for (const originalPublicId of publicIdsToAdd) {
      try {
        console.log(`   📋 نسخ الصورة: ${originalPublicId}`);

        // التحقق من وجود الصورة الأصلية أولاً
        try {
          await cloudinary.api.resource(originalPublicId);
        } catch (checkError) {
          console.error(`❌ الصورة الأصلية غير موجودة: ${originalPublicId}`);
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

        if (copyResult.success) {
          console.log(
            `     ✅ نجح نسخ: ${originalPublicId} -> ${copyResult.newPublicId}`
          );
        } else {
          console.warn(
            `     ⚠️ فشل نسخ: ${originalPublicId} - ${copyResult.error}`
          );
        }
      } catch (error) {
        console.error(`     ❌ خطأ في نسخ الصورة ${originalPublicId}:`, error);
        copyResults.push({
          success: false,
          originalPublicId,
          error: error.message,
        });
      }

      // تأخير قصير بين العمليات
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const successfulCopies = copyResults.filter((r) => r.success);
    const failedCopies = copyResults.filter((r) => !r.success);

    console.log(
      `📊 نتائج نسخ الصور: ${successfulCopies.length} نجح، ${failedCopies.length} فشل`
    );

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
      console.log(
        `💾 تحديث معلومات الصور المنسوخة في قاعدة البيانات للطلب ${orderId}...`
      );

      const updatedOrder = await OrderModel.updateOrderBackupImages(
        orderId,
        backupImagesInfo
      );

      console.log(
        `✅ تم تحديث معلومات ${backupImagesInfo.length} صورة في قاعدة البيانات`
      );

      return {
        success: true,
        updatedOrder,
        message: `تم تحديث معلومات ${backupImagesInfo.length} صورة في قاعدة البيانات`,
      };
    } catch (error) {
      console.error(`❌ خطأ في تحديث معلومات الصور في قاعدة البيانات:`, error);
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
      console.log(`🔄 بدء مزامنة صور الطلب ${orderId}...`);

      // الخطوة 1: الحصول على بيانات الطلب
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

      // الخطوة 2: تحليل التغييرات في الصور
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

      console.log(`📊 تحليل التغييرات:`);
      console.log(`   🗑️ صور للحذف: ${imageChanges.removed.length}`);
      console.log(`   ➕ صور للإضافة: ${imageChanges.added.length}`);
      console.log(`   ✅ صور محتفظ بها: ${imageChanges.retained.length}`);

      // طباعة تفاصيل الصور للتشخيص
      if (imageChanges.removed.length > 0) {
        console.log(`🗑️ الصور المراد حذفها:`, imageChanges.removed);
      }
      if (imageChanges.added.length > 0) {
        console.log(`➕ الصور المراد إضافتها:`, imageChanges.added);
      }

      // إذا لم تكن هناك تغييرات، لا نحتاج لفعل شيء
      if (!imageChanges.hasChanges) {
        console.log(`ℹ️ لا توجد تغييرات في الصور للطلب ${orderId}`);

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

      // الخطوة 3: حذف الصور القديمة من مجلد الطلب
      if (imageChanges.removed.length > 0) {
        syncLog.steps.push({
          step: 3,
          name: "حذف الصور القديمة",
          startTime: new Date(),
        });

        try {
          console.log(
            `🗑️ بدء حذف ${imageChanges.removed.length} صورة قديمة من مجلد الطلب ${order.orderNumber}...`
          );

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
            console.log(
              `✅ تم حذف ${deleteResult.deletedCount} صورة قديمة بنجاح`
            );
          } else {
            syncLog.summary.failedSteps++;
            syncLog.summary.errors.push(`فشل في حذف بعض الصور القديمة`);
            console.error(`❌ فشل في حذف الصور القديمة`);

            // طباعة تفاصيل الفشل
            const failedDeletes = deleteResult.results.filter(
              (r) => !r.success
            );
            if (failedDeletes.length > 0) {
              console.error(`❌ الصور التي فشل حذفها:`, failedDeletes);
            }
          }
        } catch (error) {
          syncLog.steps[2].endTime = new Date();
          syncLog.steps[2].success = false;
          syncLog.steps[2].error = error.message;
          syncLog.summary.failedSteps++;
          syncLog.summary.errors.push(
            `خطأ في حذف الصور القديمة: ${error.message}`
          );
          console.error(`❌ خطأ في حذف الصور القديمة:`, error);
        }
      }

      // الخطوة 4: نسخ الصور الجديدة إلى مجلد الطلب
      if (imageChanges.added.length > 0) {
        const stepIndex = syncLog.steps.length;
        syncLog.steps.push({
          step: stepIndex + 1,
          name: "نسخ الصور الجديدة",
          startTime: new Date(),
        });

        try {
          console.log(
            `➕ بدء نسخ ${imageChanges.added.length} صورة جديدة إلى مجلد الطلب ${order.orderNumber}...`
          );

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
            console.log(`✅ تم نسخ ${copyResult.copiedCount} صورة جديدة بنجاح`);

            // الخطوة 5: تحديث معلومات الصور في قاعدة البيانات
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
                  console.log(`✅ تم تحديث معلومات الصور في قاعدة البيانات`);
                } else {
                  syncLog.summary.failedSteps++;
                  syncLog.summary.warnings.push(
                    "فشل في تحديث معلومات الصور في قاعدة البيانات"
                  );
                  console.warn(
                    `⚠️ فشل في تحديث معلومات الصور في قاعدة البيانات`
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
                console.warn(`⚠️ خطأ في تحديث قاعدة البيانات:`, error);
              }
            }
          } else {
            syncLog.summary.failedSteps++;
            syncLog.summary.errors.push(`فشل في نسخ بعض الصور الجديدة`);
            console.error(`❌ فشل في نسخ الصور الجديدة`);

            // طباعة تفاصيل الفشل
            const failedCopies = copyResult.failedCopies || [];
            if (failedCopies.length > 0) {
              console.error(`❌ الصور التي فشل نسخها:`, failedCopies);
            }
          }
        } catch (error) {
          syncLog.steps[stepIndex].endTime = new Date();
          syncLog.steps[stepIndex].success = false;
          syncLog.steps[stepIndex].error = error.message;
          syncLog.summary.failedSteps++;
          syncLog.summary.errors.push(
            `خطأ في نسخ الصور الجديدة: ${error.message}`
          );
          console.error(`❌ خطأ في نسخ الصور الجديدة:`, error);
        }
      }

      // إنهاء السجل
      syncLog.endTime = new Date();
      syncLog.summary.totalSteps = syncLog.steps.length;
      syncLog.summary.duration =
        syncLog.endTime.getTime() - syncLog.startTime.getTime();

      // طباعة ملخص العملية
      console.log(`🎯 ملخص مزامنة صور الطلب ${orderId}:`);
      console.log(`   ⏱️ المدة: ${syncLog.summary.duration}ms`);
      console.log(`   ✅ خطوات نجحت: ${syncLog.summary.successfulSteps}`);
      console.log(`   ❌ خطوات فشلت: ${syncLog.summary.failedSteps}`);
      console.log(`   ⚠️ تحذيرات: ${syncLog.summary.warnings.length}`);

      if (syncLog.summary.errors.length > 0) {
        console.error(`❌ أخطاء حدثت:`, syncLog.summary.errors);
      }

      if (syncLog.summary.warnings.length > 0) {
        console.warn(`⚠️ تحذيرات:`, syncLog.summary.warnings);
      }

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

      console.error(`❌ فشل في مزامنة صور الطلب ${orderId}:`, error);

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
      console.log(`🔍 التحقق من تطابق صور الطلب ${orderId}...`);

      // الحصول على بيانات الطلب
      const orders = await OrderModel.getOrders();
      const order = orders.find((o) => o.id === orderId);

      if (!order) {
        throw new Error("الطلب غير موجود");
      }

      // استخراج الصور من التكوين الحالي
      const currentJacketConfig = order.items[0]?.jacketConfig;
      if (!currentJacketConfig) {
        throw new Error("تكوين الجاكيت غير موجود");
      }

      const expectedPublicIds =
        extractImagePublicIdsFromJacketConfig(currentJacketConfig);
      console.log(
        `📋 الصور المتوقعة في التكوين (${expectedPublicIds.length}):`,
        expectedPublicIds
      );

      // الحصول على الصور الموجودة في المجلد
      const folderImagesResult = await this.getOrderFolderImages(
        order.orderNumber
      );

      if (!folderImagesResult.success) {
        throw new Error(`فشل في فحص مجلد الطلب: ${folderImagesResult.error}`);
      }

      const actualPublicIds = folderImagesResult.images.map(
        (img) => img.originalPublicId
      );
      console.log(
        `📋 الصور الموجودة في المجلد (${actualPublicIds.length}):`,
        actualPublicIds
      );

      // مقارنة القوائم
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

      console.log(`📊 نتائج التحقق من التطابق:`);
      console.log(`   ✅ صور متطابقة: ${matchingImages.length}`);
      console.log(`   ❌ صور مفقودة: ${missingImages.length}`);
      console.log(`   ⚠️ صور زائدة: ${extraImages.length}`);
      console.log(`   🎯 حالة التطابق: ${isInSync ? "متطابق" : "غير متطابق"}`);

      if (missingImages.length > 0) {
        console.log(`❌ الصور المفقودة:`, missingImages);
      }
      if (extraImages.length > 0) {
        console.log(`⚠️ الصور الزائدة:`, extraImages);
      }

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
      console.error(`❌ خطأ في التحقق من تطابق صور الطلب ${orderId}:`, error);
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
      console.log(`🔧 بدء الإصلاح التلقائي لصور الطلب ${orderId}...`);

      // التحقق من التطابق أولاً
      const validationResult = await this.validateOrderFolderSync(orderId);

      if (!validationResult.success) {
        throw new Error(`فشل في التحقق من التطابق: ${validationResult.error}`);
      }

      if (validationResult.isInSync) {
        console.log(`✅ صور الطلب ${orderId} متطابقة بالفعل`);
        return {
          success: true,
          wasFixed: false,
          message: "صور الطلب متطابقة بالفعل",
          validationResult,
        };
      }

      // إصلاح عدم التطابق
      const fixResults = {
        deletedExtra: { success: false, count: 0 },
        addedMissing: { success: false, count: 0 },
      };

      // حذف الصور الزائدة
      if (validationResult.differences.extra.length > 0) {
        console.log(
          `🗑️ حذف ${validationResult.differences.extra.length} صورة زائدة...`
        );

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

      // إضافة الصور المفقودة
      if (validationResult.differences.missing.length > 0) {
        console.log(
          `➕ إضافة ${validationResult.differences.missing.length} صورة مفقودة...`
        );

        const copyResult = await this.copyNewImagesToOrderFolder(
          validationResult.orderNumber,
          validationResult.differences.missing
        );

        fixResults.addedMissing = {
          success: copyResult.success,
          count: copyResult.copiedCount,
          details: copyResult,
        };

        // تحديث قاعدة البيانات إذا نجح النسخ
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

      console.log(`🎯 نتائج الإصلاح التلقائي:`);
      console.log(
        `   🗑️ حذف الزائدة: ${
          fixResults.deletedExtra.success ? "نجح" : "فشل"
        } (${fixResults.deletedExtra.count})`
      );
      console.log(
        `   ➕ إضافة المفقودة: ${
          fixResults.addedMissing.success ? "نجح" : "فشل"
        } (${fixResults.addedMissing.count})`
      );
      console.log(`   🎯 النتيجة العامة: ${overallSuccess ? "نجح" : "فشل"}`);

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
      console.error(`❌ خطأ في الإصلاح التلقائي للطلب ${orderId}:`, error);
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
      console.log(`📊 إنشاء تقرير شامل عن حالة صور الطلبات...`);

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

          // تأخير قصير بين فحص الطلبات
          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`خطأ في فحص الطلب ${order.orderNumber}:`, error);
          report.ordersWithIssues.push({
            orderId: order.id,
            orderNumber: order.orderNumber,
            error: error.message,
          });
        }
      }

      console.log(`📊 تقرير صور الطلبات:`);
      console.log(`   📦 إجمالي الطلبات: ${report.totalOrders}`);
      console.log(`   ✅ طلبات متطابقة: ${report.syncedOrders}`);
      console.log(`   ❌ طلبات غير متطابقة: ${report.unsyncedOrders}`);
      console.log(`   🖼️ إجمالي الصور: ${report.summary.totalImages}`);
      console.log(`   ❌ صور مفقودة: ${report.summary.totalMissingImages}`);
      console.log(`   ⚠️ صور زائدة: ${report.summary.totalExtraImages}`);

      return {
        success: true,
        report,
        message: `تم فحص ${report.checkedOrders} طلب: ${report.syncedOrders} متطابق، ${report.unsyncedOrders} غير متطابق`,
      };
    } catch (error) {
      console.error(`❌ خطأ في إنشاء تقرير صور الطلبات:`, error);
      return {
        success: false,
        error: error.message,
        message: `فشل في إنشاء التقرير: ${error.message}`,
      };
    }
  }
}

export default new OrderImageSyncService();
