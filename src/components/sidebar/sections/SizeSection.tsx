import React from "react";
import { useJacket, JacketSize } from "../../../context/JacketContext";
import { Ruler } from "lucide-react";

const SizeSection: React.FC = () => {
  const { jacketState, setSize } = useJacket();

  const availableSizes: {
    id: JacketSize;
    name: string;
    description: string;
  }[] = [
    { id: "XS", name: "XS", description: "مقاس XS" },
    { id: "S", name: "S", description: "مقاس S" },
    { id: "M", name: "M", description: "مقاس M" },
    { id: "L", name: "L", description: "مقاس L" },
    { id: "XL", name: "XL", description: "مقاس XL" },
    { id: "2XL", name: "2XL", description: "مقاس 2XL" },
    { id: "3XL", name: "3XL", description: "مقاس 3XL" },
    { id: "4XL", name: "4XL", description: "مقاس 4XL" },
  ];

  return (
    <div className="space-y-4 p-4 bg-white rounded-xl shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Ruler className="w-5 h-5 text-[#563660]" />
        <h3 className="text-lg font-semibold text-[#563660]">اختيار المقاس</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {availableSizes.map((size) => (
          <button
            key={size.id}
            onClick={() => setSize(size.id)}
            className={`flex flex-col items-center py-3 px-4 rounded-xl transition-all ${
              jacketState.size === size.id
                ? "bg-gradient-to-r from-[#563660] to-[#7e4a8c] text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span className="text-lg font-medium">{size.name}</span>
            <span className="text-xs opacity-80">{size.description}</span>
          </button>
        ))}
      </div>

      <div className="p-3 bg-purple-50 rounded-lg text-xs text-purple-700 border border-purple-200">
        <p>
          * المقاس المحدد: <strong>{jacketState.size}</strong>
        </p>
        <p>* يمكن تعديل المقاس حسب الطلب</p>
      </div>
    </div>
  );
};

export default SizeSection;
