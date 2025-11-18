"use client";

import { RepoProvider } from "./RepoContext";
import { ToastProvider } from "./ToastContext";
import { ModalProvider } from "./ModalContext";
import { UIProvider } from "./UIContext";
import { Repo } from "@/lib/types";

export default function ContextProviderTree({
  repos,
  children,
}: {
  repos: Repo[];
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <ModalProvider>
        <RepoProvider repos={repos}>
            <UIProvider>
                {children}
            </UIProvider>
        </RepoProvider>
      </ModalProvider>
    </ToastProvider>
  );
}
