import { NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { put } from "@vercel/blob";
import { siteById } from "@/lib/sites";

// Ingest endpoint. sendBeacon posts a JSON string with no content-type, so we
// read text and parse; responses carry permissive CORS so any of the tracked
// sites can post here.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function nyDay(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", dateStyle: "short" }).format(new Date());
}

function deviceOf(ua: string): string {
  if (/iPad|Tablet/i.test(ua)) return "Tablet";
  if (/Mobi|iPhone|Android/i.test(ua)) return "Mobile";
  return "Desktop";
}

function refHost(raw: string, selfHost: string): string {
  if (!raw) return "";
  try {
    const h = new URL(raw).hostname.replace(/^www\./, "");
    return h === selfHost ? "" : h;
  } catch {
    return "";
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  try {
    const { s, p, r } = JSON.parse(await req.text()) as { s?: string; p?: string; r?: string };
    const site = siteById(s ?? "");
    if (!site) return new Response(null, { status: 204, headers: CORS });

    const ua = req.headers.get("user-agent") ?? "";
    // Skip the obvious bots; the visitor hash keeps the rest comparable.
    if (/bot|crawler|spider|preview|vercel-screenshot/i.test(ua)) {
      return new Response(null, { status: 204, headers: CORS });
    }
    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
    const day = nyDay();
    const visitor = createHash("sha256").update(`${site.id}|${ip}|${ua}|${day}`).digest("hex").slice(0, 16);

    // Geo comes from Vercel's edge headers. Country is the 2-letter code; a
    // region code ("NY") only means something next to its country, so it is
    // stored prefixed as "US-NY". City can be percent-encoded ("San%20Jose").
    const country = req.headers.get("x-vercel-ip-country") ?? "";
    const regionCode = req.headers.get("x-vercel-ip-country-region") ?? "";
    let city = req.headers.get("x-vercel-ip-city") ?? "";
    try {
      city = decodeURIComponent(city);
    } catch {
      /* leave city as received */
    }

    // event fields: t=time p=path r=referrer-host c=country
    // g=region(US-NY) l=city d=device v=visitor-hash
    const event = {
      t: Date.now(),
      p: (p ?? "/").slice(0, 200),
      r: refHost(r ?? "", site.host).slice(0, 100),
      c: country,
      g: country && regionCode ? `${country}-${regionCode}` : "",
      l: city.slice(0, 60),
      d: deviceOf(ua),
      v: visitor,
    };

    await put(`e/${site.id}/${day}/${event.t}-${Math.random().toString(36).slice(2, 8)}.json`, JSON.stringify(event), {
      access: "private",
      addRandomSuffix: false,
      contentType: "application/json",
    });
  } catch {
    /* never make the host page care */
  }
  return new Response(null, { status: 204, headers: CORS });
}
