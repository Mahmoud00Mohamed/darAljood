import React from "react";
import { useJacket } from "../../../../context/JacketContext";

const Sleeves: React.FC = () => {
  const { jacketState } = useJacket();
  const { colors } = jacketState;

  return (
    <path
      className="sleeves"
      style={{ fill: colors.sleeves }}
      d="M20.5002 204.2C24.2002 169.2 28.9002 108.3 42.9002 82.4003C57.0002 56.4003 82.6002 51.1003 106.8 84.5003C131.1 117.8 123.7 160.8 101.2 211.1C78.7002 261.4 92.1002 346 93.1002 354.4C94.2002 362.9 94.7002 371.4 77.0002 373.3C59.3002 375.2 40.8002 377.5 37.7002 370C34.5002 362.6 13.8002 266 20.5002 204.2Z"
    />
  );
};

export default Sleeves;
