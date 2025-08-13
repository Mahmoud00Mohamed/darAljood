// أدوات تنظيف البيانات لإزالة التكرارات

export interface Logo {
  id: string;
  image: string | null;
  position: string;
  x: number;
  y: number;
  scale: number;
  rotation?: number;
}

export interface CustomText {
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
}

/**
 * إزالة الشعارات المكررة بناءً على الـ ID
 */
export const removeDuplicateLogos = (logos: Logo[]): Logo[] => {
  const seen = new Set<string>();
  return logos.filter((logo) => {
    if (seen.has(logo.id)) {
      console.warn(`Duplicate logo found with ID: ${logo.id}`);
      return false;
    }
    seen.add(logo.id);
    return true;
  });
};

/**
 * إزالة النصوص المكررة بناءً على الـ ID
 */
export const removeDuplicateTexts = (texts: CustomText[]): CustomText[] => {
  const seen = new Set<string>();
  return texts.filter((text) => {
    if (seen.has(text.id)) {
      console.warn(`Duplicate text found with ID: ${text.id}`);
      return false;
    }
    seen.add(text.id);
    return true;
  });
};

/**
 * تنظيف بيانات الجاكيت من التكرارات
 */
export const cleanupJacketData = (jacketConfig: {
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
  logos: Logo[];
  texts: CustomText[];
  currentView: string;
  totalPrice: number;
  isCapturing?: boolean;
  uploadedImages?: Array<{
    id: string;
    url: string;
    name: string;
    uploadedAt: Date;
    publicId?: string;
  }>;
  pricingBreakdown?: {
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
  };
}) => {
  return {
    ...jacketConfig,
    logos: removeDuplicateLogos(jacketConfig.logos),
    texts: removeDuplicateTexts(jacketConfig.texts),
  };
};

/**
 * التحقق من وجود تكرارات في البيانات
 */
export const validateDataIntegrity = (jacketConfig: {
  logos: Logo[];
  texts: CustomText[];
}): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];

  // فحص تكرار الشعارات
  const logoIds = jacketConfig.logos.map((logo) => logo.id);
  const uniqueLogoIds = new Set(logoIds);
  if (logoIds.length !== uniqueLogoIds.size) {
    issues.push("توجد شعارات مكررة في البيانات");
  }

  // فحص تكرار النصوص
  const textIds = jacketConfig.texts.map((text) => text.id);
  const uniqueTextIds = new Set(textIds);
  if (textIds.length !== uniqueTextIds.size) {
    issues.push("توجد نصوص مكررة في البيانات");
  }

  // فحص تضارب المواقع
  const positions = [
    ...jacketConfig.logos.map((logo) => logo.position),
    ...jacketConfig.texts.map((text) => text.position),
  ];

  const frontPositions = positions.filter((pos) =>
    ["chestRight", "chestLeft"].includes(pos)
  );
  const uniqueFrontPositions = new Set(frontPositions);
  if (frontPositions.length !== uniqueFrontPositions.size) {
    issues.push("توجد عناصر متعددة في نفس الموقع الأمامي");
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
};
