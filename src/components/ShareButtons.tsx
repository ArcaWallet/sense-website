"use client";

import { useRef, useState, useSyncExternalStore } from "react";

type CopyState = "idle" | "copied" | "failed";

const socialClass =
  "inline-flex items-center gap-[7px] rounded-full bg-ink px-[16px] py-[8px] text-[13px] font-semibold text-bone no-underline transition-colors hover:bg-flame focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

const copyStateClass: Record<CopyState, string> = {
  idle: "text-ink shadow-[inset_0_0_0_1.5px_rgba(16,19,20,.28)] hover:bg-flame hover:text-white hover:shadow-[inset_0_0_0_1.5px_#e8503a]",
  copied: "bg-flame text-white shadow-[inset_0_0_0_1.5px_#e8503a]",
  failed: "text-flame shadow-[inset_0_0_0_1.5px_rgba(232,80,58,.55)]",
};

const copyLabel: Record<CopyState, string> = {
  idle: "Copy link",
  copied: "Link copied",
  failed: "Couldn't copy",
};

function Icon({ name }: { name: "link" | "check" | "alert" | "share" }) {
  const paths = {
    link: (
      <>
        <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
        <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
      </>
    ),
    check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
    alert: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5.5M12 16.5v.01" />
      </>
    ),
    share: (
      <>
        <path d="M12 3v12M7.5 7.5L12 3l4.5 4.5" />
        <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[14px] w-[14px] flex-none"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

const noSubscription = () => () => {};

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The server can't know what the visitor's browser supports, so it renders
  // false and the browser re-checks after loading.
  const canNativeShare = useSyncExternalStore(
    noSubscription,
    () => typeof navigator.share === "function",
    () => false
  );

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function copyLink() {
    clearTimeout(resetTimer.current);
    try {
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    resetTimer.current = setTimeout(() => setCopyState("idle"), 2000);
  }

  async function openShareMenu() {
    try {
      await navigator.share({ title, url });
    } catch {
      // Closing the share menu without picking an app also lands here.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-[10px]">
      <span className="font-mono text-[11px] tracking-[0.14em] text-ink/45 uppercase">
        Share
      </span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={socialClass}
      >
        X
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={socialClass}
      >
        Facebook
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={socialClass}
      >
        LinkedIn
      </a>
      {canNativeShare && (
        <button type="button" onClick={openShareMenu} className={socialClass}>
          <Icon name="share" />
          More options
        </button>
      )}
      <span aria-hidden="true" className="mx-[4px] h-[22px] w-px bg-ink/10" />
      <button
        type="button"
        onClick={copyLink}
        className={`inline-flex items-center gap-[7px] rounded-full px-[15px] py-[8px] text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${copyStateClass[copyState]}`}
      >
        <Icon name={copyState === "copied" ? "check" : copyState === "failed" ? "alert" : "link"} />
        <span aria-live="polite">{copyLabel[copyState]}</span>
      </button>
    </div>
  );
}
