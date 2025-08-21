import { uploadToR2, deleteFromR2, generateFileKey } from "../config/cloudflareR2.js";

/**
 * نسخ صورة من مجلد إلى آخر في R2 باستخدام رقم الطلب
 */
export const copyImageToOrderFolder = async (originalKey, orderNumber) => {
  try {
    // استخراج اسم الملف من المفتاح الأصلي
    const fileName = originalKey.includes("/")
      ? originalKey.split("/").pop()
      : originalKey;

    const newKey = `dar-aljoud/orders/${orderNumber}/${fileName}`;

    try {
      // التحقق من وجود الصورة في مجلد الطلب
      const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${newKey}`;
      const checkResponse = await fetch(publicUrl, { method: "HEAD" });
      
      if (checkResponse.ok) {
        return {
          success: true,
          originalKey,
          newKey: newKey,
          newUrl: publicUrl,
          size: parseInt(checkResponse.headers.get("content-length") || "0"),
          format: checkResponse.headers.get("content-type")?.split("/")[1] || "unknown",
          alreadyExists: true,
        };
      }
    } catch (checkError) {
      // الصورة غير موجودة، نتابع عملية النسخ
    }

    // تحميل الصورة الأصلية
    const originalImageUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${originalKey}`;
    const imageResponse = await fetch(originalImageUrl);
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch original image: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";

    // رفع الصورة إلى مجلد الطلب الجديد
    const uploadResult = await uploadToR2(
      Buffer.from(imageBuffer),
      newKey,
      contentType,
      {
        originalKey: originalKey,
        orderNumber: orderNumber,
        copiedAt: new Date().toISOString(),
        isOrderBackup: "true",
      }
    );

    return {
      success: true,
      originalKey,
      newKey: uploadResult.key,
      newUrl: uploadResult.url,
      size: uploadResult.size,
      format: contentType.split("/")[1],
    };
  } catch (error) {
    console.error("Error copying image to order folder:", error);
    return {
      success: false,
      originalKey,
      error: error.message,
    };
  }
};

/**
 * نسخ عدة صور إلى مجلد الطلب
 */
export const copyImagesToOrderFolder = async (imageKeys, orderNumber) => {
  const results = [];

  for (const key of imageKeys) {
    if (key && key.trim()) {
      const result = await copyImageToOrderFolder(key, orderNumber);
      results.push(result);
      // تأخير قصير بين العمليات لتجنب إرهاق الخادم
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
};

/**
 * استخراج مفاتيح الصور من URLs
 */
export const extractKeysFromUrls = (imageUrls) => {
  return imageUrls
    .filter((url) => url && typeof url === "string")
    .map((url) => {
      try {
        // استخراج المفتاح من URL الـ R2
        const r2PublicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
        if (url.startsWith(r2PublicUrl)) {
          return url.replace(r2PublicUrl + "/", "");
        }
        
        // إذا كان URL من Cloudinary (للتوافق مع البيانات القديمة)
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
        if (match) {
          return `migrated/${match[1]}`;
        }

        return null;
      } catch (error) {
        console.warn("Error extracting key from URL:", url, error);
        return null;
      }
    })
    .filter(Boolean);
};

/**
 * استخراج مفاتيح الصور من تكوين الجاكيت
 */
export const extractImageKeysFromJacketConfig = (jacketConfig) => {
  const keys = [];

  try {
    if (jacketConfig.logos && Array.isArray(jacketConfig.logos)) {
      jacketConfig.logos.forEach((logo) => {
        if (logo.image) {
          const key = extractKeysFromUrls([logo.image])[0];
          if (key) {
            keys.push(key);
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
          const key = extractKeysFromUrls([uploadedImage.url])[0];
          if (key) {
            keys.push(key);
          }
        }

        if (uploadedImage.publicId) {
          keys.push(uploadedImage.publicId);
        }
      });
    }

    const cleanedKeys = keys
      .filter(Boolean)
      .filter((key) => typeof key === "string" && key.trim().length > 0)
      .map((key) => key.trim());

    return [...new Set(cleanedKeys)];
  } catch (error) {
    console.error("Error extracting image keys from jacket config:", error);
    return [];
  }
};

/**
 * حذف صور الطلب عند حذف الطلب
 */
export const deleteOrderImages = async (orderNumber) => {
  try {
    // في R2، نحتاج لحذف الصور واحدة تلو الأخرى
    // يمكن تحسين هذا لاحقاً باستخدام list objects API
    
    const folderPrefix = `dar-aljoud/orders/${orderNumber}/`;
    const deleteResults = [];
    
    // محاولة حذف الصور الشائعة (يمكن تحسين هذا لاحقاً)
    const commonImageNames = [
      "front.png", "back.png", "right.png", "left.png",
      "logo1.png", "logo2.png", "logo3.png", "logo4.png",
      "text1.png", "text2.png"
    ];

    for (const imageName of commonImageNames) {
      try {
        const imageKey = `${folderPrefix}${imageName}`;
        const deleteResult = await deleteFromR2(imageKey);
        
        if (deleteResult.success) {
          deleteResults.push({
            key: imageKey,
            success: true,
            size: 0, // R2 لا يرجع حجم الملف عند الحذف
          });
        }
      } catch (error) {
        // تجاهل الأخطاء للصور غير الموجودة
        if (error.name !== "NoSuchKey") {
          console.warn(`Warning deleting ${imageName}:`, error);
        }
      }
    }

    const successfulDeletes = deleteResults.filter((r) => r.success);

    return {
      success: true,
      deletedCount: successfulDeletes.length,
      totalCount: deleteResults.length,
      results: deleteResults,
      statistics: {
        totalSizeDeleted: 0, // R2 لا يوفر معلومات الحجم عند الحذف
        totalSizeDeletedMB: 0,
        successfulDeletes: successfulDeletes.length,
        failedDeletes: deleteResults.length - successfulDeletes.length,
        folderDeleted: true,
      },
      message: `تم حذف ${successfulDeletes.length} صورة من مجلد الطلب`,
    };
  } catch (error) {
    console.error("Error deleting order images:", error);
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
    // في R2، نحتاج لاستخدام list objects API أو محاولة الوصول للصور المعروفة
    const folderPrefix = `dar-aljoud/orders/${orderNumber}/`;
    const images = [];
    
    // محاولة الوصول للصور الشائعة
    const commonImageNames = [
      "front.png", "back.png", "right.png", "left.png",
      "logo1.png", "logo2.png", "logo3.png", "logo4.png"
    ];

    for (const imageName of commonImageNames) {
      try {
        const imageKey = `${folderPrefix}${imageName}`;
        const imageUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${imageKey}`;
        
        // التحقق من وجود الصورة
        const checkResponse = await fetch(imageUrl, { method: "HEAD" });
        
        if (checkResponse.ok) {
          images.push({
            publicId: imageKey,
            url: imageUrl,
            width: null,
            height: null,
            format: checkResponse.headers.get("content-type")?.split("/")[1] || "unknown",
            size: parseInt(checkResponse.headers.get("content-length") || "0"),
            createdAt: checkResponse.headers.get("last-modified") || new Date().toISOString(),
            tags: [`order_${orderNumber}`, "order_backup"],
          });
        }
      } catch (error) {
        // تجاهل الأخطاء للصور غير الموجودة
      }
    }

    return {
      success: true,
      images: images,
      totalCount: images.length,
    };
  } catch (error) {
    console.error("Error getting order images info:", error);
    return {
      success: false,
      error: error.message,
      images: [],
      totalCount: 0,
    };
  }
};