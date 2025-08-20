import authService from "./authService";
import categoryService, { CategoryData } from "./categoryService";

export interface PredefinedImageData {
  id: string;
  url: string;
  name: string;
  categoryId: string;
  description?: string;
  publicId: string;
  createdAt: string;
  updatedBy: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
  category?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
}

export interface PredefinedImagesWithCategories {
  images: PredefinedImageData[];
  categories: CategoryData[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
class PredefinedImagesService {
  private baseUrl = "https://server-algood.onrender.com/api/predefined-images";

  /**
   * تحميل الشعارات الجاهزة من الباك إند
   */
  async loadPredefinedImages(): Promise<PredefinedImageData[]> {
    try {
      const response = await fetch(this.baseUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<PredefinedImageData[]> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في تحميل الشعارات الجاهزة");
      }

      return result.data;
    } catch (error) {
      console.error("Error loading predefined images:", error);
      // في حالة فشل الباك إند، استخدم البيانات المحلية
      return this.getFallbackImages();
    }
  }

  /**
   * إضافة شعار جاهز جديد (يتطلب مصادقة المدير)
   */
  async addPredefinedImage(
    file: File,
    name: string,
    categoryId: string,
    description?: string
  ): Promise<PredefinedImageData> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("رمز المصادقة مطلوب");
      }

      const formData = new FormData();
      formData.append("image", file);
      formData.append("name", name);
      formData.append("categoryId", categoryId);
      if (description) {
        formData.append("description", description);
      }

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: ApiResponse<PredefinedImageData> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في إضافة الشعار الجاهز");
      }

      return result.data;
    } catch (error) {
      console.error("Error adding predefined image:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء إضافة الشعار الجاهز"
      );
    }
  }

  /**
   * حذف شعار جاهز (يتطلب مصادقة المدير)
   */
  async deletePredefinedImage(imageId: string): Promise<boolean> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("رمز المصادقة مطلوب");
      }

      const response = await fetch(`${this.baseUrl}/${imageId}`, {
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

      const result: ApiResponse<{ imageId: string }> = await response.json();
      return result.success;
    } catch (error) {
      console.error("Error deleting predefined image:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء حذف الشعار الجاهز"
      );
    }
  }

  /**
   * تحديث معلومات شعار جاهز (يتطلب مصادقة المدير)
   */
  async updatePredefinedImage(
    imageId: string,
    updates: { name?: string; categoryId?: string; description?: string }
  ): Promise<PredefinedImageData> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("رمز المصادقة مطلوب");
      }

      const response = await fetch(`${this.baseUrl}/${imageId}`, {
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

      const result: ApiResponse<PredefinedImageData> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في تحديث الشعار الجاهز");
      }

      return result.data;
    } catch (error) {
      console.error("Error updating predefined image:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تحديث الشعار الجاهز"
      );
    }
  }

  /**
   * إعادة تعيين الشعارات الجاهزة إلى القيم الافتراضية (يتطلب مصادقة المدير)
   */
  async resetPredefinedImages(): Promise<PredefinedImageData[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("رمز المصادقة مطلوب");
      }

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

      const result: ApiResponse<PredefinedImageData[]> = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "فشل في إعادة تعيين الشعارات الجاهزة"
        );
      }

      return result.data;
    } catch (error) {
      console.error("Error resetting predefined images:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء إعادة تعيين الشعارات الجاهزة"
      );
    }
  }

  /**
   * الحصول على الشعارات مع معلومات التصنيفات
   */
  async loadPredefinedImagesWithCategories(): Promise<PredefinedImagesWithCategories> {
    try {
      const response = await fetch(`${this.baseUrl}/with-categories`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<PredefinedImagesWithCategories> =
        await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في تحميل الشعارات مع التصنيفات");
      }

      return result.data;
    } catch (error) {
      console.error("Error loading images with categories:", error);
      // في حالة فشل الباك إند، استخدم البيانات المحلية
      const fallbackImages = this.getFallbackImages();
      const fallbackCategories = await this.getFallbackCategories();

      return {
        images: fallbackImages.map((img) => ({
          ...img,
          category: fallbackCategories.find((cat) => cat.id === img.categoryId),
        })),
        categories: fallbackCategories,
      };
    }
  }

  /**
   * الحصول على الشعارات حسب التصنيف
   */
  async getPredefinedImagesByCategory(
    categoryId: string
  ): Promise<PredefinedImageData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/category/${categoryId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<PredefinedImageData[]> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في تحميل الشعارات");
      }

      return result.data;
    } catch (error) {
      console.error("Error loading images by category:", error);
      // في حالة فشل الباك إند، فلترة البيانات المحلية
      const fallbackImages = this.getFallbackImages();
      return fallbackImages.filter((img) => img.categoryId === categoryId);
    }
  }

  /**
   * التصنيفات الاحتياطية
   */
  private async getFallbackCategories(): Promise<CategoryData[]> {
    try {
      return await categoryService.getCategories();
    } catch {
      return [
        {
          id: "general",
          name: "عام",
          description: "صور عامة ومتنوعة",
          color: "#6B7280",
          icon: "folder",
          isDefault: true,
          order: 1,
          createdAt: "2025-01-15T10:00:00.000Z",
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
          createdAt: "2025-01-15T10:00:00.000Z",
          updatedBy: "system",
        },
      ];
    }
  }

  /**
   * البيانات الاحتياطية في حالة فشل الباك إند (تحويل إلى النوع الجديد)
   */
  private getFallbackImages(): PredefinedImageData[] {
    return [
      {
        id: "logo1",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078448/16_b1rjss.png",
        publicId: "16_b1rjss",
        name: "شعار 1",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo2",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078378/15_v4cfc5.png",
        publicId: "15_v4cfc5",
        name: "شعار 2",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo3",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078365/14_qqqwh1.png",
        publicId: "14_qqqwh1",
        name: "شعار 3",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo4",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078446/21_hq9kn2.png",
        publicId: "21_hq9kn2",
        name: "شعار 4",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo5",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078445/22_zdgy01.png",
        publicId: "22_zdgy01",
        name: "شعار 5",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo6",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078445/24_ryr2b7.png",
        publicId: "24_ryr2b7",
        name: "شعار 6",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo7",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078440/20_z76g1a.png",
        publicId: "20_z76g1a",
        name: "شعار 7",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo8",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078416/23_c30gr9.png",
        publicId: "23_c30gr9",
        name: "شعار 8",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo9",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078450/18_djpzcl.png",
        publicId: "18_djpzcl",
        name: "شعار 9",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo10",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078392/19_bsd1ci.png",
        publicId: "19_bsd1ci",
        name: "شعار 10",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo11",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078376/17_xeldqp.png",
        publicId: "17_xeldqp",
        name: "شعار 11",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo12",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078313/12_tg79xl.png",
        publicId: "12_tg79xl",
        name: "شعار 12",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo13",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078327/13_hwchwt.png",
        publicId: "13_hwchwt",
        name: "شعار 13",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo14",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078292/11_e4rp9f.png",
        publicId: "11_e4rp9f",
        name: "شعار 14",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo15",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078273/9_ckkfuc.png",
        publicId: "9_ckkfuc",
        name: "شعار 15",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo16",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078280/7_sdntzs.png",
        publicId: "7_sdntzs",
        name: "شعار 16",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo17",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078261/10_nt80mg.png",
        publicId: "10_nt80mg",
        name: "شعار 17",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo18",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078315/2_ecj1mj.png",
        publicId: "2_ecj1mj",
        name: "شعار 18",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo19",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078222/1_ucnpj9.png",
        publicId: "1_ucnpj9",
        name: "شعار 19",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo20",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078266/8_khcifj.png",
        publicId: "8_khcifj",
        name: "شعار 20",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo21",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078306/6_isqyzt.png",
        publicId: "6_isqyzt",
        name: "شعار 21",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo22",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078234/5_ivza7n.png",
        publicId: "5_ivza7n",
        name: "شعار 22",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo23",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078224/3_ohzsak.png",
        publicId: "3_ohzsak",
        name: "شعار 23",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo24",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1755078229/4_emla2u.png",
        publicId: "4_emla2u",
        name: "شعار 24",
        categoryId: "logos",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
    ];
  }

  /**
   * التحقق من حالة الاتصال مع الباك إند
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl.replace("/predefined-images", "/info")}`
      );
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const predefinedImagesService = new PredefinedImagesService();
export default predefinedImagesService;
