"use client";

interface MessageShellProps {
  children: React.ReactNode;
  onClose: () => void;
}

export default function MessageShell({ children, onClose }: MessageShellProps) {
  return (
    <section
      className="
        bg-gray-100 dark:bg-neutral-800
        border border-gray-300 dark:border-neutral-700
        shadow-lg rounded-xl
        overflow-y-auto overflow-x-hidden
        custom-scrollbar
        w-[14rem] h-[14rem]
        flex items-center justify-center
      "
    >
      {/* Close Button */}
      <div className="absolute top-2 right-2 flex items-center justify-end p-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="
            w-7 h-7
            flex items-center justify-center
            rounded-md
            bg-neutral-300 dark:bg-neutral-700
            hover:bg-neutral-400 dark:hover:bg-neutral-600
            text-black dark:text-white
            font-bold shadow
          "
        >
          x
        </button>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center p-4">
        {children}
      </div>
    </section>
  );
}