// خدمة رفع الصور إلى Cloudinary عبر الباك إند
export interface CloudinaryImageData {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
  createdAt: string;
  originalName?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface UploadError {
  success: false;
  message: string;
  error?: string;
}

class ImageUploadService {
  private baseUrl = "http://localhost:3001/api/upload";

  /**
   * رفع صورة واحدة إلى Cloudinary
   */
  async uploadSingleImage(file: File): Promise<CloudinaryImageData> {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${this.baseUrl}/single`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: ApiResponse<CloudinaryImageData> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في رفع الصورة");
      }

      return result.data;
    } catch (error) {
      console.error("Error uploading single image:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى."
      );
    }
  }

  /**
   * رفع عدة صور إلى Cloudinary
   */
  async uploadMultipleImages(files: File[]): Promise<CloudinaryImageData[]> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch(`${this.baseUrl}/multiple`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: ApiResponse<CloudinaryImageData[]> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في رفع الصور");
      }

      return result.data;
    } catch (error) {
      console.error("Error uploading multiple images:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء رفع الصور. يرجى المحاولة مرة أخرى."
      );
    }
  }

  /**
   * حذف صورة من Cloudinary
   */
  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${encodeURIComponent(publicId)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: ApiResponse<{ publicId: string; result: string }> =
        await response.json();

      return result.success && result.data.result === "ok";
    } catch (error) {
      console.error("Error deleting image:", error);
      return false;
    }
  }

  /**
   * الحصول على معلومات صورة
   */
  async getImageInfo(publicId: string): Promise<CloudinaryImageData | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${encodeURIComponent(publicId)}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: ApiResponse<CloudinaryImageData> = await response.json();

      if (!result.success) {
        return null;
      }

      return result.data;
    } catch (error) {
      console.error("Error getting image info:", error);
      return null;
    }
  }

  /**
   * التحقق من حالة الاتصال مع الباك إند
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl.replace("/upload", "/health")}`,
        {
          method: "GET",
        }
      );
      return response.ok;
    } catch (error) {
      console.error("Backend connection failed:", error);
      return false;
    }
  }
}

// إنشاء instance واحد للاستخدام في جميع أنحاء التطبيق
export const imageUploadService = new ImageUploadService();
export default imageUploadService;
