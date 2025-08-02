import { getConfig } from "./config";

class DisplayManager {
  // عرض صورة مع انتقال سلس
  async displayImageSmoothly(
    element: HTMLImageElement,
    newSrc: string,
    options?: {
      fadeDuration?: number;
      onComplete?: () => void;
      onError?: (error: Error) => void;
    }
  ): Promise<void> {
    const config = getConfig();
    const fadeDuration = options?.fadeDuration || config.fadeDuration;

    return new Promise((resolve, reject) => {
      // إنشاء صورة مؤقتة للتحميل
      const tempImage = new Image();

      tempImage.onload = () => {
        // بدء التلاشي
        this.fadeTransition(element, newSrc, fadeDuration, () => {
          options?.onComplete?.();
          resolve();
        });
      };

      tempImage.onerror = () => {
        const err = new Error("فشل في تحميل الصورة");
        options?.onError?.(err);
        reject(err);
      };

      // بدء تحميل الصورة
      tempImage.src = newSrc;
    });
  }

  // انتقال التلاشي
  private fadeTransition(
    element: HTMLImageElement,
    newSrc: string,
    duration: number,
    onComplete: () => void
  ): void {
    // حفظ الحالة الأصلية
    const originalTransition = element.style.transition;
    const originalOpacity = element.style.opacity;

    // تعيين الانتقال
    element.style.transition = `opacity ${duration}ms ease-in-out`;

    // تلاشي للخارج
    element.style.opacity = "0";

    setTimeout(() => {
      // تغيير المصدر
      element.src = newSrc;

      // تلاشي للداخل
      setTimeout(() => {
        element.style.opacity = "1";

        // استعادة الحالة الأصلية بعد انتهاء الانتقال
        setTimeout(() => {
          element.style.transition = originalTransition;
          element.style.opacity = originalOpacity;
          onComplete();
        }, duration);
      }, 10);
    }, duration / 2);
  }

  // عرض placeholder مع إمكانية التخصيص
  displayPlaceholder(
    element: HTMLImageElement,
    placeholderSrc: string,
    options?: {
      className?: string;
      style?: Partial<CSSStyleDeclaration>;
      attributes?: Record<string, string>;
    }
  ): void {
    element.src = placeholderSrc;

    // إضافة class للتمييز
    if (options?.className) {
      element.classList.add(options.className);
    }

    // تطبيق styles
    if (options?.style) {
      Object.assign(element.style, options.style);
    }

    // إضافة attributes
    if (options?.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }

    // إضافة data attribute للإشارة إلى أنها placeholder
    element.setAttribute("data-placeholder", "true");
  }

  // إزالة placeholder والعودة للصورة العادية
  removePlaceholder(
    element: HTMLImageElement,
    newSrc: string,
    options?: {
      fadeOut?: boolean;
      className?: string;
    }
  ): Promise<void> {
    return new Promise((resolve) => {
      // إزالة data attribute
      element.removeAttribute("data-placeholder");

      // إزالة className إذا كان محدداً
      if (options?.className) {
        element.classList.remove(options?.className);
      }

      if (options?.fadeOut) {
        // عرض الصورة الجديدة مع تأثير
        this.displayImageSmoothly(element, newSrc, {
          onComplete: () => resolve(),
        });
      } else {
        // تغيير فوري
        element.src = newSrc;
        resolve();
      }
    });
  }

  // تطبيق تأثيرات loading
  applyLoadingEffects(
    element: HTMLImageElement,
    effectType: "blur" | "skeleton" | "pulse" | "shimmer" = "blur"
  ): void {
    element.classList.add("img-cache-loading");

    switch (effectType) {
      case "blur":
        element.style.filter = "blur(5px)";
        break;
      case "skeleton":
        element.style.background =
          "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)";
        element.style.backgroundSize = "200% 100%";
        element.style.animation = "skeleton-loading 1.5s infinite";
        break;
      case "pulse":
        element.style.animation = "pulse 1.5s infinite";
        break;
      case "shimmer":
        element.style.background =
          "linear-gradient(45deg, #f6f7f8 25%, #edeef1 50%, #f6f7f8 75%)";
        element.style.backgroundSize = "200% 100%";
        element.style.animation = "shimmer 2s infinite";
        break;
    }
  }

  // إزالة تأثيرات loading
  removeLoadingEffects(element: HTMLImageElement): void {
    element.classList.remove("img-cache-loading");
    element.style.filter = "";
    element.style.background = "";
    element.style.animation = "";
  }

  // إنشاء CSS animations إذا لم تكن موجودة
  injectLoadingStyles(): void {
    const styleId = "img-cache-pro-styles";

    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes skeleton-loading {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .img-cache-loading {
          transition: all 0.3s ease;
        }
      `;
      document.head.appendChild(style);
    }
  }
}

// إنشاء مثيل واحد لإدارة العرض
export const displayManager = new DisplayManager();

// حقن الأنماط عند تحميل الوحدة
displayManager.injectLoadingStyles();
