import React from "react";
import { useJacket } from "../../../context/JacketContext";
import BackLogoOverlay from "../overlays/BackLogoOverlay";
import BackBottomTextOverlay from "../overlays/BackBottomTextOverlay";
import Body from "./BackParts/Body";
import Sleeves from "./BackParts/Sleeves";
import Trim from "./BackParts/Trim";
import Buttons from "./BackParts/Buttons";
import Collar from "./BackParts/Collar";
import Strokes from "./BackParts/Strokes";
import Patterns from "./BackParts/Patterns";

const BackView: React.FC = () => {
  const { jacketState } = useJacket();

  // فلترة الشعارات مع إزالة المكررات
  const backLogos = jacketState.logos
    .filter((logo) => logo.position === "backCenter")
    .filter(
      (logo, index, self) => index === self.findIndex((l) => l.id === logo.id)
    );

  // فلترة النصوص مع إزالة المكررات
  const backBottomTexts = jacketState.texts
    .filter((text) => text.position === "backBottom")
    .filter(
      (text, index, self) => index === self.findIndex((t) => t.id === text.id)
    );

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "320 / 396",
          maxWidth: "400px",
        }}
      >
        <svg
          version="1.2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 320 396"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          className="transition-all duration-300"
        >
          <style>
            {`
            .buttons{fill:#020600;stroke:none}
            .stroke{fill:none;stroke:#020600;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}
          `}
          </style>

          <g id="fills">
            <Collar />
            <Trim />
            <Body />
            <Sleeves />
            <Buttons />
          </g>
          <g id="strokes">
            <Strokes />
          </g>
        </svg>

        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {backLogos.map((logo) => (
            <BackLogoOverlay key={logo.id} logo={logo} view="back" />
          ))}
          {backBottomTexts.map((text) => (
            <BackBottomTextOverlay key={text.id} text={text} view="back" />
          ))}
        </div>
      </div>

      <Patterns />
    </div>
  );
};

export default BackView;
