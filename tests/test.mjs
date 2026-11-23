// Tests for the mood engine. Run: node --test tests/test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { parseMood, buildRoute, haversineKm, interpolate, encodeShare, decodeShare, whyLine } from "../engine.mjs";
import { PLACES } from "../data.js";

test("parser: lonely but adventurous -> solo + quiet + explore", () => {
  const m = parseMood("lonely but adventurous");
  assert.ok(m.tags.includes("solo"));
  assert.ok(m.tags.includes("quiet"));
  assert.ok(m.tags.includes("explore"));
  assert.equal(m.social, "solo");
});

test("parser: tired but curious -> low energy + culture", () => {
  const m = parseMood("tired but curious");
  assert.equal(m.energy, "low");
  assert.ok(m.tags.includes("culture"));
});

test("parser: rainy day -> indoor", () => {
  const m = parseMood("rainy day, want to stay indoors");
  assert.equal(m.setting, "indoor");
  assert.ok(m.tags.includes("indoor"));
});

test("parser: empty text falls back to explore/social", () => {
  const m = parseMood("");
  assert.ok(m.tags.length > 0);
});

test("parser: homesick and hungry -> heritage + food", () => {
  const m = parseMood("homesick and hungry");
  assert.ok(m.tags.includes("heritage"));
  assert.ok(m.tags.includes("food"));
});

test("catalogue: 48 places, unique ids, valid coords in Bengaluru", () => {
  assert.equal(PLACES.length, 48);
  assert.equal(new Set(PLACES.map((p) => p.id)).size, 48);
  for (const p of PLACES) {
    assert.ok(p.lat > 12.7 && p.lat < 13.5, p.id);
    assert.ok(p.lon > 77.4 && p.lon < 77.9, p.id);
    assert.ok(p.tags.length >= 4, p.id);
    assert.ok(typeof p.cost === "number" && p.cost >= 0, p.id);
    assert.ok(p.hours && p.vibe, p.id);
  }
});

test("haversine: Cubbon Park to Lalbagh is roughly 3 km", () => {
  const a = PLACES.find((p) => p.id === "cubbon");
  const b = PLACES.find((p) => p.id === "lalbagh");
  const km = haversineKm(a, b);
  assert.ok(km > 2.5 && km < 3.5, `got ${km}`);
});

test("route: total walking distance stays under 8 km", () => {
  for (const mood of ["lonely but adventurous", "tired but curious", "homesick and hungry", "rainy day, want to stay indoors", "happy, want a crowd and good food"]) {
    const r = buildRoute(mood);
    assert.ok(r.totalKm < 8, `${mood}: ${r.totalKm} km`);
  }
});

test("route: lonely but adventurous gives 3 distinct stops with an arc", () => {
  const r = buildRoute("lonely but adventurous");
  assert.equal(r.stops.length, 3);
  assert.equal(new Set(r.stops.map((s) => s.id)).size, 3);
  assert.deepEqual(r.stops.map((s) => s.role), [1, 2, 3]);
  assert.ok(r.stops[0].tags.includes("quiet") || r.stops[0].tags.includes("green") || r.stops[0].tags.includes("water"));
  assert.ok(r.totalKm > 0 && r.totalKm < 40);
  assert.ok(r.totalMin > r.walkMin);
  assert.equal(r.legs.length, 2);
  assert.equal(r.geometry, "demo");
});

test("route: tired but curious is shorter and calmer than adventurous", () => {
  const tired = buildRoute("tired but curious");
  const adv = buildRoute("lonely but adventurous");
  assert.ok(tired.stops.every((s) => s.cost <= 800));
  assert.notDeepEqual(tired.stops.map((s) => s.id), adv.stops.map((s) => s.id));
});

test("route: low budget keeps total cost under 450", () => {
  const r = buildRoute("hungry and broke", { budget: "low" });
  assert.ok(r.totalCost <= 450, `cost ${r.totalCost}`);
});

test("route: rainy mood picks indoor stops", () => {
  const r = buildRoute("rainy day, want to stay indoors");
  const indoor = r.stops.filter((s) => s.tags.includes("indoor") || s.kind === "cafe").length;
  assert.ok(indoor >= 2, `only ${indoor} indoor stops`);
});

test("route: regenerate offset changes the stops", () => {
  const a = buildRoute("lonely but adventurous", { offset: 0 });
  const b = buildRoute("lonely but adventurous", { offset: 2 });
  assert.notDeepEqual(a.stops.map((s) => s.id), b.stops.map((s) => s.id));
});

test("route: same input is deterministic", () => {
  const a = buildRoute("happy, want a crowd and good food");
  const b = buildRoute("happy, want a crowd and good food");
  assert.deepEqual(a.stops.map((s) => s.id), b.stops.map((s) => s.id));
});

test("route: total cost equals sum of stop costs", () => {
  const r = buildRoute("lonely but adventurous");
  assert.equal(r.totalCost, r.stops.reduce((x, s) => x + s.cost, 0));
});

test("interpolate: returns endpoints and n+1 points", () => {
  const a = { lat: 12.9, lon: 77.5 }, b = { lat: 13.0, lon: 77.6 };
  const pts = interpolate(a, b, 10);
  assert.equal(pts.length, 11);
  assert.deepEqual(pts[0], [12.9, 77.5]);
  assert.deepEqual(pts[10], [13.0, 77.6]);
});

test("whyLine: three stops never repeat the same reason", () => {
  for (const mood of ["lonely but adventurous", "tired but curious", "happy, want a crowd and good food"]) {
    const r = buildRoute(mood);
    const whys = r.stops.map((s) => s.why);
    assert.equal(new Set(whys).size, 3, `${mood}: ${whys.join(" | ")}`);
  }
});

test("whyLine: mentions the mood reason, one sentence", () => {
  const p = PLACES.find((x) => x.id === "cubbon");
  const m = parseMood("lonely but adventurous");
  const line = whyLine(p, m, 1);
  assert.ok(line.startsWith("Start here"));
  assert.ok(line.length < 120);
});

test("share link: encode then decode round-trips", () => {
  const r = buildRoute("lonely but adventurous");
  const code = encodeShare(r);
  assert.ok(!code.includes("+") && !code.includes("/") && !code.includes("="));
  const back = decodeShare(code);
  assert.equal(back.mood, "lonely but adventurous");
  assert.deepEqual(back.stops.map((s) => s.id), r.stops.map((s) => s.id));
});

test("share link: garbage decodes to null", () => {
  assert.equal(decodeShare("!!!not-a-code!!!"), null);
  assert.equal(decodeShare(""), null);
});
