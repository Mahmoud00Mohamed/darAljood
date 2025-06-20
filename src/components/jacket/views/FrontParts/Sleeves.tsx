import React from "react";
import { useJacket } from "../../../../context/JacketContext";

const Sleeves: React.FC = () => {
  const { jacketState } = useJacket();
  const { colors } = jacketState;

  return (
    <>
      <path
        className="sleeves"
        style={{ fill: colors.sleeves }}
        d="M3.3 182.9C-2.2 240.3 7 344.6 10.7 350.4C14.4 356.3 41.9 351 51.7 351.3C61.6 351.7 61 342.1 58.8 313.7C56.7 285.3 64.4 231.6 64.4 231.6C61.6 139 40.6 68 40.4 67.2C39.4 67.8667 38.5667 68.4667 37.9 69C22.1 81.4 8.9 125.5 3.3 182.9Z"
      />
      <path
        className="sleeves"
        style={{ fill: colors.sleeves }}
        d="M316.7 182.9C322.2 240.3 313 344.6 309.3 350.4C305.6 356.3 278.1 351 268.2 351.3C258.4 351.7 259 342.1 261.2 313.7C263.3 285.3 255.6 231.6 255.6 231.6C258.4 139 279.4 68 279.6 67.2C280.6 67.8667 281.433 68.4667 282.1 69C297.9 81.4 311.1 125.5 316.7 182.9Z"
      />
    </>
  );
};

export default Sleeves;
