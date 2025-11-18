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

interface RepoContextType {
  repos: Repo[];

  starred: Record<string, boolean>;
  setStarred: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

  isLoaded: boolean;

  count: Record<string, number>;
  setCount: React.Dispatch<React.SetStateAction<Record<string, number>>>;

  filters: {
    language: string;
    sortBy: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      language: string;
      sortBy: string;
    }>
  >;

  languages: string[];
  visibleRepos: Repo[];

  displayLanguage: Record<string, string>;
  setDisplayLanguage: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;

  refreshStars: () => Promise<void>;
}

const RepoContext = createContext<RepoContextType | undefined>(
  undefined
);

export function RepoProvider({
  repos,
  children,
}: {
  repos: Repo[];
  children: ReactNode;
}) {
  const [starred, setStarred] = useState<Record<string, boolean>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [count, setCount] = useState<Record<string, number>>({});
  const [displayLanguage, setDisplayLanguage] = useState<
    Record<string, string>
  >({});
  const [filters, setFilters] = useState({
    language: "All",
    sortBy: "activity",
  });

  //
  // Build languages dynamically
  //
  const languages = useMemo(() => {
    const langs = new Set<string>();
    repos.forEach((r) => r.language && langs.add(r.language));
    return ["All", ...Array.from(langs).sort()];
  }, [repos]);

  //
  // Visible repos after filtering + sorting
  //
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
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
        case "updated":
          return (
            new Date(b.updated_at).getTime() -
            new Date(a.updated_at).getTime()
          );
        case "stars":
          return b.stargazers_count - a.stargazers_count;
        default:
        case "activity":
          return (
            new Date(b.pushed_at).getTime() -
            new Date(a.pushed_at).getTime()
          );
      }
    });

    return list;
  }, [repos, filters]);

  //
  // Count map from repos
  //
  useEffect(() => {
    const newCounts: Record<string, number> = {};
    repos.forEach((r) => {
      newCounts[r.name] = r.stargazers_count;
    });
    setCount(newCounts);
  }, [repos]);

  //
  // Refresh authenticated user's stars
  //
  async function refreshStars() {
    try {
      const res = await fetch("/api/github/starred-list", {
        cache: "no-store",
      });
      const data = await res.json();

      if (data.authed && Array.isArray(data.repos)) {
        const starredMap: Record<string, boolean> = {};
        for (const r of data.repos) {
          if (r.name) starredMap[r.name] = true;
        }
        setStarred(starredMap);
      }
    } catch (err) {
      console.error("refreshStars failed:", err);
    } finally {
      setIsLoaded(true);
    }
  }

  useEffect(() => {
    refreshStars();
  }, []);

  //
  // Display Language Logic
  //
  useEffect(() => {
    const newMap: Record<string, string> = {};

    for (const repo of repos) {
      const langs = repo.languages ? Object.keys(repo.languages) : [];
      const matches = langs.includes(filters.language);

      newMap[repo.name] = matches
        ? filters.language
        : repo.language ?? "Unknown";
    }

    setDisplayLanguage(newMap);
  }, [repos, filters.language]);

  return (
    <RepoContext.Provider
      value={{
        repos,
        starred,
        setStarred,
        isLoaded,
        count,
        setCount,
        filters,
        setFilters,
        languages,
        visibleRepos,
        displayLanguage,
        setDisplayLanguage,
        refreshStars,
      }}
    >
      {children}
    </RepoContext.Provider>
  );
}

export function useRepoContext() {
  const context = useContext(RepoContext);
  if (!context)
    throw new Error("useRepoContext must be used within RepoProvider");
  return context;
}
