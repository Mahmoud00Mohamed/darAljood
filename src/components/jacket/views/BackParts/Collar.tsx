import React from "react";
import { useJacket } from "../../../../context/JacketContext";

const Collar: React.FC = () => {
  const { jacketState } = useJacket();
  const { colors } = jacketState;
  const collarColor = colors.trim.includes("_stripes")
    ? colors.trim.split("_")[0]
    : colors.trim;

  return (
    <>
      <path
        className="collar"
        style={{ fill: collarColor }}
        d="M208.7 18.2C205.3 7.7 208 1.5 160 1.5C112 1.5 114.7 7.7 111.3 18.2C106 34.5 100 39 100 39C100 39 148.2 15.9 220 39C220 39 214.1 34.5 208.7 18.2Z"
      />
      {colors.trim.includes("_stripes") && (
        <>
          <path
            className="trim-stripes"
            style={{ fill: "#F5F5F5" }}
            d="M207.2 16.6C169.2 1.5 132 8.8 112.6 14.8C112.1 16.3 111.5 17.6 111 18.7C129.6 12.7 169.1 3.9 209 21C208.4 19.6 207.8 18.1 207.2 16.6Z"
          />
          <path
            className="trim-stripes"
            style={{ fill: "#F5F5F5" }}
            d="M212 26.6C170.4 10.2 129.9 18 108.6 24.6C108.1 26.1 107.5 27.6 107 29C127.3 22.3 170.4 12.7 214 31.3C213.3 29.9 212.7 28.3 212 26.6Z"
          />
        </>
      )}
    </>
  );
};

export default Collar;
