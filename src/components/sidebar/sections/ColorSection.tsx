import React, { useState } from "react";
import { useJacket, JacketPart } from "../../../context/JacketContext";
import { ChevronDown, ChevronUp } from "lucide-react";

const ColorSection: React.FC = () => {
  const { jacketState, setColor } = useJacket();
  const [activePart, setActivePart] = useState<JacketPart | null>(null);

  const availableColors: {
    [key in JacketPart]?: { name: string; value: string; pattern: string }[];
  } = {
    body: [
      { name: "أسود", value: "#161618", pattern: "blackFabricPattern" },
      { name: "كحلي", value: "#1B263B", pattern: "navyWeavePattern" },
      { name: "عنابي", value: "#5C1A2B", pattern: "burgundyVelvetPattern" },
    ],
    sleeves: [
      { name: "أسود", value: "#161618", pattern: "blackFabricPattern" },
      { name: "كحلي", value: "#1B263B", pattern: "navyWeavePattern" },
      { name: "أبيض", value: "#F5F6F5", pattern: "whiteCottonPattern" },
      { name: "بيج", value: "#E7D7C1", pattern: "beigeLinenPattern" },
      { name: "رمادي غامق", value: "#4A4A4A", pattern: "grayWoolPattern" },
      { name: "عنابي", value: "#5C1A2B", pattern: "burgundyVelvetPattern" },
    ],
    trim: [
      { name: "أسود", value: "#161618", pattern: "blackFabricPattern" },
      { name: "كحلي", value: "#1B263B", pattern: "navyWeavePattern" },
      {
        name: "أسود مع خطين أبيض",
        value: "#161618_stripes",
        pattern: "blackWithWhiteStripes",
      },
      {
        name: "كحلي مع خطين أبيض",
        value: "#1B263B_stripes",
        pattern: "navyWithWhiteStripes",
      },
    ],
  };

  const jacketParts: { id: JacketPart; name: string }[] = [
    { id: "body", name: "الجسم" },
    { id: "sleeves", name: "الأكمام" },
    { id: "trim", name: "الياقة والأساور والحزام" },
  ];

  const togglePart = (partId: JacketPart) => {
    setActivePart(activePart === partId ? null : partId);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold text-gray-900 mb-3">
        اختيار الألوان
      </h3>
      {jacketParts.map((part) => (
        <div
          key={part.id}
          className="border border-gray-200 rounded-md overflow-hidden"
        >
          <button
            onClick={() => togglePart(part.id)}
            className="w-full flex justify-between items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center gap-2">
              <span>{part.name}</span>
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{
                  backgroundColor: jacketState.colors[part.id].includes(
                    "_stripes"
                  )
                    ? jacketState.colors[part.id].split("_")[0]
                    : jacketState.colors[part.id],
                }}
              />
            </div>
            {activePart === part.id ? (
              <ChevronUp size={16} className="text-gray-400" />
            ) : (
              <ChevronDown size={16} className="text-gray-400" />
            )}
          </button>
          {activePart === part.id && (
            <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 border-t border-gray-200">
              {availableColors[part.id]?.map((color) => (
                <button
                  key={`${part.id}-${color.value}`}
                  onClick={() => setColor(part.id, color.value)}
                  className={`flex flex-col items-center p-1 rounded-md transition-all ${
                    jacketState.colors[part.id] === color.value
                      ? "bg-gray-100 border-gray-400"
                      : "hover:bg-gray-100 border-gray-200"
                  } border`}
                >
                  <div
                    className="w-6 h-6 rounded-full mb-1"
                    style={{
                      backgroundColor: color.value.includes("_stripes")
                        ? color.value.split("_")[0]
                        : color.value,
                      border:
                        color.value === "#F5F6F5"
                          ? "1px solid #e5e5e5"
                          : "none",
                    }}
                  />
                  <span className="text-xs text-gray-600">{color.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ColorSection;
