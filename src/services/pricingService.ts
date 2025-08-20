// خدمة التسعير للتواصل مع الباك إند
export interface PricingData {
  basePrice: number;
  includedItems: {
    backLogo: boolean;
    backText: boolean;
    rightSideLogos: number;
    leftSideLogos: number;
    frontItems: number;
  };
  additionalCosts: {
    frontExtraItem: number;
    rightSideThirdLogo: number;
    leftSideThirdLogo: number;
  };
  lastUpdated: string;
  updatedBy: string;
}

export interface PricingBreakdown {
  basePrice: number;
  additionalCosts: Array<{
    item: string;
    cost: number;
    quantity: number;
  }>;
  totalPrice: number;
  appliedDiscount: {
    type: string;
    percentage: number;
    amount: number;
  } | null;
  finalPrice: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class PricingService {
  private baseUrl = "https://server-algood.onrender.com/api/pricing";

  /**
   * الحصول على بيانات التسعير الحالية
   */
  async getPricing(): Promise<PricingData> {
    try {
      const response = await fetch(this.baseUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<PricingData> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في الحصول على بيانات التسعير");
      }

      return result.data;
    } catch (error) {
      console.error("Error fetching pricing:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء الحصول على بيانات التسعير"
      );
    }
  }

  /**
   * حساب السعر الإجمالي
   */
  async calculatePrice(
    frontLogos: number,
    frontTexts: number,
    rightSideLogos: number,
    leftSideLogos: number,
    quantity: number = 1
  ): Promise<{ totalPrice: number; breakdown: PricingBreakdown }> {
    try {
      const response = await fetch(`${this.baseUrl}/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          frontLogos,
          frontTexts,
          rightSideLogos,
          leftSideLogos,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{
        totalPrice: number;
        breakdown: PricingBreakdown;
      }> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في حساب السعر");
      }

      return result.data;
    } catch (error) {
      console.error("Error calculating price:", error);
      throw new Error(
        error instanceof Error ? error.message : "حدث خطأ أثناء حساب السعر"
      );
    }
  }

  /**
   * تحديث بيانات التسعير (يتطلب مصادقة)
   */
  async updatePricing(
    pricingData: Partial<PricingData>,
    token: string
  ): Promise<PricingData> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pricingData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: ApiResponse<PricingData> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في تحديث بيانات التسعير");
      }

      return result.data;
    } catch (error) {
      console.error("Error updating pricing:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تحديث بيانات التسعير"
      );
    }
  }

  /**
   * إعادة تعيين الأسعار إلى القيم الافتراضية (يتطلب مصادقة)
   */
  async resetPricing(token: string): Promise<PricingData> {
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

      const result: ApiResponse<PricingData> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في إعادة تعيين الأسعار");
      }

      return result.data;
    } catch (error) {
      console.error("Error resetting pricing:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء إعادة تعيين الأسعار"
      );
    }
  }
}

export const pricingService = new PricingService();
export default pricingService;
