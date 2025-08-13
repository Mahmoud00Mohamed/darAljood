import React from "react";
import { useJacket } from "../../../context/JacketContext";
import SideLogoOverlay from "../overlays/SideLogoOverlay";
import Body from "./LeftSideParts/Body";
import Sleeves from "./LeftSideParts/Sleeves";
import BaseTrim from "./LeftSideParts/BaseTrim";
import CuffTrim from "./LeftSideParts/CuffTrim";
import Buttons from "./LeftSideParts/Buttons";
import Collar from "./LeftSideParts/Collar";
import BaseStrokes from "./LeftSideParts/BaseStrokes";
import CuffStrokes from "./LeftSideParts/CuffStrokes";
import Patterns from "./LeftSideParts/Patterns";

const LeftSideView: React.FC = () => {
  const { jacketState } = useJacket();

  // فلترة الشعارات مع إزالة المكررات
  const leftSideLogos = jacketState.logos
    .filter((logo) =>
      ["leftSide_top", "leftSide_middle", "leftSide_bottom"].includes(
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

        <g
          clipPath="url(#clip0_4_107)"
          transform="translate(144, 0) scale(-1, 1)"
        >
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
        {leftSideLogos.map((logo) => (
          <SideLogoOverlay key={logo.id} logo={logo} view="left" />
        ))}
      </div>

      <Patterns />
    </div>
  );
};

export default LeftSideView;
