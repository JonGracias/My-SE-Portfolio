"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";

import { useRepoContext } from "./RepoContext";
import { getLanguageIconUrl } from "@/utils/getLanguageIconUrl";

type IconCache = Record<string, string | null>;

interface LanguageIconContextType {
  getIcon: (lang: string) => string | null;
  loadIconsForLanguages: (languages: string[]) => Promise<void>;
}

export const LanguageIconContext = createContext<LanguageIconContextType | null>(null);

/* ----------------------------------------------------------
 * Utility: Return first URL that resolves (HEAD)
 * ---------------------------------------------------------- */
async function findFirstWorkingUrl(urls: (string | null)[]) {
  const checks = urls.map(async (url) => {
    if (!url) return null;
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok) return url;
    } catch {}
    return null;
  });

  const results = await Promise.all(checks);
  return results.find((r) => r !== null) ?? null;
}

/* ----------------------------------------------------------
 * Provider
 * ---------------------------------------------------------- */
export function LanguageIconProvider({ children }: { children: React.ReactNode }) {
  const { languages } = useRepoContext();   // ← Pull languages from RepoContext
  const [cache, setCache] = useState<IconCache>({});

  /* --------------------------------------------------------
   * Load icons for given language list (parallel)
   * -------------------------------------------------------- */
  const loadIconsForLanguages = useCallback(
    async (langs: string[]) => {
      const missing = langs.filter((l) => !(l in cache));
      if (missing.length === 0) return;

      const results = await Promise.all(
        missing.map(async (lang) => {
          const urls = getLanguageIconUrl(lang);
          const working = await findFirstWorkingUrl(urls);
          return [lang, working] as const;
        })
      );

      setCache((prev) => ({ ...prev, ...Object.fromEntries(results) }));
    },
    [cache]
  );

  /* --------------------------------------------------------
   * Load all icons when languages change
   * -------------------------------------------------------- */
  useEffect(() => {
    if (languages.length > 0) {
      loadIconsForLanguages(languages);
    }
  }, [languages, loadIconsForLanguages]);

  /* --------------------------------------------------------
   * API: get icon from cache
   * -------------------------------------------------------- */
  const getIcon = useCallback(
    (lang: string) => cache[lang] ?? null,
    [cache]
  );

  const value = useMemo(
    () => ({
      getIcon,
      loadIconsForLanguages,
    }),
    [getIcon, loadIconsForLanguages]
  );

  return (
    <LanguageIconContext.Provider value={value}>
      {children}
    </LanguageIconContext.Provider>
  );
}

/* ----------------------------------------------------------
 * Consumer hook
 * ---------------------------------------------------------- */
export function useLanguageIcons() {
  const ctx = useContext(LanguageIconContext);
  if (!ctx) {
    throw new Error("useLanguageIcons must be used within LanguageIconProvider");
  }
  return ctx;
}
