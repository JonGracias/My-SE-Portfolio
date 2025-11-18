"use client";

import { useRef, useEffect } from "react";
import RepoCard from "./RepoCard";
import { Repo } from "@/lib/types";

import { useRepoContext } from "@/context/RepoContext";
import { useUIContext } from "@/context/UIContext";

export default function RepoList() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef<HTMLDivElement | null>(null);
  const scale = 1.2;

  //
  // Repo Data Context
  //
  const {
    filters,
    setFilters,
    languages,
    visibleRepos,
  } = useRepoContext();

  //
  // UI Context
  //
  const {
    hoveredRepo,
    setHoveredRepo,
    hoverPos,
    setHoverPos,
    scrolling,
    setScrolling,
  } = useUIContext();

  //
  // Hover handler
  //
  function handleMouseEnter(el: HTMLDivElement, repo: Repo) {
    hoveredRef.current = el;
    setHoveredRepo(repo);

    const rect = el.getBoundingClientRect();
    const containerRect = scrollContainerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const containerTop = containerRect.top;
    const containerBottom = containerRect.bottom;
    const popupHeight = rect.height * scale;

    // default position
    let topPos = rect.top;

    // top clamp
    const minTop = containerTop + 10;
    if (topPos < minTop) topPos = minTop;

    // bottom clamp
    const popupBottom = topPos + popupHeight;
    const maxBottom = containerBottom + 20;
    if (popupBottom > maxBottom) {
      topPos = maxBottom - popupHeight;
    }

    setHoverPos({
      top: topPos,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }

  function handleMouseLeave() {
    hoveredRef.current = null;
    setHoveredRepo(null);
  }

  //
  // Scroll listener (kills popup while scrolling)
  //
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      setScrolling(true);
      setHoveredRepo(null);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => setScrolling(false), 150);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [setScrolling, setHoveredRepo]);

  return (
    <section
      ref={scrollContainerRef}
      className="
        scroll-container
        w-full mx-auto
        overflow-y-auto overflow-x-hidden
        custom-scrollbar
        bg-gray-100 dark:bg-gray-800
        border border-gray-300 dark:border-gray-700
        max-w-[20.6rem] sm:max-w-[28rem] md:max-w-[41.1rem] xl:max-w-[54.75rem]
        [height:calc(100dvh-24rem)] sm:[height:calc(100dvh-20rem)]
        shadow-md rounded-2xl
      "
    >
      {/* Filter Bar */}
      <div
        className="
          sticky top-0 z-10 bg-gray-100/90 dark:bg-gray-800/90 
          backdrop-blur border-b border-gray-300 dark:border-gray-700
          px-4 py-3 rounded-t-2xl flex items-center gap-3
        "
      >
        {/* Language Filter */}
        <label className="text-sm font-medium">Language:</label>
        <select
          value={filters.language}
          onChange={(e) => setFilters((f) => ({ ...f, language: e.target.value }))}
          className="
            px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700
            bg-white dark:bg-neutral-900 text-sm
          "
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        {/* Sort Filter */}
        <label className="ml-2 text-sm font-medium">Sort:</label>
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value }))}
          className="
            px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700
            bg-white dark:bg-neutral-900 text-sm
          "
        >
          <option value="stars">Most Stars</option>
          <option value="created">Date Created</option>
          <option value="activity">Most Activity</option>
          <option value="updated">Last Updated</option>
        </select>
      </div>

      {/* Popup Card */}
      {!scrolling && hoveredRepo && (
        <div
          className="fixed z-[20] transition-transform duration-200 ease-out hidden sm:block"
          style={{
            top: `${hoverPos.top}px`,
            left: `${hoverPos.left - 16}px`,
            width: hoverPos.width,
            height: hoverPos.height,
            transform: `scale(${scale})`,
          }}
        >
          <div
            id="popup-card"
            className="w-full sm:w-[12rem] h-auto"
            onMouseLeave={handleMouseLeave}
          >
            <RepoCard repo={hoveredRepo} />
          </div>
        </div>
      )}

      {/* Repo Grid */}
      <div
        className="
          grid gap-14
          grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4
          auto-rows-[12rem]
          isolate
          p-5 pt-2.5
        "
      >
        {visibleRepos.map((repo) => (
          <div
            key={repo.id}
            onMouseEnter={(e) => handleMouseEnter(e.currentTarget, repo)}
            className="relative w-full hover:z-[99] sm:w-[12rem] h-auto"
          >
            <div className="sm:pointer-events-none">
              <RepoCard repo={repo} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
