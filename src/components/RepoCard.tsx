"use client";

import { useEffect, useRef, memo, useState } from "react";
import { Repo } from "@/lib/types";
import LanguageDisplay from "./LanguageDisplay";
import StarButton from "./StarButton";
import GitHubButton from "./GitHubButton";
import { useUIContext } from "@/context/UIContext";
import InfoPanel, { RepoCardHandle } from "./InfoPanel";

export default memo(function RepoCard({ repo }: { repo: Repo }) {
  const infoRef = useRef<RepoCardHandle>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const {
    isMobile,
    hoveredRepo,
    setHoveredRepo,
    clearHoveredRepo,
  } = useUIContext();

  const isActive = hoveredRepo?.name === repo.name;

  function handleEnter() {
    const el = infoRef.current?.getScrollElement?.();

    if (el && el.scrollHeight > el.clientHeight) {
      infoRef.current?.startAutoScroll();
    }
  }

  function handleLeave() {
    const el = infoRef.current?.getScrollElement?.();

    if (el) {
      el.scrollTo({ top: 0, behavior: "smooth" });
    }

    infoRef.current?.stopAutoScroll();
  }

  //
  // ────────────────────────────────────────────────────────────────
  // Popup wheel scroll forwarding (NO document.getElementById)
  // ────────────────────────────────────────────────────────────────
  //
  useEffect(() => {
    const card = cardRef.current;
    if (!card || isMobile) return;

    const forwardWheel = (e: WheelEvent) => {
      e.preventDefault();
      const container = document.querySelector(".scroll-container");
      if (container) {
        container.scrollBy({ top: e.deltaY, behavior: "smooth" });
      }
    };

    // Only enable when card is inside popup container
    if (card.closest("#popup-card")) {
      card.addEventListener("wheel", forwardWheel, { passive: false });
      return () => card.removeEventListener("wheel", forwardWheel);
    }
  }, [isMobile]);

  const buttonClass = [
    "h-[3.5rem] w-[3.5rem]",
    "flex items-center justify-center",
    "rounded-lg m-",
    "border border-white dark:border-neutral-900",
    "hover:border-blue-400 dark:hover:border-orange-400",
  ].join(" ");

  //
  // ────────────────────────────────────────────────────────────────
  // Component
  // ────────────────────────────────────────────────────────────────
  //
  return (
    <section
      onMouseEnter={isMobile ? undefined : handleEnter}
      onMouseLeave={isMobile ? undefined : handleLeave}
      ref={cardRef}
      className={[
        "RepoCard",
        "group block rounded-xl shadow-sm",
        "bg-white dark:bg-neutral-900",
        "transition-transform duration-200 ease-out",
        "p-4 relative",
        "w-full",
        "flex flex-col min-h-[14rem] min-w-[14rem]",
      ].join(" ")}>


      {/* X BUTTON (MOBILE ONLY) */}
      {isMobile && isActive && (
        <button
          onClick={(e) => {
            e.stopPropagation();  // prevent re-opening the card
            clearHoveredRepo();   // close card
          }}
          className="
            absolute top-1 right-1
            w-6 h-6 flex items-center justify-center
            rounded-full bg-neutral-800 text-white 
            dark:bg-neutral-700 shadow-md 
            text-xs font-bold z-20
          "
        >
          ×
        </button>
      )}
        
      {/* CLICKABLE INFO PANEL */}
      <InfoPanel
        ref={infoRef}
        repo={repo}
        isMobile={isMobile}
        isActive={isActive}
      />


      {/* BUTTON ROW */}
      <div className="grid grid-cols-3 items-center justify-between  gap-2">
        <section className={buttonClass}>
          <GitHubButton repo={repo} />
        </section>

        <section className={buttonClass}>
          <LanguageDisplay repo={repo} />
        </section>

        <section className={buttonClass}>
          <StarButton repo={repo} />
        </section>
      </div>
      <div className="h-auto">
      
      </div>
    </section>
  );
});
