import React from "react";
import { useJacket } from "../../../../context/JacketContext";

const Lining: React.FC = () => {
  const { jacketState } = useJacket();
  const { colors } = jacketState;

  return (
    <path
      className="lining"
      style={{ fill: colors.body }}
      d="M200.7 7.9C185.1 -0.8 134.9 -0.8 119.3 7.9C119.3 7.9 114.4 13.2 119.3 23.1C124.3 32.9 160 62.5 160 62.5C160 62.5 195.7 32.9 200.7 23.1C205.6 13.2 200.7 7.9 200.7 7.9Z"
    />
  );
};

export default Lining;
