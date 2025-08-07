import React, { useEffect, useRef, useCallback } from "react";
import { Logo, JacketView } from "../../../context/JacketContext";

interface LogoOverlayProps {
  logo: Logo;
  view: JacketView;
}

const SVG_WIDTH = 320;
const SVG_HEIGHT = 394;

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
  }
> = {
  front_chestRight: {
    x: 105,
    y: 120,
    minX: 90,
    maxX: 130,
    minY: 110,
    maxY: 110,
    minScale: 0.5,
    maxScale: 6,
    boxWidth: 70,
    boxHeight: 70,
  },
  front_chestLeft: {
    x: 210,
    y: 120,
    minX: 190,
    maxX: 230,
    minY: 110,
    maxY: 110,
    minScale: 0.5,
    maxScale: 6,
    boxWidth: 70,
    boxHeight: 70,
  },
};

const LogoOverlay: React.FC<LogoOverlayProps> = ({ logo, view }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const shouldDisplay = useCallback(
    () =>
      view === "front" && ["chestRight", "chestLeft"].includes(logo.position),
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
    x: 0,
    y: 0,
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
    minScale: 0.5,
    maxScale: 6,
    boxWidth: 70,
    boxHeight: 70,
  };

  const xPos = basePosition.x;
  const yPos = basePosition.y;
  const scale = Math.max(
    basePosition.minScale,
    Math.min(basePosition.maxScale, logo.scale)
  );

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
          console.error("Failed to load logo image:", logo.image);
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
        }}
      />
    </div>
  );
};

export default LogoOverlay;
