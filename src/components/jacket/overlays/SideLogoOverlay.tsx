import React, { useEffect, useRef, useCallback } from "react";
import { Logo, JacketView } from "../../../context/JacketContext";

interface SideLogoOverlayProps {
  logo: Logo;
  view: JacketView;
}

const SVG_WIDTH = 144;
const SVG_HEIGHT = 410;

const positionMappings: Record<
  string,
  {
    x: number;
    y: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minScale: number;
    maxScale: number;
    boxWidth: number;
    boxHeight: number;
    rotation: number;
  }
> = {
  right_rightSide_top: {
    x: 72.5,
    y: 145,
    minX: 60,
    maxX: 84,
    minY: 135,
    maxY: 155,
    minScale: 0.9,
    maxScale: 6,
    boxWidth: 30,
    boxHeight: 70,
    rotation: 0,
  },
  right_rightSide_middle: {
    x: 64.44,
    y: 240,
    minX: 55,
    maxX: 75,
    minY: 220,
    maxY: 240,
    minScale: 0.9,
    maxScale: 6,
    boxWidth: 27,
    boxHeight: 70,
    rotation: 0,
  },
  right_rightSide_bottom: {
    x: 67,
    y: 333,
    minX: 57.3,
    maxX: 77.3,
    minY: 320,
    maxY: 340,
    minScale: 0.9,
    maxScale: 6,
    boxWidth: 23,
    boxHeight: 70,
    rotation: -7.9,
  },
  left_leftSide_top: {
    x: 71.5,
    y: 145,
    minX: 60,
    maxX: 84,
    minY: 135,
    maxY: 155,
    minScale: 0.9,
    maxScale: 6,
    boxWidth: 30,
    boxHeight: 70,
    rotation: 0,
  },
  left_leftSide_middle: {
    x: 79.44,
    y: 240,
    minX: 69,
    maxX: 89,
    minY: 220,
    maxY: 240,
    minScale: 0.9,
    maxScale: 6,
    boxWidth: 27,
    boxHeight: 70,
    rotation: 0,
  },
  left_leftSide_bottom: {
    x: 77,
    y: 333,
    minX: 66.5,
    maxX: 86.5,
    minY: 320,
    maxY: 340,
    minScale: 0.9,
    maxScale: 6,
    boxWidth: 23,
    boxHeight: 70,
    rotation: 7.9,
  },
};

const SideLogoOverlay: React.FC<SideLogoOverlayProps> = ({ logo, view }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const shouldDisplay = useCallback(
    () =>
      (view === "right" && logo.position.startsWith("rightSide")) ||
      (view === "left" && logo.position.startsWith("leftSide")),
    [view, logo.position]
  );

  useEffect(() => {
    if (
      imgRef.current &&
      containerRef.current &&
      shouldDisplay() &&
      logo.image
    ) {
      const img = imgRef.current;
      const container = containerRef.current;

      // فرض الخصائص المطلوبة للعرض الصحيح
      img.style.opacity = "1";
      img.style.visibility = "visible";
      img.style.display = "block";
      img.style.pointerEvents = "none";
      img.loading = "eager";
      img.decoding = "sync";

      container.style.opacity = "1";
      container.style.visibility = "visible";
      container.style.display = "block";
      container.style.pointerEvents = "none";
      container.style.zIndex = "1000";

      // التأكد من أن الصورة محملة
      if (!img.complete) {
        img.onload = () => {
          img.style.opacity = "1";
          img.style.visibility = "visible";
        };
      }
    }
  }, [logo.image, shouldDisplay, view, logo.position]);

  if (!shouldDisplay() || !logo.image) {
    return null;
  }

  const basePosition = positionMappings[`${view}_${logo.position}`] || {
    x: 72,
    y: 205,
    minX: 60,
    maxX: 84,
    minY: 195,
    maxY: 215,
    minScale: 0.5,
    maxScale: 6,
    boxWidth: 50,
    boxHeight: 25,
    rotation: 0,
  };

  const xPos = basePosition.x;
  const yPos = basePosition.y;
  const scale = Math.max(
    basePosition.minScale,
    Math.min(basePosition.maxScale, logo.scale)
  );
  const rotation =
    logo.rotation !== undefined ? logo.rotation : basePosition.rotation;

  const boxWidthPercent = (basePosition.boxWidth / SVG_WIDTH) * 100;
  const boxHeightPercent = (basePosition.boxHeight / SVG_HEIGHT) * 100;
  const xPercent = ((xPos - basePosition.boxWidth / 2) / SVG_WIDTH) * 100;
  const yPercent = ((yPos - basePosition.boxHeight / 2) / SVG_HEIGHT) * 100;

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        width: `${boxWidthPercent}%`,
        height: `${boxHeightPercent}%`,
        overflow: "hidden",
        border: "1px dashed #000000",
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center",
        opacity: 1,
        visibility: "visible",
        display: "block",
        zIndex: 1000,
        pointerEvents: "none",
      }}
      className="logo-overlay-container"
    >
      <img
        ref={imgRef}
        src={logo.image}
        alt="شعار"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          transform: `scale(${scale})`,
          transformOrigin: "center",
          opacity: 1,
          visibility: "visible",
          display: "block",
          imageRendering: "auto" as const,
        }}
        className="logo-overlay"
        loading="eager"
        decoding="sync"
        onLoad={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.opacity = "1";
          target.style.visibility = "visible";
        }}
        onError={(e) => {
          console.error("Failed to load side logo image:", logo.image);
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
        }}
      />
    </div>
  );
};

export default SideLogoOverlay;
