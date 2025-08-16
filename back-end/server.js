import express from "express";
import dotenv from "dotenv";
import { connectDatabase } from "./config/database.js";
import { initializeCloudinary } from "./config/cloudinary.js";
import CategoryModel from "./models/Category.js";
import PricingModel from "./models/Pricing.js";
import { initializeDefaultImages } from "./controllers/predefinedImagesController.js";
import { scheduleTemporaryLinkCleanup } from "./utils/temporaryLinkCleanup.js";
import uploadRoutes from "./routes/upload.js";
import authRoutes from "./routes/auth.js";
import pricingRoutes from "./routes/pricing.js";
import predefinedImagesRoutes from "./routes/predefinedImages.js";
import ordersRoutes from "./routes/orders.js";
import categoriesRoutes from "./routes/categories.js";
import temporaryLinksRoutes from "./routes/temporaryLinks.js";
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
    version: "2.0.0",
    database: "MongoDB",
    endpoints: {
      uploadSingle: "POST /api/upload/single",
      uploadMultiple: "POST /api/upload/multiple",
      deleteImage: "DELETE /api/upload/:publicId",
      getImageInfo: "GET /api/upload/:publicId",
      adminLogin: "POST /api/auth/login",
      getPricing: "GET /api/pricing",
      calculatePrice: "POST /api/pricing/calculate",
      updatePricing: "PUT /api/pricing (requires auth)",
      getPredefinedImages: "GET /api/predefined-images",
      addPredefinedImage: "POST /api/predefined-images (requires auth)",
      deletePredefinedImage:
        "DELETE /api/predefined-images/:imageId (requires auth)",
      updatePredefinedImage:
        "PUT /api/predefined-images/:imageId (requires auth)",
      createOrder: "POST /api/orders",
      trackOrder: "GET /api/orders/track/:trackingCode",
      getAllOrders: "GET /api/orders (requires auth)",
      getOrderById: "GET /api/orders/:orderId (requires auth)",
      updateOrderStatus: "PUT /api/orders/:orderId/status (requires auth)",
      addOrderNote: "POST /api/orders/:orderId/notes (requires auth)",
      getOrderStats: "GET /api/orders/stats (requires auth)",
      getOrderStatuses: "GET /api/orders/statuses",
      getCategories: "GET /api/categories",
      createCategory: "POST /api/categories (requires auth)",
      updateCategory: "PUT /api/categories/:categoryId (requires auth)",
      deleteCategory: "DELETE /api/categories/:categoryId (requires auth)",
      reorderCategories: "POST /api/categories/reorder (requires auth)",
      createTemporaryLink: "POST /api/temporary-links/create/:orderId (requires auth)",
      validateTemporaryLink: "GET /api/temporary-links/validate/:token",
      getOrderByTemporaryLink: "GET /api/temporary-links/order/:token",
      updateOrderByTemporaryLink: "PUT /api/temporary-links/order/:token",
      getOrderTemporaryLinks: "GET /api/temporary-links/order-links/:orderId (requires auth)",
      invalidateTemporaryLink: "PUT /api/temporary-links/invalidate/:token (requires auth)",
      getTemporaryLinkStats: "GET /api/temporary-links/stats (requires auth)",
      cleanupExpiredLinks: "POST /api/temporary-links/cleanup (requires auth)",
    },
  });
});

// مسارات رفع الصور مع rate limiting خاص
app.use("/api/upload", uploadRateLimit, uploadRoutes);

// مسارات المصادقة
app.use("/api/auth", authRoutes);

// مسارات التسعير
app.use("/api/pricing", pricingRoutes);

// مسارات الشعارات الجاهزة
app.use("/api/predefined-images", predefinedImagesRoutes);

// مسارات الطلبات
app.use("/api/orders", ordersRoutes);

// مسارات التصنيفات
app.use("/api/categories", categoriesRoutes);

// مسارات الروابط المؤقتة
app.use("/api/temporary-links", temporaryLinksRoutes);

// معالج المسارات غير الموجودة
app.use(notFoundHandler);

// معالج الأخطاء العام
app.use(errorHandler);

// بدء الخادم
const startServer = async () => {
  try {
    // الاتصال بقاعدة البيانات
    console.log("🔧 جاري الاتصال بقاعدة البيانات...");
    await connectDatabase();

    // تهيئة البيانات الافتراضية
    console.log("🔧 جاري تهيئة البيانات الافتراضية...");
    await CategoryModel.initializeDefaultCategories();
    await PricingModel.initializeDefaultPricing();
    await initializeDefaultImages();

    // تنظيف الروابط المنتهية الصلاحية عند بدء الخادم
    console.log("🔧 جاري تنظيف الروابط المنتهية الصلاحية...");
    const { default: TemporaryLinkModel } = await import("./models/TemporaryLink.js");
    await TemporaryLinkModel.cleanupExpiredLinks();

    // تهيئة Cloudinary
    console.log("🔧 جاري تهيئة Cloudinary...");
    await initializeCloudinary();

    // بدء جدولة تنظيف الروابط المؤقتة
    scheduleTemporaryLinkCleanup();

    // بدء الخادم
    app.listen(PORT, () => {
      console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
      console.log(`📡 API متاح على: http://localhost:${PORT}/api`);
      console.log(`🏥 فحص الصحة: http://localhost:${PORT}/health`);
      console.log(`📋 معلومات API: http://localhost:${PORT}/api/info`);
      console.log(`🗄️ قاعدة البيانات: MongoDB Atlas`);

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
process.on("SIGTERM", async () => {
  console.log("🛑 تم استلام إشارة SIGTERM، جاري إغلاق الخادم...");
  try {
    const { disconnectDatabase } = await import("./config/database.js");
    await disconnectDatabase();
  } catch (error) {
    console.error("خطأ في قطع الاتصال مع قاعدة البيانات:", error);
  }
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("🛑 تم استلام إشارة SIGINT، جاري إغلاق الخادم...");
  try {
    const { disconnectDatabase } = await import("./config/database.js");
    await disconnectDatabase();
  } catch (error) {
    console.error("خطأ في قطع الاتصال مع قاعدة البيانات:", error);
  }
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
