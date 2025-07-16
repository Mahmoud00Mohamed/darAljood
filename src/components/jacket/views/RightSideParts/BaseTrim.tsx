import React from "react";
import { useJacket } from "../../../../context/JacketContext";

const BaseTrim: React.FC = () => {
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
        d="M137.8 354.4C135 356.5 130.8 358 124.4 359.7C98.0996 366.8 31.9996 361.5 14.4996 354.8C10.1996 353.2 7.19961 351.2 5.09961 348.8C5.09961 348.8 8.09961 361.3 7.79961 368.1C7.49961 378 5.39961 381.8 18.4996 386.2C31.6996 390.6 94.8996 390.8 115.3 387.9C135.6 385 137.9 378.3 137.8 354.4Z"
      />
      {colors.trim.includes("_stripes") && (
        <>
          <path
            className="trim-stripes"
            style={{ fill: "#F5F5F5" }}
            d="M8.19922 373.6C21.1992 377.2 46.4992 383.2 76.9992 383.2C95.1992 383.2 115.199 381 135.499 375.2C135.699 374 135.866 372.733 135.999 371.4C81.2992 387.9 28.0992 375.8 8.29922 370C8.29922 370.733 8.29922 371.433 8.29922 372.1C8.29922 372.633 8.26589 373.133 8.19922 373.6Z"
          />
          <path
            className="trim-stripes"
            style={{ fill: "#F5F5F5" }}
            d="M8 364.6C21.2 368.3 46.7 374.3 77.5 374.3C95.9 374.3 116.1 372.1 136.6 366.2C136.8 365 136.967 363.733 137.1 362.4C81.9 379.1 28.1 366.8 8.1 361C8.1 361.733 8.1 362.433 8.1 363.1C8.1 363.633 8.06667 364.133 8 364.6Z"
          />
        </>
      )}
    </>
  );
};

export default BaseTrim;
