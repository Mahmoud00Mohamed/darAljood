import express from "express";
import upload, { handleMulterError } from "../middleware/upload.js";
import {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
  getImageInfo,
} from "../controllers/uploadController.js";

const router = express.Router();

// رفع صورة واحدة
router.post(
  "/single",
  upload.single("image"),
  handleMulterError,
  uploadSingleImage
);

// رفع عدة صور
router.post(
  "/multiple",
  upload.array("images", 10),
  handleMulterError,
  uploadMultipleImages
);

// حذف صورة
router.delete("/:publicId", deleteImage);

// الحصول على معلومات صورة
router.get("/:publicId", getImageInfo);

// معالج الأخطاء العام للمسارات
router.use((error, req, res, next) => {
  res.status(500).json({
    success: false,
    message: "حدث خطأ داخلي في الخادم",
    error: "INTERNAL_SERVER_ERROR",
  });
});

export default router;
