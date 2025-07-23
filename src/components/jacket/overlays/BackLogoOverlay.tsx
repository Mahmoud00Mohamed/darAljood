import React from "react";
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
  const shouldDisplay = () => view === "back" && logo.position === "backCenter";

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
        zIndex: 1100,
        isolation: "isolate",
      }}
      className="logo-overlay"
    >
      <img
        src={logo.image}
        alt="شعار"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          overflow: "visible",
        }}
        loading="eager"
        decoding="async"
      />
    </div>
  );
};

export default BackLogoOverlay;
