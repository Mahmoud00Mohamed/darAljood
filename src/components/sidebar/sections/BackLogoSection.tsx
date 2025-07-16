import React, { useState } from "react";
import { useJacket, LogoPosition } from "../../../context/JacketContext";
import { Trash2, Move } from "lucide-react";

const BackLogoSection: React.FC = () => {
  const { jacketState, addLogo, updateLogo, removeLogo } = useJacket();
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>(null);

  const logoPositions: { id: LogoPosition; name: string }[] = [
    { id: "backCenter", name: "منتصف الظهر" },
  ];

  const availableLogos = [
    {
      id: "logo1",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924691/16_ubbdbh.png",
      name: "شعار 1",
    },
    {
      id: "logo2",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924689/15_l0llk1.png",
      name: "شعار 2",
    },
    {
      id: "logo3",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924688/14_htk85j.png",
      name: "شعار 3",
    },
    {
      id: "logo4",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924676/21_swow6t.png",
      name: "شعار 4",
    },
    {
      id: "logo5",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924675/22_c9rump.png",
      name: "شعار 5",
    },
    {
      id: "logo6",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924671/24_x6nvyt.png",
      name: "شعار 6",
    },
    {
      id: "logo7",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924669/20_guvnha.png",
      name: "شعار 7",
    },
    {
      id: "logo8",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924661/23_rroabu.png",
      name: "شعار 8",
    },
    {
      id: "logo9",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924658/18_cpbs4b.png",
      name: "شعار 9",
    },
    {
      id: "logo10",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924657/19_kxggs4.png",
      name: "شعار 10",
    },
    {
      id: "logo11",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924650/17_k8axov.png",
      name: "شعار 11",
    },
    {
      id: "logo12",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924644/12_woyybb.png",
      name: "شعار 12",
    },
    {
      id: "logo13",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924644/13_mvqmgk.png",
      name: "شعار 13",
    },
    {
      id: "logo14",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924636/11_revnd6.png",
      name: "شعار 14",
    },
    {
      id: "logo15",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924629/9_ysz5vg.png",
      name: "شعار 15",
    },
    {
      id: "logo16",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924627/7_ptxh2b.png",
      name: "شعار 16",
    },
    {
      id: "logo17",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924622/10_yhvn0o.png",
      name: "شعار 17",
    },
    {
      id: "logo18",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924621/2_vobopy.png",
      name: "شعار 18",
    },
    {
      id: "logo19",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924621/1_kqcgdh.png",
      name: "شعار 19",
    },
    {
      id: "logo20",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924621rew/8_yoay91.png",
      name: "شعار 20",
    },
    {
      id: "logo21",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924610/6_xfyebx.png",
      name: "شعار 21",
    },
    {
      id: "logo22",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924609/5_oupz1k.png",
      name: "شعار 22",
    },
    {
      id: "logo23",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924603/3_k7zsjo.png",
      name: "شعار 23",
    },
    {
      id: "logo24",
      url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924602/4_v07jhi.png",
      name: "شعار 24",
    },
  ];

  React.useEffect(() => {
    availableLogos.forEach((logo) => {
      const img = new Image();
      img.src = logo.url;
    });
  }, []);

  const isPositionOccupied = (pos: LogoPosition) => {
    return jacketState.logos.some((logo) => logo.position === pos);
  };

  const handleLogoSelect = (logoUrl: string, position: LogoPosition) => {
    if (!isPositionOccupied(position)) {
      const newLogo = {
        id: `logo-${Date.now()}`,
        image: logoUrl,
        position,
        x: 0,
        y: 0,
        scale: 1.5,
      };
      addLogo(newLogo);
      setSelectedLogoId(newLogo.id);
    }
  };

  const filteredLogos = jacketState.logos.filter((logo) =>
    ["backCenter"].includes(logo.position)
  );

  const selectedLogo = selectedLogoId
    ? jacketState.logos.find((logo) => logo.id === selectedLogoId)
    : filteredLogos.length > 0
    ? filteredLogos[0]
    : null;

  React.useEffect(() => {
    if (!selectedLogoId && filteredLogos.length > 0) {
      setSelectedLogoId(filteredLogos[0].id);
    } else if (
      selectedLogoId &&
      !filteredLogos.find((logo) => logo.id === selectedLogoId)
    ) {
      setSelectedLogoId(filteredLogos.length > 0 ? filteredLogos[0].id : null);
    }
  }, [filteredLogos, selectedLogoId]);

  return (
    <div className="space-y-6 overflow-x-hidden">
      <h3 className="text-lg font-medium text-gray-900 mb-4 truncate">
        إضافة الشعارات (خلفي)
      </h3>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 truncate">
            الشعارات الحالية
          </span>
        </div>

        <div className="space-y-2 max-h-40 overflow-y-auto">
          {filteredLogos.map((logo) => (
            <div
              key={logo.id}
              onClick={() => setSelectedLogoId(logo.id)}
              className={`flex items-center p-2 cursor-pointer rounded-full ${
                selectedLogoId === logo.id ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              {logo.image && (
                <img
                  src={logo.image}
                  alt="شعار"
                  className="w-10 h-10 mr-3 object-contain rounded-full flex-shrink-0"
                  loading="eager"
                  decoding="async"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">
                  {logoPositions.find((pos) => pos.id === logo.position)
                    ?.name || logo.position}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeLogo(logo.id);
                  if (selectedLogoId === logo.id) {
                    setSelectedLogoId(null);
                  }
                }}
                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {filteredLogos.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 mt-4">
            <p className="mt-2 text-sm text-gray-500 truncate">
              قم باختيار شعار لتخصيص الجاكيت
            </p>
            <p className="text-xs text-gray-400 truncate">
              الشعار الخلفي مشمول في السعر الأساسي
            </p>
            <div className="mt-3 grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
              {availableLogos.map((logo) => (
                <button
                  key={logo.id}
                  onClick={() => handleLogoSelect(logo.url, "backCenter")}
                  className={`w-full h-16 border transition-all rounded-full overflow-hidden ${
                    isPositionOccupied("backCenter")
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:border-[#d4af37] hover:shadow-md"
                  }`}
                  disabled={isPositionOccupied("backCenter")}
                  title={logo.name}
                >
                  <img
                    src={logo.url}
                    alt={logo.name}
                    className="w-full h-full object-contain"
                    loading="eager"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedLogo && (
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3 truncate">
            تخصيص الشعار
          </h4>

          <div className="mb-3">
            <div className="flex justify-between items-center mb-1 flex-wrap gap-2">
              <label className="text-xs text-gray-600">ضبط الموقع</label>
              <span className="text-xs text-gray-400 flex items-center">
                <Move size={12} className="ml-1" />
                اسحب للتعديل
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">رأسي</label>
                <input
                  type="range"
                  min="-30"
                  max="0"
                  value={selectedLogo.y}
                  onChange={(e) =>
                    updateLogo(selectedLogo.id, { y: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">الحجم</label>
            <input
              type="range"
              min="0.3"
              max="1.5"
              step="0.1"
              value={selectedLogo.scale}
              onChange={(e) =>
                updateLogo(selectedLogo.id, {
                  scale: parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
          </div>
        </div>
      )}

      <div className="p-3 bg-purple-50 rounded-lg text-xs text-purple-700 border border-purple-200">
        <p>* الشعار الخلفي مشمول في السعر الأساسي</p>
      </div>
    </div>
  );
};

export default BackLogoSection;
