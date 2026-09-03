"use client";

import { useEffect, useState } from "react";
import { sharePage } from "@/lib/share";

// Chrome/Edge on Android (and desktop) fire this; iOS Safari never does.
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" />
      <path d="m8 7 4-4 4 4" />
      <path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
    </svg>
  );
}

function AddSquareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M12 8.5v7M8.5 12h7" />
    </svg>
  );
}

/* Depersonalized mockups of the three iOS moments, drawn in the app's own style. */

function BrowserBarMock() {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/80 py-2 pl-4 pr-2">
      <span className="text-xs text-slate-400">pulse-nturls-projects.vercel.app</span>
      <span className="grid h-8 w-8 place-items-center rounded-full bg-sky-500/15 text-sky-400 ring-2 ring-sky-500">
        <ShareIcon />
      </span>
    </div>
  );
}

function ShareMenuMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80">
      <div className="space-y-2.5 px-4 py-3 opacity-35">
        <div className="h-2.5 w-32 rounded-full bg-slate-600" />
        <div className="h-2.5 w-24 rounded-full bg-slate-600" />
      </div>
      <div className="flex items-center justify-between border-t border-white/10 bg-sky-500/10 px-4 py-2.5">
        <span className="text-sm font-semibold text-slate-100">Add to Home Screen</span>
        <span className="text-sky-400">
          <AddSquareIcon />
        </span>
      </div>
    </div>
  );
}

function AddDialogMock() {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2.5">
      <div className="flex items-center gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px]"
          style={{ background: "radial-gradient(120% 120% at 30% 20%, #0c4a6e, #020617)" }}
        >
          <svg width="22" height="22" viewBox="0 0 32 32">
            <polyline
              points="4,16 8,16 10.5,12 13,16 15,16 17.5,4 20.5,27 23,16 28,16"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="text-sm font-medium text-slate-100">Pulse</span>
      </div>
      <span className="rounded-full bg-sky-600 px-3.5 py-1 text-xs font-semibold text-white">Add</span>
    </div>
  );
}

function StepCaption({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-[13px] font-medium text-slate-300">
      <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-[11px] font-bold text-white">
        {n}
      </span>
      {children}
    </p>
  );
}

export function InstallSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [shareLabel, setShareLabel] = useState("Share it with a friend");

  useEffect(() => {
    setIos(/iPad|iPhone|iPod/.test(navigator.userAgent));
    setInstalled(
      window.matchMedia?.("(display-mode: standalone)").matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true,
    );
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="animate-sheet-up w-full max-w-md rounded-t-3xl border border-white/10 bg-slate-900 p-5 shadow-xl sm:rounded-3xl"
        style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl">Get the app</h2>
          <button onClick={onClose} aria-label="Close" className="text-lg text-slate-400 hover:text-slate-200">
            ✕
          </button>
        </div>

        {installed ? (
          <p className="text-sm leading-relaxed text-slate-200">
            You already have it. Pulse is on your home screen and opens full-screen like an app.
          </p>
        ) : installEvent ? (
          <div className="space-y-3">
            <p className="text-sm leading-snug text-slate-200">
              One tap puts Pulse on your home screen. It opens full-screen, like an app.
            </p>
            <button
              onClick={async () => {
                await installEvent.prompt();
                onClose();
              }}
              className="pressable w-full rounded-xl bg-sky-600 py-2.5 text-sm font-medium text-white hover:bg-sky-700"
            >
              Install Pulse
            </button>
          </div>
        ) : (
          <div>
            {!ios && (
              <p className="mb-3 text-sm leading-snug text-slate-200">
                On your phone, open <span className="font-semibold">pulse-nturls-projects.vercel.app</span>, then:
              </p>
            )}
            <ol className="space-y-4">
              <li>
                <StepCaption n={1}>
                  Tap <span className="font-semibold">Share</span> in Safari (or whichever browser you use)
                </StepCaption>
                <BrowserBarMock />
              </li>
              <li>
                <StepCaption n={2}>
                  Scroll down, tap <span className="font-semibold">Add to Home Screen</span>
                </StepCaption>
                <ShareMenuMock />
              </li>
              <li>
                <StepCaption n={3}>
                  Tap <span className="font-semibold">Add</span>
                </StepCaption>
                <AddDialogMock />
              </li>
            </ol>
            {!ios && (
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                On Android it&rsquo;s one tap: choose <span className="font-medium">Install</span> from the browser
                menu.
              </p>
            )}
          </div>
        )}

        <button
          onClick={async () => {
            if ((await sharePage()) === "copied") {
              setShareLabel("Link copied");
              setTimeout(() => setShareLabel("Share it with a friend"), 2000);
            }
          }}
          className="pressable mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-200 hover:border-sky-500/50"
        >
          <ShareIcon />
          {shareLabel}
        </button>

        <p className="mt-3 text-center text-[11px] text-slate-500">
          No app store, nothing to download. It&rsquo;s free.
        </p>
      </div>
    </div>
  );
}
