import { useRef, useImperativeHandle, forwardRef } from "react";
import {
  useJacket,
  JacketView,
  JacketState,
} from "../../context/JacketContext";
import * as htmlToImage from "html-to-image";
import JacketViewer from "./JacketViewer";
import fontPreloader from "../../utils/fontPreloader";

export interface JacketImageCaptureRef {
  captureAllViews: () => Promise<string[]>;
  captureFromConfig: (config: JacketState) => Promise<string[]>;
}

interface JacketImageCaptureProps {
  className?: string;
}

const JacketImageCapture = forwardRef<
  JacketImageCaptureRef,
  JacketImageCaptureProps
>(({ className }, ref) => {
  const {
    setCurrentView,
    setIsCapturing,
    jacketState,
    setColor,
    setMaterial,
    setSize,
    addLogo,
    addText,
    removeLogo,
    removeText,
  } = useJacket();
  const containerRef = useRef<HTMLDivElement>(null);

  const saveCurrentState = () => {
    return { ...jacketState };
  };

  const restoreState = (savedState: JacketState) => {
    jacketState.logos.forEach((logo) => removeLogo(logo.id));
    jacketState.texts.forEach((text) => removeText(text.id));
    setColor("body", savedState.colors.body);
    setColor("sleeves", savedState.colors.sleeves);
    setColor("trim", savedState.colors.trim);
    setMaterial("body", savedState.materials.body);
    setMaterial("sleeves", savedState.materials.sleeves);
    setSize(savedState.size);
    savedState.logos.forEach((logo) => addLogo(logo));
    savedState.texts.forEach((text) => addText(text));
  };

  const ensureImagesLoaded = (container: HTMLElement): Promise<void> => {
    const images = container.querySelectorAll(
      "img.logo-overlay"
    ) as NodeListOf<HTMLImageElement>;
    const promises = Array.from(images).map((img) => {
      if (img.complete && img.naturalHeight !== 0) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.warn(`Image load timeout: ${img.src}`);
          resolve(); // لا نرفض، فقط نحذر
        }, 5000);

        img.onload = () => resolve();
        img.onerror = () =>
          reject(new Error(`Failed to load image: ${img.src}`));

        img.onload = () => {
          clearTimeout(timeout);
          resolve();
        };
        img.onerror = () => {
          clearTimeout(timeout);
          console.warn(`Failed to load image: ${img.src}`);
          resolve(); // لا نرفض لتجنب توقف العملية
        };
      });
    });
    return Promise.all(promises).then(() => Promise.resolve());
  };

  const forceRepaint = (element: HTMLElement) => {
    const originalDisplay = element.style.display;
    element.style.display = "none";
    void element.offsetHeight; // إجبار إعادة الرسم
    element.style.display = originalDisplay;
  };

  const captureView = async (): Promise<string> => {
    const container = containerRef.current;
    if (!container) throw new Error("Container not found");

    // إجبار إعادة الرسم
    forceRepaint(container);

    // التأكد من تحميل الخطوط
    if (!fontPreloader.isFontLoaded("Tajawal")) {
      await fontPreloader.preloadAllFonts();
    }
    await document.fonts.ready;

    // تأخير إضافي للتأكد من استقرار DOM
    await new Promise((resolve) => setTimeout(resolve, 300));

    // التأكد من تحميل جميع الشعارات
    await ensureImagesLoaded(container);

    // تأخير إضافي للهواتف للتأكد من تحميل جميع الشعارات
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      // تأخير إضافي للهواتف (800ms) للتأكد من استقرار العرض
      await new Promise((resolve) => setTimeout(resolve, 800));

      // التأكد مرة أخرى من تحميل الصور في الهواتف
      await ensureImagesLoaded(container);

      // تأخير إضافي للتأكد من استقرار الـ DOM
      await new Promise((resolve) => setTimeout(resolve, 400));
    } else {
      // تأخير إضافي للشاشات الكبيرة أيضاً
      await new Promise((resolve) => setTimeout(resolve, 500));

      // التأكد مرة أخرى من تحميل الصور
      await ensureImagesLoaded(container);

      // تأخير إضافي للاستقرار
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    // إعدادات الحاوية والعارض
    const jacketViewer = container.querySelector(
      ".jacket-viewer-mobile"
    ) as HTMLElement;

    if (container) {
      container.style.position = "relative";
      container.style.top = "0";
      container.style.left = "0";
      container.style.opacity = "1";
      container.style.zIndex = "1000";
      container.style.visibility = "visible";
      container.style.transform = "none";
      container.style.fontFamily = "'Tajawal', 'Arial', sans-serif";
    }

    if (jacketViewer) {
      jacketViewer.style.transform = "scale(1)";
      jacketViewer.style.width = "320px";
      jacketViewer.style.height = "410px";
      jacketViewer.style.opacity = "1";
      jacketViewer.style.display = "flex";
      jacketViewer.style.visibility = "visible";
      jacketViewer.style.position = "relative";
      jacketViewer.style.margin = "0 auto";
      jacketViewer.style.fontFamily = "'Tajawal', 'Arial', sans-serif";
    }

    // تطبيق الخطوط على جميع عناصر النص
    const textElements = container.querySelectorAll(".text-overlay");
    textElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const currentFont = htmlElement.style.fontFamily;

      if (currentFont) {
        htmlElement.style.fontFamily = `${currentFont}, 'Tajawal', 'Arial', sans-serif`;
      } else {
        htmlElement.style.fontFamily = "'Tajawal', 'Arial', sans-serif";
      }

      htmlElement.style.fontWeight = "bold";
      htmlElement.style.textRendering = "optimizeLegibility";
      htmlElement.style.fontKerning = "normal";
      htmlElement.style.fontVariantLigatures = "normal";
    });

    // انتظار إضافي بسيط لاستقرار الـ DOM
    await new Promise((resolve) => setTimeout(resolve, isMobile ? 300 : 100));

    try {
      const dataUrl = await htmlToImage.toPng(container, {
        quality: 1.0,
        pixelRatio: 2,
        width: 320,
        height: 410,
        backgroundColor: "#f9fafb",
        skipFonts: false,
        cacheBust: true,
        includeQueryParams: true,
        fetchRequestInit: {
          mode: "cors",
        },
        filter: (node) => {
          if (
            node.classList &&
            node.classList.contains("jacket-viewer-controls")
          ) {
            return false;
          }
          return true;
        },
      });

      return dataUrl;
    } finally {
      if (container) {
        container.style.position = "absolute";
        container.style.top = "-9999px";
        container.style.left = "-9999px";
        container.style.opacity = "";
        container.style.zIndex = "-1";
        container.style.visibility = "";
        container.style.transform = "";
        container.style.fontFamily = "";
      }
      if (jacketViewer) {
        jacketViewer.style.transform = "";
        jacketViewer.style.width = "";
        jacketViewer.style.height = "";
        jacketViewer.style.opacity = "";
        jacketViewer.style.display = "";
        jacketViewer.style.visibility = "";
        jacketViewer.style.position = "";
        jacketViewer.style.margin = "";
        jacketViewer.style.fontFamily = "";
      }
    }
  };

  useImperativeHandle(ref, () => ({
    captureAllViews: async () => {
      const views: JacketView[] = ["front", "back", "right", "left"];
      const images: string[] = [];

      setIsCapturing(true);

      // تأخير أولي للتأكد من استقرار الحالة
      await new Promise((resolve) => setTimeout(resolve, 500));

      for (const view of views) {
        try {
          setCurrentView(view);
          // تأخير أطول بين تغيير العروض لضمان التحديث الكامل
          const isMobile = window.innerWidth <= 768;
          await new Promise((resolve) =>
            setTimeout(resolve, isMobile ? 1200 : 800)
          );
          const imageData = await captureView();
          images.push(imageData);
        } catch (error) {
          console.error(`Error capturing ${view} view:`, error);
          images.push("");
        }
      }

      setIsCapturing(false);
      return images;
    },

    captureFromConfig: async (config: JacketState) => {
      const views: JacketView[] = ["front", "back", "right", "left"];
      const images: string[] = [];

      const currentState = saveCurrentState();

      setIsCapturing(true);

      try {
        restoreState(config);
        // تأخير أطول عند استعادة الحالة لضمان التطبيق الكامل
        const isMobile = window.innerWidth <= 768;
        await new Promise((resolve) =>
          setTimeout(resolve, isMobile ? 1000 : 700)
        );

        for (const view of views) {
          try {
            setCurrentView(view);
            await new Promise((resolve) =>
              setTimeout(resolve, isMobile ? 1200 : 800)
            );
            const imageData = await captureView();
            images.push(imageData);
          } catch (error) {
            console.error(`Error capturing ${view} view:`, error);
            images.push("");
          }
        }
      } finally {
        restoreState(currentState);
        setIsCapturing(false);
      }

      return images;
    },
  }));

  return (
    <div
      ref={containerRef}
      className={`jacket-image-capture ${className}`}
      style={{
        position: "absolute",
        top: "-9999px",
        left: "-9999px",
        width: "320px",
        height: "410px",
        overflow: "visible",
        zIndex: -1,
        backgroundColor: "#f9fafb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          "'Tajawal', 'Katibeh', 'Amiri', 'Noto Naskh Arabic', 'Noto Kufi Arabic', 'Scheherazade New', 'Arial', sans-serif",
      }}
    >
      <JacketViewer isSidebarOpen={false} isCapturing={true} />
    </div>
  );
});

JacketImageCapture.displayName = "JacketImageCapture";

export default JacketImageCapture;
