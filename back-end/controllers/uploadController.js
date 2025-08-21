import {
  uploadToR2,
  deleteFromR2,
  generateFileKey,
  processImage,
  default as r2Client,
} from "../config/cloudflareR2.js";

// رفع صورة واحدة
export const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "لم يتم العثور على ملف للرفع",
        error: "NO_FILE_PROVIDED",
      });
    }

    // معالجة الصورة وتحسينها
    const processedBuffer = await processImage(req.file.buffer);

    // توليد مفتاح فريد للملف
    const fileKey = generateFileKey(req.file.originalname, "dar-aljoud/logos");

    // رفع الصورة إلى R2
    const uploadResult = await uploadToR2(
      processedBuffer,
      fileKey,
      req.file.mimetype,
      {
        originalName: req.file.originalname,
        uploadedAt: new Date().toISOString(),
        size: req.file.size.toString(),
      }
    );

    res.status(200).json({
      success: true,
      message: "تم رفع الصورة بنجاح",
      data: {
        url: uploadResult.url,
        publicId: uploadResult.key,
        key: uploadResult.key,
        width: null, // R2 لا يوفر معلومات الأبعاد تلقائياً
        height: null,
        format: req.file.mimetype.split("/")[1],
        size: uploadResult.size,
        createdAt: new Date().toISOString(),
        bucket: uploadResult.bucket,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);

    if (error.name === "CredentialsError") {
      return res.status(401).json({
        success: false,
        message: "خطأ في بيانات الاعتماد لخدمة التخزين",
        error: "CREDENTIALS_ERROR",
      });
    }

    if (error.name === "NetworkError") {
      return res.status(503).json({
        success: false,
        message: "خطأ في الاتصال بخدمة التخزين",
        error: "NETWORK_ERROR",
      });
    }

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء رفع الصورة",
      error: "UPLOAD_FAILED",
      details: error.message,
    });
  }
};

// رفع عدة صور
export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "لم يتم العثور على ملفات للرفع",
        error: "NO_FILES_PROVIDED",
      });
    }

    const uploadPromises = req.files.map(async (file) => {
      try {
        // معالجة الصورة وتحسينها
        const processedBuffer = await processImage(file.buffer);

        // توليد مفتاح فريد للملف
        const fileKey = generateFileKey(file.originalname, "dar-aljoud/logos");

        // رفع الصورة إلى R2
        const uploadResult = await uploadToR2(
          processedBuffer,
          fileKey,
          file.mimetype,
          {
            originalName: file.originalname,
            uploadedAt: new Date().toISOString(),
            size: file.size.toString(),
          }
        );

        return {
          url: uploadResult.url,
          publicId: uploadResult.key,
          key: uploadResult.key,
          width: null,
          height: null,
          format: file.mimetype.split("/")[1],
          size: uploadResult.size,
          originalName: file.originalname,
          bucket: uploadResult.bucket,
        };
      } catch (error) {
        console.error(`Error uploading file ${file.originalname}:`, error);
        return {
          error: error.message,
          originalName: file.originalname,
          success: false,
        };
      }
    });

    const uploadResults = await Promise.all(uploadPromises);

    // فصل النتائج الناجحة عن الفاشلة
    const successfulUploads = uploadResults.filter((result) => !result.error);
    const failedUploads = uploadResults.filter((result) => result.error);

    if (failedUploads.length > 0) {
      console.warn("Some uploads failed:", failedUploads);
    }

    res.status(200).json({
      success: true,
      message: `تم رفع ${successfulUploads.length} من أصل ${uploadResults.length} صورة بنجاح`,
      data: successfulUploads,
      failed: failedUploads,
    });
  } catch (error) {
    console.error("Batch upload error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء رفع الصور",
      error: "BATCH_UPLOAD_FAILED",
      details: error.message,
    });
  }
};

// حذف صورة من R2
export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "مفتاح الصورة مطلوب",
        error: "PUBLIC_ID_REQUIRED",
      });
    }

    // فك تشفير المفتاح إذا كان مُرمز
    const decodedKey = decodeURIComponent(publicId);

    const result = await deleteFromR2(decodedKey);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "تم حذف الصورة بنجاح",
        data: { publicId: decodedKey, key: result.key },
      });
    } else {
      res.status(404).json({
        success: false,
        message: "لم يتم العثور على الصورة",
        error: "IMAGE_NOT_FOUND",
      });
    }
  } catch (error) {
    console.error("Delete error:", error);

    if (error.name === "NoSuchKey") {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على الصورة",
        error: "IMAGE_NOT_FOUND",
      });
    }

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف الصورة",
      error: "DELETE_FAILED",
      details: error.message,
    });
  }
};

// الحصول على معلومات صورة
export const getImageInfo = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "مفتاح الصورة مطلوب",
        error: "PUBLIC_ID_REQUIRED",
      });
    }

    // فك تشفير المفتاح إذا كان مُرمز
    const decodedKey = decodeURIComponent(publicId);

    // إنشاء URL عام للصورة
    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${decodedKey}`;

    // محاولة الحصول على metadata من R2
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: decodedKey,
      });

      const response = await r2Client.send(command);

      res.status(200).json({
        success: true,
        message: "تم الحصول على معلومات الصورة بنجاح",
        data: {
          url: publicUrl,
          publicId: decodedKey,
          key: decodedKey,
          width: null, // R2 لا يوفر معلومات الأبعاد
          height: null,
          format: response.ContentType?.split("/")[1] || "unknown",
          size: response.ContentLength || 0,
          createdAt:
            response.LastModified?.toISOString() || new Date().toISOString(),
          metadata: response.Metadata || {},
        },
      });
    } catch (error) {
      if (error.name === "NoSuchKey") {
        return res.status(404).json({
          success: false,
          message: "لم يتم العثور على الصورة",
          error: "IMAGE_NOT_FOUND",
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Get image info error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء الحصول على معلومات الصورة",
      error: "GET_INFO_FAILED",
      details: error.message,
    });
  }
};

// رفع صورة مع معاينة (للاختبار)
export const uploadWithPreview = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "لم يتم العثور على ملف للرفع",
        error: "NO_FILE_PROVIDED",
      });
    }

    // معالجة الصورة
    const processedBuffer = await processImage(req.file.buffer);

    // توليد مفتاح للمعاينة
    const previewKey = generateFileKey(
      req.file.originalname,
      "dar-aljoud/previews"
    );

    // رفع للمعاينة
    const uploadResult = await uploadToR2(
      processedBuffer,
      previewKey,
      req.file.mimetype,
      {
        originalName: req.file.originalname,
        uploadedAt: new Date().toISOString(),
        size: req.file.size.toString(),
        isPreview: "true",
      }
    );

    res.status(200).json({
      success: true,
      message: "تم رفع الصورة للمعاينة بنجاح",
      data: {
        url: uploadResult.url,
        publicId: uploadResult.key,
        key: uploadResult.key,
        isPreview: true,
        format: req.file.mimetype.split("/")[1],
        size: uploadResult.size,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Preview upload error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء رفع الصورة للمعاينة",
      error: "PREVIEW_UPLOAD_FAILED",
      details: error.message,
    });
  }
};

export { r2Client };
