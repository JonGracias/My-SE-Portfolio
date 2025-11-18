"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

export type ToastVariant = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  content: ReactNode;
  variant: ToastVariant;
}

interface ToastContextType {
  toasts: ToastMessage[];
  pushToast: (content: ReactNode, variant?: ToastVariant) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  function pushToast(content: ReactNode, variant: ToastVariant = "info") {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, content, variant }]);

    // Auto-hide
    setTimeout(() => dismissToast(id), 4000);
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }

  return (
    <ToastContext.Provider value={{ toasts, pushToast, dismissToast }}>
      {/* Toast UI Layer */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => dismissToast(toast.id)}
            className={`
              px-4 py-3 rounded-lg shadow-xl cursor-pointer
              text-white border
              animate-slideDownFade
              ${
                toast.variant === "error"
                  ? "bg-red-600 border-red-300"
                  : toast.variant === "success"
                  ? "bg-green-600 border-green-300"
                  : "bg-blue-600 border-blue-300"
              }
            `}
          >
            {toast.content}
          </div>
        ))}
      </div>

      {children}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToastContext must be used within a ToastProvider");
  return ctx;
}
