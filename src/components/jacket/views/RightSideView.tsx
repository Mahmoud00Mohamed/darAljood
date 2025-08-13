import React from "react";
import { useJacket } from "../../../context/JacketContext";
import SideLogoOverlay from "../overlays/SideLogoOverlay";
import Body from "./RightSideParts/Body";
import Sleeves from "./RightSideParts/Sleeves";
import BaseTrim from "./RightSideParts/BaseTrim";
import CuffTrim from "./RightSideParts/CuffTrim";
import Buttons from "./RightSideParts/Buttons";
import Collar from "./RightSideParts/Collar";
import BaseStrokes from "./RightSideParts/BaseStrokes";
import CuffStrokes from "./RightSideParts/CuffStrokes";
import Patterns from "./RightSideParts/Patterns";

const RightSideView: React.FC = () => {
  const { jacketState } = useJacket();

  // فلترة الشعارات مع إزالة المكررات
  const rightSideLogos = jacketState.logos
    .filter((logo) =>
      ["rightSide_top", "rightSide_middle", "rightSide_bottom"].includes(
        logo.position
      )
    )
    .filter(
      (logo, index, self) => index === self.findIndex((l) => l.id === logo.id)
    );

  return (
    <div className="w-full h-full relative">
      <svg
        version="1.2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 144 410"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        className="transition-all duration-300"
      >
        <style>
          {`
            .stroke{fill:none;stroke:#020600;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}
          `}
        </style>

        <g clipPath="url(#clip0_4_107)">
          <g id="base-fills">
            <Collar />
            <Body />
            <BaseTrim />
          </g>
          <g id="base-strokes">
            <BaseStrokes />
          </g>
          <g id="arm-cuff-fills">
            <Sleeves />
            <Buttons />
            <CuffTrim />
          </g>
          <g id="arm-cuff-strokes">
            <CuffStrokes />
          </g>
        </g>

        <defs>
          <clipPath id="clip0_4_107">
            <rect width="144" height="410" fill="white" />
          </clipPath>
        </defs>
      </svg>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {rightSideLogos.map((logo) => (
          <SideLogoOverlay key={logo.id} logo={logo} view="right" />
        ))}
      </div>

      <Patterns />
    </div>
  );
};

export default RightSideView;
