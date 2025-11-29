"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import RepoCard from "./RepoCard";
import RepoFilters from "./RepoFilters";
import Popup from "./Popup";
import { useRepoContext } from "@/context/RepoContext";
import { useUIContext } from "@/context/UIContext";
import { Repo } from "@/lib/types";

interface Position {
  top: number;
  left: number;
  scale: number;
}

export default function RepoList() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const defaultPos: Position = { top: 0, left: 0, scale: 1 };
  const [hoverPos, setHoverPos] = useState<Position>(defaultPos);
  const [messagePos, setMessagePos] = useState<Position>(defaultPos);

  const { visibleRepos } = useRepoContext();

  const {
    hoveredRepo,
    setHoveredRepo,
    scrolling,
    setScrolling,
    message,
    clearMessage,
    clearHoveredRepo,
  } = useUIContext();

  /* -----------------------------------------------------------
   * Popup Position Calculation (Single Source of Truth)
   * ----------------------------------------------------------- */
  const computePopupPosition = useCallback(
    (rect: DOMRect) => {
      const containerRect = scrollContainerRef.current?.getBoundingClientRect();
      if (!containerRect) return defaultPos;

      const containerTop = containerRect.top;
      const containerBottom = containerRect.bottom;

      const popupHeight = rect.height;

      let top = rect.top;
      const minTop = containerTop + 10;
      if (top < minTop) top = minTop;

      const maxBottom = containerBottom - 20;
      if (top + popupHeight > maxBottom) {
        top = maxBottom - popupHeight;
      }

      const left = rect.left - 15;

      return { top, left, scale: 1.1 };
    },
    [scrollContainerRef]
  );

  /* -----------------------------------------------------------
  * Hover Logic
  * ----------------------------------------------------------- */
  const handleMouseEnter = useCallback(
    (element: HTMLDivElement, repo: Repo) => {
      setHoveredRepo(repo);

      const rect = element.getBoundingClientRect();
      const pos = computePopupPosition(rect);

      setHoverPos(pos);
      setMessagePos({ ...pos, scale: 1 });
    },
    [setHoveredRepo, computePopupPosition]
  );

  const handleMouseLeave = useCallback(() => {
    clearHoveredRepo();
    clearMessage();
  }, [clearHoveredRepo, clearMessage]);

  /* -----------------------------------------------------------
  * Scroll Behavior: Hide popups during scroll
  * ----------------------------------------------------------- */
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let timeout: NodeJS.Timeout;

    const onScroll = () => {
      setScrolling(true);
      clearHoveredRepo();
      clearMessage();

      clearTimeout(timeout);
      timeout = setTimeout(() => setScrolling(false), 150);
    };

    container.addEventListener("scroll", onScroll);
    return () => {
      container.removeEventListener("scroll", onScroll);
      clearTimeout(timeout);
    };
  }, [setScrolling, clearHoveredRepo, clearMessage]);

  /* -----------------------------------------------------------
   * RENDER
   * ----------------------------------------------------------- */
  return (
    
      <div
        ref={scrollContainerRef}
        className="
        scroll-container
        overflow-y-auto overflow-x-hidden
        custom-scrollbar
        bg-gray-100 dark:bg-gray-800
        border border-gray-300 dark:border-gray-700
        [height:calc(100dvh-23rem)]
        max-w-[65rem]
        min-h-[20rem]
        shadow-md rounded-2xl">
        <div onMouseLeave={handleMouseLeave}>
          {/* Hover Popup */} 
          {!scrolling && hoveredRepo && (
            <Popup object={<RepoCard repo={hoveredRepo}/>} position={hoverPos} />
          )}
          {/* Message */}
          {message && hoveredRepo && message.repoName === hoveredRepo.name && (
            <Popup object = {message.content} position={messagePos}/>
          )}
        </div>
        {/* Filters */}
        <RepoFilters />
        {/* Grid */}
        <div
          className="
            grid gap-16
            grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4
            auto-rows-[12rem]
            isolate
            p-5 mr-5 pt-2.5">
          {visibleRepos.map((repo) => (
            <div
              key={repo.id}
              onMouseEnter={(e) => handleMouseEnter(e.currentTarget, repo)}
              className="relative h-full w-full hover:z-[99]">
              <div className="sm:pointer-events-none">
                <RepoCard repo={repo}/>
              </div>
            </div>
          ))}
        </div>
      </div>
   
  );
}
