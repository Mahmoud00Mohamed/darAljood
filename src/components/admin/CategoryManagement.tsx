import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  Plus,
  Edit3,
  Trash2,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  GripVertical,
  RotateCcw,
  Star,
  Shapes,
  Type,
  Image as ImageIcon,
} from "lucide-react";
import categoryService, {
  CategoryData,
  CreateCategoryRequest,
} from "../../services/categoryService";
import authService from "../../services/authService";
import ConfirmationModal from "../ui/ConfirmationModal";
import Modal from "../ui/Modal";
import { useModal } from "../../hooks/useModal";

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(
    null
  );
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryData | null>(
    null
  );
  const [newCategoryData, setNewCategoryData] = useState<CreateCategoryRequest>(
    {
      name: "",
      description: "",
      color: "#6B7280",
      icon: "folder",
    }
  );

  const createCategoryModal = useModal();
  const editCategoryModal = useModal();
  const deleteCategoryModal = useModal();
  const resetCategoriesModal = useModal();

  const availableIcons = [
    { id: "folder", name: "مجلد", icon: Folder },
    { id: "star", name: "نجمة", icon: Star },
    { id: "shapes", name: "أشكال", icon: Shapes },
    { id: "type", name: "نص", icon: Type },
    { id: "image", name: "صورة", icon: ImageIcon },
  ];

  const availableColors = [
    { name: "رمادي", value: "#6B7280" },
    { name: "أزرق", value: "#3B82F6" },
    { name: "أخضر", value: "#10B981" },
    { name: "أصفر", value: "#F59E0B" },
    { name: "أحمر", value: "#EF4444" },
    { name: "بنفسجي", value: "#8B5CF6" },
    { name: "وردي", value: "#EC4899" },
    { name: "برتقالي", value: "#F97316" },
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "فشل في تحميل التصنيفات"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryData.name.trim()) {
      setError("اسم التصنيف مطلوب");
      return;
    }

    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      const newCategory = await categoryService.createCategory(
        newCategoryData,
        token
      );
      setCategories((prev) =>
        [...prev, newCategory].sort((a, b) => a.order - b.order)
      );
      setSaveMessage("تم إنشاء التصنيف بنجاح");
      setNewCategoryData({
        name: "",
        description: "",
        color: "#6B7280",
        icon: "folder",
      });
      createCategoryModal.closeModal();
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "فشل في إنشاء التصنيف");
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      const updatedCategory = await categoryService.updateCategory(
        editingCategory.id,
        {
          name: editingCategory.name,
          description: editingCategory.description,
          color: editingCategory.color,
          icon: editingCategory.icon,
        },
        token
      );

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id ? updatedCategory : cat
        )
      );
      setSaveMessage("تم تحديث التصنيف بنجاح");
      setEditingCategory(null);
      editCategoryModal.closeModal();
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "فشل في تحديث التصنيف");
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      await categoryService.deleteCategory(categoryToDelete.id, token);
      setCategories((prev) =>
        prev.filter((cat) => cat.id !== categoryToDelete.id)
      );
      setSaveMessage("تم حذف التصنيف بنجاح");
      setCategoryToDelete(null);
      deleteCategoryModal.closeModal();
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "فشل في حذف التصنيف");
    }
  };

  const handleResetCategories = async () => {
    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      const resetData = await categoryService.resetCategories(token);
      setCategories(resetData);
      setSaveMessage("تم إعادة تعيين التصنيفات بنجاح");
      resetCategoriesModal.closeModal();
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "فشل في إعادة تعيين التصنيفات"
      );
    }
  };

  const getIconComponent = (iconId: string) => {
    const iconConfig = availableIcons.find((icon) => icon.id === iconId);
    return iconConfig ? iconConfig.icon : Folder;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Folder className="w-6 h-6 text-[#563660]" />
            إدارة التصنيفات
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            إنشاء وتنظيم تصنيفات مكتبة الصور
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={createCategoryModal.openModal}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            إضافة تصنيف
          </button>
          <button
            onClick={resetCategoriesModal.openModal}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            إعادة تعيين
          </button>
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-green-700 font-medium text-sm">
              {saveMessage}
            </span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-red-700 font-medium text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#563660] mx-auto mb-4" />
            <p className="text-gray-600 text-sm">جاري تحميل التصنيفات...</p>
          </div>
        </div>
      ) : categories.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              التصنيفات المتاحة ({categories.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {categories.map((category, index) => {
              const IconComponent = getIconComponent(category.icon);

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: category.color + "20" }}
                        >
                          <IconComponent
                            className="w-5 h-5"
                            style={{ color: category.color }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-medium text-gray-900">
                            {category.name}
                          </h4>
                          {category.isDefault && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              افتراضي
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {category.description || "لا يوجد وصف"}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>الترتيب: {category.order}</span>
                          <span>
                            آخر تحديث:{" "}
                            {new Date(category.updatedAt || category.createdAt)
                              .toLocaleDateString("sv-SE")
                              .replace(/-/g, "/")}
                          </span>
                          <span>بواسطة: {category.updatedBy}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          editCategoryModal.openModal();
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {!category.isDefault && (
                        <button
                          onClick={() => {
                            setCategoryToDelete(category);
                            deleteCategoryModal.openModal();
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            لا توجد تصنيفات
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            ابدأ بإنشاء تصنيفات لتنظيم مكتبة الصور
          </p>
          <button
            onClick={createCategoryModal.openModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#563660] text-white rounded-lg hover:bg-[#4b2e55] transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            إنشاء تصنيف جديد
          </button>
        </div>
      )}

      {/* Create Category Modal */}
      <Modal
        isOpen={createCategoryModal.isOpen}
        shouldRender={createCategoryModal.shouldRender}
        onClose={createCategoryModal.closeModal}
        title="إنشاء تصنيف جديد"
        size="md"
        options={createCategoryModal.options}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم التصنيف *
            </label>
            <input
              type="text"
              value={newCategoryData.name}
              onChange={(e) =>
                setNewCategoryData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-sm"
              placeholder="مثال: شعارات الشركات"
              maxLength={50}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الوصف
            </label>
            <textarea
              value={newCategoryData.description}
              onChange={(e) =>
                setNewCategoryData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all resize-none text-sm"
              placeholder="وصف مختصر للتصنيف"
              maxLength={200}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اللون
              </label>
              <div className="grid grid-cols-4 gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() =>
                      setNewCategoryData((prev) => ({
                        ...prev,
                        color: color.value,
                      }))
                    }
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      newCategoryData.color === color.value
                        ? "border-gray-400 scale-110"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الأيقونة
              </label>
              <div className="grid grid-cols-3 gap-2">
                {availableIcons.map((icon) => {
                  const IconComponent = icon.icon;
                  return (
                    <button
                      key={icon.id}
                      onClick={() =>
                        setNewCategoryData((prev) => ({
                          ...prev,
                          icon: icon.id,
                        }))
                      }
                      className={`p-2 rounded-lg border transition-all ${
                        newCategoryData.icon === icon.id
                          ? "border-[#563660] bg-[#563660]/10"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      title={icon.name}
                    >
                      <IconComponent className="w-5 h-5 mx-auto" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCreateCategory}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#563660] text-white font-medium rounded-lg hover:bg-[#4b2e55] transition-colors text-sm"
            >
              <Save className="w-4 h-4" />
              إنشاء التصنيف
            </button>
            <button
              onClick={createCategoryModal.closeModal}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={editCategoryModal.isOpen}
        shouldRender={editCategoryModal.shouldRender}
        onClose={() => {
          editCategoryModal.closeModal();
          setEditingCategory(null);
        }}
        title="تعديل التصنيف"
        size="md"
        options={editCategoryModal.options}
      >
        {editingCategory && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم التصنيف *
              </label>
              <input
                type="text"
                value={editingCategory.name}
                onChange={(e) =>
                  setEditingCategory((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all text-sm"
                maxLength={50}
                required
                disabled={editingCategory.isDefault}
              />
              {editingCategory.isDefault && (
                <p className="text-xs text-amber-600 mt-1">
                  لا يمكن تعديل اسم التصنيفات الافتراضية
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف
              </label>
              <textarea
                value={editingCategory.description || ""}
                onChange={(e) =>
                  setEditingCategory((prev) =>
                    prev ? { ...prev, description: e.target.value } : null
                  )
                }
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all resize-none text-sm"
                maxLength={200}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اللون
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() =>
                        setEditingCategory((prev) =>
                          prev ? { ...prev, color: color.value } : null
                        )
                      }
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        editingCategory.color === color.value
                          ? "border-gray-400 scale-110"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الأيقونة
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableIcons.map((icon) => {
                    const IconComponent = icon.icon;
                    return (
                      <button
                        key={icon.id}
                        onClick={() =>
                          setEditingCategory((prev) =>
                            prev ? { ...prev, icon: icon.id } : null
                          )
                        }
                        className={`p-2 rounded-lg border transition-all ${
                          editingCategory.icon === icon.id
                            ? "border-[#563660] bg-[#563660]/10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        title={icon.name}
                      >
                        <IconComponent className="w-5 h-5 mx-auto" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleUpdateCategory}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#563660] text-white font-medium rounded-lg hover:bg-[#4b2e55] transition-colors text-sm"
              >
                <Save className="w-4 h-4" />
                حفظ التغييرات
              </button>
              <button
                onClick={() => {
                  editCategoryModal.closeModal();
                  setEditingCategory(null);
                }}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteCategoryModal.isOpen}
        onClose={() => {
          deleteCategoryModal.closeModal();
          setCategoryToDelete(null);
        }}
        onConfirm={handleDeleteCategory}
        title="تأكيد حذف التصنيف"
        message={`هل أنت متأكد من حذف التصنيف "${categoryToDelete?.name}"؟ سيتم حذفه نهائياً ولن يمكن التراجع عن هذا الإجراء.`}
        confirmText="نعم، احذف"
        cancelText="إلغاء"
        type="danger"
      />

      {/* Reset Categories Confirmation Modal */}
      <ConfirmationModal
        isOpen={resetCategoriesModal.isOpen}
        onClose={resetCategoriesModal.closeModal}
        onConfirm={handleResetCategories}
        title="إعادة تعيين التصنيفات"
        message="هل أنت متأكد من إعادة تعيين جميع التصنيفات إلى القيم الافتراضية؟ سيتم فقدان جميع التصنيفات المخصصة."
        confirmText="نعم، إعادة تعيين"
        cancelText="إلغاء"
        type="danger"
      />
    </div>
  );
};

export default CategoryManagement;
