import { useRef, useImperativeHandle, forwardRef, useEffect } from "react";
import { useJacket, JacketView, JacketState } from "../context/JacketContext";
import * as htmlToImage from "html-to-image";
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

  // Ensure all images are loaded before capturing
  const ensureImagesLoaded = async (container: HTMLElement): Promise<void> => {
    const images = container.querySelectorAll("img");
    const loadPromises = Array.from(images).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Continue even if an image fails to load
          }
        })
    );
    await Promise.all(loadPromises);
  };

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

  const captureView = async (/* view: JacketView */): Promise<string> => {
    const container = containerRef.current;
    if (!container) throw new Error("Container not found");

    const jacketViewer = container.querySelector(
      ".jacket-viewer-mobile"
    ) as HTMLElement;

    // Ensure container and viewer are visible and properly styled
    if (container) {
      container.style.position = "relative";
      container.style.top = "0";
      container.style.left = "0";
      container.style.opacity = "1";
      container.style.zIndex = "1000";
      container.style.visibility = "visible";
      container.style.transform = "none";
      container.style.width = "320px";
      container.style.height = "410px";
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
    }

    // Wait for images to load
    await ensureImagesLoaded(container);

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
        filter: (node) =>
          !node.classList?.contains("jacket-viewer-controls") &&
          !node.classList?.contains("mobile-control-buttons") &&
          !node.classList?.contains("desktop-control-buttons") &&
          !node.classList?.contains("desktop-view-buttons"),
      });

      return dataUrl;
    } finally {
      // Reset styles to initial state
      if (container) {
        container.style.position = "absolute";
        container.style.top = "-9999px";
        container.style.left = "-9999px";
        container.style.opacity = "";
        container.style.zIndex = "-1";
        container.style.visibility = "";
        container.style.transform = "";
        container.style.width = "";
        container.style.height = "";
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
          // Wait longer for rendering on mobile
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const imageData = await captureView();
          if (imageData && imageData.startsWith("data:image/png;base64,")) {
            images.push(imageData);
          } else {
            console.warn(`Invalid image data for ${view} view`);
            images.push("");
          }
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
        await new Promise((resolve) => setTimeout(resolve, 1500));

        for (const view of views) {
          try {
            setCurrentView(view);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const imageData = await captureView();
            if (imageData && imageData.startsWith("data:image/png;base64,")) {
              images.push(imageData);
            } else {
              console.warn(`Invalid image data for ${view} view`);
              images.push("");
            }
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

  // Ensure container is re-rendered on mount
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.style.display = "none";
      setTimeout(() => {
        container.style.display = "flex";
      }, 0);
    }
  }, []);

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
