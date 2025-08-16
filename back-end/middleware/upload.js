import multer from "multer";
import path from "path";

// تكوين multer للتعامل مع رفع الملفات
const storage = multer.memoryStorage();

// فلترة أنواع الملفات المسموحة
const fileFilter = (req, file, cb) => {
  // أنواع الملفات المسموحة
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("نوع الملف غير مدعوم. يُسمح فقط بـ JPEG, PNG, WEBP"), false);
  }
};

// تكوين multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB حد أقصى لحجم الملف
    files: 10, // حد أقصى 10 ملفات في الطلب الواحد
  },
});

// معالج الأخطاء لـ multer
export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "حجم الملف كبير جداً. الحد الأقصى 10MB",
        error: "FILE_TOO_LARGE",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "عدد الملفات كبير جداً. الحد الأقصى 10 ملفات",
        error: "TOO_MANY_FILES",
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "حقل الملف غير متوقع",
        error: "UNEXPECTED_FIELD",
      });
    }
  }

  if (error.message.includes("نوع الملف غير مدعوم")) {
    return res.status(400).json({
      success: false,
      message: error.message,
      error: "INVALID_FILE_TYPE",
    });
  }

  next(error);
};

export default upload;
