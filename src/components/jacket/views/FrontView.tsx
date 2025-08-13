import React from "react";
import { useJacket } from "../../../context/JacketContext";
import LogoOverlay from "../overlays/LogoOverlay";
import TextOverlay from "../overlays/TextOverlay";
import Body from "./FrontParts/Body";
import Sleeves from "./FrontParts/Sleeves";
import Trim from "./FrontParts/Trim";
import Buttons from "./FrontParts/Buttons";
import Collar from "./FrontParts/Collar";
import Lining from "./FrontParts/Lining";
import Strokes from "./FrontParts/Strokes";
import Patterns from "./FrontParts/Patterns";

const FrontView: React.FC = () => {
  const { jacketState } = useJacket();
  const { colors } = jacketState;

  // فلترة الشعارات مع إزالة المكررات
  const frontLogos = jacketState.logos
    .filter((logo) => ["chestRight", "chestLeft"].includes(logo.position))
    .filter(
      (logo, index, self) => index === self.findIndex((l) => l.id === logo.id)
    );

  // فلترة النصوص مع إزالة المكررات
  const frontTexts = jacketState.texts
    .filter((text) => ["chestRight", "chestLeft"].includes(text.position))
    .filter(
      (text, index, self) => index === self.findIndex((t) => t.id === text.id)
    );

  const collarColor = colors.trim.includes("_stripes")
    ? colors.trim.split("_")[0]
    : colors.trim;

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "320 / 394",
          maxWidth: "400px",
        }}
      >
        <svg
          version="1.2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 320 394"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          className="transition-all duration-300"
        >
          <style>
            {`
            .body{fill:${colors.body};stroke:none}
            .sleeves{fill:${colors.sleeves};stroke:none}
            .trim-base{fill:${
              colors.trim.includes("_stripes")
                ? colors.trim.split("_")[0]
                : colors.trim
            };stroke:none}
            .trim-stripes{fill:#F5F5F5;stroke:none}
            .buttons{fill:#020600;stroke:none}
            .lining{fill:${colors.body};stroke:none}
            .stroke{fill:none;stroke:#020600;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}
            .collar{fill:${collarColor};stroke:none}
          `}
          </style>

          <g id="fills">
            <Trim />
            <Body />
            <Sleeves />
            <Buttons />
            <Collar />
            <Lining />
          </g>
          <g id="strokes">
            <Strokes />
          </g>
        </svg>

        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {frontLogos.map((logo) => (
            <LogoOverlay key={logo.id} logo={logo} view="front" />
          ))}
          {frontTexts.map((text) => (
            <TextOverlay key={text.id} text={text} view="front" />
          ))}
        </div>
      </div>

      <Patterns />
    </div>
  );
};

export default FrontView;
