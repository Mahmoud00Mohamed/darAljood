import express from "express";
import {
  adminLogin,
  verifySession,
  adminLogout,
} from "../controllers/authController.js";
import { authenticateAdmin, validateLoginData } from "../middleware/auth.js";

const router = express.Router();

// تسجيل دخول المدير
router.post("/login", validateLoginData, adminLogin);

// التحقق من صحة الجلسة
router.get("/verify", authenticateAdmin, verifySession);

// تسجيل خروج المدير
router.post("/logout", authenticateAdmin, adminLogout);

// معالج الأخطاء للمسارات
router.use((error, req, res, next) => {
  res.status(500).json({
    success: false,
    message: "حدث خطأ داخلي في نظام المصادقة",
    error: "AUTH_INTERNAL_ERROR",
  });
});

export default router;
