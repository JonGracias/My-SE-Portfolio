"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useCallback,
} from "react";
import { useRepoContext } from "@/context/RepoContext";

interface StarContextType {
    starred: Record<string, boolean>;
    count: Record<string, number>;

    setStarred: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    setCount: React.Dispatch<React.SetStateAction<Record<string, number>>>;

    refreshStars: () => Promise<void>;
    starRepo: (owner: string, repo: string) => Promise<number | null>;
}

const StarContext = createContext<StarContextType | undefined>(undefined);

export function StarProvider({ children }: { children: ReactNode }) {
    const { repos } = useRepoContext();
    //
    // STARRED STATE (LOCAL CACHE)
    //
    const [starred, setStarred] = useState<Record<string, boolean>>({});

    useEffect(() => {
    try {
        const saved = JSON.parse(localStorage.getItem("userStarMap") || "{}");
        setStarred(saved);
    } catch {}
    }, []);


    useEffect(() => {
        const cached = localStorage.getItem("starredCache");
            if (cached) {
            try {
                setStarred(JSON.parse(cached));
            } catch {}
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("starredCache", JSON.stringify(starred));
    }, [starred]);

    //
    // STAR COUNT CACHE
    //
    const [count, setCount] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    repos.forEach(repo => {
        initial[repo.name] = repo.stargazers_count; 
    });
    return initial;
    });


    //
    // Fetch full GitHub starred list after login
    //
    const refreshStars = useCallback(async () => {
        try {
        const res = await fetch("/api/github/starred-list", { cache: "no-store" });
        const data = await res.json();

        if (data.authed && Array.isArray(data.repos)) {
            const next: Record<string, boolean> = {};
            data.repos.forEach((r: any) => {
            if (r?.name) next[r.name] = true;
            });
            setStarred(next);
        }
        } catch (err) {
        console.error("refreshStars failed:", err);
        }
    }, []);

    const refreshUserStars = useCallback(async () => {
        try {
            const res = await fetch("/api/github/starred-list", {
                cache: "no-store",
            });

            if (!res.ok) return;

            const data = await res.json();
            if (!data.authed || !Array.isArray(data.repos)) return;

            const userStarMap: Record<string, boolean> = {};

            data.repos.forEach((repo: any) => {
            if (repo?.name) userStarMap[repo.name] = true;
            });

            // Save to state
            setStarred(userStarMap);

            // Save to localStorage
            localStorage.setItem("userStarMap", JSON.stringify(userStarMap));
            localStorage.setItem("userStarSyncDone", "yes");

        } catch (err) {
            console.error("Failed loading user starred list:", err);
        }
    }, []);

    useEffect(() => {
        refreshUserStars();
    }, [refreshUserStars]);



    //
    // Star a repo — single API call (used by StarButton)
    //
    const starRepo = useCallback(async (owner: string, repo: string) => {
        const res = await fetch("/api/github/star", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo }),
        });

        if (res.status === 401) {
        window.location.href = "/api/github/login";
        return null;
        }

        const data = await res.json();
        if (data.ok) return data.count;

        return null;
    }, []);

    return (
        <StarContext.Provider
        value={{
            starred,
            count,
            setStarred,
            setCount,
            refreshStars,
            starRepo,
        }}
        >
        {children}
        </StarContext.Provider>
    );
}

export function useStars() {
    const ctx = useContext(StarContext);
    if (!ctx) throw new Error("useStars must be used inside StarProvider");
    return ctx;
}
