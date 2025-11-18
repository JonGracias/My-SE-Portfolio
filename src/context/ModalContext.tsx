"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
} from "react";

//
// Type for the Context
//
export interface ModalContextType {
  modal: {
    isOpen: boolean;
    content: ReactNode | null;
  };
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
}

//
// Create Context
//
const ModalContext = createContext<ModalContextType | undefined>(undefined);

//
// Modal Provider Component
//
export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<{
    isOpen: boolean;
    content: ReactNode | null;
  }>({
    isOpen: false,
    content: null,
  });

  function openModal(content: ReactNode) {
    setModal({
      isOpen: true,
      content,
    });
  }

  function closeModal() {
    setModal({
      isOpen: false,
      content: null,
    });
  }

  return (
    <ModalContext.Provider value={{ modal, openModal, closeModal }}>
      {/* Modal UI layer */}
      {modal.isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm
                     z-[9998] flex items-center justify-center"
          onClick={closeModal}>

          <div
            className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-xl
                       max-w-[20rem] animate-fadeInUp"
            onClick={(e) => e.stopPropagation()}>
            {modal.content}
          </div>
        </div>
      )}

      {children}
    </ModalContext.Provider>
  );
}

//
// Hook
//
export function useModalContext() {
  const context = useContext(ModalContext);
  if (!context)
    throw new Error("useModalContext must be used within a ModalProvider");
  return context;
}
