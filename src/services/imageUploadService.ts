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
  private uploadQueue: Map<string, Promise<CloudinaryImageData>> = new Map();

  /**
   * رفع صورة واحدة إلى Cloudinary
   */
  async uploadSingleImage(file: File): Promise<CloudinaryImageData> {
    // إنشاء مفتاح فريد للملف لتجنب الرفع المكرر
    const fileKey = `${file.name}-${file.size}-${file.lastModified}`;

    // إذا كان الملف قيد الرفع، انتظر النتيجة
    if (this.uploadQueue.has(fileKey)) {
      return this.uploadQueue.get(fileKey)!;
    }

    const uploadPromise = this.performUpload(file);
    this.uploadQueue.set(fileKey, uploadPromise);

    try {
      const result = await uploadPromise;
      return result;
    } finally {
      // إزالة من قائمة الانتظار بعد انتهاء الرفع
      setTimeout(() => {
        this.uploadQueue.delete(fileKey);
      }, 1000);
    }
  }

  /**
   * تنفيذ عملية الرفع الفعلية
   */
  private async performUpload(file: File): Promise<CloudinaryImageData> {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${this.baseUrl}/single`, {
        method: "POST",
        body: formData,
        // تحسين إعدادات الطلب للسرعة
        keepalive: true,
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
        keepalive: true,
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
   * رفع صورة في الخلفية مع إعادة المحاولة
   */
  async uploadInBackground(
    file: File,
    retries: number = 3
  ): Promise<CloudinaryImageData> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.uploadSingleImage(file);
      } catch (error) {
        console.warn(`Upload attempt ${attempt} failed:`, error);

        if (attempt === retries) {
          throw error;
        }

        // انتظار متزايد بين المحاولات
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }

    throw new Error("فشل في رفع الصورة بعد عدة محاولات");
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

  /**
   * مسح قائمة انتظار الرفع
   */
  clearUploadQueue(): void {
    this.uploadQueue.clear();
  }

  /**
   * الحصول على عدد العمليات قيد الرفع
   */
  getPendingUploadsCount(): number {
    return this.uploadQueue.size;
  }
}

// إنشاء instance واحد للاستخدام في جميع أنحاء التطبيق
export const imageUploadService = new ImageUploadService();
export default imageUploadService;
