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

  const waitForLogosToLoad = async (): Promise<void> => {
    const logoElements = containerRef.current?.querySelectorAll(
      ".logo-overlay img, .logo-overlay-container img"
    );
    if (!logoElements || logoElements.length === 0) return;

    const loadPromises = Array.from(logoElements).map((img) => {
      const imgElement = img as HTMLImageElement;

      if (imgElement.complete) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`Logo loading timeout: ${imgElement.src}`));
        }, 10000);

        const onLoad = () => {
          clearTimeout(timeout);
          imgElement.removeEventListener("load", onLoad);
          imgElement.removeEventListener("error", onError);
          resolve();
        };

        const onError = () => {
          clearTimeout(timeout);
          imgElement.removeEventListener("load", onLoad);
          imgElement.removeEventListener("error", onError);
          reject(new Error(`Failed to load logo: ${imgElement.src}`));
        };

        imgElement.addEventListener("load", onLoad);
        imgElement.addEventListener("error", onError);
      });
    });

    try {
      await Promise.all(loadPromises);
    } catch (error) {
      console.warn("Some logos failed to load:", error);
    }
  };

  const forceLogoVisibility = () => {
    const logoElements = containerRef.current?.querySelectorAll(
      ".logo-overlay, .logo-overlay-container"
    );
    logoElements?.forEach((element) => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.opacity = "1";
      htmlElement.style.visibility = "visible";
      htmlElement.style.display = "block";
      htmlElement.style.zIndex = "1000";
      htmlElement.style.pointerEvents = "none";

      const imgElement = htmlElement.querySelector("img") as HTMLImageElement;
      if (imgElement) {
        imgElement.style.opacity = "1";
        imgElement.style.visibility = "visible";
        imgElement.style.display = "block";
        imgElement.style.maxWidth = "none";
        imgElement.style.maxHeight = "none";
        imgElement.style.width = "100%";
        imgElement.style.height = "100%";
        imgElement.style.objectFit = "contain";
        imgElement.style.imageRendering = "high-quality";
        imgElement.loading = "eager";
        imgElement.decoding = "sync";
      }
    });
  };

  const captureView = async (): Promise<string> => {
    const container = containerRef.current;
    if (!container) throw new Error("Container not found");

    // التأكد من تحميل الخطوط
    if (!fontPreloader.isFontLoaded("Tajawal")) {
      await fontPreloader.preloadAllFonts();
    }

    const jacketViewer = container.querySelector(
      ".jacket-viewer-mobile"
    ) as HTMLElement;

    // إعداد الحاوية الرئيسية
    if (container) {
      container.style.position = "relative";
      container.style.top = "0";
      container.style.left = "0";
      container.style.opacity = "1";
      container.style.zIndex = "1000";
      container.style.visibility = "visible";
      container.style.transform = "none";
      container.style.fontFamily = "'Tajawal', 'Arial', sans-serif";
      container.style.overflow = "visible";
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
      jacketViewer.style.overflow = "visible";
    }

    // فرض ظهور الشعارات
    forceLogoVisibility();

    // انتظار تحميل الشعارات
    await waitForLogosToLoad();

    // انتظار إضافي للتأكد من الاستقرار
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // فرض ظهور الشعارات مرة أخرى قبل التقاط الصورة مباشرة
    forceLogoVisibility();

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

    // انتظار تحميل جميع الخطوط
    await document.fonts.ready;

    try {
      const dataUrl = await htmlToImage.toPng(container, {
        quality: 1.0,
        pixelRatio: 3,
        width: 320,
        height: 410,
        backgroundColor: "#f9fafb",
        skipFonts: false,
        cacheBust: true,
        imagePlaceholder: undefined,
        includeQueryParams: true,
        fetchRequestInit: {
          mode: "cors",
        },
        style: {
          fontFamily:
            "'Tajawal', 'Katibeh', 'Amiri', 'Noto Naskh Arabic', 'Noto Kufi Arabic', 'Scheherazade New', 'Arial', sans-serif",
          fontSize: "14px",
          color: "#000000",
          fontWeight: "bold",
          textRendering: "optimizeLegibility",
          fontKerning: "normal",
          fontVariantLigatures: "normal",
        },
        filter: (node) => {
          // السماح بمرور جميع الشعارات
          if (
            node.classList &&
            (node.classList.contains("logo-overlay") ||
              node.classList.contains("logo-overlay-container"))
          ) {
            return true;
          }

          // تصفية عناصر التحكم فقط
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
      // إعادة تعيين الأنماط إلى الحالة الأولية
      if (container) {
        container.style.position = "absolute";
        container.style.top = "-9999px";
        container.style.left = "-9999px";
        container.style.opacity = "";
        container.style.zIndex = "-1";
        container.style.visibility = "";
        container.style.transform = "";
        container.style.fontFamily = "";
        container.style.overflow = "";
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
        jacketViewer.style.overflow = "";
      }
    }
  };

  useImperativeHandle(ref, () => ({
    captureAllViews: async () => {
      const views: JacketView[] = ["front", "back", "right", "left"];
      const images: string[] = [];

      setIsCapturing(true);

      for (const view of views) {
        try {
          setCurrentView(view);
          await new Promise((resolve) => setTimeout(resolve, 800));
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
        await new Promise((resolve) => setTimeout(resolve, 1000));

        for (const view of views) {
          try {
            setCurrentView(view);
            await new Promise((resolve) => setTimeout(resolve, 800));
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
