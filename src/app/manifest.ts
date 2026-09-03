import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pulse",
    short_name: "Pulse",
    description: "Noel's sites at a glance. First-party, cookieless analytics.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#0ea5e9",
    icons: [
      { src: "/icons/manifest-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/manifest-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/manifest-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
