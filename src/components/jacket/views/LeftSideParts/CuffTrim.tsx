import React from "react";
import { useJacket } from "../../../../context/JacketContext";

const CuffTrim: React.FC = () => {
  const { jacketState } = useJacket();
  const { colors } = jacketState;
  const trimColor = colors.trim.includes("_stripes")
    ? colors.trim.split("_")[0]
    : colors.trim;

  return (
    <>
      <path
        className="trim-base"
        style={{ fill: trimColor }}
        d="M76.9992 373.3C64.5992 374.6 51.8992 376.1 44.1992 374.4C45.0992 384.7 46.6992 402.5 48.2992 406.4C50.5992 412.3 96.0992 404.2 98.0992 401.1C99.4992 398.8 94.2992 377 91.8992 366.6C89.8992 369.9 85.5992 372.4 76.9992 373.3Z"
      />
      {colors.trim.includes("_stripes") && (
        <>
          <path
            className="trim-stripes"
            style={{ fill: "#F5F5F5" }}
            d="M95.6008 387C76.0008 394.4 57.5008 395.6 46.8008 395.5C46.9341 396.7 47.0674 397.833 47.2008 398.9C47.6008 398.9 48.0008 398.9 48.4008 398.9C59.6008 398.9 77.3008 397.5 96.3008 390.4C96.1008 389.267 95.8674 388.133 95.6008 387Z"
          />
          <path
            className="trim-stripes"
            style={{ fill: "#F5F5F5" }}
            d="M94.2 377C74.8 384.4 56.6 385.6 46 385.4C46.1333 386.6 46.2667 387.767 46.4 388.9C46.8 388.9 47.1667 388.9 47.5 388.9C58.6 388.9 76.2 387.5 94.8 380.5C94.6 379.3 94.4 378.133 94.2 377Z"
          />
        </>
      )}
    </>
  );
};

export default CuffTrim;
