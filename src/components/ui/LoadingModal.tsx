import React from "react";
import { motion } from "framer-motion";
import Modal from "./Modal";

export interface LoadingModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  progress?: number;
  stage?: string;
  showProgress?: boolean;
}

const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  title = "جاري المعالجة...",
  message = "يرجى الانتظار",
  progress = 0,
  stage,
  showProgress = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      shouldRender={isOpen}
      onClose={() => {}} // لا يمكن إغلاق نافذة التحميل
      showCloseButton={false}
      size="sm"
      options={{
        closeOnEscape: false,
        closeOnBackdropClick: false,
      }}
    >
      <div className="text-center py-4">
        {/* Animated Loading Circles */}
        <div className="relative flex justify-center mb-6">
          <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-r from-blue-200 to-purple-200">
            <div className="flex items-center justify-center gap-2">
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
                className="w-5 h-5 rounded-full"
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
                className="w-5 h-5 rounded-full"
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
                className="w-5 h-5 rounded-full"
              />
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-2 text-[#563660]">{title}</h3>

        <p className="text-gray-600 text-sm mb-4">{message}</p>

        {stage && (
          <p className="text-[#563660] text-sm font-medium mb-4">{stage}</p>
        )}

        {showProgress && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">التقدم</span>
              <span className="text-sm font-bold text-[#563660]">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#563660] to-[#7e4a8c]"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500">
          يرجى عدم إغلاق النافذة أثناء المعالجة...
        </p>
      </div>
    </Modal>
  );
};

export default LoadingModal;
