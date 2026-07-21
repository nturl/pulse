// Registry of tracked sites. Adding a site = one entry here + the snippet on
// that site's layout:
//   <script defer data-site="<id>" src="https://<pulse-host>/p.js"></script>
export type Site = { id: string; name: string; host: string; url: string };

export const SITES: Site[] = [
  { id: "topsail", name: "Topsail Traffic", host: "topsailtraffic.com", url: "https://topsailtraffic.com" },
  { id: "personal", name: "Personal Site", host: "noelturlington.xyz", url: "https://noelturlington.xyz" },
  { id: "wayline", name: "Wayline", host: "wayline-lyart.vercel.app", url: "https://wayline-lyart.vercel.app" },
  { id: "fuel", name: "Fuel", host: "fuel-two-steel.vercel.app", url: "https://fuel-two-steel.vercel.app" },
  { id: "kite", name: "Kite Spots", host: "pr-kite-dashboard-v3.vercel.app", url: "https://pr-kite-dashboard-v3.vercel.app" },
  { id: "jobtracker", name: "Job Tracker", host: "job-tracker-beta-neon.vercel.app", url: "https://job-tracker-beta-neon.vercel.app" },

  // Topsail web-design venture — restaurant demos
  { id: "beauchaines-211", name: "Beauchaine's 211", host: "beauchaines-211.vercel.app", url: "https://beauchaines-211.vercel.app" },
  { id: "oval-and-ale", name: "Oval & Ale", host: "oval-and-ale.vercel.app", url: "https://oval-and-ale.vercel.app" },
  { id: "madisons-prime-rib", name: "Madison's Prime Rib", host: "madisons-prime-rib.vercel.app", url: "https://madisons-prime-rib.vercel.app" },
  { id: "city-cafe-holly-ridge", name: "City Café", host: "city-cafe-holly-ridge.vercel.app", url: "https://city-cafe-holly-ridge.vercel.app" },
  { id: "southern-roots-grille", name: "Southern Roots Grille", host: "southern-roots-grille.vercel.app", url: "https://southern-roots-grille.vercel.app" },
  { id: "riverview-cafe-1946", name: "Riverview Cafe", host: "riverview-cafe-1946.vercel.app", url: "https://riverview-cafe-1946.vercel.app" },
  { id: "buddys-crab-house", name: "Buddy's Crab House", host: "buddys-crab-house.vercel.app", url: "https://buddys-crab-house.vercel.app" },
  { id: "lorelei-pub-grill", name: "Lo-Re-Lei Pub & Grill", host: "lorelei-pub-grill.vercel.app", url: "https://lorelei-pub-grill.vercel.app" },
  { id: "the-fast-fish", name: "The Fast Fish", host: "the-fast-fish.vercel.app", url: "https://the-fast-fish.vercel.app" },
  { id: "lewis-seafood-shack", name: "Lewis Seafood Shack", host: "lewis-seafood-shack.vercel.app", url: "https://lewis-seafood-shack.vercel.app" },
  { id: "jolly-roger-grill", name: "Jolly Roger Grill", host: "jolly-roger-grill.vercel.app", url: "https://jolly-roger-grill.vercel.app" },
  { id: "tiki-turtles", name: "Tiki Turtle's", host: "tiki-turtles.vercel.app", url: "https://tiki-turtles.vercel.app" },
  { id: "locals-ice-cream", name: "Locals Ice Cream", host: "locals-ice-cream.vercel.app", url: "https://locals-ice-cream.vercel.app" },
  { id: "bahama-mamas", name: "Bahama Mama's", host: "bahama-mamas.vercel.app", url: "https://bahama-mamas.vercel.app" },
  { id: "surf-break-nutrition", name: "Surf Break Nutrition", host: "surf-break-nutrition.vercel.app", url: "https://surf-break-nutrition.vercel.app" },
  { id: "southern-sweets", name: "Southern Sweets", host: "southern-sweets.vercel.app", url: "https://southern-sweets.vercel.app" },
  { id: "emr-wings", name: "'Em R Wings", host: "emr-wings.vercel.app", url: "https://emr-wings.vercel.app" },
  { id: "mason-dixon-hotdog", name: "Mason-Dixon Hotdog", host: "mason-dixon-hotdog.vercel.app", url: "https://mason-dixon-hotdog.vercel.app" },
  { id: "bombshell-coffee", name: "Bombshell Coffee", host: "bombshell-coffee.vercel.app", url: "https://bombshell-coffee.vercel.app" },

  // Topsail web-design venture — medical demos
  { id: "barnes-chiropractic", name: "Barnes Chiropractic", host: "barnes-chiropractic.vercel.app", url: "https://barnes-chiropractic.vercel.app" },
  { id: "valjoy-beach-care", name: "Valjoy Beach Care", host: "valjoy-beach-care.vercel.app", url: "https://valjoy-beach-care.vercel.app" },
  { id: "zambrowski-dentistry", name: "Zambrowski Dentistry", host: "zambrowski-dentistry.vercel.app", url: "https://zambrowski-dentistry.vercel.app" },
  { id: "oneil-chiropractic", name: "O'Neil Family Chiropractic", host: "oneil-chiropractic.vercel.app", url: "https://oneil-chiropractic.vercel.app" },
  { id: "hampstead-optometry", name: "Hampstead Optometry", host: "hampstead-optometry.vercel.app", url: "https://hampstead-optometry.vercel.app" },
  { id: "shoreline-health", name: "Shoreline Health", host: "shoreline-health.vercel.app", url: "https://shoreline-health.vercel.app" },
  { id: "primary-vision-care", name: "Primary Vision Care", host: "primary-vision-care.vercel.app", url: "https://primary-vision-care.vercel.app" },
  { id: "holly-ridge-healthcare", name: "Holly Ridge Healthcare", host: "holly-ridge-healthcare.vercel.app", url: "https://holly-ridge-healthcare.vercel.app" },
  { id: "raise-the-bar-therapy", name: "Raise The Bar Therapy", host: "raise-the-bar-therapy.vercel.app", url: "https://raise-the-bar-therapy.vercel.app" },
];

export function siteById(id: string): Site | undefined {
  return SITES.find((s) => s.id === id);
}
