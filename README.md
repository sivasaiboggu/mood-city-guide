# Mood Map — Bengaluru walks for how you feel

Type how you feel — "lonely but adventurous" — and get a three-stop walking
route through Bengaluru, each stop explained in one line about why it fits
that exact mood. Same city, different feeling, different city.

## Run it

No build step, no server, no key needed. Open `index.html` in a browser
(or serve the folder with any static server). The app plans a route for
"lonely but adventurous" on load, so the page is never empty.

To rebuild the bundle after editing the sources:

```sh
node build.js
```

(`bundle.js` is generated from `data.js`, `engine.mjs` and `app.js` — ES
modules are blocked from `file://` by CORS, so the shipped script is one
classic bundle. The ESM sources are what the tests import.)

## How it works

1. **Mood parser** — a keyword lexicon turns free text into structured tags
   (energy, social, indoor/outdoor, budget, themes). Deterministic, local.
2. **Deterministic scorer** — ranks 48 seeded Bengaluru places by tag match,
   arc role, cost, and distance from the previous stop.
3. **The arc** — stop 1 decompresses (quiet/green/water), stop 2 explores
   (busy/food/culture), stop 3 rewards (views/sunset/food). Legs show walking
   minutes and km; the summary shows total distance, time and rough cost.
4. **Map** — Leaflet 1.9.4 (vendored) with numbered markers and an animated
   route line. A built-in street grid and green areas keep the map readable
   when OSM tiles cannot load.

The AI never ranks. With your own free Gemini key (Settings), Gemini only
rewrites the one-line "why" per stop. With your own free OpenRouteService
key, leg geometry and distances come from real street routing. Both fail
soft to demo data, and the page always says which mode it is in.

## Features

- Free-text mood + 6 canned mood chips
- Budget / time / energy filters
- "Another version" — deterministic regenerate (next-best stops)
- Save routes (localStorage, up to 12), shareable route links (`#r=`),
  copy route as text
- Settings for Gemini + OpenRouteService keys (localStorage only, never sent
  anywhere else)

## Verified versions (23 Nov 2026)

- Gemini model: `gemini-3.8-flash` (verified in Google AI Studio's model
  list); fallback `gemini-3.5-flash-lite` (`gemini-2.5-flash` is deprecated
  and auto-routes there from 1 Dec 2026).
- Leaflet 1.9.4 (current stable; 2.0 is still beta).
- OpenRouteService host is `https://api.openrouteservice.org`
  (`POST /v2/directions/foot-walking/geojson`); free Standard plan is
  10,000 directions/day as currently published.

## Tests

```sh
node --test tests/test.mjs
```

20 tests, 0 failures — parser, catalogue integrity, haversine, route arc,
budget/time/rain filters, determinism, regenerate, share round-trip,
why-line uniqueness.

Screenshots: `scripts/shot.py` (headless Chrome via CDP) —
`screenshots/desktop-1280.png` (1280px, scrollWidth == innerWidth),
`screenshots/mobile-390.png` (390px, scrollWidth == innerWidth),
`screenshots/desktop-full.png` (full page).

## Honest limits

- Demo data: 48 real Bengaluru places, seeded by hand. Coordinates are
  approximate (street-level), hours and costs are the usual published ones —
  check before you go.
- Without an ORS key, distances are straight-line estimates; real walking
  distance is longer (typically 20–40% on city streets).
- No live opening hours, crowds, prices or closures on free tiers.
- One city, seeded well, beats ten cities seeded thin. A second city typed
  live will be thin.
- Mood matching is keywords + tags, not psychology.

## Files

- `index.html`, `styles.css` — the app
- `data.js` — the 48-place Bengaluru catalogue + canned moods
- `engine.mjs` — parser, scorer, route builder, share encoding (tested)
- `app.js` — UI, map, Gemini + ORS clients, saved routes
- `build.js` — bundles the above into `bundle.js` for `file://` use
- `tests/test.mjs` — 20 tests
- `scripts/shot.py` — screenshot helper (headless Chrome via CDP)
- `vendor/` — Leaflet 1.9.4 + DM Serif Display (self-hosted)

## Licence

MIT — see `LICENSE`. Built by Sivasai Boggu, 2026.
