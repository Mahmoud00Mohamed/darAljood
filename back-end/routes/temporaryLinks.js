import express from "express";
import {
  createTemporaryLink,
  validateTemporaryLink,
  getOrderByTemporaryLink,
  updateOrderByTemporaryLink,
  getOrderTemporaryLinks,
  invalidateTemporaryLink,
  getTemporaryLinkStats,
  cleanupExpiredLinks,
} from "../controllers/temporaryLinkController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { generalRateLimit } from "../middleware/security.js";

const router = express.Router();

// المسارات العامة (بدون مصادقة)
router.get("/validate/:token", generalRateLimit, validateTemporaryLink);
router.get("/order/:token", generalRateLimit, getOrderByTemporaryLink);
router.put("/order/:token", generalRateLimit, updateOrderByTemporaryLink);

// المسارات الإدارية (تتطلب مصادقة)
router.post("/create/:orderId", authenticateAdmin, createTemporaryLink);
router.get("/order-links/:orderId", authenticateAdmin, getOrderTemporaryLinks);
router.put("/invalidate/:token", authenticateAdmin, invalidateTemporaryLink);
router.get("/stats", authenticateAdmin, getTemporaryLinkStats);
router.post("/cleanup", authenticateAdmin, cleanupExpiredLinks);

// معالج الأخطاء للمسارات
router.use((error, req, res, next) => {
  console.error("خطأ في مسار الروابط المؤقتة:", error);

  res.status(500).json({
    success: false,
    message: "حدث خطأ داخلي في نظام الروابط المؤقتة",
    error: "TEMPORARY_LINKS_INTERNAL_ERROR",
  });
});

export default router;
