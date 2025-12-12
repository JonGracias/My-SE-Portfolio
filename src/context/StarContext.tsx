"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useCallback,
} from "react";
import { Repo } from "@/lib/repos";
import { getCookie } from "@/utils/getCookie";
import { useRepoContext } from "./RepoContext";
import { useAuth } from "./AuthProvider";

interface StarContextType {
    starred: Record<string, boolean>;
    count: Record<string, number>;

    isLogin: boolean;     // "Logging in…"
    isLogged: boolean;    // "Logged in!"
    isStarring: boolean;  // "Starring…"

    setStarred: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    setCount: React.Dispatch<React.SetStateAction<Record<string, number>>>;

    refreshStars: () => Promise<void>;
    starRepo: (owner: string, repo: string) => Promise<number | null>;
}

const StarContext = createContext<StarContextType | undefined>(undefined);

export function StarProvider({ children }: { children: ReactNode }) {
    const { repos } = useRepoContext();
    const { isLogged } = useAuth();

    //
    // ----------------------------------------------------
    // State
    // ----------------------------------------------------
    //
    const [starred, setStarred] = useState<Record<string, boolean>>({});
    const [count, setCount] = useState<Record<string, number>>({});
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";

    // FLAGS
    const [isStarring, setIsStarring] = useState(false);
    const [isLogin, setIsLogin] = useState(false);


    //
    // ----------------------------------------------------
    // Initialize counts from repository list
    // ----------------------------------------------------
    //
    useEffect(() => {
        const initial: Record<string, number> = {};
        repos.forEach((r) => {
            initial[r.name] = r.stargazers_count;
        });
        setCount(initial);
    }, [repos]);


    //
    // ----------------------------------------------------
    // Load previous user star map from localStorage
    // ----------------------------------------------------
    //
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("userStarMap") || "{}");
            setStarred(saved);
        } catch {}
    }, []);


    //
    // ----------------------------------------------------
    // Refresh starred list AFTER LOGIN
    // (one clean version – no duplicate refreshUserStars)
    // ----------------------------------------------------
    //
    const refreshStars = useCallback(async () => {
    try {
        // Fetch the starred repos list for the authenticated user
        const res = await fetch(`${apiBase}/api/github/starred-list`, {
        cache: "no-store",
        credentials: "include",
        });

        const data = await res.json();

        // Return if the response is not authenticated or repos are not in an array
        if (!data.authed || !Array.isArray(data.repos)) return;

        // Create a list of starred repository names
        const starredRepos = new Set(data.repos.map((repo: Repo) => repo.name));

        // Create the next state based on whether the repo is starred
        const next: Record<string, boolean> = {};
        data.repos.forEach((repo: Repo) => {
        // If the repo is starred, set it in the next state as true
        next[repo.name] = starredRepos.has(repo.name);
        });

        // Update the state with the starred repos
        setStarred(next);

        // Store the starred repos in localStorage for persistence
        localStorage.setItem("userStarMap", JSON.stringify(next));
    } catch (err) {
        console.error("refreshStars failed:", err);
    }
    }, []);



    //
    // ----------------------------------------------------
    // Detect login return (gh_token cookie set by callback)
    // ----------------------------------------------------
    //
    useEffect(() => {
        if(isLogged == true){
            refreshStars()
        };
    }, [isLogged]);
    //
    // ----------------------------------------------------
    // STAR a repo
    // ----------------------------------------------------
    //
    const starRepo = useCallback(async (owner: string, repo: string) => {
        const starUrl = `${apiBase}/api/github/star`;
        const loginUrl = `${apiBase}/api/github/login`;

        setIsStarring(true);

        try {
            const res = await fetch(starUrl, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ owner, repo }),
            });

            if (res.status === 401) {
                setIsLogin(true);        // show “Logging in…”
                window.location.href = loginUrl;
                return null;             // DO NOT RETRY automatically
            }

            const data = await res.json();
            if (!data?.ok) return null;

            // Update UI state
            setStarred((prev) => ({ ...prev, [repo]: true }));
            setCount((prev) => ({
                ...prev,
                [repo]: data.count ?? prev[repo],
            }));

            return data.count ?? null;

        } catch (err) {
            console.error("Star error:", err);
            return null;
        } finally {
            setIsStarring(false);
        }
    }, []);


    //
    // ----------------------------------------------------
    // Provider
    // ----------------------------------------------------
    //
    return (
        <StarContext.Provider
            value={{
                starred,
                count,
                setStarred,
                setCount,
                refreshStars,
                starRepo,
                isLogin,
                isLogged,
                isStarring,
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
