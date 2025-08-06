import React from "react";
import { motion } from "framer-motion";
import { Type, CheckCircle, Loader2 } from "lucide-react";
import { useFontPreloader } from "../../hooks/useFontPreloader";

interface FontPreloadIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

/**
 * مؤشر حالة تحميل الخطوط - يمكن استخدامه للتطوير والاختبار
 */
const FontPreloadIndicator: React.FC<FontPreloadIndicatorProps> = ({
  showDetails = false,
  className = "",
}) => {
  const { isLoading, isFontReady } = useFontPreloader();

  const requiredFonts = [
    "Katibeh",
    "Amiri",
    "Noto Naskh Arabic",
    "Noto Kufi Arabic",
    "Scheherazade New",
    "Tajawal",
  ];

  const loadedCount = requiredFonts.filter((font) => isFontReady(font)).length;
  const totalCount = requiredFonts.length;
  const progress = (loadedCount / totalCount) * 100;

  if (!showDetails && loadedCount === totalCount) {
    return null; // إخفاء المؤشر عند اكتمال التحميل
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50 ${className}`}
    >
      <div className="flex items-center gap-2 mb-2">
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
        ) : loadedCount === totalCount ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <Type className="w-4 h-4 text-gray-500" />
        )}
        <span className="text-sm font-medium text-gray-700">
          {isLoading
            ? "جاري تحميل الخطوط..."
            : loadedCount === totalCount
            ? "تم تحميل جميع الخطوط"
            : `تحميل الخطوط: ${loadedCount}/${totalCount}`}
        </span>
      </div>

      {/* شريط التقدم */}
      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* تفاصيل الخطوط */}
      {showDetails && (
        <div className="mt-2 space-y-1">
          {requiredFonts.map((font) => (
            <div key={font} className="flex items-center gap-2 text-xs">
              {isFontReady(font) ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <div className="w-3 h-3 border border-gray-300 rounded-full" />
              )}
              <span
                className={
                  isFontReady(font) ? "text-green-700" : "text-gray-500"
                }
              >
                {font}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default FontPreloadIndicator;
