import express from "express";
import upload, { handleMulterError } from "../middleware/upload.js";
import {
  getPredefinedImages,
  addPredefinedImage,
  deletePredefinedImage,
  updatePredefinedImage,
  resetPredefinedImages,
  getPredefinedImagesByCategory,
  getPredefinedImagesWithCategories,
} from "../controllers/predefinedImagesController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { uploadRateLimit } from "../middleware/security.js";

const router = express.Router();

// المسارات العامة (بدون مصادقة)
router.get("/", getPredefinedImages);
router.get("/with-categories", getPredefinedImagesWithCategories);
router.get("/category/:categoryId", getPredefinedImagesByCategory);

// المسارات الإدارية (تتطلب مصادقة)
router.post(
  "/",
  authenticateAdmin,
  uploadRateLimit,
  upload.single("image"),
  handleMulterError,
  addPredefinedImage
);

router.delete("/:imageId", authenticateAdmin, deletePredefinedImage);

router.put("/:imageId", authenticateAdmin, updatePredefinedImage);

router.post("/reset", authenticateAdmin, resetPredefinedImages);

// معالج الأخطاء للمسارات
router.use((error, req, res, next) => {
  res.status(500).json({
    success: false,
    message: "حدث خطأ داخلي في نظام الشعارات الجاهزة",
    error: "PREDEFINED_IMAGES_INTERNAL_ERROR",
  });
});

export default router;
