// معالج الأخطاء العام
export const errorHandler = (err, req, res, next) => {
  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({
      success: false,
      message: "غير مسموح بالوصول من هذا النطاق",
      error: "CORS_ERROR",
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "تنسيق البيانات غير صحيح",
      error: "INVALID_JSON",
    });
  }

  if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
    return res.status(503).json({
      success: false,
      message: "خدمة رفع الصور غير متاحة حالياً",
      error: "SERVICE_UNAVAILABLE",
    });
  }

  res.status(500).json({
    success: false,
    message: "حدث خطأ داخلي في الخادم",
    error: "INTERNAL_SERVER_ERROR",
    ...(process.env.NODE_ENV === "development" && { details: err.message }),
  });
};

// معالج المسارات غير الموجودة
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: "المسار المطلوب غير موجود",
    error: "NOT_FOUND",
    path: req.originalUrl,
  });
};
