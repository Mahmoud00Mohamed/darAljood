import { useRef, useImperativeHandle, forwardRef } from "react";
import { useJacket, JacketView, JacketState } from "../context/JacketContext";
import domtoimage from "dom-to-image";
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

    // Ensure the container is visible during capture
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.zIndex = "1000";

    try {
      const dataUrl = await domtoimage.toPng(container, {
        quality: 0.8,
        bgcolor: "#f9fafb",
        width: 320,
        height: 410,
        filter: (node: Node) => {
          if (node instanceof Element) {
            return !(
              node.classList.contains("jacket-viewer-controls") ||
              node.classList.contains("mobile-control-buttons") ||
              node.classList.contains("desktop-control-buttons") ||
              node.classList.contains("desktop-view-buttons")
            );
          }
          return true;
        },
      });

      return dataUrl;
    } catch {
      throw new Error(`Error capturing ${view} view`);
    } finally {
      // Restore original styles
      container.style.position = "absolute";
      container.style.top = "-9999px";
      container.style.left = "-9999px";
      container.style.zIndex = "-1";
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
          await new Promise((resolve) => setTimeout(resolve, 500)); // Increased delay
          const imageData = await captureView(view);
          images.push(imageData);
        } catch {
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
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Increased delay

        for (const view of views) {
          try {
            setCurrentView(view);
            await new Promise((resolve) => setTimeout(resolve, 500)); // Increased delay
            const imageData = await captureView(view);
            images.push(imageData);
          } catch {
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
      }}
    >
      <JacketViewer isSidebarOpen={false} isCapturing={true} />
    </div>
  );
});

JacketImageCapture.displayName = "JacketImageCapture";

export default JacketImageCapture;
