"use client";

import { Repo } from "@/lib/repos";
import { useStars } from "@/context/StarContext";
import { useUIContext } from "@/context/UIContext";
import { useCallback } from "react";

export default function StarButton({ repo }: { repo: Repo }) {
  const { starred, setStarred, count, setCount, starRepo } = useStars();

  const { setMessage, clearMessage } = useUIContext();

  const repoStarred = starred[repo.name] ?? false;
  const starCount = count[repo.name] ?? 0;

  //
  // -------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------
  //
  function setStarValue(v: boolean) {
    setStarred((prev) => ({ ...prev, [repo.name]: v }));
  }

  function setCountValue(v: number) {
    setCount((prev) => ({ ...prev, [repo.name]: v }));
  }

  //
  // -------------------------------------------------------------------
  // Star handler
  // -------------------------------------------------------------------
  //
  async function handleStar() {
    // local cached values
    const oldValue = repoStarred;
    const oldCount = starCount;

    // ================
    // 1. Optimistic UI
    // ================
    setStarValue(true);
    setCountValue(oldCount + 1);

    try {
      // ================
      // 2. Background API
      // ================
      const res = await fetch("/api/github/star", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: repo.owner, repo: repo.name })
      });

      // redirect to login
      if (res.status === 401) {
        window.location.href = "/api/github/login";
        return;
      }

      const data = await res.json();

      // ================
      // 3. Server truth
      // ================
      if (data.ok) {
        setStarValue(true);
        setCountValue(data.count); // canonical GitHub count
      } else {
        throw new Error("GitHub error");
      }

    } catch (err) {
      console.error("Star error:", err);

      // ================
      // 4. Revert on fail
      // ================
      setStarValue(oldValue);
      setCountValue(oldCount);
    }
  }


  //
  // -------------------------------------------------------------------
  // Message for "Not Allowed!" joke
  // -------------------------------------------------------------------
  //
  function triggerFunnyUnstarMessage() {
    const message = (
      <div className="flex items-center h-[8rem] w-full justify-center text-red-300 font-bold">
        Not allowed!
      </div>
    );

    setMessage(repo.name, message);
  }

  //
  // -------------------------------------------------------------------
  // Unstar Confirmation Popup
  // -------------------------------------------------------------------
  //
  function handleUnstarClick() {
    const dialog = (
      <section className="mt-6 w-[13rem]">
        <p className="mb-2 text-center">
          Are you sure you want to unstar this repo?
        </p>

        <div className="flex justify-center gap-4">
          <button
            className="px-2 py-2 bg-red-600 text-white rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              clearMessage();
              triggerFunnyUnstarMessage();
            }}
          >
            Yes
          </button>

          <button
            className="px-2 py-2 bg-gray-500 text-white rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              clearMessage();
            }}
          >
            No
          </button>
        </div>
      </section>
    );

    setMessage(repo.name, dialog);
  }

  //
  // -------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------
  //
  const starButtonClass = "h-[4rem] w-[4rem] flex items-center justify-center";

  return (
    <div className="text-m">
      {!repoStarred ? (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleStar();
          }}
          className={starButtonClass}
        >
          {starCount} ☆
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleUnstarClick();
          }}
          className={starButtonClass}
        >
          {starCount} ⭐
        </button>
      )}
    </div>
  );
}
