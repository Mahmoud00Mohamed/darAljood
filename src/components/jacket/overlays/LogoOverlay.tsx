import React from "react";
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
  const shouldDisplay = () =>
    view === "front" && ["chestRight", "chestLeft"].includes(logo.position);

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
  const xPercent = (xPos / SVG_WIDTH) * 100;
  const yPercent = (yPos / SVG_HEIGHT) * 100;

  return (
    <div
      style={{
        position: "absolute",
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        width: `${boxWidthPercent}%`,
        height: `${boxHeightPercent}%`,
        transform: "translate(-50%, -50%)",
        overflow: "hidden", // تغيير إلى hidden لقص الأطراف
        border: "1px dashed #000000",
      }}
      className="logo-overlay-container"
    >
      <img
        src={logo.image}
        alt="شعار"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          transform: `scale(${scale})`,
          transformOrigin: "center",
        }}
        className="logo-overlay"
        loading="eager"
        decoding="async"
      />
    </div>
  );
};

export default LogoOverlay;
