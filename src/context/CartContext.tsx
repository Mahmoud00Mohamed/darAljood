import React, { createContext, useContext, useState, useEffect } from "react";
import { JacketState } from "./JacketContext";

export interface CartItem {
  id: string;
  jacketConfig: JacketState;
  quantity: number;
  price: number;
  addedAt: Date;
  imageKeys?: string[]; // مفاتيح الصور بدلاً من الصور نفسها
}

interface CartContextType {
  items: CartItem[];
  addToCart: (
    jacketConfig: JacketState,
    quantity: number,
    jacketImages?: string[]
  ) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getItemImages: (itemId: string) => string[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// مدير تخزين الصور في sessionStorage
class ImageStorageManager {
  private static instance: ImageStorageManager;
  private readonly prefix = "jacket_image_";

  static getInstance(): ImageStorageManager {
    if (!ImageStorageManager.instance) {
      ImageStorageManager.instance = new ImageStorageManager();
    }
    return ImageStorageManager.instance;
  }

  // حفظ الصور وإرجاع مفاتيحها
  storeImages(images: string[]): string[] {
    const keys: string[] = [];

    images.forEach((image, index) => {
      if (image) {
        const key = `${this.prefix}${Date.now()}_${index}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        try {
          sessionStorage.setItem(key, image);
          keys.push(key);
        } catch (error) {
          console.warn(`Failed to store image ${index}:`, error);
          // في حالة فشل التخزين، نحتفظ بالصورة في الذاكرة مؤقتاً
          this.memoryStorage.set(key, image);
          keys.push(key);
        }
      }
    });

    return keys;
  }

  // استرجاع الصور باستخدام المفاتيح
  retrieveImages(keys: string[]): string[] {
    return keys
      .map((key) => {
        try {
          // محاولة الاسترجاع من sessionStorage أولاً
          const image = sessionStorage.getItem(key);
          if (image) return image;

          // إذا لم توجد، محاولة الاسترجاع من الذاكرة
          return this.memoryStorage.get(key) || "";
        } catch (error) {
          console.warn(`Failed to retrieve image with key ${key}:`, error);
          return this.memoryStorage.get(key) || "";
        }
      })
      .filter(Boolean);
  }

  // حذف الصور
  deleteImages(keys: string[]): void {
    keys.forEach((key) => {
      try {
        sessionStorage.removeItem(key);
        this.memoryStorage.delete(key);
      } catch (error) {
        console.warn(`Failed to delete image with key ${key}:`, error);
      }
    });
  }

  // تخزين مؤقت في الذاكرة كبديل
  private memoryStorage = new Map<string, string>();

  // تنظيف الصور القديمة
  cleanup(): void {
    try {
      const keysToRemove: string[] = [];

      // تنظيف sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => {
        sessionStorage.removeItem(key);
      });

      // تنظيف الذاكرة
      this.memoryStorage.clear();
    } catch (error) {
      console.warn("Failed to cleanup images:", error);
    }
  }
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const imageManager = ImageStorageManager.getInstance();

  // تحميل السلة من localStorage عند بدء التطبيق
  useEffect(() => {
    if (!isInitialized) {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          const validatedCart = parsedCart
            .map((item: any) => ({
              ...item,
              addedAt: new Date(item.addedAt),
              imageKeys: Array.isArray(item.imageKeys) ? item.imageKeys : [],
            }))
            .filter(
              (item: any) => item.id && item.jacketConfig && item.quantity
            );

          setItems(validatedCart);
        } catch (error) {
          console.error("Error loading cart from localStorage:", error);
          localStorage.removeItem("cart");
        }
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // حفظ السلة في localStorage عند تغيير العناصر
  useEffect(() => {
    if (isInitialized) {
      try {
        // حفظ البيانات الأساسية فقط (بدون الصور)
        const cartData = items.map((item) => ({
          id: item.id,
          jacketConfig: item.jacketConfig,
          quantity: item.quantity,
          price: item.price,
          addedAt: item.addedAt,
          imageKeys: item.imageKeys || [],
        }));

        localStorage.setItem("cart", JSON.stringify(cartData));
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);

        // في حالة تجاوز الحد المسموح، احتفظ بعنصر واحد فقط
        if (
          error instanceof DOMException &&
          error.name === "QuotaExceededError"
        ) {
          try {
            const lastItem = items[items.length - 1];
            if (lastItem) {
              localStorage.setItem(
                "cart",
                JSON.stringify([
                  {
                    id: lastItem.id,
                    jacketConfig: lastItem.jacketConfig,
                    quantity: lastItem.quantity,
                    price: lastItem.price,
                    addedAt: lastItem.addedAt,
                    imageKeys: lastItem.imageKeys || [],
                  },
                ])
              );

              // تحديث الحالة للاحتفاظ بالعنصر الأخير فقط
              setItems([lastItem]);
            }
          } catch (fallbackError) {
            console.error("Fallback save also failed:", fallbackError);
            localStorage.removeItem("cart");
          }
        }
      }
    }
  }, [items, isInitialized]);

  const addToCart = (
    jacketConfig: JacketState,
    quantity: number,
    jacketImages?: string[]
  ) => {
    // تنظيف الصور القديمة قبل إضافة جديدة
    imageManager.cleanup();

    // حفظ الصور الجديدة والحصول على مفاتيحها
    const imageKeys = jacketImages
      ? imageManager.storeImages(jacketImages)
      : [];

    const newItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      jacketConfig,
      quantity,
      price: jacketConfig.totalPrice,
      addedAt: new Date(),
      imageKeys,
    };

    // حذف الصور للعناصر القديمة
    items.forEach((item) => {
      if (item.imageKeys) {
        imageManager.deleteImages(item.imageKeys);
      }
    });

    // استبدال العنصر الموجود بالعنصر الجديد (منتج واحد فقط)
    setItems([newItem]);
  };

  const removeFromCart = (id: string) => {
    const itemToRemove = items.find((item) => item.id === id);
    if (itemToRemove && itemToRemove.imageKeys) {
      imageManager.deleteImages(itemToRemove.imageKeys);
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    // حذف جميع الصور المرتبطة بالسلة
    items.forEach((item) => {
      if (item.imageKeys) {
        imageManager.deleteImages(item.imageKeys);
      }
    });

    setItems([]);
    localStorage.removeItem("cart");
    imageManager.cleanup();
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getItemImages = (itemId: string): string[] => {
    const item = items.find((item) => item.id === itemId);
    if (!item || !item.imageKeys) return [];

    return imageManager.retrieveImages(item.imageKeys);
  };

  // تنظيف الصور عند إغلاق التطبيق
  useEffect(() => {
    const handleBeforeUnload = () => {
      // لا نحذف الصور هنا لأنها قد تكون مطلوبة في جلسة أخرى
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        getItemImages,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
