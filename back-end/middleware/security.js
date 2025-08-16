import rateLimit from "express-rate-limit";
import helmet from "helmet";

// تحديد معدل الطلبات لرفع الصور
export const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 10000, // حد أقصى 50 طلب رفع لكل IP في 15 دقيقة
  message: {
    success: false,
    message: "تم تجاوز الحد المسموح لرفع الصور. يرجى المحاولة لاحقاً",
    error: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// تحديد معدل الطلبات العام
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 20000, // حد أقصى 200 طلب لكل IP في 15 دقيقة
  message: {
    success: false,
    message: "تم تجاوز الحد المسموح للطلبات. يرجى المحاولة لاحقاً",
    error: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// تكوين Helmet للأمان
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://api.cloudinary.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// التحقق من صحة Content-Type للصور
export const validateImageContentType = (req, res, next) => {
  if (req.method === "POST" && req.path.includes("/upload/")) {
    const contentType = req.get("Content-Type");

    if (!contentType || !contentType.includes("multipart/form-data")) {
      return res.status(400).json({
        success: false,
        message: "نوع المحتوى يجب أن يكون multipart/form-data",
        error: "INVALID_CONTENT_TYPE",
      });
    }
  }

  next();
};
