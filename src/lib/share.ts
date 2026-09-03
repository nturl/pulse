// Native share where it exists (every phone, Safari/Chrome on macOS),
// clipboard fallback elsewhere.
export async function sharePage(): Promise<"shared" | "copied" | "failed"> {
  const data = {
    title: "Pulse",
    text: "Noel's sites at a glance.",
    url: "https://pulse-nturls-projects.vercel.app",
  };
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(data);
    } catch {
      /* user closed the share sheet; nothing to do */
    }
    return "shared";
  }
  try {
    await navigator.clipboard.writeText(data.url);
    return "copied";
  } catch {
    return "failed";
  }
}
