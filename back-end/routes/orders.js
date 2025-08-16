import express from "express";
import {
  createOrder,
  trackOrderByCode,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateOrder,
  addOrderNote,
  getOrderStats,
  deleteOrder,
  getOrderStatuses,
} from "../controllers/orderController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { generalRateLimit } from "../middleware/security.js";

const router = express.Router();

// المسارات العامة (بدون مصادقة)
router.post("/", generalRateLimit, createOrder);
router.get("/track/:searchValue", trackOrderByCode);
router.get("/statuses", getOrderStatuses);

// المسارات الإدارية (تتطلب مصادقة)
router.get("/", authenticateAdmin, getAllOrders);
router.get("/stats", authenticateAdmin, getOrderStats);
router.get("/:orderId", authenticateAdmin, getOrderById);
router.put("/:orderId/status", authenticateAdmin, updateOrderStatus);
router.put("/:orderId", authenticateAdmin, updateOrder);
router.post("/:orderId/notes", authenticateAdmin, addOrderNote);
router.delete("/:orderId", authenticateAdmin, deleteOrder);

// معالج الأخطاء للمسارات
router.use((error, req, res, next) => {
  console.error("خطأ في مسار الطلبات:", error);

  res.status(500).json({
    success: false,
    message: "حدث خطأ داخلي في نظام الطلبات",
    error: "ORDERS_INTERNAL_ERROR",
  });
});

export default router;
