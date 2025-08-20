// خدمة إدارة الطلبات
export interface JacketConfig {
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
}

export interface OrderData {
  id: string;
  orderNumber: string;
  trackingCode: string;
  customerInfo: {
    name: string;
    phone: string;
  };
  items: Array<{
    id: string;
    jacketConfig: JacketConfig;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  status: string;
  statusName: string;
  statusHistory: Array<{
    status: string;
    statusName: string;
    timestamp: string;
    note: string;
    updatedBy: string;
  }>;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery: string;
  shippedAt?: string;
  deliveredAt?: string;
  notes?: Array<{
    id: string;
    content: string;
    addedBy: string;
    addedAt: string;
  }>;
}

export interface PublicOrderInfo {
  orderNumber: string;
  trackingCode: string;
  status: string;
  statusName: string;
  createdAt: string;
  estimatedDelivery: string;
  shippedAt?: string;
  deliveredAt?: string;
  statusHistory: Array<{
    status: string;
    statusName: string;
    timestamp: string;
    note: string;
  }>;
  totalPrice: number;
  itemsCount: number;
}

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

export interface OrderValidationResult {
  success: boolean;
  isInSync: boolean;
  orderNumber: string;
  expected: {
    count: number;
    publicIds: string[];
  };
  actual: {
    count: number;
    publicIds: string[];
    images: Array<{
      publicId: string;
      url: string;
      originalPublicId: string;
      size: number;
      format: string;
      createdAt: string;
    }>;
  };
  differences: {
    missing: string[];
    extra: string[];
    matching: string[];
  };
  message: string;
  error?: string;
}

export interface OrderImageFixResult {
  success: boolean;
  wasFixed: boolean;
  validationResult: OrderValidationResult;
  fixResults: {
    deletedExtra: {
      success: boolean;
      count: number;
      details?: unknown;
    };
    addedMissing: {
      success: boolean;
      count: number;
      details?: unknown;
    };
  };
  message: string;
  error?: string;
}

export interface OrderImagesReport {
  totalOrders: number;
  checkedOrders: number;
  syncedOrders: number;
  unsyncedOrders: number;
  ordersWithIssues: Array<{
    orderId: string;
    orderNumber: string;
    issues?: {
      missing: string[];
      extra: string[];
      matching: string[];
    };
    message?: string;
    error?: string;
  }>;
  summary: {
    totalImages: number;
    totalMissingImages: number;
    totalExtraImages: number;
  };
  generatedAt: string;
}

export interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  inProduction: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
  averageOrderValue: number;
  thisMonth: number;
  lastMonth: number;
  pendingReview: {
    total: number;
    totalValue: number;
    thisMonth: number;
  };
}

export interface CreateOrderRequest {
  customerInfo: {
    name: string;
    phone: string;
  };
  items: Array<{
    id: string;
    jacketConfig: JacketConfig;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class OrderService {
  private baseUrl = "https://server-algood.onrender.com/api/orders";

  /**
   * إنشاء طلب جديد
   */
  async createOrder(orderData: CreateOrderRequest): Promise<OrderData> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: ApiResponse<OrderData> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في إنشاء الطلب");
      }

      return result.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw new Error(
        error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الطلب"
      );
    }
  }

  /**
   * تتبع الطلب بواسطة رمز التتبع
   */
  async trackOrder(searchValue: string): Promise<PublicOrderInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/track/${searchValue}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: ApiResponse<PublicOrderInfo> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في تتبع الطلب");
      }

      return result.data;
    } catch (error) {
      console.error("Error tracking order:", error);
      throw new Error(
        error instanceof Error ? error.message : "حدث خطأ أثناء تتبع الطلب"
      );
    }
  }

  /**
   * البحث عن الطلب برقم الطلب أو رمز التتبع
   */
  async searchOrder(searchValue: string): Promise<PublicOrderInfo> {
    try {
      // تنظيف القيمة المدخلة
      const cleanValue = searchValue.trim().toUpperCase();

      // محاولة البحث برمز التتبع أولاً
      const response = await fetch(`${this.baseUrl}/track/${cleanValue}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: ApiResponse<PublicOrderInfo> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "لم يتم العثور على الطلب");
      }

      return result.data;
    } catch (error) {
      console.error("Error searching order:", error);
      throw new Error(
        error instanceof Error ? error.message : "حدث خطأ أثناء البحث عن الطلب"
      );
    }
  }

  /**
   * الحصول على جميع الطلبات (يتطلب مصادقة)
   */
  async getAllOrders(
    token: string,
    options: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
      dateFrom?: string;
      dateTo?: string;
      includePending?: boolean;
    } = {}
  ): Promise<{
    orders: OrderData[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalOrders: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      const params = new URLSearchParams();
      if (options.page) params.set("page", options.page.toString());
      if (options.limit) params.set("limit", options.limit.toString());
      if (options.status) params.set("status", options.status);
      if (options.search) params.set("search", options.search);
      if (options.dateFrom) params.set("dateFrom", options.dateFrom);
      if (options.dateTo) params.set("dateTo", options.dateTo);
      if (options.includePending !== undefined)
        params.set("includePending", options.includePending.toString());

      const url = `${this.baseUrl}?${params.toString()}`;

      const response = await fetch(url, {
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

      const result: ApiResponse<{
        orders: OrderData[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalOrders: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      }> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في الحصول على الطلبات");
      }

      return result.data;
    } catch (error) {
      console.error("Error getting orders:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء الحصول على الطلبات"
      );
    }
  }

  /**
   * الحصول على طلب واحد (يتطلب مصادقة)
   */
  async getOrderById(orderId: string, token: string): Promise<OrderData> {
    try {
      const response = await fetch(`${this.baseUrl}/${orderId}`, {
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

      const result: ApiResponse<OrderData> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في الحصول على الطلب");
      }

      return result.data;
    } catch (error) {
      console.error("Error getting order:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء الحصول على الطلب"
      );
    }
  }

  /**
   * تحديث حالة الطلب (يتطلب مصادقة)
   */
  async updateOrderStatus(
    orderId: string,
    status: string,
    note: string,
    token: string
  ): Promise<OrderData> {
    try {
      const response = await fetch(`${this.baseUrl}/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, note }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: ApiResponse<OrderData> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في تحديث حالة الطلب");
      }

      return result.data;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تحديث حالة الطلب"
      );
    }
  }

  /**
   * تحديث بيانات الطلب (يتطلب مصادقة)
   */
  async updateOrder(
    orderId: string,
    updateData: {
      customerInfo?: {
        name: string;
        phone: string;
      };
      jacketConfig?: JacketConfig;
      quantity?: number;
      totalPrice?: number;
    },
    token: string
  ): Promise<OrderData & { imageSync?: ImageSyncResult }> {
    try {
      const response = await fetch(`${this.baseUrl}/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: ApiResponse<OrderData & { imageSync?: ImageSyncResult }> =
        await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في تحديث الطلب");
      }

      return result.data;
    } catch (error) {
      console.error("Error updating order:", error);
      throw new Error(
        error instanceof Error ? error.message : "حدث خطأ أثناء تحديث الطلب"
      );
    }
  }
  /**
   * إضافة ملاحظة للطلب (يتطلب مصادقة)
   */
  async addOrderNote(
    orderId: string,
    note: string,
    token: string
  ): Promise<OrderData> {
    try {
      const response = await fetch(`${this.baseUrl}/${orderId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ note }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: ApiResponse<OrderData> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في إضافة الملاحظة");
      }

      return result.data;
    } catch (error) {
      console.error("Error adding order note:", error);
      throw new Error(
        error instanceof Error ? error.message : "حدث خطأ أثناء إضافة الملاحظة"
      );
    }
  }

  /**
   * الحصول على إحصائيات الطلبات (يتطلب مصادقة)
   */
  async getOrderStats(token: string): Promise<OrderStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
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

      const result: ApiResponse<OrderStats> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في الحصول على الإحصائيات");
      }

      return result.data;
    } catch (error) {
      console.error("Error getting order stats:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء الحصول على الإحصائيات"
      );
    }
  }

  /**
   * حذف طلب (يتطلب مصادقة)
   */
  async deleteOrder(orderId: string, token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${orderId}`, {
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

      const result: ApiResponse<{ orderId: string }> = await response.json();
      return result.success;
    } catch (error) {
      console.error("Error deleting order:", error);
      throw new Error(
        error instanceof Error ? error.message : "حدث خطأ أثناء حذف الطلب"
      );
    }
  }

  /**
   * الحصول على حالات الطلب المتاحة
   */
  async getOrderStatuses(): Promise<
    Array<{
      value: string;
      name: string;
      color: string;
    }>
  > {
    try {
      const response = await fetch(`${this.baseUrl}/statuses`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<
        Array<{
          value: string;
          name: string;
          color: string;
        }>
      > = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في الحصول على حالات الطلب");
      }

      return result.data;
    } catch (error) {
      console.error("Error getting order statuses:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء الحصول على حالات الطلب"
      );
    }
  }

  /**
   * التحقق من تطابق صور الطلب (يتطلب مصادقة المدير)
   */
  async validateOrderImageSync(
    orderId: string,
    token: string
  ): Promise<OrderValidationResult> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${orderId}/images/validate`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: ApiResponse<OrderValidationResult> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في التحقق من تطابق صور الطلب");
      }

      return result.data;
    } catch (error) {
      console.error("Error validating order image sync:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء التحقق من تطابق صور الطلب"
      );
    }
  }

  /**
   * إصلاح تلقائي لتطابق صور الطلب (يتطلب مصادقة المدير)
   */
  async autoFixOrderImageSync(
    orderId: string,
    token: string
  ): Promise<OrderImageFixResult> {
    try {
      const response = await fetch(`${this.baseUrl}/${orderId}/images/fix`, {
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

      const result: ApiResponse<OrderImageFixResult> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في إصلاح تطابق صور الطلب");
      }

      return result.data;
    } catch (error) {
      console.error("Error auto-fixing order image sync:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء إصلاح تطابق صور الطلب"
      );
    }
  }

  /**
   * تقرير شامل عن حالة صور جميع الطلبات (يتطلب مصادقة المدير)
   */
  async getOrderImagesReport(token: string): Promise<OrderImagesReport> {
    try {
      const response = await fetch(`${this.baseUrl}/images/report`, {
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

      const result: ApiResponse<OrderImagesReport> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في إنشاء تقرير صور الطلبات");
      }

      return result.data;
    } catch (error) {
      console.error("Error getting order images report:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء إنشاء تقرير صور الطلبات"
      );
    }
  }
}

export const orderService = new OrderService();
export default orderService;
