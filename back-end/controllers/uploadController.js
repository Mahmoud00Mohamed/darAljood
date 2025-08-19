import cloudinary from "../config/cloudinary.js";

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

    const fileStr = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    const uploadOptions = {
      folder: "dar-aljoud/logos",
      resource_type: "image",
      quality: "auto:good",
      fetch_format: "auto",
      flags: "progressive",
      transformation: [
        {
          width: 1000,
          height: 1000,
          crop: "limit",
          quality: "auto:good",
        },
      ],
    };

    const result = await cloudinary.uploader.upload(fileStr, uploadOptions);

    res.status(200).json({
      success: true,
      message: "تم رفع الصورة بنجاح",
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        createdAt: result.created_at,
      },
    });
  } catch (error) {
    if (error.http_code) {
      return res.status(error.http_code).json({
        success: false,
        message: "خطأ في خدمة رفع الصور",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء رفع الصورة",
      error: "UPLOAD_FAILED",
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
      const fileStr = `data:${file.mimetype};base64,${file.buffer.toString(
        "base64"
      )}`;

      const uploadOptions = {
        folder: "dar-aljoud/logos",
        resource_type: "image",
        quality: "auto:good",
        fetch_format: "auto",
        flags: "progressive",
        transformation: [
          {
            width: 1000,
            height: 1000,
            crop: "limit",
            quality: "auto:good",
          },
        ],
      };

      const result = await cloudinary.uploader.upload(fileStr, uploadOptions);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        originalName: file.originalname,
      };
    });

    const uploadResults = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      message: `تم رفع ${uploadResults.length} صورة بنجاح`,
      data: uploadResults,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء رفع الصور",
      error: "BATCH_UPLOAD_FAILED",
    });
  }
};

// حذف صورة من Cloudinary
export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "معرف الصورة مطلوب",
        error: "PUBLIC_ID_REQUIRED",
      });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      res.status(200).json({
        success: true,
        message: "تم حذف الصورة بنجاح",
        data: { publicId, result: result.result },
      });
    } else {
      res.status(404).json({
        success: false,
        message: "لم يتم العثور على الصورة",
        error: "IMAGE_NOT_FOUND",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف الصورة",
      error: "DELETE_FAILED",
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
        message: "معرف الصورة مطلوب",
        error: "PUBLIC_ID_REQUIRED",
      });
    }

    const result = await cloudinary.api.resource(publicId);

    res.status(200).json({
      success: true,
      message: "تم الحصول على معلومات الصورة بنجاح",
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        createdAt: result.created_at,
      },
    });
  } catch (error) {
    if (error.http_code === 404) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على الصورة",
        error: "IMAGE_NOT_FOUND",
      });
    }

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء الحصول على معلومات الصورة",
      error: "GET_INFO_FAILED",
    });
  }
};
