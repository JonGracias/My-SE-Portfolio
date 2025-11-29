"use client";

import { memo } from "react";
import { useRepoContext } from "@/context/RepoContext";
import { Repo } from "@/lib/types";
import { useUIContext } from "@/context/UIContext";
import LangIcon from "./LangIcon";

export default function LanguageDisplay({ repo }: { repo: Repo }) {
  const { setFilters, displayLanguage } = useRepoContext();
  const { setMessage, clearHoveredRepo } = useUIContext();

  const langMap = repo.languages ?? {};
  const totalBytes = Object.values(langMap).reduce((a, b) => a + b, 0);

  const primaryLanguage = displayLanguage[repo.name] ?? "Unknown";

  /* ────────────────────────────────────────────────
     Robust percent()
  ───────────────────────────────────────────────── */
  function percent(bytes: number | undefined) {
    if (!totalBytes || !bytes) return "0%";
    return ((bytes / totalBytes) * 100).toFixed(1) + "%";
  }

  /* ────────────────────────────────────────────────
     CLICK → OPEN OVERLAY OF LANGS
  ───────────────────────────────────────────────── */
  function handleClick() {
    const keys = Object.keys(langMap);

    if (keys.length === 0) return;

    const entries = keys.map((lang) => {
      const bytes = langMap[lang];

      return (
        <button
          key={lang}
          className="
            flex flex-col items-center justify-center
            border border-white dark:border-neutral-900
            hover:border-blue-400 dark:hover:border-orange-400
            rounded-md text-sm h-[3.3rem] w-[3.3rem]
          "
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            clearHoveredRepo();
            setFilters((f) => ({ ...f, language: lang }));
          }}
        >
          <LangIcon lang={lang} percentText={percent(bytes)} />
        </button>
      );
    });

    const message = (
      <section>
        {/* Languages Popup */}
        <div className="w-[8rem] grid grid-cols-2 gap-10">
          {entries}
        </div>
      </section>
    );

    setMessage(repo.name, message);
  }

  /* ────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────── */
  return (
    <button
      onClick={handleClick}
      className="overflow-visible w-[4rem] h-[4rem] flex items-center justify-center cursor-pointer"
    >
      <LangIcon
        lang={primaryLanguage}
        percentText={percent(langMap[primaryLanguage])}
      />
    </button>
  );
}
