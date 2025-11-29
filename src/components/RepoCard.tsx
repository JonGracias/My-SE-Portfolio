"use client";

import { useEffect, useRef, memo } from "react";
import { Repo } from "@/lib/types";
import LanguageDisplay from "./LanguageDisplay";
import StarButton from "./StarButton";
import GitHubButton from "./GitHubButton";
import InfoPanel, { RepoCardHandle } from "./InfoPanel";

export default memo(function RepoCard({ repo }: { repo: Repo }) {
  const infoRef = useRef<RepoCardHandle>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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
    if (!card) return;

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
  }, []);

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
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      
      ref={cardRef}
      className={[
        
        "group block rounded-xl border shadow-sm",
        "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700",
        "hover:border-blue-400 hover:shadow-xl",
        "transition-transform duration-200 ease-out",
        "h-[14rem] w-[14rem] p-4",
      ].join(" ")}>
        
      {/* CLICKABLE INFO PANEL */}
      <InfoPanel ref={infoRef} repo={repo} />

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
    </section>
  );
});
