import { useState, useEffect, useCallback } from "react";
import pricingService, { PricingData, PricingBreakdown } from "../services/pricingService";

interface UsePricingReturn {
  pricingData: PricingData | null;
  isLoading: boolean;
  error: string | null;
  calculatePrice: (
    frontLogos: number,
    frontTexts: number,
    rightSideLogos: number,
    leftSideLogos: number,
    quantity?: number
  ) => Promise<{ totalPrice: number; breakdown: PricingBreakdown }>;
  refreshPricing: () => Promise<void>;
}

/**
 * Hook لإدارة التسعير من الباك إند
 */
export const usePricing = (): UsePricingReturn => {
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // تحميل بيانات التسعير
  const loadPricing = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await pricingService.getPricing();
      setPricingData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحميل بيانات التسعير';
      setError(errorMessage);
      console.error('Error loading pricing:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // حساب السعر
  const calculatePrice = useCallback(async (
    frontLogos: number,
    frontTexts: number,
    rightSideLogos: number,
    leftSideLogos: number,
    quantity: number = 1
  ) => {
    try {
      return await pricingService.calculatePrice(
        frontLogos,
        frontTexts,
        rightSideLogos,
        leftSideLogos,
        quantity
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في حساب السعر';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // إعادة تحميل بيانات التسعير
  const refreshPricing = useCallback(async () => {
    await loadPricing();
  }, [loadPricing]);

  // تحميل البيانات عند تحميل المكون
  useEffect(() => {
    loadPricing();
  }, [loadPricing]);

  return {
    pricingData,
    isLoading,
    error,
    calculatePrice,
    refreshPricing,
  };
};

export default usePricing;