import cloudinary from "../config/cloudinary.js";
import PredefinedImageSchema from "../models/schemas/PredefinedImageSchema.js";
import CategoryModel from "../models/Category.js";

// البيانات الافتراضية للشعارات الجاهزة
const DEFAULT_PREDEFINED_IMAGES = [
  {
    id: "logo1",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078450/18_djpzcl.png",
    publicId: "18_djpzcl",
    name: "شعار 1",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
    updatedBy: "system",
  },
  {
    id: "logo2",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078448/16_b1rjss.png",
    publicId: "16_b1rjss",
    name: "شعار 2",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
    updatedBy: "system",
  },
  {
    id: "logo3",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078446/21_hq9kn2.png",
    publicId: "21_hq9kn2",
    name: "شعار 3",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
    updatedBy: "system",
  },
  {
    id: "logo4",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078445/24_ryr2b7.png",
    publicId: "24_ryr2b7",
    name: "شعار 4",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
    updatedBy: "system",
  },
  {
    id: "logo5",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078445/22_zdgy01.png",
    publicId: "22_zdgy01",
    name: "شعار 5",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
    updatedBy: "system",
  },
  {
    id: "logo6",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078440/20_z76g1a.png",
    publicId: "20_z76g1a",
    name: "شعار 6",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
    updatedBy: "system",
  },
  {
    id: "logo7",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078416/23_c30gr9.png",
    publicId: "23_c30gr9",
    name: "شعار 7",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
    updatedBy: "system",
  },
  {
    id: "logo8",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078392/19_bsd1ci.png",
    publicId: "19_bsd1ci",
    name: "شعار 8",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
    updatedBy: "system",
  },
  {
    id: "logo9",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078378/15_v4cfc5.png",
    publicId: "15_v4cfc5",
    name: "شعار 9",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
    updatedBy: "system",
  },
  {
    id: "logo10",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078376/17_xeldqp.png",
    publicId: "17_xeldqp",
    name: "شعار 10",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
    updatedBy: "system",
  },
  {
    id: "logo11",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078365/14_qqqwh1.png",
    publicId: "14_qqqwh1",
    name: "شعار 11",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
    updatedBy: "system",
  },
  {
    id: "logo12",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078327/13_hwchwt.png",
    publicId: "13_hwchwt",
    name: "شعار 12",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
    updatedBy: "system",
  },
  {
    id: "logo13",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078315/2_ecj1mj.png",
    publicId: "2_ecj1mj",
    name: "شعار 13",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
    updatedBy: "system",
  },
  {
    id: "logo14",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078313/12_tg79xl.png",
    publicId: "12_tg79xl",
    name: "شعار 14",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
    updatedBy: "system",
  },
  {
    id: "logo15",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078306/6_isqyzt.png",
    publicId: "6_isqyzt",
    name: "شعار 15",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
    updatedBy: "system",
  },
  {
    id: "logo16",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078292/11_e4rp9f.png",
    publicId: "11_e4rp9f",
    name: "شعار 16",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
    updatedBy: "system",
  },
  {
    id: "logo17",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078280/7_sdntzs.png",
    publicId: "7_sdntzs",
    name: "شعار 17",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
    updatedBy: "system",
  },
  {
    id: "logo18",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078273/9_ckkfuc.png",
    publicId: "9_ckkfuc",
    name: "شعار 18",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
    updatedBy: "system",
  },
  {
    id: "logo19",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078266/8_khcifj.png",
    publicId: "8_khcifj",
    name: "شعار 19",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
    updatedBy: "system",
  },
  {
    id: "logo20",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078261/10_nt80mg.png",
    publicId: "10_nt80mg",
    name: "شعار 20",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
    updatedBy: "system",
  },
  {
    id: "logo21",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078234/5_ivza7n.png",
    publicId: "5_ivza7n",
    name: "شعار 21",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
    updatedBy: "system",
  },
  {
    id: "logo22",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078229/4_emla2u.png",
    publicId: "4_emla2u",
    name: "شعار 22",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
    updatedBy: "system",
  },
  {
    id: "logo23",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078224/3_ohzsak.png",
    publicId: "3_ohzsak",
    name: "شعار 23",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
    updatedBy: "system",
  },
  {
    id: "logo24",
    url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078222/1_ucnpj9.png",
    publicId: "1_ucnpj9",
    name: "شعار 24",
    categoryId: "logos",
    description: "شعار جاهز للاستخدام",
    updatedBy: "system",
  },
];

/**
 * تهيئة الشعارات الافتراضية
 */
export const initializeDefaultImages = async () => {
  try {
    const existingCount = await PredefinedImageSchema.countDocuments();

    if (existingCount === 0) {
      console.log("🔧 إنشاء الشعارات الجاهزة الافتراضية...");
      await PredefinedImageSchema.insertMany(DEFAULT_PREDEFINED_IMAGES);
      console.log("✅ تم إنشاء الشعارات الجاهزة الافتراضية بنجاح");
    }
  } catch (error) {
    console.error("❌ خطأ في تهيئة الشعارات الجاهزة:", error);
    throw new Error("فشل في تهيئة الشعارات الجاهزة");
  }
};

// الحصول على جميع الشعارات الجاهزة (عام - بدون مصادقة)
export const getPredefinedImages = async (req, res) => {
  try {
    const images = await PredefinedImageSchema.find()
      .sort({ createdAt: -1 })
      .lean();

    const cleanImages = images.map((img) => ({
      ...img,
      _id: undefined,
    }));

    res.status(200).json({
      success: true,
      message: "تم الحصول على الشعارات الجاهزة بنجاح",
      data: cleanImages,
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

    const { name, categoryId, description } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "اسم الشعار ومعرف التصنيف مطلوبان",
        error: "MISSING_REQUIRED_FIELDS",
      });
    }

    // التحقق من وجود التصنيف
    const category = await CategoryModel.getCategoryById(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "التصنيف المحدد غير موجود",
        error: "CATEGORY_NOT_FOUND",
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

    // إنشاء شعار جديد في قاعدة البيانات
    const newImage = new PredefinedImageSchema({
      id: `logo-${Date.now()}`,
      url: result.secure_url,
      publicId: result.public_id,
      name: name.trim(),
      categoryId: categoryId.trim(),
      description: description?.trim() || "شعار جاهز للاستخدام",
      updatedBy: req.admin?.username || "admin",
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    });

    const savedImage = await newImage.save();

    res.status(201).json({
      success: true,
      message: "تم إضافة الشعار الجاهز بنجاح",
      data: {
        ...savedImage.toObject(),
        _id: undefined,
      },
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

    // البحث عن الشعار
    const imageToDelete = await PredefinedImageSchema.findOne({ id: imageId });

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

    // حذف الشعار من قاعدة البيانات
    await PredefinedImageSchema.deleteOne({ id: imageId });

    res.status(200).json({
      success: true,
      message: "تم حذف الشعار الجاهز بنجاح",
      data: {
        imageId,
        deletedImage: {
          ...imageToDelete.toObject(),
          _id: undefined,
        },
      },
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
    const { name, categoryId, description } = req.body;

    if (!imageId) {
      return res.status(400).json({
        success: false,
        message: "معرف الشعار مطلوب",
        error: "IMAGE_ID_REQUIRED",
      });
    }

    // البحث عن الشعار
    const existingImage = await PredefinedImageSchema.findOne({ id: imageId });

    if (!existingImage) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على الشعار",
        error: "IMAGE_NOT_FOUND",
      });
    }

    // تحديث بيانات الشعار
    const updatedImage = await PredefinedImageSchema.findOneAndUpdate(
      { id: imageId },
      {
        ...(name && { name: name.trim() }),
        ...(categoryId && { categoryId: categoryId.trim() }),
        ...(description && { description: description.trim() }),
        updatedAt: new Date(),
        updatedBy: req.admin?.username || "admin",
      },
      { new: true, lean: true }
    );

    res.status(200).json({
      success: true,
      message: "تم تحديث الشعار الجاهز بنجاح",
      data: {
        ...updatedImage,
        _id: undefined,
      },
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

    // حذف جميع الشعارات الموجودة
    await PredefinedImageSchema.deleteMany({});

    // إنشاء الشعارات الافتراضية مع تحديث updatedBy
    const defaultImages = DEFAULT_PREDEFINED_IMAGES.map((img) => ({
      ...img,
      updatedAt: new Date(),
      updatedBy,
    }));

    const insertedImages = await PredefinedImageSchema.insertMany(
      defaultImages
    );

    const cleanImages = insertedImages.map((img) => ({
      ...img.toObject(),
      _id: undefined,
    }));

    res.status(200).json({
      success: true,
      message: "تم إعادة تعيين الشعارات الجاهزة إلى القيم الافتراضية بنجاح",
      data: cleanImages,
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

// الحصول على الشعارات حسب التصنيف (عام - بدون مصادقة)
export const getPredefinedImagesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "معرف التصنيف مطلوب",
        error: "CATEGORY_ID_REQUIRED",
      });
    }

    const images = await PredefinedImageSchema.find({ categoryId })
      .sort({ createdAt: -1 })
      .lean();

    const cleanImages = images.map((img) => ({
      ...img,
      _id: undefined,
    }));

    res.status(200).json({
      success: true,
      message: "تم الحصول على الشعارات بنجاح",
      data: cleanImages,
    });
  } catch (error) {
    console.error("Error getting images by category:", error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء الحصول على الشعارات",
      error: "GET_IMAGES_BY_CATEGORY_FAILED",
    });
  }
};

// الحصول على الشعارات مع معلومات التصنيفات (عام - بدون مصادقة)
export const getPredefinedImagesWithCategories = async (req, res) => {
  try {
    const images = await PredefinedImageSchema.find()
      .sort({ createdAt: -1 })
      .lean();
    const categories = await CategoryModel.getCategories();

    // إضافة معلومات التصنيف لكل صورة
    const imagesWithCategories = images.map((image) => {
      const category = categories.find((cat) => cat.id === image.categoryId);
      return {
        ...image,
        _id: undefined,
        category: category
          ? {
              id: category.id,
              name: category.name,
              color: category.color,
              icon: category.icon,
            }
          : null,
      };
    });

    res.status(200).json({
      success: true,
      message: "تم الحصول على الشعارات مع التصنيفات بنجاح",
      data: {
        images: imagesWithCategories,
        categories,
      },
    });
  } catch (error) {
    console.error("Error getting images with categories:", error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء الحصول على الشعارات",
      error: "GET_IMAGES_WITH_CATEGORIES_FAILED",
    });
  }
};
