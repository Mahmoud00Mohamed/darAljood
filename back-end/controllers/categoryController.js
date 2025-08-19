import CategoryModel from "../models/Category.js";

// الحصول على جميع التصنيفات (عام - بدون مصادقة)
export const getCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.getCategories();

    res.status(200).json({
      success: true,
      message: "تم الحصول على التصنيفات بنجاح",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء الحصول على التصنيفات",
      error: "GET_CATEGORIES_FAILED",
    });
  }
};

// إنشاء تصنيف جديد (يتطلب مصادقة المدير)
export const createCategory = async (req, res) => {
  try {
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بإنشاء تصنيفات",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const { name, description, color, icon } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "اسم التصنيف مطلوب",
        error: "CATEGORY_NAME_REQUIRED",
      });
    }

    if (name.trim().length < 2 || name.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: "اسم التصنيف يجب أن يكون بين 2 و 50 حرف",
        error: "INVALID_CATEGORY_NAME_LENGTH",
      });
    }

    const newCategory = await CategoryModel.createCategory(
      {
        name,
        description,
        color,
        icon,
      },
      req.admin?.username || "admin"
    );

    res.status(201).json({
      success: true,
      message: "تم إنشاء التصنيف بنجاح",
      data: newCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء إنشاء التصنيف",
      error: "CREATE_CATEGORY_FAILED",
    });
  }
};

// تحديث تصنيف (يتطلب مصادقة المدير)
export const updateCategory = async (req, res) => {
  try {
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بتحديث التصنيفات",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const { categoryId } = req.params;
    const updates = req.body;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "معرف التصنيف مطلوب",
        error: "CATEGORY_ID_REQUIRED",
      });
    }

    if (
      updates.name &&
      (updates.name.trim().length < 2 || updates.name.trim().length > 50)
    ) {
      return res.status(400).json({
        success: false,
        message: "اسم التصنيف يجب أن يكون بين 2 و 50 حرف",
        error: "INVALID_CATEGORY_NAME_LENGTH",
      });
    }

    const updatedCategory = await CategoryModel.updateCategory(
      categoryId,
      updates,
      req.admin?.username || "admin"
    );

    res.status(200).json({
      success: true,
      message: "تم تحديث التصنيف بنجاح",
      data: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء تحديث التصنيف",
      error: "UPDATE_CATEGORY_FAILED",
    });
  }
};
// حذف تصنيف (يتطلب مصادقة المدير)
export const deleteCategory = async (req, res) => {
  try {
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بحذف التصنيفات",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "معرف التصنيف مطلوب",
        error: "CATEGORY_ID_REQUIRED",
      });
    }

    await CategoryModel.deleteCategory(categoryId);

    res.status(200).json({
      success: true,
      message: "تم حذف التصنيف بنجاح",
      data: { categoryId },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء حذف التصنيف",
      error: "DELETE_CATEGORY_FAILED",
    });
  }
};

// إعادة ترتيب التصنيفات (يتطلب مصادقة المدير)
export const reorderCategories = async (req, res) => {
  try {
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بإعادة ترتيب التصنيفات",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const { categoryOrders } = req.body;

    if (!Array.isArray(categoryOrders)) {
      return res.status(400).json({
        success: false,
        message: "بيانات الترتيب يجب أن تكون مصفوفة",
        error: "INVALID_ORDER_DATA",
      });
    }

    const reorderedCategories = await CategoryModel.reorderCategories(
      categoryOrders,
      req.admin?.username || "admin"
    );

    res.status(200).json({
      success: true,
      message: "تم إعادة ترتيب التصنيفات بنجاح",
      data: reorderedCategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء إعادة ترتيب التصنيفات",
      error: "REORDER_CATEGORIES_FAILED",
    });
  }
};
// الحصول على تصنيف واحد (عام - بدون مصادقة)
export const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "معرف التصنيف مطلوب",
        error: "CATEGORY_ID_REQUIRED",
      });
    }

    const category = await CategoryModel.getCategoryById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "التصنيف غير موجود",
        error: "CATEGORY_NOT_FOUND",
      });
    }

    res.status(200).json({
      success: true,
      message: "تم العثور على التصنيف",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء الحصول على التصنيف",
      error: "GET_CATEGORY_FAILED",
    });
  }
};

// إعادة تعيين التصنيفات إلى القيم الافتراضية (يتطلب مصادقة المدير)
export const resetCategories = async (req, res) => {
  try {
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بإعادة تعيين التصنيفات",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const resetCategories = await CategoryModel.resetToDefaults(
      req.admin?.username || "admin"
    );

    res.status(200).json({
      success: true,
      message: "تم إعادة تعيين التصنيفات إلى القيم الافتراضية بنجاح",
      data: resetCategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء إعادة تعيين التصنيفات",
      error: "RESET_CATEGORIES_FAILED",
    });
  }
};
