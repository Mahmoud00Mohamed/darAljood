import CategorySchema from "./schemas/CategorySchema.js";

// البيانات الافتراضية للتصنيفات
const DEFAULT_CATEGORIES = [
  {
    id: "general",
    name: "عام",
    description: "صور عامة ومتنوعة",
    color: "#6B7280",
    icon: "folder",
    isDefault: true,
    order: 1,
    updatedBy: "system",
  },
  {
    id: "logos",
    name: "شعارات",
    description: "شعارات الشركات والمؤسسات",
    color: "#3B82F6",
    icon: "star",
    isDefault: true,
    order: 2,
    updatedBy: "system",
  },
  {
    id: "symbols",
    name: "رموز ورسوم",
    description: "رموز وأشكال هندسية",
    color: "#10B981",
    icon: "shapes",
    isDefault: true,
    order: 3,
    updatedBy: "system",
  },
  {
    id: "text-designs",
    name: "تصاميم نصية",
    description: "تصاميم وخطوط نصية",
    color: "#F59E0B",
    icon: "type",
    isDefault: true,
    order: 4,
    updatedBy: "system",
  },
];

class CategoryModel {
  /**
   * تهيئة التصنيفات الافتراضية
   */
  async initializeDefaultCategories() {
    try {
      const existingCount = await CategorySchema.countDocuments();
      
      if (existingCount === 0) {
        console.log("🔧 إنشاء التصنيفات الافتراضية...");
        await CategorySchema.insertMany(DEFAULT_CATEGORIES);
        console.log("✅ تم إنشاء التصنيفات الافتراضية بنجاح");
      }
    } catch (error) {
      console.error("❌ خطأ في تهيئة التصنيفات الافتراضية:", error);
      throw new Error("فشل في تهيئة التصنيفات الافتراضية");
    }
  }

  /**
   * الحصول على جميع التصنيفات
   */
  async getCategories() {
    try {
      const categories = await CategorySchema.find().sort({ order: 1 }).lean();
      return categories.map(cat => ({
        ...cat,
        _id: undefined, // إزالة _id من MongoDB
      }));
    } catch (error) {
      console.error("Error getting categories:", error);
      throw new Error("فشل في الحصول على التصنيفات");
    }
  }

  /**
   * إنشاء تصنيف جديد
   */
  async createCategory(categoryData, createdBy = "admin") {
    try {
      // التحقق من عدم تكرار الاسم
      const existingCategory = await CategorySchema.findOne({
        name: { $regex: new RegExp(`^${categoryData.name}$`, 'i') }
      });
      
      if (existingCategory) {
        throw new Error("يوجد تصنيف بهذا الاسم مسبقاً");
      }

      // إنشاء ID فريد
      const categoryId = `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // تحديد الترتيب التالي
      const maxOrderCategory = await CategorySchema.findOne().sort({ order: -1 });
      const maxOrder = maxOrderCategory ? maxOrderCategory.order : 0;

      const newCategory = new CategorySchema({
        id: categoryId,
        name: categoryData.name.trim(),
        description: categoryData.description?.trim() || "",
        color: categoryData.color || "#6B7280",
        icon: categoryData.icon || "folder",
        isDefault: false,
        order: maxOrder + 1,
        updatedBy: createdBy,
      });

      const savedCategory = await newCategory.save();
      
      return {
        ...savedCategory.toObject(),
        _id: undefined,
      };
    } catch (error) {
      console.error("Error creating category:", error);
      throw new Error(error.message || "فشل في إنشاء التصنيف");
    }
  }

  /**
   * تحديث تصنيف
   */
  async updateCategory(categoryId, updates, updatedBy = "admin") {
    try {
      const category = await CategorySchema.findOne({ id: categoryId });

      if (!category) {
        throw new Error("التصنيف غير موجود");
      }

      // منع تعديل التصنيفات الافتراضية (الاسم فقط)
      if (category.isDefault && updates.name && updates.name !== category.name) {
        throw new Error("لا يمكن تعديل اسم التصنيفات الافتراضية");
      }

      // التحقق من عدم تكرار الاسم
      if (updates.name && updates.name !== category.name) {
        const existingCategory = await CategorySchema.findOne({
          id: { $ne: categoryId },
          name: { $regex: new RegExp(`^${updates.name}$`, 'i') }
        });
        
        if (existingCategory) {
          throw new Error("يوجد تصنيف بهذا الاسم مسبقاً");
        }
      }

      // تحديث البيانات
      const updatedCategory = await CategorySchema.findOneAndUpdate(
        { id: categoryId },
        { 
          ...updates,
          updatedBy,
          updatedAt: new Date(),
        },
        { new: true, lean: true }
      );

      return {
        ...updatedCategory,
        _id: undefined,
      };
    } catch (error) {
      console.error("Error updating category:", error);
      throw new Error(error.message || "فشل في تحديث التصنيف");
    }
  }

  /**
   * حذف تصنيف
   */
  async deleteCategory(categoryId) {
    try {
      const category = await CategorySchema.findOne({ id: categoryId });

      if (!category) {
        throw new Error("التصنيف غير موجود");
      }

      // منع حذف التصنيفات الافتراضية
      if (category.isDefault) {
        throw new Error("لا يمكن حذف التصنيفات الافتراضية");
      }

      await CategorySchema.deleteOne({ id: categoryId });
      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw new Error(error.message || "فشل في حذف التصنيف");
    }
  }

  /**
   * إعادة ترتيب التصنيفات
   */
  async reorderCategories(categoryOrders, updatedBy = "admin") {
    try {
      const bulkOps = categoryOrders.map(({ id, order }) => ({
        updateOne: {
          filter: { id },
          update: { 
            order, 
            updatedAt: new Date(),
            updatedBy 
          }
        }
      }));

      await CategorySchema.bulkWrite(bulkOps);
      
      const reorderedCategories = await CategorySchema.find().sort({ order: 1 }).lean();
      return reorderedCategories.map(cat => ({
        ...cat,
        _id: undefined,
      }));
    } catch (error) {
      console.error("Error reordering categories:", error);
      throw new Error("فشل في إعادة ترتيب التصنيفات");
    }
  }

  /**
   * الحصول على تصنيف واحد
   */
  async getCategoryById(categoryId) {
    try {
      const category = await CategorySchema.findOne({ id: categoryId }).lean();
      
      if (!category) {
        return null;
      }

      return {
        ...category,
        _id: undefined,
      };
    } catch (error) {
      console.error("Error getting category:", error);
      return null;
    }
  }

  /**
   * إعادة تعيين إلى التصنيفات الافتراضية
   */
  async resetToDefaults(updatedBy = "admin") {
    try {
      // حذف جميع التصنيفات الموجودة
      await CategorySchema.deleteMany({});
      
      // إنشاء التصنيفات الافتراضية مع تحديث updatedBy
      const defaultData = DEFAULT_CATEGORIES.map(cat => ({
        ...cat,
        updatedAt: new Date(),
        updatedBy,
      }));

      const insertedCategories = await CategorySchema.insertMany(defaultData);
      
      return insertedCategories.map(cat => ({
        ...cat.toObject(),
        _id: undefined,
      }));
    } catch (error) {
      console.error("Error resetting categories:", error);
      throw new Error("فشل في إعادة تعيين التصنيفات");
    }
  }
}

export default new CategoryModel();