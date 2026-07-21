// Event folding: raw events land as one small blob each; the dashboard reads
// a per-site aggregate that is folded forward incrementally. Each event is
// fetched exactly once ever; frozen days never get relisted.
import { head, list, put } from "@vercel/blob";
import { unstable_cache } from "next/cache";

export type DayAgg = {
  views: number;
  visitors: Record<string, 1>;
  refs: Record<string, number>;
  paths: Record<string, number>;
  countries: Record<string, number>;
  regions: Record<string, number>;
  cities: Record<string, number>;
  devices: Record<string, number>;
};

export type SiteAgg = {
  days: Record<string, DayAgg>;
  // last folded event pathname per day, so refolding only touches new events
  cursors: Record<string, string>;
};

// g (region) and l (city) were added later, so events written before then omit them.
type RawEvent = { t: number; p: string; r: string; c: string; g?: string; l?: string; d: string; v: string };

const emptyDay = (): DayAgg => ({
  views: 0,
  visitors: {},
  refs: {},
  paths: {},
  countries: {},
  regions: {},
  cities: {},
  devices: {},
});

function nyDayOffset(offset: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", dateStyle: "short" }).format(
    new Date(Date.now() - offset * 86_400_000),
  );
}

// Private-store downloadUrls require the RW token as a bearer header.
function authedFetch(url: string): Promise<Response> {
  return fetch(url, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    cache: "no-store",
  });
}

async function readAgg(site: string): Promise<SiteAgg> {
  try {
    const meta = await head(`a/${site}.json`);
    const r = await authedFetch(meta.downloadUrl);
    if (r.ok) return (await r.json()) as SiteAgg;
  } catch {
    /* first run */
  }
  return { days: {}, cursors: {} };
}

function fold(day: DayAgg, e: RawEvent) {
  day.views++;
  day.visitors[e.v] = 1;
  if (e.r) day.refs[e.r] = (day.refs[e.r] ?? 0) + 1;
  day.paths[e.p] = (day.paths[e.p] ?? 0) + 1;
  if (e.c) day.countries[e.c] = (day.countries[e.c] ?? 0) + 1;
  // Days aggregated before regions/cities existed won't have these maps yet.
  if (e.g) {
    day.regions ??= {};
    day.regions[e.g] = (day.regions[e.g] ?? 0) + 1;
  }
  if (e.l) {
    day.cities ??= {};
    day.cities[e.l] = (day.cities[e.l] ?? 0) + 1;
  }
  day.devices[e.d] = (day.devices[e.d] ?? 0) + 1;
}

// Fetch in pathname order; stop at the first failure so the cursor never
// advances past an event we haven't folded.
async function fetchEventsOrdered(
  items: { pathname: string; downloadUrl: string }[],
): Promise<{ events: RawEvent[]; lastOk: string | null }> {
  const results: (RawEvent | null)[] = new Array(items.length).fill(null);
  const POOL = 10;
  for (let i = 0; i < items.length; i += POOL) {
    await Promise.all(
      items.slice(i, i + POOL).map(async (it, j) => {
        try {
          const r = await authedFetch(it.downloadUrl);
          results[i + j] = r.ok ? ((await r.json()) as RawEvent) : null;
        } catch {
          results[i + j] = null;
        }
      }),
    );
  }
  const events: RawEvent[] = [];
  let lastOk: string | null = null;
  for (let i = 0; i < items.length; i++) {
    const e = results[i];
    if (!e) break;
    events.push(e);
    lastOk = items[i].pathname;
  }
  return { events, lastOk };
}

async function foldSiteNow(site: string): Promise<SiteAgg> {
  const agg = await readAgg(site);
  let dirty = false;

  // Only today and yesterday can have unfolded events.
  for (const day of [nyDayOffset(0), nyDayOffset(1)]) {
    const cursor = agg.cursors[day] ?? "";
    const found: { pathname: string; downloadUrl: string }[] = [];
    let pageCursor: string | undefined;
    do {
      const page = await list({ prefix: `e/${site}/${day}/`, cursor: pageCursor, limit: 1000 });
      for (const b of page.blobs) {
        if (b.pathname > cursor) found.push({ pathname: b.pathname, downloadUrl: b.downloadUrl });
      }
      pageCursor = page.hasMore ? page.cursor : undefined;
    } while (pageCursor);
    if (!found.length) continue;

    found.sort((a, b) => (a.pathname < b.pathname ? -1 : 1));
    const { events, lastOk } = await fetchEventsOrdered(found);
    if (!events.length || !lastOk) continue;
    const dayAgg = (agg.days[day] ??= emptyDay());
    for (const e of events) fold(dayAgg, e);
    agg.cursors[day] = lastOk;
    dirty = true;
  }

  // Keep the aggregate bounded.
  for (const day of Object.keys(agg.days)) {
    if (day < nyDayOffset(90)) {
      delete agg.days[day];
      delete agg.cursors[day];
      dirty = true;
    }
  }

  if (dirty) {
    await put(`a/${site}.json`, JSON.stringify(agg), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
  }
  return agg;
}

// Fold at most every 3 minutes per site across instances.
export function getSiteAgg(site: string): Promise<SiteAgg> {
  return unstable_cache(() => foldSiteNow(site), [`pulse-fold-v2-${site}`], { revalidate: 180 })();
}
