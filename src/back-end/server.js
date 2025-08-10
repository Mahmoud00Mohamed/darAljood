import express from "express";
import dotenv from "dotenv";
import { initializeCloudinary } from "./config/cloudinary.js";
import uploadRoutes from "./routes/upload.js";
import authRoutes from "./routes/auth.js";
import pricingRoutes from "./routes/pricing.js";
import corsMiddleware from "./middleware/cors.js";
import {
  uploadRateLimit,
  generalRateLimit,
  securityHeaders,
  validateImageContentType,
} from "./middleware/security.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

// تحميل متغيرات البيئة
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// تطبيق middleware الأمان
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(generalRateLimit);

// تحليل JSON (مع حد أقصى للحجم)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// التحقق من صحة Content-Type
app.use(validateImageContentType);

// مسار الصحة للتحقق من حالة الخادم
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "الخادم يعمل بشكل طبيعي",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// مسار معلومات الخادم
app.get("/api/info", (req, res) => {
  res.status(200).json({
    success: true,
    message: "خادم دار الجود لرفع الصور",
    version: "1.0.0",
    endpoints: {
      uploadSingle: "POST /api/upload/single",
      uploadMultiple: "POST /api/upload/multiple",
      deleteImage: "DELETE /api/upload/:publicId",
      getImageInfo: "GET /api/upload/:publicId",
      adminLogin: "POST /api/auth/login",
      getPricing: "GET /api/pricing",
      calculatePrice: "POST /api/pricing/calculate",
      updatePricing: "PUT /api/pricing (requires auth)",
    },
  });
});

// مسارات رفع الصور مع rate limiting خاص
app.use("/api/upload", uploadRateLimit, uploadRoutes);

// مسارات المصادقة
app.use("/api/auth", authRoutes);

// مسارات التسعير
app.use("/api/pricing", pricingRoutes);

// معالج المسارات غير الموجودة
app.use(notFoundHandler);

// معالج الأخطاء العام
app.use(errorHandler);

// بدء الخادم
const startServer = async () => {
  try {
    // تهيئة Cloudinary
    console.log("🔧 جاري تهيئة Cloudinary...");
    await initializeCloudinary();

    // بدء الخادم
    app.listen(PORT, () => {
      console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
      console.log(`📡 API متاح على: http://localhost:${PORT}/api`);
      console.log(`🏥 فحص الصحة: http://localhost:${PORT}/health`);
      console.log(`📋 معلومات API: http://localhost:${PORT}/api/info`);

      if (process.env.NODE_ENV === "development") {
        console.log("🔧 وضع التطوير مفعل");
      }
    });
  } catch (error) {
    console.error("❌ فشل في بدء الخادم:", error.message);
    process.exit(1);
  }
};

// معالجة إغلاق الخادم بشكل صحيح
process.on("SIGTERM", () => {
  console.log("🛑 تم استلام إشارة SIGTERM، جاري إغلاق الخادم...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 تم استلام إشارة SIGINT، جاري إغلاق الخادم...");
  process.exit(0);
});

// معالجة الأخطاء غير المعالجة
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

// بدء الخادم
startServer();
