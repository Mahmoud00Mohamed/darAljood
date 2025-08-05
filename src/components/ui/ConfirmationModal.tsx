import React from "react";
import { AlertTriangle, CheckCircle, Info, Loader2 } from "lucide-react";
import Modal from "./Modal";
import { useModal } from "../../hooks/useModal";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "info" | "success";
  isLoading?: boolean;
}

const typeConfig = {
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
    confirmBg:
      "bg-gradient-to-r from-[#563660] to-[#7e4a8c] hover:from-[#4b2e55] hover:to-[#6d3f7a]",
    borderColor: "border-amber-200",
  },
  danger: {
    icon: AlertTriangle,
    iconColor: "text-red-600",
    iconBg: "bg-red-50",
    confirmBg:
      "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
    borderColor: "border-red-200",
  },
  info: {
    icon: Info,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    confirmBg:
      "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    borderColor: "border-blue-200",
  },
  success: {
    icon: CheckCircle,
    iconColor: "text-green-600",
    iconBg: "bg-green-50",
    confirmBg:
      "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    borderColor: "border-green-200",
  },
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  type = "warning",
  isLoading = false,
}) => {
  const modal = useModal({
    closeOnEscape: !isLoading,
    closeOnBackdropClick: !isLoading,
    zIndex: 9998, // أقل من نافذة PDF
  });

  const config = typeConfig[type];
  const Icon = config.icon;

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      shouldRender={isOpen}
      onClose={handleClose}
      showCloseButton={false}
      size="sm"
      options={modal.options}
      className="max-w-sm mx-4 sm:max-w-md sm:mx-auto"
      contentClassName="bg-white shadow-2xl border border-gray-100"
    >
      <div className="p-4 sm:p-6">
        {/* Icon and Title */}
        <div className="text-center mb-4 sm:mb-6">
          <div
            className={`w-12 h-12 sm:w-16 sm:h-16 ${config.iconBg} ${config.borderColor} border-2 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4`}
          >
            <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${config.iconColor}`} />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${config.confirmBg} shadow-lg hover:shadow-xl`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm sm:text-base">جاري المعالجة...</span>
              </>
            ) : (
              <span className="text-sm sm:text-base">{confirmText}</span>
            )}
          </button>

          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 py-2.5 sm:py-3 px-4 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
