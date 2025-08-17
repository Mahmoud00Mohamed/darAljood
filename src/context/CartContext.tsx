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
  private readonly storageType: "localStorage" | "sessionStorage" =
    "localStorage"; // تغيير إلى localStorage

  static getInstance(): ImageStorageManager {
    if (!ImageStorageManager.instance) {
      ImageStorageManager.instance = new ImageStorageManager();
    }
    return ImageStorageManager.instance;
  }

  // الحصول على نوع التخزين المناسب
  private getStorage(): Storage {
    return this.storageType === "localStorage" ? localStorage : sessionStorage;
  }

  // حفظ الصور وإرجاع مفاتيحها
  storeImages(images: string[]): string[] {
    const keys: string[] = [];
    const storage = this.getStorage();

    images.forEach((image, index) => {
      if (image) {
        const key = `${this.prefix}${Date.now()}_${index}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        try {
          storage.setItem(key, image);
          keys.push(key);
        } catch {
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
    const storage = this.getStorage();
    return keys
      .map((key) => {
        try {
          // محاولة الاسترجاع من التخزين المحدد أولاً
          const image = storage.getItem(key);
          if (image) return image;

          // إذا لم توجد، محاولة الاسترجاع من الذاكرة
          return this.memoryStorage.get(key) || "";
        } catch {
          return this.memoryStorage.get(key) || "";
        }
      })
      .filter(Boolean);
  }

  // حذف الصور
  deleteImages(keys: string[]): void {
    const storage = this.getStorage();
    keys.forEach((key) => {
      try {
        storage.removeItem(key);
        this.memoryStorage.delete(key);
      } catch {
        // تم إزالة رسالة التحذير
      }
    });
  }

  // تخزين مؤقت في الذاكرة كبديل
  private memoryStorage = new Map<string, string>();

  // تنظيف الصور القديمة
  cleanup(): void {
    try {
      const storage = this.getStorage();
      const keysToRemove: string[] = [];

      // تنظيف التخزين المحدد
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => {
        storage.removeItem(key);
      });

      // تنظيف الذاكرة
      this.memoryStorage.clear();
    } catch {
      // تم إزالة رسالة التحذير
    }
  }

  // تنظيف الصور القديمة فقط (أكثر من 7 أيام)
  cleanupOldImages(): void {
    try {
      const storage = this.getStorage();
      const keysToRemove: string[] = [];
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(this.prefix)) {
          // استخراج timestamp من المفتاح
          const timestampMatch = key.match(/_(\d+)_/);
          if (timestampMatch) {
            const timestamp = parseInt(timestampMatch[1]);
            if (timestamp < sevenDaysAgo) {
              keysToRemove.push(key);
            }
          }
        }
      }

      keysToRemove.forEach((key) => {
        storage.removeItem(key);
      });
    } catch {
      // تم إزالة رسالة التحذير
    }
  }
}

// eslint-disable-next-line react-refresh/only-export-components
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

  // تحديد مفتاح التخزين حسب الصفحة الحالية
  const getCartStorageKey = () => {
    const currentPath = window.location.pathname;
    if (
      currentPath.startsWith("/admin/orders/") &&
      currentPath.endsWith("/edit")
    ) {
      return "orderEditCart";
    }
    if (currentPath.startsWith("/edit-order/")) {
      return "temporaryOrderEditCart";
    }
    return "cart";
  };

  // تحميل السلة من localStorage عند بدء التطبيق
  useEffect(() => {
    if (!isInitialized) {
      const storageKey = getCartStorageKey();
      const savedCart = localStorage.getItem(storageKey);
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          const validatedCart = parsedCart
            .map((item: CartItem & { addedAt: string }) => ({
              ...item,
              addedAt: new Date(item.addedAt),
              imageKeys: Array.isArray(item.imageKeys) ? item.imageKeys : [],
            }))
            .filter(
              (item: CartItem) => item.id && item.jacketConfig && item.quantity
            );

          setItems(validatedCart);
        } catch {
          localStorage.removeItem(storageKey);
        }
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // حفظ السلة في localStorage عند تغيير العناصر
  useEffect(() => {
    if (isInitialized) {
      try {
        const storageKey = getCartStorageKey();
        // حفظ البيانات الأساسية فقط (بدون الصور)
        const cartData = items.map((item) => ({
          id: item.id,
          jacketConfig: item.jacketConfig,
          quantity: item.quantity,
          price: item.price,
          addedAt: item.addedAt,
          imageKeys: item.imageKeys || [],
        }));

        localStorage.setItem(storageKey, JSON.stringify(cartData));
      } catch (error) {
        // في حالة تجاوز الحد المسموح، احتفظ بعنصر واحد فقط
        if (
          error instanceof DOMException &&
          error.name === "QuotaExceededError"
        ) {
          try {
            const lastItem = items[items.length - 1];
            if (lastItem) {
              const storageKey = getCartStorageKey();
              localStorage.setItem(
                storageKey,
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
          } catch {
            const storageKey = getCartStorageKey();
            localStorage.removeItem(storageKey);
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
    // تنظيف الصور القديمة فقط (أكثر من 7 أيام) بدلاً من حذف كل شيء
    imageManager.cleanupOldImages();

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
    const storageKey = getCartStorageKey();
    localStorage.removeItem(storageKey);
    // لا نحذف جميع الصور عند مسح السلة، فقط الصور المرتبطة بالعناصر المحذوفة
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
    // تنظيف الصور القديمة عند بدء التطبيق
    imageManager.cleanupOldImages();

    const handleBeforeUnload = () => {
      // تنظيف الصور القديمة فقط عند إغلاق التطبيق
      imageManager.cleanupOldImages();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [imageManager]);

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
