"use client";
import { useRepoContext } from "@/context/RepoContext";
import { useAuth } from "@/context/AuthProvider";
import { Filters } from "@/lib/filters";
import { useState } from "react";
import GitHubAuthButton from "./GitHubLogButton"

export default function RepoFilters() {
  const { filters, setFilters, languages } = useRepoContext();
  const { isLogged, loading } = useAuth();
  const [open, setOpen] = useState(false);

  
  function toggleLanguage(lang: string) {
    setFilters((f) => {
      const exists = f.languages.includes(lang);
      return {
        ...f,
        languages: exists
          ? f.languages.filter((l) => l !== lang)
          : [...f.languages, lang],
      };
    });
  }

  return (
  <div
    className="
      sticky top-0 z-10
      bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur
      border-b border-gray-300 dark:border-gray-700
      px-4 py-3 rounded-t-2xl
      flex items-center justify-between gap-4
    "
  >
      {/* LEFT: Filters + Sort */}
      <div className="flex flex-wrap items-center gap-3 relative">
        {/* Languages Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="
              px-3 py-1 rounded-lg
              border border-gray-300 dark:border-gray-700
              bg-white dark:bg-neutral-900
              text-sm font-medium
              hover:border-blue-400 dark:hover:border-orange-400

            "
          >
            Languages
            {filters.languages.length > 0 && (
              <span className="ml-1 text-xs opacity-70">
                ({filters.languages.length})
              </span>
            )}
          </button>

          {open && (
            <div
              className="
                absolute left-0 mt-2 z-20
                w-[18rem]
                bg-white dark:bg-neutral-900
                border border-gray-300 dark:border-gray-700
                rounded-xl shadow-lg
                p-3
              "
            >
              <div className="flex justify-between mb-3 text-xs">
                <button
                  onClick={() =>
                    setFilters((f) => ({ ...f, languages: [] }))
                  }
                  className="text-blue-600 dark:text-blue-400"
                >
                  Clear
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-500 p-1"
                >
                  X
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto custom-scrollbar">
                {languages.map((lang) => (
                  <label
                    key={lang}
                    className="
                      flex items-center gap-2
                      text-sm cursor-pointer
                      rounded px-2 py-1
                      hover:bg-gray-100 dark:hover:bg-neutral-800
                    "
                  >
                    <input
                      type="checkbox"
                      checked={filters.languages.includes(lang)}
                      onChange={() => toggleLanguage(lang)}
                    />
                    <span className="truncate">{lang}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sort */}
        <select
          value={filters.sortBy}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              sortBy: e.target.value as Filters["sortBy"],
            }))
          }
          className="
            px-2 py-1 rounded-lg
            border border-gray-300 dark:border-gray-700
            bg-white dark:bg-neutral-900
          "
        >
          <option value="stars">Most Stars</option>
          <option value="created">Date Created</option>
          <option value="activity">Most Worked On</option>
          <option value="updated">Last Updated</option>
        </select>
      </div>

      {/* RIGHT: Auth */}
      <div className="flex items-center">
          <GitHubAuthButton size="sm" showStatus={false}/>
      </div>
    </div>
  );
}
