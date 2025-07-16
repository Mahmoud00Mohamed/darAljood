import React from "react";
import { useJacket } from "../../../../context/JacketContext";

const Buttons: React.FC = () => {
  const { jacketState } = useJacket();
  const { colors } = jacketState;

  return (
    <path
      className="buttons"
      style={{ fill: colors.body }}
      d="M123.101 331.3C123.101 331.3 133.501 292.4 129.001 257.4L123.501 257.8C123.501 257.8 127.301 293 117.301 332.2L123.101 331.3Z"
    />
  );
};

export default Buttons;
