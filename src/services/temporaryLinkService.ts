// خدمة إدارة الروابط المؤقتة
export interface ImageSyncResult {
  success: boolean;
  hasChanges: boolean;
  message: string;
  hasWarnings: boolean;
  changes?: {
    removed: number;
    added: number;
    retained: number;
  };
}

export interface TemporaryLinkData {
  id: string;
  orderId: string;
  token: string;
  expiresAt: string;
  isUsed: boolean;
  usedAt?: string;
  createdBy: string;
  createdAt: string;
  accessCount: number;
  lastAccessAt?: string;
  fullUrl: string;
  expiresIn: string;
  validUntil: string;
}

export interface TemporaryLinkValidation {
  orderId: string;
  orderNumber: string;
  customerInfo: {
    name: string;
    phone: string;
  };
  link: {
    token: string;
    expiresAt: string;
    accessCount: number;
  };
  remainingTime: number; // بالدقائق
}

export interface TemporaryOrderData {
  order: {
    id: string;
    orderNumber: string;
    trackingCode: string;
    customerInfo: {
      name: string;
      phone: string;
    };
    items: Array<{
      id: string;
      jacketConfig: {
        colors: {
          body: string;
          sleeves: string;
          trim: string;
        };
        materials: {
          body: string;
          sleeves: string;
        };
        size: string;
        logos: Array<{
          id: string;
          image: string | null;
          position: string;
          x: number;
          y: number;
          scale: number;
          rotation?: number;
        }>;
        texts: Array<{
          id: string;
          content: string;
          position: string;
          x: number;
          y: number;
          scale: number;
          font: string;
          color: string;
          isConnected: boolean;
          charStyles?: Array<{
            x?: number;
            y?: number;
            scale?: number;
            font?: string;
            color?: string;
          }>;
        }>;
        currentView: string;
        totalPrice: number;
        isCapturing: boolean;
        uploadedImages: Array<{
          id: string;
          url: string;
          name: string;
          uploadedAt: Date;
          publicId?: string;
        }>;
      };
      quantity: number;
      price: number;
    }>;
    totalPrice: number;
    status: string;
    statusName: string;
    createdAt: string;
    updatedAt: string;
  };
  linkInfo: {
    token: string;
    expiresAt: string;
    remainingTime: number;
    accessCount: number;
  };
  remainingTime?: number; // إضافة الوقت المتبقي في الاستجابة
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class TemporaryLinkService {
  private baseUrl = "https://server-algood.onrender.com/api/temporary-links";

  /**
   * إنشاء رابط مؤقت لطلب (يتطلب مصادقة المدير)
   */
  async createTemporaryLink(
    orderId: string,
    durationHours: number = 1,
    token: string
  ): Promise<TemporaryLinkData> {
    try {
      const response = await fetch(`${this.baseUrl}/create/${orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ durationHours }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: ApiResponse<TemporaryLinkData> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في إنشاء الرابط المؤقت");
      }

      return result.data;
    } catch (error) {
      console.error("Error creating temporary link:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء إنشاء الرابط المؤقت"
      );
    }
  }

  /**
   * التحقق من صحة الرابط المؤقت
   */
  async validateTemporaryLink(token: string): Promise<TemporaryLinkValidation> {
    try {
      const response = await fetch(`${this.baseUrl}/validate/${token}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: ApiResponse<TemporaryLinkValidation> =
        await response.json();

      if (!result.success) {
        throw new Error(result.message || "الرابط غير صحيح أو منتهي الصلاحية");
      }

      return result.data;
    } catch (error) {
      console.error("Error validating temporary link:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء التحقق من الرابط"
      );
    }
  }

  /**
   * الحصول على بيانات الطلب عبر الرابط المؤقت
   */
  async getOrderByTemporaryLink(token: string): Promise<TemporaryOrderData> {
    try {
      const response = await fetch(`${this.baseUrl}/order/${token}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: ApiResponse<TemporaryOrderData> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في الحصول على بيانات الطلب");
      }

      return result.data;
    } catch (error) {
      console.error("Error getting order by temporary link:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء الحصول على بيانات الطلب"
      );
    }
  }

  /**
   * تحديث الطلب عبر الرابط المؤقت
   */
  async updateOrderByTemporaryLink(
    token: string,
    updateData: {
      customerInfo: {
        name: string;
        phone: string;
      };
      jacketConfig: {
        colors: {
          body: string;
          sleeves: string;
          trim: string;
        };
        materials: {
          body: string;
          sleeves: string;
        };
        size: string;
        logos: Array<{
          id: string;
          image: string | null;
          position: string;
          x: number;
          y: number;
          scale: number;
          rotation?: number;
        }>;
        texts: Array<{
          id: string;
          content: string;
          position: string;
          x: number;
          y: number;
          scale: number;
          font: string;
          color: string;
          isConnected: boolean;
          charStyles?: Array<{
            x?: number;
            y?: number;
            scale?: number;
            font?: string;
            color?: string;
          }>;
        }>;
        currentView: string;
        totalPrice: number;
        isCapturing: boolean;
        uploadedImages: Array<{
          id: string;
          url: string;
          name: string;
          uploadedAt: Date;
          publicId?: string;
        }>;
      };
      quantity?: number;
      totalPrice?: number;
    }
  ): Promise<TemporaryOrderData & { imageSync?: ImageSyncResult }> {
    try {
      const response = await fetch(`${this.baseUrl}/order/${token}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: ApiResponse<
        TemporaryOrderData & { imageSync?: ImageSyncResult }
      > = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في تحديث الطلب");
      }

      return result.data;
    } catch (error) {
      console.error("Error updating order by temporary link:", error);
      throw new Error(
        error instanceof Error ? error.message : "حدث خطأ أثناء تحديث الطلب"
      );
    }
  }

  /**
   * الحصول على الوقت المتبقي للرابط
   */
  async getRemainingTime(token: string): Promise<number> {
    try {
      const validation = await this.validateTemporaryLink(token);
      return validation.remainingTime;
    } catch (error) {
      console.error("Error getting remaining time:", error);
      return 0;
    }
  }

  /**
   * الحصول على الروابط المؤقتة لطلب معين (يتطلب مصادقة المدير)
   */
  async getOrderTemporaryLinks(
    orderId: string,
    token: string
  ): Promise<TemporaryLinkData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/order-links/${orderId}`, {
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

      const result: ApiResponse<TemporaryLinkData[]> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في الحصول على الروابط المؤقتة");
      }

      return result.data;
    } catch (error) {
      console.error("Error getting order temporary links:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء الحصول على الروابط المؤقتة"
      );
    }
  }

  /**
   * إلغاء رابط مؤقت (يتطلب مصادقة المدير)
   */
  async invalidateTemporaryLink(
    token: string,
    adminToken: string
  ): Promise<TemporaryLinkData> {
    try {
      const response = await fetch(`${this.baseUrl}/invalidate/${token}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: ApiResponse<TemporaryLinkData> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في إلغاء الرابط المؤقت");
      }

      return result.data;
    } catch (error) {
      console.error("Error invalidating temporary link:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء إلغاء الرابط المؤقت"
      );
    }
  }
}

export const temporaryLinkService = new TemporaryLinkService();
export default temporaryLinkService;
