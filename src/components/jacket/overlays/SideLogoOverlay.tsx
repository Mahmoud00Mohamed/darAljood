import React from "react";
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
  const shouldDisplay =
    (view === "right" && logo.position.startsWith("rightSide")) ||
    (view === "left" && logo.position.startsWith("leftSide"));

  if (!shouldDisplay || !logo.image) {
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
      style={{
        position: "absolute",
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        width: `${boxWidthPercent}%`,
        height: `${boxHeightPercent}%`,
        overflow: "visible",
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center",
        willChange: "transform, width, height",
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
          willChange: "transform",
        }}
        className="logo-overlay"
        loading="eager"
        decoding="sync"
      />
    </div>
  );
};

export default SideLogoOverlay;
