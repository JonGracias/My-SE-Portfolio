"use client";
import React, { useEffect, useRef } from "react";

interface Position {
  top: number;
  left: number;
  scale: number;
}

interface PopupProps {
  object: React.ReactNode;
  position?: Partial<Position>;
}

const DEFAULT_POS: Position = {
  top: 0,
  left: 0,
  scale: 1,
};

export default function Popup({ object, position = {} }: PopupProps) {
  const finalPos: Position = { ...DEFAULT_POS, ...position };
    
  return (
    <div
      id="popup-card"
      className="fixed z-[20] w-fit h-fit"
      style={{
        top: finalPos.top,
        left: finalPos.left,
        transform: `scale(${finalPos.scale})`,
        transformOrigin: "center center",}}>
      {object}
    </div>
  );
}
