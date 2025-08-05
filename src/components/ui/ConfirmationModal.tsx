import React from "react";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
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
    iconColor: "text-yellow-600",
    iconBg: "bg-yellow-100",
    confirmBg: "bg-yellow-600 hover:bg-yellow-700",
  },
  danger: {
    icon: AlertTriangle,
    iconColor: "text-red-600",
    iconBg: "bg-red-100",
    confirmBg: "bg-red-600 hover:bg-red-700",
  },
  info: {
    icon: Info,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    confirmBg: "bg-blue-600 hover:bg-blue-700",
  },
  success: {
    icon: CheckCircle,
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
    confirmBg: "bg-green-600 hover:bg-green-700",
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
    >
      <div className="text-center">
        <div
          className={`w-12 h-12 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}
        >
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>

        <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 py-2 px-4 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 ${config.confirmBg}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري المعالجة...
              </div>
            ) : (
              confirmText
            )}
          </button>

          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
