// خدمة إدارة التصنيفات
export interface CategoryData {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  isDefault: boolean;
  order: number;
  createdAt: string;
  updatedBy: string;
  updatedAt?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  order?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class CategoryService {
  private baseUrl = "https://server-algood.onrender.com/api/categories";

  /**
   * الحصول على جميع التصنيفات
   */
  async getCategories(): Promise<CategoryData[]> {
    try {
      const response = await fetch(this.baseUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<CategoryData[]> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في الحصول على التصنيفات");
      }

      return result.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء الحصول على التصنيفات"
      );
    }
  }

  /**
   * الحصول على تصنيف واحد
   */
  async getCategoryById(categoryId: string): Promise<CategoryData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${categoryId}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<CategoryData> = await response.json();

      if (!result.success) {
        return null;
      }

      return result.data;
    } catch (error) {
      console.error("Error fetching category:", error);
      return null;
    }
  }

  /**
   * إنشاء تصنيف جديد (يتطلب مصادقة)
   */
  async createCategory(
    categoryData: CreateCategoryRequest,
    token: string
  ): Promise<CategoryData> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: ApiResponse<CategoryData> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في إنشاء التصنيف");
      }

      return result.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw new Error(
        error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء التصنيف"
      );
    }
  }

  /**
   * تحديث تصنيف (يتطلب مصادقة)
   */
  async updateCategory(
    categoryId: string,
    updates: UpdateCategoryRequest,
    token: string
  ): Promise<CategoryData> {
    try {
      const response = await fetch(`${this.baseUrl}/${categoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: ApiResponse<CategoryData> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في تحديث التصنيف");
      }

      return result.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw new Error(
        error instanceof Error ? error.message : "حدث خطأ أثناء تحديث التصنيف"
      );
    }
  }

  /**
   * حذف تصنيف (يتطلب مصادقة)
   */
  async deleteCategory(categoryId: string, token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${categoryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: ApiResponse<{ categoryId: string }> = await response.json();
      return result.success;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw new Error(
        error instanceof Error ? error.message : "حدث خطأ أثناء حذف التصنيف"
      );
    }
  }

  /**
   * إعادة ترتيب التصنيفات (يتطلب مصادقة)
   */
  async reorderCategories(
    categoryOrders: Array<{ id: string; order: number }>,
    token: string
  ): Promise<CategoryData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ categoryOrders }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: ApiResponse<CategoryData[]> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في إعادة ترتيب التصنيفات");
      }

      return result.data;
    } catch (error) {
      console.error("Error reordering categories:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء إعادة ترتيب التصنيفات"
      );
    }
  }

  /**
   * إعادة تعيين التصنيفات إلى القيم الافتراضية (يتطلب مصادقة)
   */
  async resetCategories(token: string): Promise<CategoryData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/reset`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: ApiResponse<CategoryData[]> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في إعادة تعيين التصنيفات");
      }

      return result.data;
    } catch (error) {
      console.error("Error resetting categories:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء إعادة تعيين التصنيفات"
      );
    }
  }
}

export const categoryService = new CategoryService();
export default categoryService;
