"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export type DayPoint = { day: string; label: string; visitors: number; views: number };

export function Sparkline({ data }: { data: DayPoint[] }) {
  return (
    <div className="h-36 w-full overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 6, left: 6, bottom: 0 }}>
          <defs>
            <linearGradient id="pulse-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={26}
          />
          <Tooltip
            formatter={(v, name) => [String(v), name === "visitors" ? "Visitors" : "Views"]}
            labelFormatter={(l) => l}
            contentStyle={{
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              fontSize: 12,
              color: "#e2e8f0",
            }}
          />
          <Area type="monotone" dataKey="views" stroke="#0369a1" strokeWidth={1.5} fill="none" />
          <Area type="monotone" dataKey="visitors" stroke="#38bdf8" strokeWidth={2.5} fill="url(#pulse-area)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
