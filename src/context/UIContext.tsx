"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import MessageShell from "@/components/MessageShell";
import { Repo } from "@/lib/types";

/* -------------------------------------------------------
 * Types
 * ------------------------------------------------------- */
interface RepoMessage {
  repoName: string;
  content: ReactNode;        // Already wrapped inside MessageShell
}

interface UIContextType {
  hoveredRepo: Repo | null;
  setHoveredRepo: (repo: Repo | null) => void;

  message: RepoMessage | null;
  setMessage: (repoName: string, content: ReactNode) => void;

  scrolling: boolean;
  setScrolling: (state: boolean) => void;

  clearMessage: () => void;
  clearHoveredRepo: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

/* -------------------------------------------------------
 * Provider
 * ------------------------------------------------------- */
export function UIProvider({ children }: { children: ReactNode }) {
  const [hoveredRepo, _setHoveredRepo] = useState<Repo | null>(null);

  // The global popup message
  const [message, _setMessage] = useState<RepoMessage | null>(null);

  // Flag used to hide messages temporarily during scrolling
  const [scrolling, setScrolling] = useState<boolean>(false);

  /* -----------------------------------------------------
   * Message Controls
   * ----------------------------------------------------- */
  const clearMessage = useCallback(() => {
    _setMessage(null);
  }, []);

  const setMessage = useCallback(
    (repoName: string, content: ReactNode) => {
      _setMessage({
        repoName,
        content: (
          <MessageShell onClose={clearMessage}>
            {content}
          </MessageShell>
        ),
      });
    },
    [clearMessage]
  );

  /* -----------------------------------------------------
   * Hover Controls
   * ----------------------------------------------------- */
  const setHoveredRepo = useCallback((repo: Repo | null) => {
    _setHoveredRepo(repo);
  }, []);

  const clearHoveredRepo = useCallback(() => {
    _setHoveredRepo(null);
  }, []);

  /* -----------------------------------------------------
   * Provider Value
   * ----------------------------------------------------- */
  return (
    <UIContext.Provider
      value={{
        hoveredRepo,
        setHoveredRepo,

        message,
        setMessage,

        scrolling,
        setScrolling,

        clearMessage,
        clearHoveredRepo,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

/* -------------------------------------------------------
 * Hook
 * ------------------------------------------------------- */
export function useUIContext() {
  const ctx = useContext(UIContext);
  if (!ctx) {
    throw new Error("useUIContext must be used inside UIProvider");
  }
  return ctx;
}
