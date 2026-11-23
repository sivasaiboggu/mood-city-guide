// Mood engine — pure functions, no DOM, no network. Tested in tests/test.mjs.
import { PLACES } from "./data.js";

export const WALK_KMH = 4.8;
export const STOP_MINUTES = 35;

// Keyword lexicon: word -> tag contributions.
const LEXICON = [
  [/lonely|alone|isolated|nobody|by myself/, ["solo", "quiet"]],
  [/adventurous|adventure|explore|wander|surprise|new/, ["explore", "views"]],
  [/tired|exhausted|drained|weary|low energy/, ["low-energy", "quiet"]],
  [/curious|wonder|learn|discover/, ["culture", "explore"]],
  [/homesick|missing home|nostalgic/, ["heritage", "food"]],
  [/hungry|starving|food|eat|snack/, ["food"]],
  [/stressed|anxious|overwhelmed|tense|need air|need some air/, ["quiet", "green", "low-energy"]],
  [/happy|great|celebrat|good mood|excited/, ["social", "busy"]],
  [/crowd|people|buzz|busy|lively|party/, ["busy", "social", "people"]],
  [/rain|rainy|wet|indoor|inside|stay in/, ["indoor", "rain"]],
  [/calm|peace|quiet|silence|decompress|unwind|relax/, ["quiet", "green"]],
  [/sad|down|blue|heartbroken/, ["quiet", "solo", "green"]],
  [/bored/, ["explore", "culture"]],
  [/romantic|date|anniversary/, ["views", "sunset", "quiet"]],
  [/sunset|evening|dusk|golden hour/, ["sunset", "views"]],
  [/morning|early|sunrise/, ["morning", "green"]],
  [/night|late|after dark/, ["night"]],
  [/cheap|broke|free|no money|budget|low cost/, ["cheap", "free"]],
  [/book|read|reading/, ["books"]],
  [/art|gallery|paint|museum/, ["art", "culture"]],
  [/music|concert|gig|live/, ["music"]],
  [/nature|green|trees|park|lake|water|birds/, ["green", "water"]],
  [/coffee|cafe|chai/, ["coffee"]],
  [/shop|shopping|market|bargain/, ["shopping"]],
  [/history|heritage|old/, ["heritage"]],
  [/walk|stroll/, ["green", "outdoor"]],
  [/wired|restless|energetic|hyper|awake/, ["busy", "explore"]],
];

export function parseMood(text) {
  const t = (text || "").toLowerCase().trim();
  const tags = new Set();
  for (const [re, add] of LEXICON) if (re.test(t)) add.forEach((x) => tags.add(x));
  if (tags.size === 0) { tags.add("explore"); tags.add("social"); }
  const energy = tags.has("low-energy") ? "low" : tags.has("busy") || tags.has("explore") ? "high" : "medium";
  const social = tags.has("solo") && !tags.has("social") ? "solo" : tags.has("social") || tags.has("busy") ? "social" : "either";
  const setting = tags.has("indoor") ? "indoor" : tags.has("green") || tags.has("water") ? "outdoor" : "either";
  const budget = tags.has("cheap") || tags.has("free") ? "low" : "any";
  return { text: t, tags: [...tags], energy, social, setting, budget };
}

export function haversineKm(a, b) {
  const R = 6371, rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Deterministic pseudo-random from a string, so "Regenerate" cycles predictably.
export function hashSeed(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

function scorePlace(place, mood, arcRole, opts, anchor) {
  let s = 0;
  for (const tag of mood.tags) if (place.tags.includes(tag)) s += 3;
  // Arc roles: 1 = decompress, 2 = explore, 3 = reward.
  if (arcRole === 1 && (place.tags.includes("quiet") || place.tags.includes("green") || place.tags.includes("water"))) s += 4;
  if (arcRole === 2 && (place.tags.includes("busy") || place.tags.includes("food") || place.tags.includes("culture") || place.tags.includes("explore"))) s += 4;
  if (arcRole === 3 && (place.tags.includes("views") || place.tags.includes("sunset") || place.tags.includes("food"))) s += 4;
  if (mood.setting === "indoor" && place.tags.includes("indoor")) s += 3;
  if (mood.setting === "indoor" && !place.tags.includes("indoor") && place.kind !== "cafe") s -= 4;
  if (mood.setting === "outdoor" && place.tags.includes("outdoor")) s += 2;
  if (mood.social === "solo" && place.tags.includes("solo")) s += 2;
  if (mood.social === "social" && place.tags.includes("social")) s += 2;
  if (opts.budget === "low" && place.cost <= 150) s += 3;
  if (opts.budget === "low" && place.cost > 400) s -= 5;
  if (opts.time === "short" && place.kind === "park") s -= 1;
  if (mood.energy === "low" && place.tags.includes("busy")) s -= 2;
  // Keep the walk walkable: penalise stops far from the previous stop.
  if (anchor) {
    const km = haversineKm(anchor, place);
    if (km > 1.5) s -= (km - 1.5) * 3;
    if (km > 5) s -= 12;
  }
  return s;
}

// Most specific reason first, so three stops don't all say the same thing.
const REASON_PRIORITY = ["quiet", "water", "green", "food", "views", "sunset", "books", "coffee", "heritage", "art", "music", "culture", "busy", "people", "shopping", "morning", "night", "cheap", "free", "indoor", "rain", "explore", "solo", "social", "low-energy"];

export function whyLine(place, mood, arcRole, used = new Set()) {
  const role = ["", "Start here — ", "Then — ", "End here — "][arcRole];
  const tag = REASON_PRIORITY.find((t) => mood.tags.includes(t) && place.tags.includes(t));
  const reasons = {
    quiet: "few people, room to think",
    green: "trees and open sky instead of walls",
    water: "still water slows everything down",
    food: "good food, no fuss, no small talk needed",
    busy: "anonymous buzz — company without conversation",
    views: "a proper view to look at for a while",
    sunset: "best as the light goes",
    culture: "something to look at and think about",
    books: "shelves to get lost in",
    coffee: "a table, a cup, and time",
    heritage: "the old city, still standing",
    art: "art worth standing in front of",
    music: "music you can just listen to",
    shopping: "stalls to wander, nothing you have to buy",
    morning: "best in the early light",
    night: "comes alive after dark",
    cheap: "costs almost nothing",
    free: "free to walk in",
    indoor: "dry, warm, and inside",
    rain: "a good place to wait out the rain",
    explore: "easy to wander through",
    solo: "built for going alone",
    social: "full of people doing their own thing",
    people: "people-watching, no talking required",
    "low-energy": "no effort needed to enjoy it",
  };
  const reason = reasons[tag] || place.vibe;
  if (used.has(reason)) return `${role}${place.vibe}`;
  used.add(reason);
  return `${role}${reason}.`;
}

// Straight-line interpolation between two points (demo geometry).
export function interpolate(a, b, n = 24) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    pts.push([a.lat + (b.lat - a.lat) * f, a.lon + (b.lon - a.lon) * f]);
  }
  return pts;
}

export function buildRoute(moodText, opts = {}) {
  const mood = parseMood(moodText);
  const options = { budget: opts.budget || "any", time: opts.time || "any", energy: opts.energy || mood.energy, offset: opts.offset || 0 };
  const used = new Set();
  const stops = [];
  const seed = hashSeed(moodText.toLowerCase() + "|" + options.offset);
  for (let role = 1; role <= 3; role++) {
    const anchor = stops.length ? stops[stops.length - 1] : null;
    const ranked = PLACES.filter((p) => !used.has(p.id))
      .map((p) => ({ p, s: scorePlace(p, mood, role, options, anchor) }))
      .sort((a, b) => b.s - a.s || ((hashSeed(a.p.id + seed) % 100) - (hashSeed(b.p.id + seed) % 100)));
    // Offset lets "Regenerate" pick the next-best set instead of the same three.
    const pick = ranked[Math.min(options.offset, ranked.length - 1)];
    used.add(pick.p.id);
    stops.push({ ...pick.p, score: pick.s, role, why: whyLine(pick.p, mood, role) });
  }
  // Order stops to keep walking short: greedy nearest-neighbour from stop 1.
  const ordered = [stops[0]];
  const rest = stops.slice(1);
  while (rest.length) {
    const last = ordered[ordered.length - 1];
    rest.sort((a, b) => haversineKm(last, a) - haversineKm(last, b));
    ordered.push(rest.shift());
  }
  const usedReasons = new Set();
  ordered.forEach((s, i) => { s.role = i + 1; s.why = whyLine(s, mood, i + 1, usedReasons); });

  const legs = [];
  let totalKm = 0;
  for (let i = 0; i < ordered.length - 1; i++) {
    const km = haversineKm(ordered[i], ordered[i + 1]);
    totalKm += km;
    legs.push({ from: ordered[i].id, to: ordered[i + 1].id, km: +km.toFixed(2), min: Math.round((km / WALK_KMH) * 60), points: interpolate(ordered[i], ordered[i + 1]) });
  }
  const walkMin = Math.round((totalKm / WALK_KMH) * 60);
  return {
    mood: moodText, parsed: mood, stops: ordered, legs,
    totalKm: +totalKm.toFixed(2), walkMin,
    stayMin: ordered.length * STOP_MINUTES,
    totalMin: walkMin + ordered.length * STOP_MINUTES,
    totalCost: ordered.reduce((a, s) => a + s.cost, 0),
    geometry: "demo", // "demo" = straight-line estimate; "ors" = real street routing
  };
}

export function encodeShare(route) {
  const payload = { m: route.mood, s: route.stops.map((s) => s.id) };
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload)))).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
export function decodeShare(code) {
  try {
    const json = decodeURIComponent(escape(atob(code.replaceAll("-", "+").replaceAll("_", "/"))));
    const d = JSON.parse(json);
    if (!d.m || !Array.isArray(d.s)) return null;
    const stops = d.s.map((id) => PLACES.find((p) => p.id === id)).filter(Boolean);
    if (stops.length === 0) return null;
    return { mood: d.m, stops };
  } catch { return null; }
}
