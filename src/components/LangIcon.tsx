"use client";

import { useLanguageIcons } from "@/context/LanguageIconContext";

interface LangIconProps {
  lang: string;
  percentText: string;
  size?: number;       
}

export default function LangIcon({
  lang,
  percentText,
}: LangIconProps) {
  const { getIcon } = useLanguageIcons();
  const iconUrl = getIcon(lang);

  return (
    <div className="relative flex items-center justify-center w-[4rem]">
      {/* Logo */}
      <div className="
          w-11 h-11 flex items-center justify-center
          rounded-sm
          bg-icon
          backdrop-blur-sm
          pointer-events-none">
        {iconUrl ? (
        <img src={iconUrl}  className="w-10 h-10"/>
        ) : (
        // Text Fallback
        <div className="text-[8px] text-red-700 font-bold">{lang}</div>         
        )}
      </div>
      
      {/* Percentage */}
      <div className="absolute top-10 left-6 w-10 h-8 flex items-center justify-center">
          <span className="relative text-[12px] font-bold text-black dark:text-icon">
          {percentText}
          </span>
      </div>
    </div>
  );
}
