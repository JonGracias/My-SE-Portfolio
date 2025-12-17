// src/lib/github.ts

import type { Repo } from "@/lib/repos";

/**
 * Fallback data used when GitHub credentials are missing
 * or API calls fail.
 */
const DUMMY_REPOS: Repo[] = [
  {
    id: 123456,
    name: "dummy-repo-name",
    html_url: "https://github.com/dummy/dummy-repo",
    description: "This is a dummy description of the repository.",
    stargazers_count: 0,
    language: "JavaScript",

    languages: { JavaScript: 100 },
    languages_abv: { JS: 100 },

    forks_count: 0,
    open_issues_count: 0,
    owner: "dummy-owner",

    created_at: "2025-01-01T00:00:00Z",
    pushed_at: "2025-01-01T01:00:00Z",
    updated_at: "2025-01-01T02:00:00Z",

    readme: "This is a dummy README content.",
  },
];


export async function fetchRepos(): Promise<Repo[]> {
  const user = process.env.GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;

  if (!user || !token) {
    return DUMMY_REPOS;
  }

  try {
    // ─── FETCH REPO LIST (ISR-CACHED) ───────────────────────────
    const repoRes = await fetch(
      `https://api.github.com/users/${user}/repos?per_page=100&sort=updated`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
        // ✅ ISR-friendly caching
        next: { revalidate: 600 },
      }
    );

    if (!repoRes.ok) {
      console.error("GitHub repo fetch failed:", repoRes.status);
      return DUMMY_REPOS;
    }

    const rawRepos = await repoRes.json();

    // ─── ENRICH REPOS (PARALLEL, BEST-EFFORT) ──────────────────
    const repos: Repo[] = await Promise.all(
      rawRepos.map(async (r: any) => {
        let languages: Record<string, number> = {};
        let readme: string | null = null;

        // LANGUAGES
        try {
          const langRes = await fetch(r.languages_url, {
            headers: { Authorization: `Bearer ${token}` },
            next: { revalidate: 600 },
          });
          if (langRes.ok) {
            languages = await langRes.json();
          }
        } catch {
          // silent failure
        }

        // README
        try {
          const readmeRes = await fetch(
            `https://api.github.com/repos/${user}/${r.name}/readme`,
            {
              headers: { Authorization: `Bearer ${token}` },
              next: { revalidate: 600 },
            }
          );

          if (readmeRes.ok) {
            const data = await readmeRes.json();
            if (data?.content) {
              readme = Buffer.from(data.content, "base64").toString("utf-8");
            }
          }
        } catch {
          // silent failure
        }

        return {
          id: r.id,
          name: r.name,
          html_url: r.html_url,
          description: r.description,
          stargazers_count: r.stargazers_count,

          language: r.language,
          languages,

          forks_count: r.forks_count,
          open_issues_count: r.open_issues_count,

          owner: r.owner?.login ?? "",

          created_at: r.created_at,
          pushed_at: r.pushed_at,
          updated_at: r.updated_at,

          readme,
        };
      })
    );

    return repos;
  } catch (err) {
    console.error("GitHub API error:", err);
    return DUMMY_REPOS;
  }
}
