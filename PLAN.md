# Mood Map — Mood-based city guide (project #7)

## Deepened plan (SaaS level, demoable in 24–48h)

### 1. One-sentence pitch
Type how you feel — "lonely but adventurous" — and get a three-stop walking
route through Bengaluru, each stop explained in one line about why it fits
that exact mood.

### 2. Who it is for
- Someone new to a city, or bored of their own neighbourhood, who wants the
  city to meet them where they are emotionally, not just geographically.
- Demo audience: hackathon judges, then anyone planning a slow afternoon.

### 3. Core promise
Same city, different feeling, different city. The route is built around an
arc — decompress, explore, reward — not around the shortest path.

### 4. Feature set (v1, this build)
1. **Free-text mood input** with 6 canned mood chips ("lonely but adventurous",
   "tired but curious", "homesick and hungry", "stressed, need air",
   "happy and want a crowd", "rainy day, indoors").
2. **Mood parser** — keyword lexicon → structured tags (energy, social,
   indoor/outdoor, pace, budget, themes). Deterministic, no key needed.
3. **Deterministic scorer** — ranks the 48-place seeded catalogue by tag match,
   arc role, cost, and distance from the previous stop. The LLM never ranks.
4. **Three-stop route with an arc** — stop 1 decompress (quiet/green/water),
   stop 2 explore (busy/food/culture), stop 3 reward (views/sunset/food).
   Legs show walking minutes and km; totals show distance, time and cost.
5. **Leaflet map** — numbered markers, animated route polyline, click a stop
   card to fly to it, popups with hours and the why-line. Works offline: a
   built-in street grid and green areas keep the map readable when OSM tiles
   cannot load.
6. **Filters** — budget (any / under ₹150 a stop), time (any / under 2 hours),
   energy (from my words / low / medium / high).
7. **Regenerate** ("Another version") — deterministic offset picks the
   next-best set of stops, so the demo can re-roll live.
8. **Save routes** — localStorage, up to 12, with open/delete.
9. **Shareable route link** — `#r=` base64url payload (mood + stop ids);
   opening it rebuilds that exact route.
10. **Copy as text** — plain-text route for pasting into a message.
11. **Settings** — free Gemini key + free OpenRouteService key + model picker,
    stored in localStorage only. With a Gemini key, the one-line "why" per stop
    is rewritten by the model (ranking stays local). With an ORS key, leg
    geometry and distances come from real street routing.
12. **Honest offline note** — the page always says plainly whether it is
    running on demo data, template why-lines, or live services.

### 5. Out of scope for v1 (v2 ideas)
- More cities (each needs its own 40–60 place seed; a second city typed live
  is thin by design — see Honest limits).
- Live opening hours, crowds, prices, closures (no free tier gives these
  reliably).
- Accounts, sync, social sharing, turn-by-turn navigation.
- Overpass live-place supplement (planned in the original plan; cut because
  Overpass is fair-use, slow, and would break the demo — the seeded catalogue
  plus ORS is the reliable path; revisit with a 5s timeout and seeded fallback).
- Multi-day itineraries, group moods, weather-aware re-planning.

### 6. Data model
- **Place**: id, name, area, lat, lon, kind (park/lake/street/cafe/food/
  viewpoint/culture/market/bookshop/temple), cost (₹ per person, 0 = free),
  hours (usual published hours), tags[] (from a fixed vocabulary:
  quiet, green, water, busy, social, solo, food, views, sunset, culture,
  art, books, coffee, heritage, music, shopping, morning, night, cheap,
  free, indoor, outdoor, rain, explore, people, low-energy, birds, hike,
  animals, science, history, theatre, beer, burgers, streetfood, bargain,
  drive, shade), vibe (one human line).
- **Mood**: raw text, tags[], energy (low/medium/high), social
  (solo/social/either), setting (indoor/outdoor/either), budget (low/any).
- **Route**: mood, parsed mood, stops[3] (place + role + why + score),
  legs[2] (from/to, km, min, points[]), totalKm, walkMin, stayMin (35 min
  per stop), totalMin, totalCost, geometry ("demo" = straight-line estimate,
  "ors" = real street routing).
- **Saved route**: mood, stop names, km, cost, saved-at timestamp.
- **Share payload**: { m: mood text, s: [stop ids] }, base64url in the hash.

### 7. Architecture
Plain static site — no build step at runtime, no server, no database.
`index.html` + `styles.css` + `bundle.js` (generated from `data.js`,
`engine.mjs`, `app.js` by `node build.js`; ES modules are blocked from
`file://` by CORS, so the bundle is a single classic script).
Leaflet 1.9.4 vendored locally (`vendor/`), DM Serif Display self-hosted
(`vendor/fonts/`), OSM raster tiles with attribution when online.
- Browser → local mood parser → deterministic scorer → route builder →
  Leaflet render.
- Optional, only with user-pasted keys: Gemini `generateContent` (writes the
  why-lines only) and ORS `POST /v2/directions/foot-walking/geojson`
  (replaces leg geometry + distances). Both fail soft to demo data.
- No keys exist in this VM and none are baked in. Nothing is sent anywhere
  without a key the user pasted themselves.

### 8. Verified versions (checked 23 Nov 2026)
- **Gemini model**: the plan's `gemini-3.8-flash` is real — it appears in
  Google AI Studio's model list (`gemini-3.8-flash`). `gemini-2.5-flash` is
  deprecated and routes to `gemini-3.5-flash-lite` from 1 Dec 2026, so the
  fallback model is `gemini-3.5-flash-lite`. Default: `gemini-3.8-flash`.
- **Leaflet**: 1.9.4 is the current stable release; 2.0 is still beta
  (2.0.0-beta.1, Nov 2026). Using 1.9.4, vendored.
- **OpenRouteService**: the live host is `https://api.openrouteservice.org`
  (the plan's `api.heigit.org` is wrong for the public API). Endpoint:
  `POST /v2/directions/{profile}/geojson`, profile `foot-walking`,
  `Authorization` header with the key. Free Standard plan: 10,000
  directions/day as currently published (the plan's 2,000/day figure is
  out of date).
- **Demo city**: Bengaluru, 48 seeded places. Coordinates are approximate
  (street-level), hours/costs are the usual published ones.

### 9. Complete user flow (end to end)
1. Land on the page. A route for "lonely but adventurous" is already planned
   (no key, no click) so the page is never empty.
2. Read the intro and the offline-demo note; see the map with the route drawn.
3. Type a feeling (or tap a chip) → "Plan my walk". The readback line says
   how the words were understood ("solo · quiet · explore · views — high
   energy, solo").
4. Summary appears: km, total time, rough cost, 3 stops. Stop cards show the
   why-line, area, hours, cost, and the walk to the next stop.
5. Tap a stop card (or marker) → map flies to it, popup shows the same detail.
6. Not right? Change a filter or press "Another version" for the next-best set.
7. Happy with it? Save it (Saved routes, reopenable), copy the share link
   (opens the exact route), or copy it as text.
8. Optional: Settings → paste a free Gemini key and/or ORS key → plan again;
   the note updates to say which live services are on.
9. A shared link (`#r=…`) opens straight to that route.

### 10. 2-minute demo script
- **0:00–0:15** — "Everyone's maps optimise for fastest. This one optimises
  for how you feel." Type "lonely but adventurous".
- **0:15–0:50** — Route animates in. Tap stop 1 (quiet lake, "few people,
  room to think"), stop 2 (temple, calm on a busy road), stop 3 (bookshop
  café, the reward).
- **0:50–1:30** — Change the mood to "tired but curious" live; the route
  re-draws to shorter, calmer, indoor stops — proof it is not a canned
  screenshot. Press "Another version" once.
- **1:30–2:00** — Show time, distance, total cost; copy the share link and
  open it in a second tab. Close: "Same city, different feeling, different
  city."

### 11. Design identity
- **References** (from the playbook): Mobbin (app flow — single-column input
  → results, no landing-page chrome), Land-book (editorial landing type,
  big serif headline), Minimal Gallery (restrained palette, one accent).
- **Signature idea**: a printed-walk feel — cream paper, one serif display
  face, one sunset-orange accent doing all the work (markers, route, buttons).
- **Palette**: paper `#FFF9F2`, ink `#1C1917`, sunset orange `#EA580C`
  (dark `#C2410C`), hairline `#E7E0D6`. No gradients, no glows.
- **Type**: DM Serif Display (self-hosted) for headings, system sans for
  everything else. One strong font, nothing else.
- **Motion**: only the route line drawing in (1.4s, transform/opacity only),
  disabled under `prefers-reduced-motion`.
- **Copy**: plain human words. No "seamless", "elevate", "AI-powered" headline.

### 12. Biggest risk + fallback
Live APIs failing mid-demo (Gemini 429, ORS rate limit, OSM tiles blocked).
Fallback: the demo runs entirely off the seeded catalogue + straight-line
geometry + template why-lines. Every live call fails soft, the app says so
in the note, and the route still works. Never fake a live API call.

### 13. Honest limits
- Not live Google-Maps-quality data: no real-time hours, crowds, prices or
  closures; coordinates are approximate — verify before navigating.
- Only feels personal in the one seeded city. A second city typed live will
  be thin.
- Distances without an ORS key are straight-line estimates, so real walking
  distance is longer (typically 20–40% on city streets).
- Mood parsing is keywords + tags, not psychology; say that on stage.
- Gemini only writes the one-line reasons, and only with the user's own key.
  Without a key the reasons are templates written from the place data.

### 14. Testing
`node --test tests/test.mjs` — parser, catalogue integrity, haversine,
route arc, budget/time/rain filters, determinism, regenerate, share
round-trip, why-line uniqueness. 20 tests, 0 failures.
Screenshots via headless Chrome (`scripts/shot.py`, CDP): 1280px desktop +
390px mobile, zero horizontal overflow (verified: scrollWidth == innerWidth
at both sizes), read by eye and fixed.
