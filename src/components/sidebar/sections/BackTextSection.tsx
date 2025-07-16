import React, { useState } from "react";
import {
  useJacket,
  TextPosition,
  CustomText,
} from "../../../context/JacketContext";
import { Type, Trash2, Move } from "lucide-react";
import { ChromePicker } from "react-color";

const BackTextSection: React.FC = () => {
  const { jacketState, addText, updateText, removeText } = useJacket();
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [font, setFont] = useState("Katibeh");
  const [color, setColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const textPositions: { id: TextPosition; name: string }[] = [
    { id: "backBottom", name: "أسفل الظهر" },
  ];

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

  const isPositionOccupied = (pos: TextPosition) => {
    return jacketState.texts.some((text) => text.position === pos);
  };

  const handleAddText = () => {
    if (
      content.trim() &&
      content.length <= 24 &&
      !isPositionOccupied("backBottom")
    ) {
      const newText: CustomText = {
        id: `text-${Date.now()}`,
        content,
        position: "backBottom",
        x: 0,
        y: 0,
        scale: 1.5,
        font,
        color,
        isConnected: true,
      };
      addText(newText);
      setSelectedTextId(newText.id);
      setContent("");
      setColor("#000000");
      setFont("Katibeh");
    }
  };

  const filteredTexts = jacketState.texts.filter((text) =>
    ["backBottom"].includes(text.position)
  );

  const selectedText = selectedTextId
    ? jacketState.texts.find((text) => text.id === selectedTextId)
    : filteredTexts.length > 0
    ? filteredTexts[0]
    : null;

  React.useEffect(() => {
    if (!selectedTextId && filteredTexts.length > 0) {
      setSelectedTextId(filteredTexts[0].id);
    } else if (
      selectedTextId &&
      !filteredTexts.find((text) => text.id === selectedTextId)
    ) {
      setSelectedTextId(filteredTexts.length > 0 ? filteredTexts[0].id : null);
    }
  }, [filteredTexts, selectedTextId]);

  return (
    <div className="space-y-6">
      {filteredTexts.length === 0 && (
        <>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            إضافة النصوص (خلفي)
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              أدخل النص
            </label>
            <div className="flex">
              <input
                type="text"
                maxLength={24}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="(24 حرفًا كحد أقصى)"
                className="flex-1 p-2 border border-gray-300 rounded-r-md text-sm"
                dir="rtl"
              />
              <button
                onClick={handleAddText}
                disabled={
                  !content.trim() ||
                  content.length > 24 ||
                  isPositionOccupied("backBottom")
                }
                className="px-4 py-2 bg-[#d4af37] text-white rounded-l-md disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                إضافة
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الخط
            </label>
            <select
              value={font}
              onChange={(e) => setFont(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            >
              {availableFonts.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اللون
            </label>
            <div className="flex flex-wrap gap-2">
              {availableColors.map((colorOption) => (
                <button
                  key={colorOption.value}
                  onClick={() => setColor(colorOption.value)}
                  className={`w-8 h-8 rounded-full transition-all transform ${
                    color === colorOption.value
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
              <button
                className="w-8 h-8 rounded-full border"
                style={{ backgroundColor: color }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
              {showColorPicker && (
                <div className="absolute z-10">
                  <ChromePicker
                    color={color}
                    onChange={(color) => setColor(color.hex)}
                  />
                </div>
              )}
            </div>
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
              النص الخلفي مشمول في السعر الأساسي
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
                  {text.content.substring(0, 2)}
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
              maxLength={24}
              value={selectedText.content}
              onChange={(e) =>
                updateText(selectedText.id, { content: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded text-sm"
              dir="rtl"
            />
          </div>

          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">الخط</label>
            <select
              value={selectedText.font}
              onChange={(e) =>
                updateText(selectedText.id, { font: e.target.value })
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
                    updateText(selectedText.id, { color: colorOption.value })
                  }
                  className={`w-8 h-8 rounded-full transition-all transform ${
                    selectedText.color === colorOption.value
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
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">رأسي</label>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={selectedText.y}
                  onChange={(e) =>
                    updateText(selectedText.id, {
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
              min="0.3"
              max="1.5"
              step="0.1"
              value={selectedText.scale}
              onChange={(e) =>
                updateText(selectedText.id, {
                  scale: parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
          </div>
        </div>
      )}

      <div className="p-3 bg-purple-50 rounded-lg text-xs text-purple-700 border border-purple-200">
        <p>* النص الخلفي مشمول في السعر الأساسي</p>
      </div>
    </div>
  );
};

export default BackTextSection;
