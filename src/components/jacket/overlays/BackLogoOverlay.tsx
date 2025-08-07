import React, { useEffect, useRef, useCallback } from "react";
import { Logo, JacketView } from "../../../context/JacketContext";

interface BackLogoOverlayProps {
  logo: Logo;
  view: JacketView;
}

const SVG_WIDTH = 320;
const SVG_HEIGHT = 396;

const positionMappings: Record<
  string,
  {
    x: number;
    y: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  }
> = {
  back_backCenter: {
    x: 160,
    y: 195,
    minX: 50,
    maxX: 270,
    minY: 30,
    maxY: 366,
  },
};

const BackLogoOverlay: React.FC<BackLogoOverlayProps> = ({ logo, view }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const shouldDisplay = useCallback(
    () => view === "back" && logo.position === "backCenter",
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
  };

  const xPos = basePosition.x;
  const yPos = Math.min(
    basePosition.y,
    Math.max(basePosition.minY, basePosition.y + logo.y)
  );
  const xPercent = (xPos / SVG_WIDTH) * 100;
  const yPercent = (yPos / SVG_HEIGHT) * 100;

  const baseSizePercent = 40;
  const sizePercent = baseSizePercent * logo.scale;

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        transform: "translate(-50%, -50%)",
        width: `${sizePercent}%`,
        height: `${sizePercent}%`,
        maxWidth: `${baseSizePercent * 1.5}%`,
        maxHeight: `${(baseSizePercent * 1.5 * SVG_HEIGHT) / SVG_WIDTH}%`,
        overflow: "visible",
        opacity: 1,
        visibility: "visible",
        display: "block",
        zIndex: 1000,
        pointerEvents: "none",
      }}
      className="logo-overlay"
    >
      <img
        ref={imgRef}
        src={logo.image}
        alt="شعار"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          overflow: "visible",
          opacity: 1,
          visibility: "visible",
          display: "block",
          imageRendering: "auto" as const,
        }}
        loading="eager"
        decoding="sync"
        onLoad={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.opacity = "1";
          target.style.visibility = "visible";
        }}
        onError={(e) => {
          console.error("Failed to load back logo image:", logo.image);
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
        }}
      />
    </div>
  );
};

export default BackLogoOverlay;
