import cloudinary from "../config/cloudinary.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// مسار ملف بيانات الشعارات الجاهزة
const PREDEFINED_IMAGES_FILE = path.join(
  __dirname,
  "../data/predefinedImages.json"
);

// البيانات الافتراضية للشعارات الجاهزة
const DEFAULT_PREDEFINED_IMAGES = [
  {
    id: "logo1",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078450/18_djpzcl.png",
    publicId: "18_djpzcl",
    name: "شعار 1",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo2",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078448/16_b1rjss.png",
    publicId: "16_b1rjss",
    name: "شعار 2",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo3",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078446/21_hq9kn2.png",
    publicId: "21_hq9kn2",
    name: "شعار 3",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo4",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078445/24_ryr2b7.png",
    publicId: "24_ryr2b7",
    name: "شعار 4",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo5",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078445/22_zdgy01.png",
    publicId: "22_zdgy01",
    name: "شعار 5",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo6",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078440/20_z76g1a.png",
    publicId: "20_z76g1a",
    name: "شعار 6",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo7",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078416/23_c30gr9.png",
    publicId: "23_c30gr9",
    name: "شعار 7",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo8",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078392/19_bsd1ci.png",
    publicId: "19_bsd1ci",
    name: "شعار 8",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo9",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078378/15_v4cfc5.png",
    publicId: "15_v4cfc5",
    name: "شعار 9",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo10",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078376/17_xeldqp.png",
    publicId: "17_xeldqp",
    name: "شعار 10",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo11",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078365/14_qqqwh1.png",
    publicId: "14_qqqwh1",
    name: "شعار 11",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo12",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078327/13_hwchwt.png",
    publicId: "13_hwchwt",
    name: "شعار 12",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo13",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078315/2_ecj1mj.png",
    publicId: "2_ecj1mj",
    name: "شعار 13",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo14",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078313/12_tg79xl.png",
    publicId: "12_tg79xl",
    name: "شعار 14",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo15",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078306/6_isqyzt.png",
    publicId: "6_isqyzt",
    name: "شعار 15",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo16",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078292/11_e4rp9f.png",
    publicId: "11_e4rp9f",
    name: "شعار 16",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo17",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078280/7_sdntzs.png",
    publicId: "7_sdntzs",
    name: "شعار 17",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo18",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078273/9_ckkfuc.png",
    publicId: "9_ckkfuc",
    name: "شعار 18",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo19",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078266/8_khcifj.png",
    publicId: "8_khcifj",
    name: "شعار 19",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo20",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078261/10_nt80mg.png",
    publicId: "10_nt80mg",
    name: "شعار 20",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo21",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078234/5_ivza7n.png",
    publicId: "5_ivza7n",
    name: "شعار 21",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo22",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078229/4_emla2u.png",
    publicId: "4_emla2u",
    name: "شعار 22",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo23",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078224/3_ohzsak.png",
    publicId: "3_ohzsak",
    name: "شعار 23",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo24",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078222/1_ucnpj9.png",
    publicId: "1_ucnpj9",
    name: "شعار 24",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
];

// التأكد من وجود مجلد البيانات
const ensureDataDirectory = async () => {
  const dataDir = path.dirname(PREDEFINED_IMAGES_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

// التأكد من وجود ملف البيانات
const ensureDataFile = async () => {
  try {
    await fs.access(PREDEFINED_IMAGES_FILE);
  } catch {
    await savePredefinedImages(DEFAULT_PREDEFINED_IMAGES);
  }
};

// قراءة بيانات الشعارات الجاهزة
const loadPredefinedImages = async () => {
  try {
    await ensureDataDirectory();
    await ensureDataFile();

    const data = await fs.readFile(PREDEFINED_IMAGES_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading predefined images data:", error);
    return DEFAULT_PREDEFINED_IMAGES;
  }
};

// حفظ بيانات الشعارات الجاهزة
const savePredefinedImages = async (images) => {
  try {
    await ensureDataDirectory();
    await fs.writeFile(
      PREDEFINED_IMAGES_FILE,
      JSON.stringify(images, null, 2),
      "utf8"
    );
    return images;
  } catch (error) {
    console.error("Error saving predefined images data:", error);
    throw new Error("فشل في حفظ بيانات الشعارات الجاهزة");
  }
};

// الحصول على جميع الشعارات الجاهزة (عام - بدون مصادقة)
export const getPredefinedImages = async (req, res) => {
  try {
    const images = await loadPredefinedImages();

    res.status(200).json({
      success: true,
      message: "تم الحصول على الشعارات الجاهزة بنجاح",
      data: images,
    });
  } catch (error) {
    console.error("Error getting predefined images:", error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء الحصول على الشعارات الجاهزة",
      error: "GET_PREDEFINED_IMAGES_FAILED",
    });
  }
};

// إضافة شعار جاهز جديد (يتطلب مصادقة المدير)
export const addPredefinedImage = async (req, res) => {
  try {
    // التحقق الإضافي من صلاحيات المدير
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بإضافة شعارات جاهزة",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "لم يتم العثور على ملف للرفع",
        error: "NO_FILE_PROVIDED",
      });
    }

    const { name, category, description } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "اسم الشعار والفئة مطلوبان",
        error: "MISSING_REQUIRED_FIELDS",
      });
    }

    // تحويل buffer إلى base64
    const fileStr = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    // خيارات الرفع إلى Cloudinary
    const uploadOptions = {
      folder: "dar-aljoud/predefined-logos",
      resource_type: "image",
      quality: "auto:good",
      fetch_format: "auto",
      flags: "progressive",
      transformation: [
        {
          width: 1000,
          height: 1000,
          crop: "limit",
          quality: "auto:good",
        },
      ],
    };

    // رفع الصورة إلى Cloudinary
    const result = await cloudinary.uploader.upload(fileStr, uploadOptions);

    // تحميل البيانات الحالية
    const currentImages = await loadPredefinedImages();

    // إنشاء شعار جديد
    const newImage = {
      id: `logo-${Date.now()}`,
      url: result.secure_url,
      publicId: result.public_id,
      name: name.trim(),
      category: category.trim(),
      description: description?.trim() || "شعار جاهز للاستخدام",
      createdAt: new Date().toISOString(),
      updatedBy: req.admin?.username || "admin",
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    };

    // إضافة الشعار الجديد
    const updatedImages = [...currentImages, newImage];
    await savePredefinedImages(updatedImages);

    res.status(201).json({
      success: true,
      message: "تم إضافة الشعار الجاهز بنجاح",
      data: newImage,
    });
  } catch (error) {
    console.error("Error adding predefined image:", error);

    // معالجة أخطاء Cloudinary المحددة
    if (error.http_code) {
      return res.status(error.http_code).json({
        success: false,
        message: "خطأ في خدمة رفع الصور",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إضافة الشعار الجاهز",
      error: "ADD_PREDEFINED_IMAGE_FAILED",
    });
  }
};

// حذف شعار جاهز (يتطلب مصادقة المدير)
export const deletePredefinedImage = async (req, res) => {
  try {
    // التحقق الإضافي من صلاحيات المدير
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بحذف شعارات جاهزة",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const { imageId } = req.params;

    if (!imageId) {
      return res.status(400).json({
        success: false,
        message: "معرف الشعار مطلوب",
        error: "IMAGE_ID_REQUIRED",
      });
    }

    // تحميل البيانات الحالية
    const currentImages = await loadPredefinedImages();

    // البحث عن الشعار
    const imageToDelete = currentImages.find((img) => img.id === imageId);

    if (!imageToDelete) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على الشعار",
        error: "IMAGE_NOT_FOUND",
      });
    }

    // حذف الصورة من Cloudinary
    try {
      await cloudinary.uploader.destroy(imageToDelete.publicId);
    } catch (cloudinaryError) {
      console.warn("Failed to delete from Cloudinary:", cloudinaryError);
      // نتابع العملية حتى لو فشل حذف الصورة من Cloudinary
    }

    // حذف الشعار من البيانات المحلية
    const updatedImages = currentImages.filter((img) => img.id !== imageId);
    await savePredefinedImages(updatedImages);

    res.status(200).json({
      success: true,
      message: "تم حذف الشعار الجاهز بنجاح",
      data: { imageId, deletedImage: imageToDelete },
    });
  } catch (error) {
    console.error("Error deleting predefined image:", error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف الشعار الجاهز",
      error: "DELETE_PREDEFINED_IMAGE_FAILED",
    });
  }
};

// تحديث معلومات شعار جاهز (يتطلب مصادقة المدير)
export const updatePredefinedImage = async (req, res) => {
  try {
    // التحقق الإضافي من صلاحيات المدير
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بتحديث شعارات جاهزة",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const { imageId } = req.params;
    const { name, category, description } = req.body;

    if (!imageId) {
      return res.status(400).json({
        success: false,
        message: "معرف الشعار مطلوب",
        error: "IMAGE_ID_REQUIRED",
      });
    }

    // تحميل البيانات الحالية
    const currentImages = await loadPredefinedImages();

    // البحث عن الشعار
    const imageIndex = currentImages.findIndex((img) => img.id === imageId);

    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على الشعار",
        error: "IMAGE_NOT_FOUND",
      });
    }

    // تحديث بيانات الشعار
    const updatedImage = {
      ...currentImages[imageIndex],
      ...(name && { name: name.trim() }),
      ...(category && { category: category.trim() }),
      ...(description && { description: description.trim() }),
      updatedAt: new Date().toISOString(),
      updatedBy: req.admin?.username || "admin",
    };

    currentImages[imageIndex] = updatedImage;
    await savePredefinedImages(currentImages);

    res.status(200).json({
      success: true,
      message: "تم تحديث الشعار الجاهز بنجاح",
      data: updatedImage,
    });
  } catch (error) {
    console.error("Error updating predefined image:", error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث الشعار الجاهز",
      error: "UPDATE_PREDEFINED_IMAGE_FAILED",
    });
  }
};

// إعادة تعيين الشعارات الجاهزة إلى القيم الافتراضية (يتطلب مصادقة المدير)
export const resetPredefinedImages = async (req, res) => {
  try {
    // التحقق الإضافي من صلاحيات المدير
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بإعادة تعيين الشعارات الجاهزة",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const updatedBy = req.admin?.username || "admin";
    const defaultImages = DEFAULT_PREDEFINED_IMAGES.map((img) => ({
      ...img,
      updatedAt: new Date().toISOString(),
      updatedBy,
    }));

    await savePredefinedImages(defaultImages);

    res.status(200).json({
      success: true,
      message: "تم إعادة تعيين الشعارات الجاهزة إلى القيم الافتراضية بنجاح",
      data: defaultImages,
    });
  } catch (error) {
    console.error("Error resetting predefined images:", error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إعادة تعيين الشعارات الجاهزة",
      error: "RESET_PREDEFINED_IMAGES_FAILED",
    });
  }
};
