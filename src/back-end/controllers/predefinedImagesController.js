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
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924691/16_ubbdbh.png",
    publicId: "16_ubbdbh",
    name: "شعار 1",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo2",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924689/15_l0llk1.png",
    publicId: "15_l0llk1",
    name: "شعار 2",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo3",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924688/14_htk85j.png",
    publicId: "14_htk85j",
    name: "شعار 3",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo4",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924676/21_swow6t.png",
    publicId: "21_swow6t",
    name: "شعار 4",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo5",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924675/22_c9rump.png",
    publicId: "22_c9rump",
    name: "شعار 5",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo6",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924671/24_x6nvyt.png",
    publicId: "24_x6nvyt",
    name: "شعار 6",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo7",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924669/20_guvnha.png",
    publicId: "20_guvnha",
    name: "شعار 7",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo8",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924661/23_rroabu.png",
    publicId: "23_rroabu",
    name: "شعار 8",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo9",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924658/18_cpbs4b.png",
    publicId: "18_cpbs4b",
    name: "شعار 9",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo10",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924657/19_kxggs4.png",
    publicId: "19_kxggs4",
    name: "شعار 10",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo11",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924650/17_k8axov.png",
    publicId: "17_k8axov",
    name: "شعار 11",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo12",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924644/12_woyybb.png",
    publicId: "12_woyybb",
    name: "شعار 12",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo13",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924644/13_mvqmgk.png",
    publicId: "13_mvqmgk",
    name: "شعار 13",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo14",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924636/11_revnd6.png",
    publicId: "11_revnd6",
    name: "شعار 14",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo15",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924629/9_ysz5vg.png",
    publicId: "9_ysz5vg",
    name: "شعار 15",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo16",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924627/7_ptxh2b.png",
    publicId: "7_ptxh2b",
    name: "شعار 16",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo17",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924622/10_yhvn0o.png",
    publicId: "10_yhvn0o",
    name: "شعار 17",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo18",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924621/2_vobopy.png",
    publicId: "2_vobopy",
    name: "شعار 18",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo19",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924621/1_kqcgdh.png",
    publicId: "1_kqcgdh",
    name: "شعار 19",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo20",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924621/8_yoay91.png",
    publicId: "8_yoay91",
    name: "شعار 20",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo21",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924610/6_xfyebx.png",
    publicId: "6_xfyebx",
    name: "شعار 21",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo22",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924609/5_oupz1k.png",
    publicId: "5_oupz1k",
    name: "شعار 22",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo23",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924603/3_k7zsjo.png",
    publicId: "3_k7zsjo",
    name: "شعار 23",
    category: "شعارات جاهزة",
    description: "شعار جاهز للاستخدام",
    createdAt: new Date().toISOString(),
    updatedBy: "system",
  },
  {
    id: "logo24",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924602/4_v07jhi.png",
    publicId: "4_v07jhi",
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
