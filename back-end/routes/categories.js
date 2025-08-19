import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  getCategoryById,
  resetCategories,
} from "../controllers/categoryController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = express.Router();

// المسارات العامة (بدون مصادقة)
router.get("/", getCategories);
router.get("/:categoryId", getCategoryById);

// المسارات الإدارية (تتطلب مصادقة)
router.post("/", authenticateAdmin, createCategory);
router.put("/:categoryId", authenticateAdmin, updateCategory);
router.delete("/:categoryId", authenticateAdmin, deleteCategory);
router.post("/reorder", authenticateAdmin, reorderCategories);
router.post("/reset", authenticateAdmin, resetCategories);

// معالج الأخطاء للمسارات
router.use((error, req, res, next) => {
  res.status(500).json({
    success: false,
    message: "حدث خطأ داخلي في نظام التصنيفات",
    error: "CATEGORIES_INTERNAL_ERROR",
  });
});

export default router;
