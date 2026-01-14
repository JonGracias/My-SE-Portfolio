"use client";

import { Repo } from "@/lib/repos";
import { useStars } from "@/context/StarContext";
import { useUIContext } from "@/context/UIContext";
import { useAuth } from "@/context/AuthProvider";
import GitHubAuthButton from "./GitHubLogButton"

export default function StarButton({ repo }: { repo: Repo }) {
  const {
    starred,
    count,
    starRepo,
    isLogin,
    isStarring,
  } = useStars();

  const { hoveredRepo, setMessage, clearMessage  } = useUIContext();
  const { isLogged  } = useAuth();
  const repoKey = repo.name;
  const isActive = hoveredRepo?.name === repoKey;
  const isStarred = starred[repoKey];
  const starCount = count[repoKey] ?? repo.stargazers_count;

  //
  // -------------------------------------------------------------
  // BUTTON LABEL LOGIC
  // -------------------------------------------------------------
  //
  let label = "";
  if (isStarring) label = "Starring…";

  //
  // -------------------------------------------------------------
  // HANDLE STAR CLICK
  // -------------------------------------------------------------
  //
async function handleStar() {
  if (isStarring) return;

  if (!isLogged) {
    setMessage(
      repo.name,
      <div className="w-full h-full flex items-center justify-center">
        <GitHubAuthButton showStatus={false}/>
      </div>
    );
    return;
  }

  await starRepo(repo.owner, repo.name);
}


  //
  // -------------------------------------------------------------
  // FUNNY UNSTAR MESSAGE
  // -------------------------------------------------------------
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
  // -------------------------------------------------------------
  // UNSTAR CONFIRMATION POPUP
  // -------------------------------------------------------------
  //
  function handleUnstarClick() {
    const dialog = (
      <section className="mt-6">
        <p className="mb-2 text-center">Are you sure you want to unstar this repo?</p>

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
  // -------------------------------------------------------------
  // DISABLED STATE
  // -------------------------------------------------------------
  //
  const disabled = isLogin || isStarring;

  //
  // -------------------------------------------------------------
  // STYLES
  // -------------------------------------------------------------
  //
  const starButtonClass =
    "h-[4rem] w-[4rem] flex flex-col items-center justify-center text-center";

  //
  // -------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------
  //
  return (
    <div className="text-m select-none">
      {!isStarred ? (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleStar();
          }}
          className={starButtonClass}
          disabled={disabled}
        >
          <div className="text-lg">{starCount} ☆</div>
          {label && isActive && <div className="text-xs opacity-70">{label}</div>}
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleUnstarClick();
          }}
          className={starButtonClass}
          disabled={disabled}
        >
          <div className="text-lg">{starCount} ⭐</div>
          {label && isActive && <div className="text-xs opacity-70">{label}</div>}
        </button>
      )}
    </div>
  );
}
