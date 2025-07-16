import React, { useState } from "react";
import {
  useJacket,
  JacketPart,
  JacketMaterial,
} from "../../../context/JacketContext";
import {
  ChevronDown,
  ChevronUp,
  Feather,
  LucideIcon,
  Shirt,
} from "lucide-react";

const MaterialSection: React.FC = () => {
  const { jacketState, setMaterial } = useJacket();
  const [activePart, setActivePart] = useState<JacketPart | null>(null);

  const availableMaterials: {
    id: JacketMaterial;
    name: string;
    icon: LucideIcon;
  }[] = [
    { id: "leather", name: "جلد", icon: Feather },
    { id: "cotton", name: "قطن", icon: Shirt },
  ];

  const jacketParts: { id: JacketPart; name: string }[] = [
    { id: "body", name: "الجسم" },
    { id: "sleeves", name: "الأكمام" },
  ];

  const handleSelectAll = (material: JacketMaterial) => {
    jacketParts.forEach((part) => setMaterial(part.id, material));
  };

  const togglePart = (partId: JacketPart) => {
    setActivePart(activePart === partId ? null : partId);
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-xl shadow-md">
      <h3 className="text-lg font-semibold text-[#563660] mb-4">
        تخصيص الخامات
      </h3>

      <div className="bg-gray-50 p-3 rounded-lg mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">تحديد الكل</h4>
        <div className="grid grid-cols-2 gap-2">
          {availableMaterials.map((material) => {
            const Icon = material.icon;
            return (
              <button
                key={`all-${material.id}`}
                onClick={() => handleSelectAll(material.id)}
                className="flex flex-col items-center py-2 px-1 text-sm rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-all"
              >
                <Icon size={20} className="mb-1 text-gray-600" />
                <span>{material.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {jacketParts.map((part) => (
        <div key={part.id} className="bg-gray-50 rounded-lg overflow-hidden">
          <button
            onClick={() => togglePart(part.id)}
            className="w-full flex justify-between items-center p-3 text-sm font-medium text-gray-800 hover:bg-gray-100 transition-all"
          >
            <div className="flex items-center gap-2">
              <span>{part.name}</span>
              <span className="text-xs bg-[#563660] text-white px-2 py-1 rounded-full">
                {
                  availableMaterials.find(
                    (m) => m.id === jacketState.materials[part.id]
                  )?.name
                }
              </span>
            </div>
            {activePart === part.id ? (
              <ChevronUp size={18} className="text-gray-500" />
            ) : (
              <ChevronDown size={18} className="text-gray-500" />
            )}
          </button>
          {activePart === part.id && (
            <div className="grid grid-cols-2 gap-2 p-3 border-t border-gray-200">
              {availableMaterials.map((material) => {
                const Icon = material.icon;
                return (
                  <button
                    key={`${part.id}-${material.id}`}
                    onClick={() => setMaterial(part.id, material.id)}
                    className={`flex flex-col items-center py-2 px-1 text-sm rounded-lg transition-all ${
                      jacketState.materials[part.id] === material.id
                        ? "bg-[#563660] text-white"
                        : "bg-white border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={20} className="mb-1 text-gray-600" />
                    <span>{material.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}

      <div className="p-3 bg-purple-50 rounded-lg text-xs text-purple-700 border border-purple-200">
        <p>* الأكثر طلبًا: الجسم قطن، الأكمام جلد </p>
      </div>
    </div>
  );
};

export default MaterialSection;
