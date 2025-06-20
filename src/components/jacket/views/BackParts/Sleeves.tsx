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
        d="M3.3 184.2C-2.2 241.6 7 345.9 10.7 351.7C14.4 357.6 41.9 352.4 51.8 352.7C61.6 353 61 343.4 58.8 315C56.7 286.6 64.4 233 64.4 233C61.6 140.3 40.6 69.3 40.4 68.6C39.4 69.2 38.6 69.8 37.9 70.4C22.1 82.7 8.9 126.8 3.3 184.2Z"
      />
      <path
        className="sleeves"
        style={{ fill: colors.sleeves }}
        d="M316.7 184.2C322.2 241.6 313 345.9 309.3 351.7C305.6 357.6 278.1 352.4 268.3 352.7C258.4 353 259 343.4 261.2 315C263.3 286.6 255.6 233 255.6 233C258.4 140.3 279.4 69.3 279.6 68.6C280.6 69.2 281.4 69.8 282.1 70.4C297.9 82.7 311.1 126.8 316.7 184.2Z"
      />
    </>
  );
};

export default Sleeves;
