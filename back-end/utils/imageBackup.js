import cloudinary from "../config/cloudinary.js";

/**
 * نسخ صورة من مجلد إلى آخر في Cloudinary باستخدام رقم الطلب
 */
export const copyImageToOrderFolder = async (originalPublicId, orderNumber) => {
  try {
    const fileName = originalPublicId.includes("/")
      ? originalPublicId.split("/").pop()
      : originalPublicId;

    const newPublicId = `dar-aljoud/orders/${orderNumber}/${fileName}`;

    try {
      const existingImage = await cloudinary.api.resource(newPublicId);
      if (existingImage) {
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
    }

    const originalImageUrl = cloudinary.url(originalPublicId, {
      secure: true,
      fetch_format: "auto",
      quality: "auto:good",
    });

    const result = await cloudinary.uploader.upload(originalImageUrl, {
      public_id: newPublicId,
      folder: `dar-aljoud/orders/${orderNumber}`,
      resource_type: "image",
      overwrite: false,
      invalidate: true,
      tags: [`order_${orderNumber}`, "order_backup"],
      use_filename: false,
      unique_filename: false,
    });

    return {
      success: true,
      originalPublicId,
      newPublicId: result.public_id,
      newUrl: result.secure_url,
      size: result.bytes,
      format: result.format,
    };
  } catch (error) {
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

  for (const publicId of imagePublicIds) {
    if (publicId && publicId.trim()) {
      const result = await copyImageToOrderFolder(publicId, orderNumber);
      results.push(result);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

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
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
        if (match) {
          return match[1];
        }

        const transformMatch = url.match(/\/upload\/[^/]+\/(.+)\.[^.]+$/);
        if (transformMatch) {
          return transformMatch[1];
        }

        return null;
      } catch (error) {
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

        if (uploadedImage.publicId) {
          publicIds.push(uploadedImage.publicId);
        }
      });
    }

    const cleanedIds = publicIds
      .filter(Boolean)
      .filter((id) => typeof id === "string" && id.trim().length > 0)
      .map((id) => id.trim());

    return [...new Set(cleanedIds)];
  } catch (error) {
    return [];
  }
};

/**
 * حذف صور الطلب عند حذف الطلب
 */
export const deleteOrderImages = async (orderNumber) => {
  try {
    const searchResult = await cloudinary.search
      .expression(`folder:dar-aljoud/orders/${orderNumber}`)
      .sort_by("public_id", "desc")
      .max_results(100)
      .execute();

    if (searchResult.resources.length === 0) {
      return {
        success: true,
        deletedCount: 0,
        totalCount: 0,
        results: [],
        message: "لا توجد صور للحذف",
      };
    }

    const deleteResults = [];

    for (const resource of searchResult.resources) {
      try {
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
      } catch (error) {
        deleteResults.push({
          publicId: resource.public_id,
          success: false,
          error: error.message,
          size: resource.bytes,
          format: resource.format,
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const successfulDeletes = deleteResults.filter((r) => r.success);
    const failedDeletes = deleteResults.filter((r) => !r.success);

    try {
      await cloudinary.api.delete_folder(`dar-aljoud/orders/${orderNumber}`);
    } catch (error) {
      // تجاهل خطأ حذف المجلد
    }

    const totalDeletedSize = successfulDeletes.reduce(
      (sum, result) => sum + (result.size || 0),
      0
    );
    const totalDeletedSizeMB = (totalDeletedSize / (1024 * 1024)).toFixed(2);

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
        folderDeleted: true,
      },
      message: `تم حذف ${successfulDeletes.length} من أصل ${deleteResults.length} صورة بنجاح`,
    };
  } catch (error) {
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
    return {
      success: false,
      error: error.message,
      images: [],
      totalCount: 0,
    };
  }
};
