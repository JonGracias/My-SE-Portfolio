"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { Repo } from "@/lib/types";

type SortOption = "created" | "updated" | "stars" | "activity";

interface Filters {
  language: string;
  sortBy: SortOption;
}

interface RepoContextType {
  repos: Repo[];

  // Stars
  starred: Record<string, boolean>;
  setStarred: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  refreshStars: () => Promise<void>;

  // Star counts
  count: Record<string, number>;
  setCount: React.Dispatch<React.SetStateAction<Record<string, number>>>;

  // Filters
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;

  // Language options
  languages: string[];

  // Filtered / sorted repos
  visibleRepos: Repo[];

  // Display language chosen for each repo based on filters
  displayLanguage: Record<string, string>;
  setDisplayLanguage: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const RepoContext = createContext<RepoContextType | undefined>(undefined);

export function RepoProvider({
  repos,
  children,
}: {
  repos: Repo[];
  children: ReactNode;
}) {
  // ---------------------------------------------------------
  // STARRED STATE (LOCAL CACHE + REMOTE SYNC)
  // ---------------------------------------------------------

  const [starred, setStarred] = useState<Record<string, boolean>>({});

  // Load user star cache on mount
  useEffect(() => {
    const cached = localStorage.getItem("starredCache");
    if (cached) {
      try {
        setStarred(JSON.parse(cached));
      } catch {}
    }
  }, []);

  // Persist star cache
  useEffect(() => {
    localStorage.setItem("starredCache", JSON.stringify(starred));
  }, [starred]);

  // Refresh from GitHub authenticated star list
  async function refreshStars() {
    try {
      const res = await fetch("/api/github/starred-list", { cache: "no-store" });
      const data = await res.json();

      if (data.authed && Array.isArray(data.repos)) {
        // Remote truth: build a fresh map of GitHub-starred repos
        const remoteNames = new Set<string>(
          data.repos
            .map((r: any) => r?.name)
            .filter((name: string | undefined): name is string => !!name)
        );

        setStarred(() => {
          const next: Record<string, boolean> = {};
          remoteNames.forEach((name) => {
            next[name] = true;
          });
          return next;
        });
      }
      // If not authed, we leave local starred as-is (pure local favorites).
    } catch (err) {
      console.error("refreshStars failed:", err);
    }
  }

  useEffect(() => {
    refreshStars();
  }, []);

  // ---------------------------------------------------------
  // STAR COUNTS (STATIC PER BUILD + CLIENT UPDATES)
  // ---------------------------------------------------------
  const [count, setCount] = useState<Record<string, number>>({});

  useEffect(() => {
    const map: Record<string, number> = {};
    repos.forEach((r) => (map[r.name] = r.stargazers_count));
    setCount(map);
  }, [repos]);

  // ---------------------------------------------------------
  // FILTERS
  // ---------------------------------------------------------
  const [filters, setFilters] = useState<Filters>({
    language: "All",
    sortBy: "activity",
  });

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
    return ["All", ...Array.from(set).sort()];
  }, [repos]);

  // ---------------------------------------------------------
  // FILTERED + SORTED REPOS
  // ---------------------------------------------------------
  const visibleRepos = useMemo(() => {
    let list = [...repos];

    if (filters.language !== "All") {
      list = list.filter((r) =>
        r.languages
          ? Object.keys(r.languages).includes(filters.language)
          : r.language === filters.language
      );
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
  const [displayLanguage, setDisplayLanguage] =
    useState<Record<string, string>>({});

  useEffect(() => {
    const map: Record<string, string> = {};

    repos.forEach((repo) => {
      const langs = repo.languages ? Object.keys(repo.languages) : [];
      const selected =
        filters.language !== "All" && langs.includes(filters.language)
          ? filters.language
          : repo.language ?? "Unknown";

      map[repo.name] = selected;
    });

    setDisplayLanguage(map);
  }, [repos, filters.language]);

  // ---------------------------------------------------------
  // PROVIDER VALUE
  // ---------------------------------------------------------
  return (
    <RepoContext.Provider
      value={{
        repos,

        starred,
        setStarred,
        refreshStars,

        count,
        setCount,

        filters,
        setFilters,

        languages,
        visibleRepos,

        displayLanguage,
        setDisplayLanguage,
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
