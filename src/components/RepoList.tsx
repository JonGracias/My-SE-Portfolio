"use client";

import { useRef, useEffect, useState, useCallback, JSX } from "react";
import RepoCard from "./RepoCard";
import RepoFilters from "./RepoFilters";
import { useRepoContext } from "@/context/RepoContext";
import { useUIContext } from "@/context/UIContext";
import LargeRepoCard from "./LargeRepoCard";
import type { Position, Repo } from "@/lib/repos";

export default function RepoList() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const defaultPos: Position = { top: 0, left: 0, height: 0, width: 0, scale: 0, };
  const [hoverPos, setHoverPos] = useState<Position>(defaultPos);
  const [messagePos, setMessagePos] = useState<Position>(defaultPos);
  const [largerPos, setLargerPos] = useState<Position>(defaultPos);
  const { visibleRepos } = useRepoContext();
  const hoverCardCache = useRef<Record<string, JSX.Element>>({});


  const {
    hoveredRepo,
    setHoveredRepo,
    scrolling,
    setScrolling,
    message,
    clearMessage,
    clearHoveredRepo,
    largerRepo,
    setLargerRepo
  } = useUIContext();
  
  // Reactive window width
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
    
  const largeRepoPosition = useCallback(
    () => {
      const mainContainerRect =
        mainContainerRef.current?.getBoundingClientRect();

      if (!mainContainerRect) return defaultPos;

      const LargerTop = mainContainerRect.top;
      const LargerLeft = mainContainerRect.left;
      const LargerHeight = mainContainerRect.height;
      const LargerWidth = mainContainerRect.width;
      const scale = 1;

      // ---------------------------------------
      // Larger Position
      // ---------------------------------------
      let top = LargerTop;
      let left = LargerLeft - 16;
      let height = LargerHeight;
      let width = LargerWidth;

      return { top, left, height, width, scale };
    },[scrollContainerRef, windowWidth]);

  const computePopupPosition = useCallback(
    (rect: DOMRect) => {
      const scrollContainerRect =
        scrollContainerRef.current?.getBoundingClientRect();
      const mainContainerRect =
        mainContainerRef.current?.getBoundingClientRect();

      if (!scrollContainerRect || !mainContainerRect) return defaultPos;


      const scrollTop = scrollContainerRect.top;
      const scrollBottom = scrollContainerRect.bottom;
      const myRem = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );

      // ---------------------------------------
      // Desktop Defaults
      // ---------------------------------------
      let scale = 1;
      let height = myRem * 16;
      let width = myRem * 16;

      let left = rect.left - 32;
      let top = rect.top - 16;

      // ---------------------------------------
      // Vertical Clamp
      // ---------------------------------------
      const minTop = scrollTop;
      if (top < minTop) top = minTop;

      const maxBottom = scrollBottom + 20;
      if (top + height > maxBottom) {
        top = maxBottom - height;
      }

      return { top, left, height, width, scale };
    },
    [scrollContainerRef, windowWidth]
  );

  /* -----------------------------------------------------------
   * Hover Logic
   * ----------------------------------------------------------- */
  const handleMouseEnter = useCallback(
    (element: HTMLDivElement, repo: Repo) => {
      setHoveredRepo(repo);


      const rect = element.getBoundingClientRect();
      const lpos = largeRepoPosition();
      const pos = computePopupPosition(rect);
      const mess = computePopupPosition(rect);

      setHoverPos(pos);
      setMessagePos(mess);
      setLargerPos({ ...lpos });
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

  function handleClick(repo: Repo) {
    setLargerRepo(repo)
  }

  function getHoverCard(repo: Repo) {
    const key = repo.name;

    if (!hoverCardCache.current[key]) {
      hoverCardCache.current[key] = (
        <RepoCard
          repo={repo}
        />
      );
    }

    return hoverCardCache.current[key];
  }



  /* -----------------------------------------------------------
   * RENDER
   * ----------------------------------------------------------- */
  return (
    <div onMouseLeave={handleMouseLeave} 
        ref={mainContainerRef}
        className="
          relative flex flex-col h-[99%] rounded-xl
          bg-gray-100 dark:bg-gray-800
          border border-gray-300 dark:border-gray-700
          w-[90%] md:w-[46.5rem] lg:w-[55rem]
          shadow-[0_8px_24px_rgba(0,0,0,0.5),0_2px_6px_rgba(0,0,0,0.4)]">

      {largerRepo && (
        <div className="Large_Card absolute inset-0">
          {/* Large Repo Popup */}
            <LargeRepoCard repo={largerRepo} position={largerPos}/>
        </div>
      )}

      <div className="Popup_card" onMouseLeave={handleMouseLeave}>
        {/* Hover Popup */}
        {!scrolling && !largerRepo && hoveredRepo && (
          
          <div id="popup-card" className="fixed z-[20]"
            style={{
              top: hoverPos.top,
              left: hoverPos.left,
              width: hoverPos.width,
              height: hoverPos.height,
              transform: `scale(${hoverPos.scale})`,
              transformOrigin: "center center"}}
            >
            {hoveredRepo && getHoverCard(hoveredRepo)}
          </div>
        )}

        {/* Message */}
        {message && hoveredRepo && message.repoName === hoveredRepo.name && !largerRepo &&(

          <div className="fixed z-[25] flex items-center justify-center"
            style={{
              top: messagePos.top,
              left: messagePos.left,
              width: messagePos.width,
              height: messagePos.height,
              transform: `scale(${messagePos.scale})`,
              transformOrigin: "center center"}}
            >
            {message.content} 
          </div>
        )}
      </div>

      {/* Filters */}
        <RepoFilters />
      <div
        ref={scrollContainerRef}
        className="
          scroll-container
          flex-1
          overflow-y-auto 
          custom-scrollbar
          flex flex-col items-center justify-start">
        {/* Grid */}
        <div
        ref={gridContainerRef}
          className="
            grid gap-6
            grid-cols-1 sm:grid-cols-2 md:grid-cols-3 
            auto-rows-[14rem]
            [grid-template-columns:repeat(auto-fill,_14rem)]
            px-5 py-10
          ">
          {visibleRepos.map((repo) => (
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleClick(repo)}
              key={repo.id}
              onMouseEnter={(e) => handleMouseEnter(e.currentTarget, repo)}
              className="relative h-[14rem] w-[14rem]">
              <div className="pointer-events-none">
                <RepoCard repo={repo} position={defaultPos}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
