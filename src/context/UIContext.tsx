"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
} from "react";

interface HoverPos {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface UIContextType {
  hoveredRepo: any | null; // you can type this as Repo if you want
  setHoveredRepo: (repo: any | null) => void;

  hoverPos: HoverPos;
  setHoverPos: (pos: HoverPos) => void;

  scrolling: boolean;
  setScrolling: (state: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [hoveredRepo, setHoveredRepo] = useState<any | null>(null);

  const [hoverPos, setHoverPos] = useState<HoverPos>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const [scrolling, setScrolling] = useState<boolean>(false);

  return (
    <UIContext.Provider
      value={{
        hoveredRepo,
        setHoveredRepo,
        hoverPos,
        setHoverPos,
        scrolling,
        setScrolling,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUIContext() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUIContext must be used within a UIProvider");
  return ctx;
}
