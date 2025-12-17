"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import type { Filters } from "@/lib/filters";
import { Repo } from "@/lib/repos";

interface RepoContextType {
  repos: Repo[];
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;

  // Language options
  languages: string[];

  // Filtered / sorted repos
  visibleRepos: Repo[];

  // Display language chosen for each repo based on filters
  displayLanguage: Record<string, string>;
  setDisplayLanguage: React.Dispatch<React.SetStateAction<Record<string, string>>>;

  loading: boolean;
  setLoading: (state: boolean) => void;
}

const RepoContext = createContext<RepoContextType | undefined>(undefined);

export function RepoProvider({
  children,
  initialRepos,
}: {
  children: ReactNode;
  initialRepos: Repo[];
}) {
  // ---------------------------------------------------------
  // FILTERS
  // ---------------------------------------------------------
  const [filters, setFilters] = useState<Filters>({
    languages: [],
    sortBy: "activity",
  });

  const [repos, setRepos] = useState<Repo[]>(initialRepos);
  const [loading, setLoading] = useState(true);
  const [displayLanguage, setDisplayLanguage] = useState<Record<string, string>>({});


  // ---------------------------------------------------------
  // LANGUAGE LIST
  // ---------------------------------------------------------
  const languages = useMemo(() => {
    const set = new Set<string>();
    repos.forEach((repo) => {
      if (repo.languages) {
        Object.keys(repo.languages).forEach((l) => set.add(l));
      }
      if (repo.language) set.add(repo.language);
    });
    return [ ...Array.from(set).sort()];
  }, [repos]);

  // ---------------------------------------------------------
  // FILTERED + SORTED REPOS
  // ---------------------------------------------------------
  const visibleRepos = useMemo(() => {
    let list = [...repos];

  if (filters.languages.length > 0) {
    list = list.filter((r) => {
      const repoLangs = r.languages
        ? Object.keys(r.languages)
        : r.language
        ? [r.language]
        : [];

      return filters.languages.some((l) => repoLangs.includes(l));
    });
  }


    list.sort((a, b) => {
      switch (filters.sortBy) {
        case "created":
          return +new Date(b.created_at) - +new Date(a.created_at);
        case "updated":
          return +new Date(b.updated_at) - +new Date(a.updated_at);
        case "stars":
          return b.stargazers_count - a.stargazers_count;
        default:
        case "activity":
          return +new Date(b.pushed_at) - +new Date(a.pushed_at);
      }
    });

    return list;
  }, [repos, filters]);

  // ---------------------------------------------------------
  // DISPLAY LANGUAGE PER REPO
  // ---------------------------------------------------------
  useEffect(() => {
    const map: Record<string, string> = {};

    repos.forEach((repo) => {
      const langMap = repo.languages ?? {};
      const repoLangs = Object.keys(langMap);

      // 1. Find selected languages that exist in this repo
      const matchingSelected = filters.languages.filter((l) =>
        repoLangs.includes(l)
      );

      let selected: string;

      if (matchingSelected.length > 0) {
        // 2. Pick the one with the highest byte count
        selected = matchingSelected.reduce((best, current) => {
          return (langMap[current] ?? 0) > (langMap[best] ?? 0)
            ? current
            : best;
        });
      } else {
        // 3. Fallbacks
        selected = repo.language ?? "Unknown";
      }

      map[repo.name] = selected;
    });

    setDisplayLanguage(map);
  }, [repos, filters.languages]);


  // ---------------------------------------------------------
  // PROVIDER VALUE
  // ---------------------------------------------------------
  return (
    <RepoContext.Provider
      value={{
        repos,

        filters,
        setFilters,

        languages,
        visibleRepos,

        displayLanguage,
        setDisplayLanguage,

        loading,
        setLoading
      }}
    >
      {children}
    </RepoContext.Provider>
  );
}

export function useRepoContext() {
  const ctx = useContext(RepoContext);
  if (!ctx) {
    throw new Error("useRepoContext must be used inside RepoProvider");
  }
  return ctx;
}
