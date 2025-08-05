import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingOverlayProps {
  isVisible: boolean;
  stage: "capturing" | "generating" | "completed";
  onComplete?: () => void;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  stage,
  onComplete,
}) => {
  const getStageInfo = () => {
    switch (stage) {
      case "capturing":
        return {
          title: "جاري التقاط الصور...",
          subtitle: "نقوم بالتقاط صور عالية الجودة لتصميمك",
          progress: 33,
          color: "text-blue-600",
          bgColor: "from-blue-500 to-blue-600",
        };
      case "generating":
        return {
          title: "جاري إنشاء ملف PDF...",
          subtitle: "نقوم بتجهيز ملف PDF احترافي لطلبك",
          progress: 66,
          color: "text-purple-600",
          bgColor: "from-purple-500 to-purple-600",
        };
      case "completed":
        return {
          title: "تم إنشاء الملف بنجاح!",
          subtitle: "ملف PDF جاهز للتحميل والإرسال",
          progress: 100,
          color: "text-green-600",
          bgColor: "from-green-500 to-green-600",
        };
      default:
        return {
          title: "جاري المعالجة...",
          subtitle: "يرجى الانتظار",
          progress: 0,
          color: "text-gray-600",
          bgColor: "from-gray-500 to-gray-600",
        };
    }
  };

  const stageInfo = getStageInfo();

  React.useEffect(() => {
    if (stage === "completed" && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [stage, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-70 z-[9999] flex items-center justify-center backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md shadow-2xl border border-gray-100"
          >
            {/* Animated circles */}
            <div className="relative flex justify-center mb-6">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center bg-gradient-to-r from-blue-200 to-purple-200">
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <motion.div
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.6, 1, 0.6],
                      backgroundColor: ["#60A5FA", "#A78BFA", "#60A5FA"],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                  />
                  <motion.div
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.6, 1, 0.6],
                      backgroundColor: ["#A78BFA", "#60A5FA", "#A78BFA"],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.4,
                    }}
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                  />
                  <motion.div
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.6, 1, 0.6],
                      backgroundColor: ["#60A5FA", "#A78BFA", "#60A5FA"],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.8,
                    }}
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                  />
                </div>
              </div>
            </div>

            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-6"
            >
              <h2
                className={`text-lg sm:text-xl font-semibold mb-2 ${stageInfo.color}`}
              >
                {stageInfo.title}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                {stageInfo.subtitle}
              </p>
            </motion.div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">
                  التقدم
                </span>
                <span className={`text-sm font-bold ${stageInfo.color}`}>
                  {stageInfo.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${stageInfo.bgColor}`}
                  initial={{ width: "0%" }}
                  animate={{ width: `${stageInfo.progress}%` }}
                  transition={{
                    duration: stage === "completed" ? 0.8 : 1.2,
                    ease: "easeOut",
                    delay: 0.2,
                  }}
                />
              </div>
            </div>

            {/* Stage indicators */}
            <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
              <div
                className={`flex items-center gap-1 transition-all duration-300 ${
                  stage === "capturing"
                    ? "text-blue-600 font-medium scale-105"
                    : ""
                }`}
              >
                <motion.div
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                    stageInfo.progress >= 33
                      ? "bg-blue-500 scale-110"
                      : "bg-gray-300"
                  }`}
                  animate={stage === "capturing" ? { scale: [1, 1.2, 1] } : {}}
                  transition={{
                    duration: 1,
                    repeat: stage === "capturing" ? Infinity : 0,
                  }}
                />
                <span className="text-xs">التقاط</span>
              </div>
              <div
                className={`flex items-center gap-1 transition-all duration-300 ${
                  stage === "generating"
                    ? "text-purple-600 font-medium scale-105"
                    : ""
                }`}
              >
                <motion.div
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                    stageInfo.progress >= 66
                      ? "bg-purple-500 scale-110"
                      : "bg-gray-300"
                  }`}
                  animate={stage === "generating" ? { scale: [1, 1.2, 1] } : {}}
                  transition={{
                    duration: 1,
                    repeat: stage === "generating" ? Infinity : 0,
                  }}
                />
                <span className="text-xs">إنشاء</span>
              </div>
              <div
                className={`flex items-center gap-1 transition-all duration-300 ${
                  stage === "completed"
                    ? "text-green-600 font-medium scale-105"
                    : ""
                }`}
              >
                <motion.div
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                    stageInfo.progress >= 100
                      ? "bg-green-500 scale-110"
                      : "bg-gray-300"
                  }`}
                  animate={stage === "completed" ? { scale: [1, 1.3, 1] } : {}}
                  transition={{
                    duration: 0.6,
                    repeat: stage === "completed" ? 3 : 0,
                  }}
                />
                <span className="text-xs">اكتمال</span>
              </div>
            </div>

            {/* Success message */}
            {stage === "completed" && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="p-3 sm:p-4 bg-green-50 border-2 border-green-200 rounded-xl text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5, type: "spring" }}
                  className="text-xl sm:text-2xl mb-2"
                >
                  ✨
                </motion.div>
                <p className="text-green-800 text-xs sm:text-sm font-medium">
                  تم إنشاء ملف PDF بنجاح وبدء التحميل
                </p>
              </motion.div>
            )}

            {/* Loading message for current stage */}
            {stage !== "completed" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="text-center"
              >
                <p className="text-xs text-gray-500">
                  {stage === "capturing" &&
                    "يرجى عدم إغلاق النافذة أثناء التقاط الصور..."}
                  {stage === "generating" &&
                    "يرجى الانتظار أثناء إنشاء ملف PDF..."}
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;
