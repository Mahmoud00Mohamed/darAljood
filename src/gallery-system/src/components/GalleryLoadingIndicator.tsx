import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Images, Loader2 } from "lucide-react";

interface GalleryLoadingIndicatorProps {
  progress: number;
  loadedCount: number;
  totalCount: number;
  className?: string;
}

/**
 * مؤشر تحميل الصور في المعرض
 */
export const GalleryLoadingIndicator: React.FC<GalleryLoadingIndicatorProps> = ({
  progress,
  loadedCount,
  totalCount,
  className = "",
}) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 min-w-[280px] ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Images className="w-6 h-6 text-[#563660]" />
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin absolute -top-1 -right-1" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                جاري تحميل الصور
              </span>
              <span className="text-xs text-gray-500">
                {loadedCount}/{totalCount}
              </span>
            </div>
            
            {/* شريط التقدم */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#563660] to-[#7e4a8c] rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500">
                {progress}% مكتمل
              </span>
              <span className="text-xs text-green-600">
                {progress === 100 ? "تم الانتهاء!" : "جاري التحميل..."}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};