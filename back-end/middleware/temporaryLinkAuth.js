import TemporaryLinkModel from "../models/TemporaryLink.js";

/**
 * Middleware للتحقق من صحة الرابط المؤقت
 */
export const validateTemporaryLinkMiddleware = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "رمز الرابط مطلوب",
        error: "TOKEN_REQUIRED",
      });
    }

    const userAgent = req.get("User-Agent") || "";
    const ipAddress = req.ip || req.connection.remoteAddress || "";

    const validation = await TemporaryLinkModel.validateTemporaryLink(
      token,
      userAgent,
      ipAddress
    );

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        error: validation.reason,
      });
    }

    req.temporaryLink = validation.link;
    req.orderId = validation.orderId;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء التحقق من الرابط",
      error: "VALIDATION_ERROR",
    });
  }
};

/**
 * Middleware لتسجيل الوصول للرابط المؤقت
 */
export const logTemporaryLinkAccess = (req, res, next) => {
  next();
};

/**
 * Middleware لتحديد معدل الطلبات للروابط المؤقتة
 */
export const temporaryLinkRateLimit = (req, res, next) => {
  // يمكن إضافة rate limiting مخصص للروابط المؤقتة هنا
  // حالياً نستخدم generalRateLimit
  next();
};
