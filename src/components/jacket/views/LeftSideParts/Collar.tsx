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
        d="M83.0004 30.4C96.1004 38.9 110.2 50.5 120.1 70C119.1 61.2 117.5 45.9 117 39.9C116.3 31.1 110 17.8 92.1004 8.29998C74.2004 -1.20001 54.2004 0.899989 52.4004 4.39999C50.7004 7.89999 48.9004 25.8 48.9004 25.8C48.9004 25.8 63.3004 17.8 83.0004 30.4Z"
      />
      {colors.trim.includes("_stripes") && (
        <>
          <path
            className="trim-stripes"
            style={{ fill: "#F5F5F5" }}
            d="M118.1 55.7997C117.8 52.8997 117.5 50.1997 117.3 47.7997C93.2 12.0997 63.5 13.5997 50.5 16.2997C50.3 17.5664 50.1333 18.7997 50 19.9997C54.9 18.7997 63.3 17.4997 73.2 19.4997C90.8 22.9997 106.1 35.3997 118.1 55.7997Z"
          />
          <path
            className="trim-stripes"
            style={{ fill: "#F5F5F5" }}
            d="M117 43.8005C116.7 41.0005 116.3 38.5005 116 36.2005C92.0996 2.90047 63.7996 5.10047 51.4996 8.10047C51.3663 9.3328 51.2329 10.5994 51.0996 11.8005C55.7996 10.4005 63.6996 8.90047 73.0996 10.6005C90.0996 13.4005 105 24.9005 117 43.8005Z"
          />
        </>
      )}
    </>
  );
};

export default Collar;
