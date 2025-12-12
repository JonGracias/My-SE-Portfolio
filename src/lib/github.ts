// src/lib/github.ts
import { Repo } from "@/lib/repos";

export async function fetchRepos(): Promise<Repo[]> {
  const res = await fetch("/api/github/repos", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch repos");
  }

  return res.json();
}
