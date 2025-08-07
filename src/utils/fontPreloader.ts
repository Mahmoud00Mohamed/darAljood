// خدمة تحميل الخطوط مسبقاً لتسريع عملية التقاط الصور

interface FontConfig {
  family: string;
  url: string;
  weights?: string[];
  display?: string;
}

class FontPreloader {
  private static instance: FontPreloader;
  private loadedFonts = new Set<string>();
  private loadingPromises = new Map<string, Promise<void>>();

  static getInstance(): FontPreloader {
    if (!FontPreloader.instance) {
      FontPreloader.instance = new FontPreloader();
    }
    return FontPreloader.instance;
  }

  private fonts: FontConfig[] = [
    {
      family: "Katibeh",
      url: "https://fonts.googleapis.com/css2?family=Katibeh&display=swap",
    },
    {
      family: "Amiri",
      url: "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap",
      weights: ["400", "700"],
    },
    {
      family: "Noto Naskh Arabic",
      url: "https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap",
      weights: ["400", "700"],
    },
    {
      family: "Noto Kufi Arabic",
      url: "https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;700&display=swap",
      weights: ["400", "700"],
    },
    {
      family: "Scheherazade New",
      url: "https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap",
      weights: ["400", "700"],
    },
    {
      family: "Tajawal",
      url: "https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap",
      weights: ["400", "500", "700"],
    },
  ];

  /**
   * تحميل خط واحد مع معالجة الأخطاء
   */
  private async loadSingleFont(fontConfig: FontConfig): Promise<void> {
    const fontKey = fontConfig.family;

    // إذا كان الخط محمل مسبقاً، لا نحتاج لتحميله مرة أخرى
    if (this.loadedFonts.has(fontKey)) {
      return Promise.resolve();
    }

    // إذا كان الخط قيد التحميل، انتظر انتهاء التحميل
    if (this.loadingPromises.has(fontKey)) {
      return this.loadingPromises.get(fontKey)!;
    }

    const loadingPromise = new Promise<void>((resolve) => {
      // التحقق من وجود الخط في النظام أولاً
      if (document.fonts.check(`16px "${fontConfig.family}"`)) {
        this.loadedFonts.add(fontKey);
        resolve();
        return;
      }

      // إنشاء link element لتحميل الخط
      const link = document.createElement("link");
      link.href = fontConfig.url;
      link.rel = "stylesheet";
      link.crossOrigin = "anonymous";

      const timeout = setTimeout(() => {
        this.loadedFonts.add(fontKey); // اعتبر الخط محمل لتجنب المحاولات المتكررة
        resolve();
      }, 5000); // timeout بعد 5 ثوان

      link.onload = () => {
        clearTimeout(timeout);

        // تحميل جميع أوزان الخط
        const weights = fontConfig.weights || ["400"];
        const fontPromises = weights.map((weight) =>
          document.fonts.load(`${weight} 16px "${fontConfig.family}"`)
        );

        Promise.allSettled(fontPromises)
          .then(() => {
            this.loadedFonts.add(fontKey);
            resolve();
          })
          .catch(() => {
            this.loadedFonts.add(fontKey); // اعتبر الخط محمل لتجنب المحاولات المتكررة
            resolve();
          });
      };

      link.onerror = () => {
        clearTimeout(timeout);
        this.loadedFonts.add(fontKey); // اعتبر الخط محمل لتجنب المحاولات المتكررة
        resolve(); // لا نرفض Promise لتجنب توقف العملية
      };

      // إضافة الخط إلى head إذا لم يكن موجود
      if (!document.querySelector(`link[href="${fontConfig.url}"]`)) {
        document.head.appendChild(link);
      } else {
        // إذا كان الخط موجود، حمله مباشرة
        clearTimeout(timeout);
        const weights = fontConfig.weights || ["400"];
        const fontPromises = weights.map((weight) =>
          document.fonts.load(`${weight} 16px "${fontConfig.family}"`)
        );

        Promise.allSettled(fontPromises)
          .then(() => {
            this.loadedFonts.add(fontKey);
            resolve();
          })
          .catch(() => {
            this.loadedFonts.add(fontKey);
            resolve();
          });
      }
    });

    this.loadingPromises.set(fontKey, loadingPromise);
    return loadingPromise;
  }

  /**
   * تحميل جميع الخطوط مسبقاً
   */
  async preloadAllFonts(): Promise<void> {
    try {
      // تحميل جميع الخطوط بشكل متوازي
      const loadingPromises = this.fonts.map((font) =>
        this.loadSingleFont(font)
      );
      await Promise.allSettled(loadingPromises);

      // انتظار إضافي للتأكد من تحميل جميع الخطوط
      await document.fonts.ready;
    } catch {
      // خطأ في تحميل بعض الخطوط
    }
  }

  /**
   * التحقق من تحميل خط معين
   */
  isFontLoaded(fontFamily: string): boolean {
    return (
      this.loadedFonts.has(fontFamily) ||
      document.fonts.check(`16px "${fontFamily}"`)
    );
  }

  /**
   * تحميل خط معين إذا لم يكن محمل
   */
  async ensureFontLoaded(fontFamily: string): Promise<void> {
    const fontConfig = this.fonts.find((f) => f.family === fontFamily);
    if (fontConfig && !this.isFontLoaded(fontFamily)) {
      await this.loadSingleFont(fontConfig);
    }
  }

  /**
   * الحصول على قائمة الخطوط المحملة
   */
  getLoadedFonts(): string[] {
    return Array.from(this.loadedFonts);
  }

  /**
   * إعادة تعيين حالة التحميل (للاختبار)
   */
  reset(): void {
    this.loadedFonts.clear();
    this.loadingPromises.clear();
  }
}

export const fontPreloader = FontPreloader.getInstance();
export default fontPreloader;
