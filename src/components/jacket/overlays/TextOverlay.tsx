import React from "react";
import { CustomText } from "../../../context/JacketContext";
import fontPreloader from "../../../utils/fontPreloader";

interface TextOverlayProps {
  text: CustomText;
  view: string;
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
  }
> = {
  front_chestRight: {
    x: 110,
    y: 110,
    minX: 90,
    maxX: 130,
    minY: 90,
    maxY: 130,
    minScale: 0.4,
    maxScale: 1.8,
  },
  front_chestLeft: {
    x: 210,
    y: 110,
    minX: 190,
    maxX: 230,
    minY: 90,
    maxY: 130,
    minScale: 0.4,
    maxScale: 1.8,
  },
};

// دالة للحصول على الخط مع fallbacks
const getFontFamily = (font?: string): string => {
  // التأكد من تحميل الخط المطلوب
  if (font && fontPreloader.isFontLoaded(font)) {
    const fontMap: { [key: string]: string } = {
      Katibeh: "'Katibeh', 'Tajawal', 'Arial', sans-serif",
      Amiri: "'Amiri', 'Tajawal', 'Arial', sans-serif",
      "Noto Naskh Arabic":
        "'Noto Naskh Arabic', 'Tajawal', 'Arial', sans-serif",
      "Noto Kufi Arabic": "'Noto Kufi Arabic', 'Tajawal', 'Arial', sans-serif",
      "Scheherazade New": "'Scheherazade New', 'Tajawal', 'Arial', sans-serif",
      Tajawal: "'Tajawal', 'Arial', sans-serif",
    };

    return fontMap[font] || "'Tajawal', 'Arial', sans-serif";
  }

  // fallback إذا لم يكن الخط محمل
  const fontMap: { [key: string]: string } = {
    Katibeh: "'Katibeh', 'Tajawal', 'Arial', sans-serif",
    Amiri: "'Amiri', 'Tajawal', 'Arial', sans-serif",
    "Noto Naskh Arabic": "'Noto Naskh Arabic', 'Tajawal', 'Arial', sans-serif",
    "Noto Kufi Arabic": "'Noto Kufi Arabic', 'Tajawal', 'Arial', sans-serif",
    "Scheherazade New": "'Scheherazade New', 'Tajawal', 'Arial', sans-serif",
    Tajawal: "'Tajawal', 'Arial', sans-serif",
  };

  return fontMap[font || "Katibeh"] || "'Tajawal', 'Arial', sans-serif";
};
const TextOverlay: React.FC<TextOverlayProps> = ({ text, view }) => {
  const shouldDisplay = () =>
    view === "front" && ["chestRight", "chestLeft"].includes(text.position);

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
    minScale: 0.4,
    maxScale: 1.8,
  };

  const characters = text.isConnected ? [text.content] : text.content.split("");

  return (
    <>
      {characters.map((char, index) => {
        const charStyle = text.charStyles?.[text.isConnected ? 0 : index] || {};
        const xOffset = text.isConnected
          ? 0
          : index === 0
          ? -0.0234375 * SVG_WIDTH
          : 0.0234375 * SVG_WIDTH;
        const xPos = Math.max(
          basePosition.minX,
          Math.min(
            basePosition.maxX,
            basePosition.x + (charStyle.x || 0) + xOffset
          )
        );
        const yPos = Math.max(
          basePosition.minY,
          Math.min(basePosition.maxY, basePosition.y + (charStyle.y || 0))
        );
        const scale = Math.max(
          basePosition.minScale,
          Math.min(basePosition.maxScale, charStyle.scale || text.scale || 1)
        );
        const fontSize = (12 * scale * 3) / 16;

        // الحصول على الخط مع fallbacks
        const fontFamily = getFontFamily(charStyle.font || text.font);
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${(xPos / SVG_WIDTH) * 100}%`,
              top: `${(yPos / SVG_HEIGHT) * 100}%`,
              fontFamily: fontFamily,
              fontSize: `${fontSize}rem`,
              color: charStyle.color || text.color || "#000000",
              textAlign: "center",
              transform: "translate(-50%, -50%)",
              direction: "rtl",
              whiteSpace: text.isConnected ? "nowrap" : "normal",
              overflow: "visible",
              textOverflow: "visible",
              fontWeight: "bold",
              textShadow: "0px 0px 0.1rem rgba(255,255,255,0.5)",
              display: "inline-block",
              letterSpacing: text.isConnected ? "normal" : "0",
              boxSizing: "border-box",
              fontKerning: "normal",
              textRendering: "optimizeLegibility",
              transformOrigin: "center",
              maxWidth: "none",
              minWidth: "max-content",
              fontVariantLigatures: "normal",
              fontFeatureSettings: "normal",
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
            }}
            className="text-overlay"
            data-font={charStyle.font || text.font || "Katibeh"}
          >
            {char}
          </div>
        );
      })}
    </>
  );
};

export default TextOverlay;
