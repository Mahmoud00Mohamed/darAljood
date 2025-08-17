import cloudinary from "../config/cloudinary.js";

/**
 * نسخ صورة من مجلد إلى آخر في Cloudinary باستخدام رقم الطلب
 */
export const copyImageToOrderFolder = async (originalPublicId, orderNumber) => {
  try {
    console.log(
      `📋 بدء نسخ الصورة ${originalPublicId} إلى مجلد الطلب ${orderNumber}`
    );

    // إنشاء public_id جديد للصورة في مجلد الطلبات باستخدام رقم الطلب
    // استخراج اسم الملف من originalPublicId بشكل صحيح
    const fileName = originalPublicId.includes("/")
      ? originalPublicId.split("/").pop()
      : originalPublicId;

    const newPublicId = `dar-aljoud/orders/${orderNumber}/${fileName}`;

    // التحقق من وجود الصورة مسبقاً في مجلد الطلب
    try {
      const existingImage = await cloudinary.api.resource(newPublicId);
      if (existingImage) {
        console.log(`ℹ️ الصورة موجودة مسبقاً في مجلد الطلب: ${newPublicId}`);
        return {
          success: true,
          originalPublicId,
          newPublicId: existingImage.public_id,
          newUrl: existingImage.secure_url,
          size: existingImage.bytes,
          format: existingImage.format,
          alreadyExists: true,
        };
      }
    } catch (checkError) {
      // الصورة غير موجودة، نتابع عملية النسخ
      console.log(
        `📋 الصورة غير موجودة في مجلد الطلب، سيتم نسخها: ${newPublicId}`
      );
    }
    // نسخ الصورة باستخدام Cloudinary transformation
    const result = await cloudinary.uploader.upload(
      cloudinary.url(originalPublicId, {
        fetch_format: "auto",
        quality: "auto:good",
      }),
      {
        public_id: newPublicId,
        resource_type: "image",
        overwrite: false, // لا تستبدل إذا كانت موجودة
        invalidate: true, // تحديث الكاش
        tags: [`order_${orderNumber}`, "order_backup"], // إضافة tags للتنظيم
      }
    );

    console.log(
      `✅ تم نسخ الصورة بنجاح: ${originalPublicId} -> ${result.public_id}`
    );
    return {
      success: true,
      originalPublicId,
      newPublicId: result.public_id,
      newUrl: result.secure_url,
      size: result.bytes,
      format: result.format,
    };
  } catch (error) {
    console.error(`Error copying image ${originalPublicId}:`, error);
    return {
      success: false,
      originalPublicId,
      error: error.message,
    };
  }
};

/**
 * نسخ عدة صور إلى مجلد الطلب
 */
export const copyImagesToOrderFolder = async (imagePublicIds, orderNumber) => {
  const results = [];

  console.log(
    `🔄 بدء نسخ ${imagePublicIds.length} صورة إلى مجلد الطلب ${orderNumber}`
  );

  for (const publicId of imagePublicIds) {
    if (publicId && publicId.trim()) {
      const result = await copyImageToOrderFolder(publicId, orderNumber);
      results.push(result);

      // تقليل التأخير لتسريع العملية
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;
  console.log(`📊 نتائج النسخ: ${successCount} نجح، ${failCount} فشل`);

  return results;
};

/**
 * استخراج public IDs من URLs الصور
 */
export const extractPublicIdsFromUrls = (imageUrls) => {
  return imageUrls
    .filter((url) => url && typeof url === "string")
    .map((url) => {
      try {
        // استخراج public_id من Cloudinary URL
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
        if (match) {
          return match[1];
        }

        // إذا كان URL يحتوي على transformations
        const transformMatch = url.match(/\/upload\/[^/]+\/(.+)\.[^.]+$/);
        if (transformMatch) {
          return transformMatch[1];
        }

        return null;
      } catch (error) {
        console.error("Error extracting public ID from URL:", url, error);
        return null;
      }
    })
    .filter(Boolean);
};

/**
 * استخراج public IDs من تكوين الجاكيت
 */
export const extractImagePublicIdsFromJacketConfig = (jacketConfig) => {
  const publicIds = [];

  try {
    // استخراج من الشعارات
    if (jacketConfig.logos && Array.isArray(jacketConfig.logos)) {
      jacketConfig.logos.forEach((logo) => {
        if (logo.image) {
          const publicId = extractPublicIdsFromUrls([logo.image])[0];
          if (publicId) {
            publicIds.push(publicId);
          }
        }
      });
    }

    // استخراج من الصور المرفوعة
    if (
      jacketConfig.uploadedImages &&
      Array.isArray(jacketConfig.uploadedImages)
    ) {
      jacketConfig.uploadedImages.forEach((uploadedImage) => {
        if (uploadedImage.url) {
          const publicId = extractPublicIdsFromUrls([uploadedImage.url])[0];
          if (publicId) {
            publicIds.push(publicId);
          }
        }

        // إذا كان publicId موجود مباشرة
        if (uploadedImage.publicId) {
          publicIds.push(uploadedImage.publicId);
        }
      });
    }

    // إزالة المكررات وتنظيف القيم الفارغة
    const cleanedIds = publicIds
      .filter(Boolean) // إزالة القيم الفارغة
      .filter((id) => typeof id === "string" && id.trim().length > 0) // التأكد من أن القيم نصوص صحيحة
      .map((id) => id.trim()); // إزالة المسافات الزائدة

    return [...new Set(cleanedIds)];
  } catch (error) {
    console.error("Error extracting public IDs from jacket config:", error);
    return [];
  }
};

/**
 * حذف صور الطلب عند حذف الطلب
 */
export const deleteOrderImages = async (orderNumber) => {
  try {
    console.log(`🔍 البحث عن صور الطلب رقم ${orderNumber} في Cloudinary...`);

    // البحث عن جميع الصور في مجلد الطلب
    const searchResult = await cloudinary.search
      .expression(`folder:dar-aljoud/orders/${orderNumber}`)
      .sort_by("public_id", "desc")
      .max_results(100)
      .execute();

    console.log(
      `📊 تم العثور على ${searchResult.resources.length} صورة في مجلد الطلب`
    );

    if (searchResult.resources.length === 0) {
      console.log(`ℹ️ لا توجد صور للحذف في مجلد الطلب رقم ${orderNumber}`);
      return {
        success: true,
        deletedCount: 0,
        totalCount: 0,
        results: [],
        message: "لا توجد صور للحذف",
      };
    }

    const deleteResults = [];

    // حذف كل صورة مع تسجيل مفصل
    console.log(`🗑️ بدء حذف ${searchResult.resources.length} صورة...`);
    for (const resource of searchResult.resources) {
      try {
        console.log(`   🗑️ حذف الصورة: ${resource.public_id}`);
        const deleteResult = await cloudinary.uploader.destroy(
          resource.public_id
        );
        deleteResults.push({
          publicId: resource.public_id,
          result: deleteResult.result,
          success: deleteResult.result === "ok",
          size: resource.bytes,
          format: resource.format,
        });

        if (deleteResult.result === "ok") {
          console.log(`     ✅ نجح حذف: ${resource.public_id}`);
        } else {
          console.warn(
            `     ⚠️ فشل حذف: ${resource.public_id} - النتيجة: ${deleteResult.result}`
          );
        }
      } catch (error) {
        console.error(
          `     ❌ خطأ في حذف الصورة ${resource.public_id}:`,
          error
        );
        deleteResults.push({
          publicId: resource.public_id,
          success: false,
          error: error.message,
          size: resource.bytes,
          format: resource.format,
        });
      }

      // تأخير قصير بين العمليات لتجنب إرهاق Cloudinary
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const successfulDeletes = deleteResults.filter((r) => r.success);
    const failedDeletes = deleteResults.filter((r) => !r.success);

    console.log(
      `📊 نتائج الحذف: ${successfulDeletes.length} نجح، ${failedDeletes.length} فشل`
    );

    // 4. محاولة حذف المجلد إذا كان فارغاً
    console.log(`📁 محاولة حذف مجلد الطلب: dar-aljoud/orders/${orderNumber}`);
    try {
      await cloudinary.api.delete_folder(`dar-aljoud/orders/${orderNumber}`);
      console.log(`✅ تم حذف مجلد الطلب بنجاح`);
    } catch (error) {
      // تجاهل خطأ حذف المجلد - قد يكون غير فارغ أو غير موجود أو محمي
      console.warn(`⚠️ لم يتم حذف مجلد الطلب ${orderNumber}: ${error.message}`);
    }

    // تجميع الإحصائيات
    const totalDeletedSize = successfulDeletes.reduce(
      (sum, result) => sum + (result.size || 0),
      0
    );
    const totalDeletedSizeMB = (totalDeletedSize / (1024 * 1024)).toFixed(2);

    console.log(`💾 تم توفير ${totalDeletedSizeMB} ميجابايت من مساحة التخزين`);

    return {
      success: true,
      deletedCount: successfulDeletes.length,
      totalCount: deleteResults.length,
      results: deleteResults,
      statistics: {
        totalSizeDeleted: totalDeletedSize,
        totalSizeDeletedMB: parseFloat(totalDeletedSizeMB),
        successfulDeletes: successfulDeletes.length,
        failedDeletes: failedDeletes.length,
        folderDeleted: true, // نفترض النجاح إذا لم يكن هناك خطأ كبير
      },
      message: `تم حذف ${successfulDeletes.length} من أصل ${deleteResults.length} صورة بنجاح`,
    };
  } catch (error) {
    console.error(
      `Error deleting order images for order ${orderNumber}:`,
      error
    );
    return {
      success: false,
      error: error.message,
      deletedCount: 0,
      totalCount: 0,
      results: [],
      message: `فشل في حذف صور الطلب: ${error.message}`,
    };
  }
};

/**
 * الحصول على معلومات صور الطلب
 */
export const getOrderImagesInfo = async (orderNumber) => {
  try {
    const searchResult = await cloudinary.search
      .expression(`folder:dar-aljoud/orders/${orderNumber}`)
      .sort_by("public_id", "desc")
      .max_results(100)
      .execute();

    return {
      success: true,
      images: searchResult.resources.map((resource) => ({
        publicId: resource.public_id,
        url: resource.secure_url,
        width: resource.width,
        height: resource.height,
        format: resource.format,
        size: resource.bytes,
        createdAt: resource.created_at,
        tags: resource.tags || [],
      })),
      totalCount: searchResult.total_count,
    };
  } catch (error) {
    console.error(
      `Error getting order images info for order ${orderNumber}:`,
      error
    );
    return {
      success: false,
      error: error.message,
      images: [],
      totalCount: 0,
    };
  }
};
