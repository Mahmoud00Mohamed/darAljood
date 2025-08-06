import { useRef, useImperativeHandle, forwardRef } from "react";
import {
  useJacket,
  JacketView,
  JacketState,
} from "../../context/JacketContext";
import * as htmlToImage from "html-to-image";
import JacketViewer from "./JacketViewer";

export interface JacketImageCaptureRef {
  captureAllViews: () => Promise<string[]>;
  captureFromConfig: (config: JacketState) => Promise<string[]>;
}

interface JacketImageCaptureProps {
  className?: string;
}

// تحميل الخطوط مسبقاً
const preloadFonts = async (): Promise<void> => {
  const fonts = [
    {
      family: "Katibeh",
      url: "https://fonts.googleapis.com/css2?family=Katibeh&display=swap",
    },
    {
      family: "Amiri",
      url: "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap",
    },
    {
      family: "Noto Naskh Arabic",
      url: "https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap",
    },
    {
      family: "Noto Kufi Arabic",
      url: "https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;700&display=swap",
    },
    {
      family: "Scheherazade New",
      url: "https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap",
    },
    {
      family: "Tajawal",
      url: "https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap",
    },
  ];

  const fontPromises = fonts.map((font) => {
    return new Promise<void>((resolve) => {
      const link = document.createElement("link");
      link.href = font.url;
      link.rel = "stylesheet";
      link.onload = () => {
        // التأكد من تحميل الخط
        document.fonts
          .load(`16px "${font.family}"`)
          .then(() => {
            resolve();
          })
          .catch(() => {
            console.warn(`Failed to load font: ${font.family}`);
            resolve();
          });
      };
      link.onerror = () => {
        console.warn(`Failed to load font stylesheet: ${font.family}`);
        resolve();
      };
      document.head.appendChild(link);
    });
  });

  await Promise.all(fontPromises);

  // انتظار إضافي للتأكد من تحميل جميع الخطوط
  await new Promise((resolve) => setTimeout(resolve, 1000));
};
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

  const captureView = async (): Promise<string> => {
    const container = containerRef.current;
    if (!container) throw new Error("Container not found");

    // تحميل الخطوط مسبقاً
    await preloadFonts();

    const jacketViewer = container.querySelector(
      ".jacket-viewer-mobile"
    ) as HTMLElement;

    // التأكد من أن الحاوية والعارض مرئيان ومنسقان بشكل صحيح
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

      // التأكد من تطبيق الخط الصحيح
      if (currentFont) {
        htmlElement.style.fontFamily = `${currentFont}, 'Tajawal', 'Arial', sans-serif`;
      } else {
        htmlElement.style.fontFamily = "'Tajawal', 'Arial', sans-serif";
      }

      // إضافة خصائص إضافية لضمان عرض الخط بشكل صحيح
      htmlElement.style.fontWeight = "bold";
      htmlElement.style.textRendering = "optimizeLegibility";
      htmlElement.style.fontKerning = "normal";
      htmlElement.style.fontVariantLigatures = "normal";
    });

    // انتظار تحميل جميع الخطوط
    await document.fonts.ready;

    // انتظار إضافي للتأكد من تطبيق الخطوط
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const dataUrl = await htmlToImage.toPng(container, {
        quality: 1.0,
        pixelRatio: 3,
        width: 320,
        height: 410,
        backgroundColor: "#f9fafb",
        skipFonts: false, // تغيير إلى false لتضمين الخطوط
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
          // تصفية العناصر غير المرغوب فيها
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

      // تحميل الخطوط مسبقاً قبل بدء التقاط الصور
      await preloadFonts();
      for (const view of views) {
        try {
          setCurrentView(view);
          await new Promise((resolve) => setTimeout(resolve, 800)); // زيادة وقت الانتظار
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

      // تحميل الخطوط مسبقاً
      await preloadFonts();
      try {
        restoreState(config);
        await new Promise((resolve) => setTimeout(resolve, 1500)); // زيادة وقت الانتظار

        for (const view of views) {
          try {
            setCurrentView(view);
            await new Promise((resolve) => setTimeout(resolve, 800)); // زيادة وقت الانتظار
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
