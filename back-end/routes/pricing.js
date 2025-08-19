import express from "express";
import {
  getPricing,
  calculatePrice,
  updatePricing,
  resetPricing,
  getPricingHistory,
} from "../controllers/pricingController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { uploadRateLimit } from "../middleware/security.js";

const router = express.Router();

// المسارات العامة (بدون مصادقة)
router.get("/", getPricing);
router.post("/calculate", calculatePrice);

// المسارات الإدارية (تتطلب مصادقة)
router.put("/", authenticateAdmin, updatePricing);
router.post("/reset", authenticateAdmin, resetPricing);
router.get("/history", authenticateAdmin, getPricingHistory);

// تطبيق rate limiting على المسارات الإدارية
router.use("/", uploadRateLimit);

// معالج الأخطاء للمسارات
router.use((error, req, res, next) => {
  res.status(500).json({
    success: false,
    message: "حدث خطأ داخلي في نظام التسعير",
    error: "PRICING_INTERNAL_ERROR",
  });
});

export default router;
