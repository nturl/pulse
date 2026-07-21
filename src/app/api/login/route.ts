import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const pass = String(form.get("pass") ?? "");
  const url = req.nextUrl.clone();

  if (!process.env.PULSE_PASS || pass !== process.env.PULSE_PASS) {
    url.pathname = "/login";
    url.search = "?bad=1";
    return NextResponse.redirect(url, 303);
  }

  url.pathname = "/";
  url.search = "";
  const res = NextResponse.redirect(url, 303);
  res.cookies.set("pulse", createHash("sha256").update(`${process.env.PULSE_PASS}|pulse-cookie`).digest("hex"), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 180 * 24 * 3600,
    path: "/",
  });
  return res;
}
