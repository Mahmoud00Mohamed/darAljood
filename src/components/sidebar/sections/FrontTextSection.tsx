import React, { useState, useEffect } from "react";
import {
  useJacket,
  TextPosition,
  CustomText,
} from "../../../context/JacketContext";
import { Type, Trash2, Move, Link2, Unlink, AlertCircle } from "lucide-react";
import { usePricing } from "../../../hooks/usePricing";

const FrontTextSection: React.FC = () => {
  const { jacketState, addText, updateText, removeText } = useJacket();
  const { pricingData } = usePricing();
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [position, setPosition] = useState<TextPosition>("chestRight");
  const [selectedCharIndex, setSelectedCharIndex] = useState<number | null>(
    null
  );

  const textPositions: { id: TextPosition; name: string }[] = [
    { id: "chestRight", name: "صدر يمين" },
    { id: "chestLeft", name: "صدر يسار" },
  ];

  const isPositionOccupied = (pos: TextPosition) => {
    return (
      jacketState.texts.some((text) => text.position === pos) ||
      jacketState.logos.some((logo) => logo.position === pos)
    );
  };

  // حساب عدد العناصر الأمامية الحالية
  const frontLogos = jacketState.logos.filter((logo) =>
    ["chestRight", "chestLeft"].includes(logo.position)
  ).length;

  const frontTexts = jacketState.texts.filter((text) =>
    ["chestRight", "chestLeft"].includes(text.position)
  ).length;

  const totalFrontItems = frontLogos + frontTexts;
  const isExtraItem =
    totalFrontItems >= (pricingData?.includedItems.frontItems || 1);

  useEffect(() => {
    const occupiedPositions = [
      ...jacketState.logos.map((logo) => logo.position),
      ...jacketState.texts.map((text) => text.position),
    ];
    if (
      occupiedPositions.includes("chestRight") &&
      !occupiedPositions.includes("chestLeft")
    ) {
      setPosition("chestLeft");
    } else if (!occupiedPositions.includes("chestRight")) {
      setPosition("chestRight");
    }
  }, [jacketState.logos, jacketState.texts]);

  const handleAddText = () => {
    if (
      content.trim() &&
      content.length === 2 &&
      !isPositionOccupied(position)
    ) {
      const newText: CustomText = {
        id: `text-${Date.now()}`,
        content,
        position,
        x: 0,
        y: 0,
        scale: 1,
        font: "Katibeh",
        color: "#000000",
        isConnected: true,
        charStyles: [
          { x: 0, y: 0, scale: 1 },
          { x: 0, y: 0, scale: 1 },
        ],
      };
      addText(newText);
      setContent("");
      setSelectedTextId(newText.id);
    }
  };

  const handleToggleConnection = (textId: string, isConnected: boolean) => {
    updateText(textId, { isConnected: !isConnected });
    if (!isConnected) {
      setSelectedCharIndex(null);
    }
  };

  const filteredTexts = jacketState.texts.filter((text) =>
    ["chestRight", "chestLeft"].includes(text.position)
  );

  const selectedText = selectedTextId
    ? jacketState.texts.find((text) => text.id === selectedTextId)
    : null;

  const handleCharStyleUpdate = (
    index: number,
    updates: Partial<CustomText>
  ) => {
    if (selectedText) {
      const updatedCharStyles = [...(selectedText.charStyles || [])];
      updatedCharStyles[index] = { ...updatedCharStyles[index], ...updates };
      updateText(selectedText.id, { charStyles: updatedCharStyles });
    }
  };

  const handleGlobalStyleUpdate = (updates: Partial<CustomText>) => {
    if (selectedText) {
      const updatedCharStyles = selectedText.charStyles?.map((style) => ({
        ...style,
        ...updates,
      }));
      updateText(selectedText.id, { charStyles: updatedCharStyles });
    }
  };

  const availableFonts = [
    { id: "Katibeh", name: "كاتبة" },
    { id: "Amiri", name: "أميري" },
    { id: "Noto Naskh Arabic", name: "نوتو نسخ عربي" },
    { id: "Noto Kufi Arabic", name: "نوتو كوفي عربي" },
    { id: "Scheherazade New", name: "شهرزاد جديد" },
  ];

  const availableColors = [
    { name: "أسود", value: "#000000" },
    { name: "أبيض", value: "#ffffff" },
    { name: "ذهبي", value: "#d4af37" },
    { name: "أحمر", value: "#c41e3a" },
  ];

  return (
    <div className="space-y-6">
      {/* تنبيه التكلفة الإضافية */}
      {isExtraItem && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-amber-800 font-medium">تكلفة إضافية</p>
              <p className="text-amber-700">
                إضافة شعار أو نص إضافي في الأمام سيكلف{" "}
                {pricingData?.additionalCosts.frontExtraItem || 25} ريال
              </p>
            </div>
          </div>
        </div>
      )}

      {filteredTexts.length < 2 && (
        <>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            إضافة النصوص (أمامي)
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              أدخل النص
            </label>
            <div className="flex">
              <input
                type="text"
                maxLength={2}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="أدخل حرفين فقط"
                className="flex-1 p-2 border border-gray-300 rounded-r-md text-sm"
                dir="rtl"
              />
              <button
                onClick={handleAddText}
                disabled={
                  !content.trim() ||
                  content.length !== 2 ||
                  isPositionOccupied(position)
                }
                className="px-4 py-2 bg-[#d4af37] text-white rounded-l-md disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                إضافة
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الموقع
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as TextPosition)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            >
              {textPositions.map((pos) => (
                <option
                  key={pos.id}
                  value={pos.id}
                  disabled={isPositionOccupied(pos.id)}
                >
                  {pos.name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          النصوص الحالية
        </h4>
        {filteredTexts.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
            <Type className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              قم بإضافة نص لتخصيص الجاكيت
            </p>
            <p className="text-xs text-gray-400">
              العنصر الأول في الأمام مشمول في السعر الأساسي
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {filteredTexts.map((text) => (
              <div
                key={text.id}
                onClick={() => setSelectedTextId(text.id)}
                className={`flex items-center p-2 rounded cursor-pointer ${
                  selectedTextId === text.id
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <div
                  className="w-10 h-10 flex items-center justify-center mr-3 text-sm"
                  style={{
                    fontFamily: text.font,
                    color: text.color,
                    backgroundColor:
                      text.color === "#ffffff" ? "#f0f0f0" : "transparent",
                    border:
                      text.color === "#ffffff" ? "1px solid #e5e5e5" : "none",
                  }}
                >
                  {text.content}
                </div>
                <div className="flex-1">
                  <p className="text-sm truncate max-w-[120px]">
                    {text.content}
                  </p>
                  <p className="text-xs text-gray-500">
                    {textPositions.find((pos) => pos.id === text.position)
                      ?.name || text.position}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeText(text.id);
                    if (selectedTextId === text.id) {
                      setSelectedTextId(null);
                    }
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedText && (
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">تخصيص النص</h4>

          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">النص</label>
            <input
              type="text"
              maxLength={2}
              value={selectedText.content}
              onChange={(e) =>
                updateText(selectedText.id, { content: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded text-sm"
              dir="rtl"
            />
          </div>

          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">
              ربط/فصل الحروف
            </label>
            <button
              onClick={() =>
                handleToggleConnection(
                  selectedText.id,
                  selectedText.isConnected
                )
              }
              className={`w-full flex items-center justify-center gap-2 p-2 rounded text-sm ${
                selectedText.isConnected
                  ? "bg-gray-100 text-gray-800"
                  : "bg-[#d4af37] text-white"
              }`}
            >
              {selectedText.isConnected ? (
                <>
                  <Unlink size={16} />
                  فصل الحروف
                </>
              ) : (
                <>
                  <Link2 size={16} />
                  ربط الحروف
                </>
              )}
            </button>
          </div>

          {!selectedText.isConnected && (
            <div className="mb-3">
              <label className="block text-xs text-gray-600 mb-1">
                اختيار الحرف
              </label>
              <div className="flex gap-2">
                {selectedText.content.split("").map((char, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedCharIndex(index)}
                    className={`w-10 h-10 rounded text-sm flex items-center justify-center ${
                      selectedCharIndex === index
                        ? "bg-[#d4af37] text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">الخط</label>
            <select
              value={
                selectedText.isConnected
                  ? selectedText.charStyles?.[0]?.font || selectedText.font
                  : selectedText.charStyles?.[selectedCharIndex ?? 0]?.font ||
                    selectedText.font
              }
              onChange={(e) =>
                selectedText.isConnected
                  ? handleGlobalStyleUpdate({ font: e.target.value })
                  : handleCharStyleUpdate(selectedCharIndex ?? 0, {
                      font: e.target.value,
                    })
              }
              className="w-full p-2 border border-gray-300 rounded text-sm"
            >
              {availableFonts.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">اللون</label>
            <div className="flex flex-wrap gap-2">
              {availableColors.map((colorOption) => (
                <button
                  key={colorOption.value}
                  onClick={() =>
                    selectedText.isConnected
                      ? handleGlobalStyleUpdate({ color: colorOption.value })
                      : handleCharStyleUpdate(selectedCharIndex ?? 0, {
                          color: colorOption.value,
                        })
                  }
                  className={`w-8 h-8 rounded-full transition-all transform ${
                    (selectedText.isConnected
                      ? selectedText.charStyles?.[0]?.color
                      : selectedText.charStyles?.[selectedCharIndex ?? 0]
                          ?.color) === colorOption.value
                      ? "ring-2 ring-offset-2 ring-[#d4af37] scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{
                    backgroundColor: colorOption.value,
                    border:
                      colorOption.value === "#ffffff"
                        ? "1px solid #e5e5e5"
                        : "none",
                  }}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-gray-600">ضبط الموقع</label>
              <span className="text-xs text-gray-400 flex items-center">
                <Move size={12} className="ml-1" />
                اسحب للتعديل
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">أفقي</label>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={
                    selectedText.isConnected
                      ? selectedText.charStyles?.[0]?.x || 0
                      : selectedText.charStyles?.[selectedCharIndex ?? 0]?.x ||
                        0
                  }
                  onChange={(e) =>
                    selectedText.isConnected
                      ? handleGlobalStyleUpdate({
                          x: parseInt(e.target.value),
                        })
                      : handleCharStyleUpdate(selectedCharIndex ?? 0, {
                          x: parseInt(e.target.value),
                        })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">رأسي</label>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={
                    selectedText.isConnected
                      ? selectedText.charStyles?.[0]?.y || 0
                      : selectedText.charStyles?.[selectedCharIndex ?? 0]?.y ||
                        0
                  }
                  onChange={(e) =>
                    selectedText.isConnected
                      ? handleGlobalStyleUpdate({
                          y: parseInt(e.target.value),
                        })
                      : handleCharStyleUpdate(selectedCharIndex ?? 0, {
                          y: parseInt(e.target.value),
                        })
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
              min="0.5"
              max="2"
              step="0.1"
              value={
                selectedText.isConnected
                  ? selectedText.charStyles?.[0]?.scale || 1
                  : selectedText.charStyles?.[selectedCharIndex ?? 0]?.scale ||
                    1
              }
              onChange={(e) =>
                selectedText.isConnected
                  ? handleGlobalStyleUpdate({
                      scale: parseFloat(e.target.value),
                    })
                  : handleCharStyleUpdate(selectedCharIndex ?? 0, {
                      scale: parseFloat(e.target.value),
                    })
              }
              className="w-full"
            />
          </div>
        </div>
      )}

      <div className="p-3 bg-purple-50 rounded-lg text-xs text-purple-700 border border-purple-200">
        <p>
          * العنصر الأول في الأمام مشمول في السعر الأساسي، يتم إضافة{" "}
          {pricingData?.additionalCosts.frontExtraItem || 25} ريال لكل عنصر
          إضافي
        </p>
      </div>
    </div>
  );
};

export default FrontTextSection;
