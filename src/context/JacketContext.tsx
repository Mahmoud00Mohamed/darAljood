import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import pricingService from "../services/pricingService";

export type JacketPart = "body" | "sleeves" | "trim";
export type JacketView = "front" | "back" | "right" | "left";
export type JacketMaterial = "leather" | "cotton";
export type JacketSize = "XS" | "S" | "M" | "L" | "XL" | "2XL" | "3XL" | "4XL";
export type LogoPosition =
  | "chestRight"
  | "chestLeft"
  | "backCenter"
  | "rightSide_top"
  | "rightSide_middle"
  | "rightSide_bottom"
  | "leftSide_top"
  | "leftSide_middle"
  | "leftSide_bottom";
export type TextPosition = "chestRight" | "chestLeft" | "backBottom";

export interface Logo {
  id: string;
  image: string | null;
  position: LogoPosition;
  x: number;
  y: number;
  scale: number;
  rotation?: number;
}

export interface CustomText {
  id: string;
  content: string;
  position: TextPosition;
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

export interface UploadedImage {
  id: string;
  url: string;
  name: string;
  uploadedAt: Date;
  publicId?: string;
}

export interface JacketState {
  colors: Record<JacketPart, string>;
  materials: Record<JacketPart, JacketMaterial>;
  size: JacketSize;
  logos: Logo[];
  texts: CustomText[];
  currentView: JacketView;
  totalPrice: number;
  isCapturing: boolean;
  uploadedImages: UploadedImage[];
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
}

export interface JacketContextType {
  jacketState: JacketState;
  setColor: (part: JacketPart, color: string) => void;
  setMaterial: (part: JacketPart, material: JacketMaterial) => void;
  setSize: (size: JacketSize) => void;
  addLogo: (logo: Logo) => void;
  updateLogo: (id: string, updates: Partial<Logo>) => void;
  removeLogo: (id: string) => void;
  addText: (text: CustomText) => void;
  updateText: (id: string, updates: Partial<CustomText>) => void;
  removeText: (id: string) => void;
  setCurrentView: (view: JacketView) => void;
  resetColors: () => void;
  setIsCapturing: (isCapturing: boolean) => void;
  addUploadedImage: (image: UploadedImage) => void;
  findExistingImage: (imageData: string) => UploadedImage | null;
  getUploadedImages: () => UploadedImage[];
  updatePricing: (quantity?: number) => Promise<void>;
  isLoadingPrice: boolean;
}

const defaultColors: Record<JacketPart, string> = {
  body: "#5C1A2B",
  sleeves: "#1B263B",
  trim: "#1B263B_stripes",
};

const defaultMaterials: Record<JacketPart, JacketMaterial> = {
  body: "cotton",
  sleeves: "leather",
  trim: "cotton",
};

const initialState: JacketState = {
  colors: defaultColors,
  materials: defaultMaterials,
  size: "M",
  logos: [],
  texts: [],
  currentView: "front",
  totalPrice: 220,
  isCapturing: false,
  uploadedImages: [],
};

const JacketContext = createContext<JacketContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useJacket = () => {
  const context = useContext(JacketContext);
  if (context === undefined) {
    throw new Error("useJacket must be used within a JacketProvider");
  }
  return context;
};

const compareImages = (imageData1: string, imageData2: string): boolean => {
  const cleanData1 = imageData1.split(",")[1] || imageData1;
  const cleanData2 = imageData2.split(",")[1] || imageData2;
  return cleanData1 === cleanData2;
};

export const JacketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // تحديد مفتاح التخزين حسب الصفحة الحالية
  const getStorageKey = () => {
    const currentPath = window.location.pathname;
    if (
      currentPath.startsWith("/admin/orders/") &&
      currentPath.endsWith("/edit")
    ) {
      return "orderEditJacketState";
    }
    return "jacketState";
  };

  const [jacketState, setJacketState] = useState<JacketState>(() => {
    try {
      const storageKey = getStorageKey();
      const savedState = localStorage.getItem(storageKey);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        return {
          ...initialState,
          ...parsedState,
          colors: { ...defaultColors, ...parsedState.colors },
          materials: { ...defaultMaterials, ...parsedState.materials },
          size: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"].includes(
            parsedState.size
          )
            ? parsedState.size
            : "M",
          logos: Array.isArray(parsedState.logos) ? parsedState.logos : [],
          texts: Array.isArray(parsedState.texts) ? parsedState.texts : [],
          currentView: ["front", "back", "right", "left"].includes(
            parsedState.currentView
          )
            ? parsedState.currentView
            : "front",
          totalPrice:
            typeof parsedState.totalPrice === "number"
              ? parsedState.totalPrice
              : 220,
          isCapturing: false,
          uploadedImages: Array.isArray(parsedState.uploadedImages)
            ? parsedState.uploadedImages.map(
                (img: UploadedImage & { uploadedAt: string }) => ({
                  ...img,
                  uploadedAt: new Date(img.uploadedAt),
                })
              )
            : [],
          pricingBreakdown: parsedState.pricingBreakdown || undefined,
        };
      }
      return initialState;
    } catch {
      return initialState;
    }
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);

  // حفظ الحالة في localStorage
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      try {
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(jacketState));
      } catch (error) {
        console.warn("Failed to save jacket state:", error);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [jacketState, isInitialized]);

  // حساب السعر من الباك إند
  const calculatePriceFromBackend = useCallback(
    async (quantity: number = 1) => {
      setIsLoadingPrice(true);
      try {
        const frontLogos = jacketState.logos.filter((logo) =>
          ["chestRight", "chestLeft"].includes(logo.position)
        ).length;

        const frontTexts = jacketState.texts.filter((text) =>
          ["chestRight", "chestLeft"].includes(text.position)
        ).length;

        const rightSideLogos = jacketState.logos.filter((logo) =>
          ["rightSide_top", "rightSide_middle", "rightSide_bottom"].includes(
            logo.position
          )
        ).length;

        const leftSideLogos = jacketState.logos.filter((logo) =>
          ["leftSide_top", "leftSide_middle", "leftSide_bottom"].includes(
            logo.position
          )
        ).length;

        const result = await pricingService.calculatePrice(
          frontLogos,
          frontTexts,
          rightSideLogos,
          leftSideLogos,
          quantity
        );

        return {
          totalPrice: result.totalPrice,
          breakdown: result.breakdown,
        };
      } catch (error) {
        console.error("Error calculating price from backend:", error);
        // استخدام السعر الافتراضي في حالة الخطأ
        return {
          totalPrice: 220,
          breakdown: {
            basePrice: 220,
            additionalCosts: [],
            totalPrice: 220,
            appliedDiscount: null,
            finalPrice: 220 * quantity,
          },
        };
      } finally {
        setIsLoadingPrice(false);
      }
    },
    [jacketState.logos, jacketState.texts]
  );

  // تحديث السعر
  const updatePricing = useCallback(
    async (quantity: number = 1) => {
      const pricingResult = await calculatePriceFromBackend(quantity);

      setJacketState((prev) => ({
        ...prev,
        totalPrice: pricingResult.totalPrice,
        pricingBreakdown: pricingResult.breakdown,
      }));
    },
    [calculatePriceFromBackend]
  );

  // تحديث السعر عند تغيير الشعارات أو النصوص
  useEffect(() => {
    if (isInitialized) {
      updatePricing();
    }
  }, [jacketState.logos, jacketState.texts, isInitialized, updatePricing]);

  const setColor = useCallback((part: JacketPart, color: string) => {
    setJacketState((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [part]: color,
      },
    }));
  }, []);

  const setMaterial = useCallback(
    (part: JacketPart, material: JacketMaterial) => {
      setJacketState((prev) => ({
        ...prev,
        materials: {
          ...prev.materials,
          [part]: material,
        },
      }));
    },
    []
  );

  const setSize = useCallback((size: JacketSize) => {
    setJacketState((prev) => ({
      ...prev,
      size,
    }));
  }, []);

  const addLogo = useCallback((logo: Logo) => {
    setJacketState((prev) => ({
      ...prev,
      logos: [...prev.logos.filter((l) => l.id !== logo.id), logo],
    }));
  }, []);

  const updateLogo = useCallback((id: string, updates: Partial<Logo>) => {
    setJacketState((prev) => ({
      ...prev,
      logos: prev.logos.map((logo) =>
        logo.id === id ? { ...logo, ...updates } : logo
      ),
    }));
  }, []);

  const removeLogo = useCallback((id: string) => {
    setJacketState((prev) => ({
      ...prev,
      logos: prev.logos.filter((logo) => logo.id !== id),
    }));
  }, []);

  const addText = useCallback((text: CustomText) => {
    setJacketState((prev) => ({
      ...prev,
      texts: [...prev.texts.filter((t) => t.id !== text.id), text],
    }));
  }, []);

  const updateText = useCallback((id: string, updates: Partial<CustomText>) => {
    setJacketState((prev) => ({
      ...prev,
      texts: prev.texts.map((text) =>
        text.id === id ? { ...text, ...updates } : text
      ),
    }));
  }, []);

  const removeText = useCallback((id: string) => {
    setJacketState((prev) => ({
      ...prev,
      texts: prev.texts.filter((text) => text.id !== id),
    }));
  }, []);

  const setCurrentView = useCallback((view: JacketView) => {
    setJacketState((prev) => ({
      ...prev,
      currentView: view,
    }));
  }, []);

  const resetColors = useCallback(() => {
    setJacketState((prev) => ({
      ...prev,
      colors: defaultColors,
    }));
  }, []);

  const setIsCapturing = useCallback((isCapturing: boolean) => {
    setJacketState((prev) => ({
      ...prev,
      isCapturing,
    }));
  }, []);

  const addUploadedImage = useCallback((image: UploadedImage) => {
    setJacketState((prev) => ({
      ...prev,
      uploadedImages: [...prev.uploadedImages, image],
    }));
  }, []);

  const findExistingImage = useCallback(
    (imageData: string): UploadedImage | null => {
      return (
        jacketState.uploadedImages.find((img) =>
          compareImages(img.url, imageData)
        ) || null
      );
    },
    [jacketState.uploadedImages]
  );

  const getUploadedImages = useCallback(() => {
    return jacketState.uploadedImages;
  }, [jacketState.uploadedImages]);

  return (
    <JacketContext.Provider
      value={{
        jacketState,
        setColor,
        setMaterial,
        setSize,
        addLogo,
        updateLogo,
        removeLogo,
        addText,
        updateText,
        removeText,
        setCurrentView,
        resetColors,
        setIsCapturing,
        addUploadedImage,
        findExistingImage,
        getUploadedImages,
        updatePricing,
        isLoadingPrice,
      }}
    >
      {children}
    </JacketContext.Provider>
  );
};
