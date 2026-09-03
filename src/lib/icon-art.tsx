import type { ReactElement } from "react";

// Shared app-icon art: a bold pulse/heartbeat line on the dashboard's own
// dark-sky gradient. Scales by size; used by the favicon, apple icon, and
// PWA manifest icons. Kept inside the maskable safe zone (roughly the
// middle 80%) so Android's circular/squircle crop never clips the spike.
export function iconArt(size: number): ReactElement {
  const stroke = Math.max(2, Math.round(size * 0.09));
  // A heartbeat trace: flat, small bump, sharp spike up then down, flat.
  const points = [
    [4, 16],
    [8, 16],
    [10.5, 12],
    [13, 16],
    [15, 16],
    [17.5, 4],
    [20.5, 27],
    [23, 16],
    [28, 16],
  ]
    .map(([x, y]) => `${(x / 32) * size},${(y / 32) * size}`)
    .join(" ");

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(120% 120% at 30% 20%, #0c4a6e, #020617)",
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <polyline
          points={points}
          fill="none"
          stroke="#38bdf8"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
