import React from "react";
import { CustomText, JacketView } from "../../../context/JacketContext";

interface BackBottomTextOverlayProps {
  text: CustomText;
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
    minScale: number;
    maxScale: number;
    maxWidth: number;
  }
> = {
  back_backBottom: {
    x: 160,
    y: 310,
    minX: 120,
    maxX: 200,
    minY: 270,
    maxY: 340,
    minScale: 0.3,
    maxScale: 1.5,
    maxWidth: 280, // تحديد الحد الأقصى للعرض لمنع التجاوز
  },
};

const BackBottomTextOverlay: React.FC<BackBottomTextOverlayProps> = ({
  text,
  view,
}) => {
  const shouldDisplay = () => view === "back" && text.position === "backBottom";

  if (!shouldDisplay() || !text.content) {
    return null;
  }

  const basePosition = positionMappings[`${view}_${text.position}`] || {
    x: 0,
    y: 0,
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
    minScale: 0.3,
    maxScale: 1.5,
    maxWidth: 280,
  };

  const xPos = basePosition.x;
  const yPos = Math.max(
    basePosition.minY,
    Math.min(basePosition.maxY, basePosition.y + text.y)
  );
  const scale = Math.max(
    basePosition.minScale,
    Math.min(basePosition.maxScale, text.scale)
  );

  const fontSize = (6 * scale * 3) / 16;
  const xPercent = (xPos / SVG_WIDTH) * 100;
  const yPercent = (yPos / SVG_HEIGHT) * 100;
  const maxWidthPercent = (basePosition.maxWidth / SVG_WIDTH) * 100;

  return (
    <div
      style={{
        position: "absolute",
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        fontFamily: text.font || "Katibeh",
        fontSize: `${fontSize}rem`,
        color: text.color || "#000000",
        textAlign: "center",
        transform: "translate(-50%, -50%)",
        direction: "rtl",
        whiteSpace: "normal", // تغيير إلى normal للسماح بكسر النص
        overflow: "visible",
        textOverflow: "clip",
        fontWeight: "bold",
        overflowWrap: "break-word", // كسر الكلمات عند الحاجة
        wordBreak: "break-word", // كسر الكلمات لمنع التجاوز
        maxWidth: `${maxWidthPercent}%`, // تحديد الحد الأقصى للعرض
        lineHeight: "1.2", // تحسين المسافة بين الأسطر
      }}
      className="text-overlay"
    >
      {text.content}
    </div>
  );
};

export default BackBottomTextOverlay;
