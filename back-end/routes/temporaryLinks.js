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
import OrderImageSyncService from "../utils/orderImageSyncService.js";

const router = express.Router();

// المسارات العامة (بدون مصادقة)
router.get("/validate/:token", generalRateLimit, validateTemporaryLink);
router.get("/order/:token", generalRateLimit, getOrderByTemporaryLink);

// تحديث الطلب عبر الرابط المؤقت مع مزامنة الصور
router.put(
  "/order/:token",
  generalRateLimit,
  async (req, res, next) => {
    try {
      const { token } = req.params;
      const orderData = await import(
        "../controllers/temporaryLinkController.js"
      )
        .then((module) =>
          module.getOrderByTemporaryLink(
            { params: { token } },
            { json: () => {} }
          )
        )
        .catch(() => null);

      req.oldJacketConfig = orderData?.order?.items?.[0]?.jacketConfig;
      next();
    } catch (error) {
      next();
    }
  },
  updateOrderByTemporaryLink
);

// المسارات الإدارية (تتطلب مصادقة)
router.post("/create/:orderId", authenticateAdmin, createTemporaryLink);
router.get("/order-links/:orderId", authenticateAdmin, getOrderTemporaryLinks);
router.put("/invalidate/:token", authenticateAdmin, invalidateTemporaryLink);
router.get("/stats", authenticateAdmin, getTemporaryLinkStats);
router.post("/cleanup", authenticateAdmin, cleanupExpiredLinks);

// معالج الأخطاء للمسارات
router.use((error, req, res, next) => {
  res.status(500).json({
    success: false,
    message: "حدث خطأ داخلي في نظام الروابط المؤقتة",
    error: "TEMPORARY_LINKS_INTERNAL_ERROR",
  });
});

export default router;
