import React from "react";
import { useJacket } from "../../../../context/JacketContext";

const Body: React.FC = () => {
  const { jacketState } = useJacket();
  const { colors } = jacketState;

  return (
    <path
      className="body"
      style={{ fill: colors.body }}
      d="M48.9 25.7997C48.9 25.7997 63.3 17.7997 83 30.3997C102.6 42.9997 124.4 62.6997 131.1 105.2C141.2 169.8 138.4 254.8 139.8 301.5C141.2 348.2 150.7 352.7 124.4 359.7C98.1 366.8 32 361.5 14.5 354.8C-3.09999 348.2 0.400013 335.5 5.40001 314.5C10.3 293.4 7.20001 262.1 4.10001 211.1C0.900013 160.2 9.20001 114.3 27.1 76.3997C43.6 41.4997 48.9 25.7997 48.9 25.7997Z"
    />
  );
};

export default Body;
