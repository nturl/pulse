import { SITES } from "@/lib/sites";
import { getSiteAgg, type SiteAgg } from "@/lib/store";
import { Sparkline, type DayPoint } from "@/components/Sparkline";

export const dynamic = "force-dynamic";

// Chart spans the full retention window (see store.ts); top lists default to
// a shorter slice of it. Formatters are module-level singletons since both
// are called dozens of times per site across ~30 sites per render.
const DAYS_SHOWN = 90;
const dayKeyFormat = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", dateStyle: "short" });
const dayLabelFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

function nyDayOffset(offset: number): string {
  return dayKeyFormat.format(new Date(Date.now() - offset * 86_400_000));
}

function series(agg: SiteAgg): DayPoint[] {
  const out: DayPoint[] = [];
  for (let i = DAYS_SHOWN - 1; i >= 0; i--) {
    const day = nyDayOffset(i);
    const d = agg.days[day];
    out.push({
      day,
      label: dayLabelFormat.format(new Date(`${day}T12:00:00`)),
      visitors: d ? Object.keys(d.visitors).length : 0,
      views: d?.views ?? 0,
    });
  }
  return out;
}

function topOf(
  agg: SiteAgg,
  key: "refs" | "paths" | "countries" | "regions" | "cities" | "devices",
  days = 30,
  n = 6,
) {
  const merged: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = agg.days[nyDayOffset(i)];
    if (!d) continue;
    // ?? {} covers days aggregated before regions/cities were tracked.
    for (const [k, v] of Object.entries(d[key] ?? {})) merged[k] = (merged[k] ?? 0) + v;
  }
  return Object.entries(merged)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">{label}</p>
      <p className="mt-1 font-serif text-3xl tabular-nums">{value.toLocaleString()}</p>
    </div>
  );
}

function TopList({ title, rows, icon }: { title: string; rows: [string, number][]; icon?: (k: string) => string }) {
  const max = rows[0]?.[1] ?? 1;
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">{title}</p>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Nothing yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map(([k, v]) => (
            <li key={k} className="relative overflow-hidden rounded-lg">
              <span
                className="absolute inset-y-0 left-0 rounded-lg bg-sky-500/15"
                style={{ width: `${Math.max(6, (v / max) * 100)}%` }}
              />
              <span className="relative flex items-center justify-between gap-2 px-2.5 py-1.5 text-sm">
                <span className="truncate text-slate-200">
                  {icon ? `${icon(k)} ` : ""}
                  {k}
                </span>
                <span className="shrink-0 tabular-nums text-slate-400">{v.toLocaleString()}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function Dashboard() {
  const aggs = await Promise.all(SITES.map(async (s) => ({ site: s, agg: await getSiteAgg(s.id) })));

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10">
      <header className="mb-8 flex items-baseline justify-between">
        <div>
          <h1 className="font-serif text-5xl tracking-tight">Pulse</h1>
          <p className="mt-1.5 text-sm text-slate-400">Noel&rsquo;s sites at a glance. Folds every 3 minutes.</p>
        </div>
        <span className="text-xs text-slate-500">{SITES.length} site{SITES.length === 1 ? "" : "s"}</span>
      </header>

      <div className="space-y-10">
        {aggs.map(({ site, agg }) => {
          const pts = series(agg);
          const today = pts[pts.length - 1];
          const week = pts.slice(-7);
          const month = pts.slice(-30);
          const quarter = pts; // DAYS_SHOWN already covers the full 90-day retention window
          return (
            <section key={site.id}>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="font-serif text-2xl">{site.name}</h2>
                <a href={site.url} target="_blank" rel="noreferrer" className="text-xs text-sky-400 hover:underline">
                  {site.host} ↗
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Tile label="Visitors today" value={today.visitors} />
                <Tile label="Views today" value={today.views} />
                <Tile label="Visitors 7d" value={week.reduce((a, p) => a + p.visitors, 0)} />
                <Tile label="Views 7d" value={week.reduce((a, p) => a + p.views, 0)} />
                <Tile label="Visitors 30d" value={month.reduce((a, p) => a + p.visitors, 0)} />
                <Tile label="Views 30d" value={month.reduce((a, p) => a + p.views, 0)} />
                <Tile label="Visitors 90d" value={quarter.reduce((a, p) => a + p.visitors, 0)} />
                <Tile label="Views 90d" value={quarter.reduce((a, p) => a + p.views, 0)} />
              </div>

              <div className="mt-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                    Last {DAYS_SHOWN} days
                  </p>
                  <p className="text-[11px] text-slate-500">
                    <span className="text-sky-400">visitors</span> · <span className="text-sky-700">views</span>
                  </p>
                </div>
                <Sparkline data={pts} />
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <TopList title="Referrers · 30d" rows={topOf(agg, "refs")} />
                <TopList title="Pages · 30d" rows={topOf(agg, "paths")} />
                <TopList title="Cities · 30d" rows={topOf(agg, "cities")} />
                <TopList title="Devices · 30d" rows={topOf(agg, "devices")} />
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-10 text-center text-[11px] text-slate-600">
        First-party, cookieless. Visitors are a daily-rotating anonymous hash.
      </p>
    </main>
  );
}
