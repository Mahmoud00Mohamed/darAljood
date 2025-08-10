import authService from "./authService";

export interface PredefinedImageData {
  id: string;
  url: string;
  name: string;
  category: string;
  description?: string;
  publicId: string;
  createdAt: string;
  updatedBy: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
class PredefinedImagesService {
  private baseUrl = "http://localhost:3001/api/predefined-images";

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
    category: string,
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
      formData.append("category", category);
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
    updates: { name?: string; category?: string; description?: string }
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
   * البيانات الاحتياطية في حالة فشل الباك إند (تحويل إلى النوع الجديد)
   */
  private getFallbackImages(): PredefinedImageData[] {
    return [
      {
        id: "logo1",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924691/16_ubbdbh.png",
        publicId: "16_ubbdbh",
        name: "شعار 1",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo2",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924689/15_l0llk1.png",
        publicId: "15_l0llk1",
        name: "شعار 2",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo3",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924688/14_htk85j.png",
        publicId: "14_htk85j",
        name: "شعار 3",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo4",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924676/21_swow6t.png",
        publicId: "21_swow6t",
        name: "شعار 4",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo5",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924675/22_c9rump.png",
        publicId: "22_c9rump",
        name: "شعار 5",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo6",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924671/24_x6nvyt.png",
        publicId: "24_x6nvyt",
        name: "شعار 6",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo7",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924669/20_guvnha.png",
        publicId: "20_guvnha",
        name: "شعار 7",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo8",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924661/23_rroabu.png",
        publicId: "23_rroabu",
        name: "شعار 8",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo9",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924658/18_cpbs4b.png",
        publicId: "18_cpbs4b",
        name: "شعار 9",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo10",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924657/19_kxggs4.png",
        publicId: "19_kxggs4",
        name: "شعار 10",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo11",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924650/17_k8axov.png",
        publicId: "17_k8axov",
        name: "شعار 11",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo12",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924644/12_woyybb.png",
        publicId: "12_woyybb",
        name: "شعار 12",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo13",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924644/13_mvqmgk.png",
        publicId: "13_mvqmgk",
        name: "شعار 13",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo14",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924636/11_revnd6.png",
        publicId: "11_revnd6",
        name: "شعار 14",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo15",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924629/9_ysz5vg.png",
        publicId: "9_ysz5vg",
        name: "شعار 15",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo16",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924627/7_ptxh2b.png",
        publicId: "7_ptxh2b",
        name: "شعار 16",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo17",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924622/10_yhvn0o.png",
        publicId: "10_yhvn0o",
        name: "شعار 17",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo18",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924621/2_vobopy.png",
        publicId: "2_vobopy",
        name: "شعار 18",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo19",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924621/1_kqcgdh.png",
        publicId: "1_kqcgdh",
        name: "شعار 19",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo20",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924621/8_yoay91.png",
        publicId: "8_yoay91",
        name: "شعار 20",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo21",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924610/6_xfyebx.png",
        publicId: "6_xfyebx",
        name: "شعار 21",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo22",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924609/5_oupz1k.png",
        publicId: "5_oupz1k",
        name: "شعار 22",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo23",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924603/3_k7zsjo.png",
        publicId: "3_k7zsjo",
        name: "شعار 23",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
        createdAt: "2025-01-25T10:00:00.000Z",
        updatedBy: "system",
      },
      {
        id: "logo24",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924602/4_v07jhi.png",
        publicId: "4_v07jhi",
        name: "شعار 24",
        category: "شعارات جاهزة",
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
