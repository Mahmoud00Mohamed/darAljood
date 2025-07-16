export interface PricingConfig {
  basePrice: number;
  includedItems: {
    backLogo: boolean;
    backText: boolean;
    rightSideLogos: number;
    leftSideLogos: number;
    frontItems: number; // شعار أو نص في الأمام
  };
  additionalCosts: {
    frontExtraItem: number; // شعار أو نص إضافي في الأمام
    rightSideThirdLogo: number; // شعار ثالث في الجهة اليمنى
    leftSideThirdLogo: number; // شعار ثالث في الجهة اليسرى
  };
}

export const PRICING_CONFIG: PricingConfig = {
  basePrice: 220, // السعر الأساسي للجاكيت
  includedItems: {
    backLogo: true, // شعار خلفي مشمول
    backText: true, // نص خلفي مشمول
    rightSideLogos: 2, // شعارين في الجهة اليمنى مشمولين
    leftSideLogos: 2, // شعارين في الجهة اليسرى مشمولين
    frontItems: 1, // شعار أو نص واحد في الأمام مشمول
  },
  additionalCosts: {
    frontExtraItem: 25, // شعار أو نص إضافي في الأمام
    rightSideThirdLogo: 25, // شعار ثالث في الجهة اليمنى
    leftSideThirdLogo: 25, // شعار ثالث في الجهة اليسرى
  },
};

export const calculateTotalPrice = (
  frontLogos: number,
  frontTexts: number,
  rightSideLogos: number,
  leftSideLogos: number
): number => {
  let totalPrice = PRICING_CONFIG.basePrice;

  const totalFrontItems = frontLogos + frontTexts;
  if (totalFrontItems > PRICING_CONFIG.includedItems.frontItems) {
    const extraFrontItems =
      totalFrontItems - PRICING_CONFIG.includedItems.frontItems;
    totalPrice +=
      extraFrontItems * PRICING_CONFIG.additionalCosts.frontExtraItem;
  }

  if (rightSideLogos > PRICING_CONFIG.includedItems.rightSideLogos) {
    const extraRightLogos =
      rightSideLogos - PRICING_CONFIG.includedItems.rightSideLogos;
    totalPrice +=
      extraRightLogos * PRICING_CONFIG.additionalCosts.rightSideThirdLogo;
  }

  if (leftSideLogos > PRICING_CONFIG.includedItems.leftSideLogos) {
    const extraLeftLogos =
      leftSideLogos - PRICING_CONFIG.includedItems.leftSideLogos;
    totalPrice +=
      extraLeftLogos * PRICING_CONFIG.additionalCosts.leftSideThirdLogo;
  }

  return totalPrice;
};

export const getPricingBreakdown = (
  frontLogos: number,
  frontTexts: number,
  rightSideLogos: number,
  leftSideLogos: number
) => {
  const breakdown = {
    basePrice: PRICING_CONFIG.basePrice,
    additionalCosts: [] as Array<{
      item: string;
      cost: number;
      quantity: number;
    }>,
    totalPrice: 0,
  };

  const totalFrontItems = frontLogos + frontTexts;
  if (totalFrontItems > PRICING_CONFIG.includedItems.frontItems) {
    const extraFrontItems =
      totalFrontItems - PRICING_CONFIG.includedItems.frontItems;
    breakdown.additionalCosts.push({
      item: "عناصر أمامية إضافية",
      cost: PRICING_CONFIG.additionalCosts.frontExtraItem,
      quantity: extraFrontItems,
    });
  }

  if (rightSideLogos > PRICING_CONFIG.includedItems.rightSideLogos) {
    const extraRightLogos =
      rightSideLogos - PRICING_CONFIG.includedItems.rightSideLogos;
    breakdown.additionalCosts.push({
      item: "شعارات إضافية - جهة يمنى",
      cost: PRICING_CONFIG.additionalCosts.rightSideThirdLogo,
      quantity: extraRightLogos,
    });
  }

  if (leftSideLogos > PRICING_CONFIG.includedItems.leftSideLogos) {
    const extraLeftLogos =
      leftSideLogos - PRICING_CONFIG.includedItems.leftSideLogos;
    breakdown.additionalCosts.push({
      item: "شعارات إضافية - جهة يسرى",
      cost: PRICING_CONFIG.additionalCosts.leftSideThirdLogo,
      quantity: extraLeftLogos,
    });
  }

  breakdown.totalPrice = calculateTotalPrice(
    frontLogos,
    frontTexts,
    rightSideLogos,
    leftSideLogos
  );

  return breakdown;
};
