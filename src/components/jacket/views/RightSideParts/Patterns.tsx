import React from "react";

const Patterns: React.FC = () => {
  return (
    <svg width="0" height="0">
      <defs>
        <pattern
          id="blackFabricPattern"
          patternUnits="userSpaceOnUse"
          width="10"
          height="10"
        >
          <path
            d="M0,0 L10,10 M10,0 L0,10"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="0.3"
          />
        </pattern>
        <pattern
          id="navyWeavePattern"
          patternUnits="userSpaceOnUse"
          width="8"
          height="8"
        >
          <path
            d="M0,4 H8 M4,0 V8"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.5"
          />
        </pattern>
        <pattern
          id="whiteCottonPattern"
          patternUnits="userSpaceOnUse"
          width="6"
          height="6"
        >
          <circle cx="3" cy="3" r="0.5" fill="rgba(0,0,0,0.05)" />
        </pattern>
        <pattern
          id="beigeLinenPattern"
          patternUnits="userSpaceOnUse"
          width="12"
          height="12"
        >
          <path
            d="M0,6 H12 M6,0 V12"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth="0.4"
          />
        </pattern>
        <pattern
          id="grayWoolPattern"
          patternUnits="userSpaceOnUse"
          width="10"
          height="10"
        >
          <circle cx="5" cy="5" r="1" fill="rgba(0,0,0,0.1)" />
          <path
            d="M2,2 L8,8"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="0.3"
          />
        </pattern>
        <pattern
          id="burgundyVelvetPattern"
          patternUnits="userSpaceOnUse"
          width="14"
          height="14"
        >
          <path
            d="M0,7 H14 M7,0 V14"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="0.5"
          />
          <circle cx="7" cy="7" r="0.8" fill="rgba(255,255,255,0.05)" />
        </pattern>
        <pattern
          id="blackWithWhiteStripes"
          patternUnits="userSpaceOnUse"
          width="10"
          height="10"
        >
          <rect x="0" y="0" width="10" height="10" fill="#1C2526" />
          <path d="M0,2 H10 M0,8 H10" stroke="#FFFFFF" strokeWidth="1" />
        </pattern>
        <pattern
          id="navyWithWhiteStripes"
          patternUnits="userSpaceOnUse"
          width="10"
          height="10"
        >
          <rect x="0" y="0" width="10" height="10" fill="#1B263B" />
          <path d="M0,2 H10 M0,8 H10" stroke="#FFFFFF" strokeWidth="1" />
        </pattern>
      </defs>
    </svg>
  );
};

export default Patterns;
