import { NextRequest, NextResponse } from "next/server";

// Everything is private except the tracker, the ingest endpoint, login, and
// the PWA plumbing (manifest, service worker, icons) — those must be
// reachable unauthenticated or they 302 to /login instead of installing.
const PUBLIC = [
  /^\/api\/t$/,
  /^\/p\.js$/,
  /^\/login$/,
  /^\/api\/login$/,
  /^\/manifest\.webmanifest$/,
  /^\/sw\.js$/,
  /^\/icon(\.\w+)?$/,
  /^\/apple-icon(\.\w+)?$/,
  /^\/icons\//,
];

async function expectedCookie(): Promise<string> {
  const data = new TextEncoder().encode(`${process.env.PULSE_PASS}|pulse-cookie`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((re) => re.test(pathname))) return NextResponse.next();
  if (req.cookies.get("pulse")?.value === (await expectedCookie())) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next|favicon\\.ico).*)"] };
