import { useRef, useImperativeHandle, forwardRef } from "react";
import { useJacket, JacketView, JacketState } from "../context/JacketContext";
import html2canvas from "html2canvas";
import JacketViewer from "./jacket/JacketViewer";

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

  const captureView = async (view: JacketView): Promise<string> => {
    const container = containerRef.current;
    if (!container) throw new Error("Container not found");

    const jacketViewer = container.querySelector(
      ".jacket-viewer-mobile"
    ) as HTMLElement;

    const textOverlays = container.querySelectorAll(
      ".text-overlay"
    ) as NodeListOf<HTMLElement>;

    const logoOverlays = container.querySelectorAll(
      ".logo-overlay-container"
    ) as NodeListOf<HTMLElement>;

    if (jacketViewer) {
      jacketViewer.style.transform = "scale(1.5)";
      jacketViewer.style.width = "480px";
      jacketViewer.style.height = "615px";
    }

    // تطبيق قص الأجزاء الخارجة عن حدود المستطيل في العروض الأمامية واليمنى واليسرى
    if (["front", "right", "left"].includes(view)) {
      logoOverlays.forEach((overlay) => {
        overlay.style.overflow = "hidden";
      });
    }

    // تطبيق الرفع المناسب للنصوص بناءً على العرض
    textOverlays.forEach((overlay) => {
      const offset = view === "front" ? "-15px" : "-12px";
      overlay.style.transform = `translate(-50%, -50%) translateY(${offset})`;
    });

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f9fafb",
        width: 480,
        height: 615,
        windowWidth: 480,
        windowHeight: 615,
        ignoreElements: (element) =>
          element.classList.contains("jacket-viewer-controls") ||
          element.classList.contains("mobile-control-buttons") ||
          element.classList.contains("desktop-control-buttons") ||
          element.classList.contains("desktop-view-buttons"),
      });

      return canvas.toDataURL("image/png", 0.8);
    } finally {
      textOverlays.forEach((overlay) => {
        overlay.style.transform = "translate(-50%, -50%)";
      });

      logoOverlays.forEach((overlay) => {
        overlay.style.overflow = "";
      });

      if (jacketViewer) {
        jacketViewer.style.transform = "";
        jacketViewer.style.width = "";
        jacketViewer.style.height = "";
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
          await new Promise((resolve) => setTimeout(resolve, 200));
          const imageData = await captureView(view);
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
        await new Promise((resolve) => setTimeout(resolve, 500));

        for (const view of views) {
          try {
            setCurrentView(view);
            await new Promise((resolve) => setTimeout(resolve, 200));
            const imageData = await captureView(view);
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
        width: "480px",
        height: "615px",
        overflow: "visible",
        zIndex: -1,
        backgroundColor: "#f9fafb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <JacketViewer isSidebarOpen={false} isCapturing={true} />
    </div>
  );
});

JacketImageCapture.displayName = "JacketImageCapture";

export default JacketImageCapture;
