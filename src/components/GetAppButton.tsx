"use client";

import { useEffect, useState } from "react";
import { InstallSheet } from "./InstallSheet";

// Header entry point for the install sheet; hides itself once the site is
// already running standalone (installed).
export function GetAppButton() {
  const [standalone, setStandalone] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setStandalone(
      window.matchMedia?.("(display-mode: standalone)").matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true,
    );
  }, []);

  if (standalone) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="pressable inline-flex shrink-0 items-center gap-1.5 rounded-full border border-sky-500/30 bg-slate-900/80 px-3.5 py-1.5 text-xs font-semibold text-sky-400 hover:border-sky-500/50"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <rect x="6.5" y="2.5" width="11" height="19" rx="3" />
          <path d="M10.5 18.5h3" />
        </svg>
        Get the app
      </button>
      <InstallSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
