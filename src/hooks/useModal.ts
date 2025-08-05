import { useState, useCallback, useEffect } from "react";

export interface ModalState {
  isOpen: boolean;
  isAnimating: boolean;
  shouldRender: boolean;
}

export interface ModalOptions {
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  preventBodyScroll?: boolean;
  animationDuration?: number;
  zIndex?: number;
}

const defaultOptions: Required<ModalOptions> = {
  closeOnEscape: true,
  closeOnBackdropClick: true,
  preventBodyScroll: true,
  animationDuration: 300,
  zIndex: 9990,
};

export const useModal = (options: ModalOptions = {}) => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    isAnimating: false,
    shouldRender: false,
  });

  const mergedOptions = { ...defaultOptions, ...options };

  const openModal = useCallback(() => {
    setModalState({
      isOpen: false,
      isAnimating: true,
      shouldRender: true,
    });

    // تأخير قصير لضمان تحديث DOM قبل بدء الانيميشن
    requestAnimationFrame(() => {
      setModalState((prev) => ({
        ...prev,
        isOpen: true,
      }));
    });

    // منع التمرير في الخلفية إذا كان مطلوباً
    if (mergedOptions.preventBodyScroll) {
      document.body.style.overflow = "hidden";
    }
  }, [mergedOptions.preventBodyScroll]);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
      isAnimating: true,
    }));

    // إزالة النافذة من DOM بعد انتهاء الانيميشن
    setTimeout(() => {
      setModalState((prev) => ({
        ...prev,
        isAnimating: false,
        shouldRender: false,
      }));
    }, mergedOptions.animationDuration);

    // استعادة التمرير
    if (mergedOptions.preventBodyScroll) {
      document.body.style.overflow = "";
    }
  }, [mergedOptions.animationDuration, mergedOptions.preventBodyScroll]);

  // معالجة الضغط على مفتاح Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        modalState.isOpen &&
        mergedOptions.closeOnEscape
      ) {
        closeModal();
      }
    };

    if (modalState.shouldRender) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [
    modalState.isOpen,
    modalState.shouldRender,
    mergedOptions.closeOnEscape,
    closeModal,
  ]);

  // تنظيف عند إلغاء تحميل المكون
  useEffect(() => {
    return () => {
      if (mergedOptions.preventBodyScroll) {
        document.body.style.overflow = "";
      }
    };
  }, [mergedOptions.preventBodyScroll]);

  return {
    ...modalState,
    openModal,
    closeModal,
    toggleModal: modalState.isOpen ? closeModal : openModal,
    options: mergedOptions,
  };
};
