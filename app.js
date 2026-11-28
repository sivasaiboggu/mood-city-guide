import { buildRoute, encodeShare, decodeShare, parseMood } from "./engine.mjs";
import { CITY, PLACES, CANNED_MOODS } from "./data.js";

const $ = (s) => document.querySelector(s);
const moodInput = $("#moodInput"), chipsEl = $("#chips"), readbackEl = $("#readback");
const summaryEl = $("#summary"), stopsEl = $("#stops"), statusEl = $("#statusLine");
const routeActionsEl = $("#routeActions"), demoNoteEl = $("#demoNote");

let map, routeLayer, markerLayer, currentRoute = null, regenOffset = 0;

// ---------- Map ----------
const STREETS = [
  [[12.9756, 77.5946], [12.9756, 77.6120]], // MG Road
  [[12.9756, 77.5980], [12.9759, 77.6060]], // Church Street
  [[12.9725, 77.5980], [12.9725, 77.6080]], // Brigade Road
  [[12.9857, 77.6000], [12.9857, 77.6120]], // Commercial Street
  [[12.9784, 77.6300], [12.9784, 77.6500]], // 100 Feet Road
  [[12.9352, 77.6150], [12.9352, 77.6350]], // 80 Feet Road
  [[12.9507, 77.5750], [12.9507, 77.5900]], // Lalbagh Road
  [[12.9716, 77.5850], [12.9900, 77.5850]], // Residency / Richmond Rd
  [[12.9600, 77.5946], [12.9900, 77.5946]], // South-North spine
  [[12.9487, 77.5750], [12.9487, 77.5900]], // VV Puram
  [[13.0061, 77.5580], [13.0061, 77.5750]], // 8th Cross Malleshwaram
  [[12.9307, 77.5780], [12.9307, 77.5900]], // Jayanagar 4th Block
  [[12.9816, 77.6100], [12.9816, 77.6300]], // Ulsoor Rd
  [[12.9716, 77.5946], [12.9716, 77.6408]], // Old Airport Rd (east)
];
const GREENS = [
  { at: [12.9763, 77.5929], r: 420, name: "Cubbon Park" },
  { at: [12.9507, 77.5848], r: 520, name: "Lalbagh" },
  { at: [12.9816, 77.6200], r: 260, name: "Ulsoor Lake" },
  { at: [13.0094, 77.5656], r: 220, name: "Sankey Tank" },
];

function initMap() {
  map = L.map("map", { zoomControl: true }).setView(CITY.centre, CITY.zoom);
  // Tiles when online; the street grid + green areas below keep the map
  // readable when tiles cannot load (offline demo).
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  for (const g of GREENS) L.circle(g.at, { radius: g.r, color: "#B7D3A8", weight: 1, fillColor: "#DCEAD4", fillOpacity: 0.9 }).addTo(map);
  for (const s of STREETS) L.polyline(s, { color: "#DDD6CB", weight: 5, opacity: 0.9 }).addTo(map);
  routeLayer = L.layerGroup().addTo(map);
  markerLayer = L.layerGroup().addTo(map);
}

// ---------- Keys (localStorage only) ----------
const store = {
  get geminiKey() { return localStorage.getItem("moodmap.geminiKey") || ""; },
  get orsKey() { return localStorage.getItem("moodmap.orsKey") || ""; },
  get model() { return localStorage.getItem("moodmap.model") || "gemini-3.8-flash"; },
};

// ---------- Gemini: rewrites the one-line "why" per stop. Never ranks. ----------
async function geminiWhyLines(route) {
  const key = store.geminiKey;
  if (!key) return null;
  const stops = route.stops.map((s, i) => `${i + 1}. ${s.name} (${s.area}) — ${s.vibe}`).join("\n");
  const body = {
    contents: [{ parts: [{ text:
      `A person in Bengaluru feels: "${route.mood}". They will walk to these three places in order:\n${stops}\n` +
      `Write one short sentence (under 18 words) for each place explaining why it fits that exact feeling. ` +
      `Plain human words, no marketing adjectives, no emoji. Reply as JSON only: {"lines": ["...", "...", "..."]}` }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
  };
  const models = [store.model, "gemini-3.5-flash-lite"].filter((m, i, a) => a.indexOf(m) === i);
  for (const model of models) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
      const m = text.match(/\{[\s\S]*\}/);
      if (!m) continue;
      const parsed = JSON.parse(m[0]);
      if (Array.isArray(parsed.lines) && parsed.lines.length === 3) return parsed.lines;
    } catch { /* network or key error: fall through to template lines */ }
  }
  return null;
}

// ---------- OpenRouteService: real street geometry when a key exists ----------
async function orsGeometry(route) {
  const key = store.orsKey;
  if (!key) return null;
  const coords = route.stops.map((s) => [s.lon, s.lat]);
  try {
    const res = await fetch("https://api.openrouteservice.org/v2/directions/foot-walking/geojson", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: key },
      body: JSON.stringify({ coordinates: coords }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const feat = data?.features?.[0];
    if (!feat) return null;
    const pts = feat.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
    const summary = feat.properties?.summary || {};
    return { points: pts, km: summary.distance ? +(summary.distance / 1000).toFixed(2) : route.totalKm,
             min: summary.duration ? Math.round(summary.duration / 60) : route.walkMin };
  } catch { return null; }
}

// ---------- Rendering ----------
function renderRoute(route, opts = {}) {
  currentRoute = route;
  const mood = parseMood(route.mood);
  readbackEl.innerHTML = `Reading “<b>${escapeHtml(route.mood)}</b>” as: ${mood.tags.map(escapeHtml).join(" · ")} — ${route.energy || mood.energy} energy, ${mood.social === "either" ? "any company" : mood.social}.`;
  summaryEl.hidden = false;
  const hours = Math.floor(route.totalMin / 60), mins = route.totalMin % 60;
  summaryEl.innerHTML = `
    <div class="stat"><b>${route.totalKm} km</b><span>walking${opts.geometry === "ors" ? " (street route)" : " (straight-line estimate)"}</span></div>
    <div class="stat"><b>${hours > 0 ? hours + "h " : ""}${mins}m</b><span>walk + ${route.stayMin} min at stops</span></div>
    <div class="stat"><b>₹${route.totalCost}</b><span>entry + food, roughly</span></div>
    <div class="stat"><b>${route.stops.length} stops</b><span>decompress → explore → reward</span></div>`;
  stopsEl.innerHTML = "";
  route.stops.forEach((s, i) => {
    const li = document.createElement("li");
    li.className = "stop";
    li.tabIndex = 0;
    li.innerHTML = `
      <div class="stop-top"><span class="stop-num">${i + 1}</span><h3>${escapeHtml(s.name)}</h3><span class="stop-kind">${escapeHtml(s.kind)}</span></div>
      <p class="stop-why">${escapeHtml(s.why)}</p>
      <p class="stop-meta">${escapeHtml(s.area)} · ${escapeHtml(s.hours)} · <b>${s.cost === 0 ? "Free" : "₹" + s.cost}</b>${i < route.stops.length - 1 ? ` · then ${route.legs[i].min} min walk (${route.legs[i].km} km)` : ""}</p>`;
    const focus = () => { map.setView([s.lat, s.lon], 15, { animate: true }); highlightStop(i); };
    li.addEventListener("click", focus);
    li.addEventListener("keydown", (e) => { if (e.key === "Enter") focus(); });
    stopsEl.appendChild(li);
  });
  routeActionsEl.hidden = false;
  $("#regenBtn").disabled = false;

  routeLayer.clearLayers(); markerLayer.clearLayers();
  const allPts = [];
  if (opts.orsPoints) {
    allPts.push(...opts.orsPoints);
    L.polyline(opts.orsPoints, { color: "#EA580C", weight: 5, opacity: 0.95, className: "route-line" }).addTo(routeLayer);
  } else {
    for (const leg of route.legs) {
      allPts.push(...leg.points);
      L.polyline(leg.points, { color: "#EA580C", weight: 5, opacity: 0.95, className: "route-line", dashArray: "1 8" }).addTo(routeLayer);
    }
  }
  route.stops.forEach((s, i) => {
    const icon = L.divIcon({ className: "", html: `<div class="num-marker">${i + 1}</div>`, iconSize: [30, 30], iconAnchor: [15, 15] });
    L.marker([s.lat, s.lon], { icon }).addTo(markerLayer)
      .bindPopup(`<b>${escapeHtml(s.name)}</b><br>${escapeHtml(s.area)} · ${escapeHtml(s.hours)}<br>${escapeHtml(s.why)}`);
  });
  if (allPts.length) map.fitBounds(L.latLngBounds(allPts).pad(0.18));
  updateDemoNote(opts);
}

function highlightStop(i) {
  document.querySelectorAll(".stop").forEach((el, j) => el.classList.toggle("active", i === j));
}

function updateDemoNote(opts) {
  const parts = [];
  if (opts.geometry === "ors") parts.push("Street routing live via OpenRouteService.");
  else parts.push("Offline demo data — distances are straight-line estimates.");
  if (opts.ai) parts.push("“Why” lines written by Gemini.");
  else parts.push("“Why” lines are templates; add a free Gemini key in Settings for AI wording.");
  demoNoteEl.textContent = parts.join(" ") + " Places are a seeded list of 48 real Bengaluru spots; hours and prices are the usual published ones.";
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---------- Planning ----------
async function plan(moodText, offset) {
  const budget = $("#budgetSel").value, time = $("#timeSel").value;
  const energySel = $("#energySel").value;
  const energy = energySel === "auto" ? undefined : energySel;
  const route = buildRoute(moodText, { budget, time, energy, offset });
  if (time === "short" && route.totalMin > 120) {
    statusEl.textContent = "Note: even the shortest version runs over 2 hours with stops — the walk itself is short, the stops take the time.";
  } else statusEl.textContent = "";
  renderRoute(route);
  statusEl.textContent += (statusEl.textContent ? " " : "") + "Planning… checking for live routing and AI wording.";
  const [ors, aiLines] = await Promise.all([orsGeometry(route), geminiWhyLines(route)]);
  let changed = false;
  if (aiLines) {
    route.stops.forEach((s, i) => { s.why = aiLines[i]; });
    changed = true;
  }
  if (ors) {
    route.totalKm = ors.km; route.walkMin = ors.min;
    route.totalMin = ors.min + route.stayMin;
    route.geometry = "ors";
    changed = true;
  }
  if (changed) renderRoute(route, { orsPoints: ors?.points, ai: !!aiLines, geometry: ors ? "ors" : "demo" });
  statusEl.textContent = ors ? "Live street routing on." : aiLines ? "AI wording on; routing is the demo estimate." : "No keys — running on offline demo data.";
  try { history.replaceState(null, "", "#r=" + encodeShare(route)); } catch { /* file:// may restrict */ }
}

function planFromForm() {
  const text = moodInput.value.trim();
  if (!text) { statusEl.textContent = "Type a feeling first — even two words will do."; moodInput.focus(); return; }
  regenOffset = 0;
  plan(text, 0);
}

// ---------- Saved routes ----------
function loadSaved() {
  try { return JSON.parse(localStorage.getItem("moodmap.saved") || "[]"); } catch { return []; }
}
function renderSaved() {
  const saved = loadSaved();
  $("#savedCount").textContent = saved.length;
  const sec = $("#savedSection"), list = $("#savedList");
  sec.hidden = saved.length === 0;
  list.innerHTML = "";
  saved.forEach((item, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="s-mood">${escapeHtml(item.mood)}</span><span class="s-meta">${escapeHtml(item.stops.join(" → "))} · ${item.km} km · ₹${item.cost}</span>`;
    const loadBtn = document.createElement("button"); loadBtn.type = "button"; loadBtn.textContent = "Open";
    loadBtn.addEventListener("click", () => {
      moodInput.value = item.mood; regenOffset = 0; plan(item.mood, 0);
      document.querySelector(".layout").scrollIntoView({ behavior: "smooth" });
    });
    const delBtn = document.createElement("button"); delBtn.type = "button"; delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      const s = loadSaved(); s.splice(idx, 1);
      localStorage.setItem("moodmap.saved", JSON.stringify(s)); renderSaved();
    });
    li.append(loadBtn, delBtn);
    list.appendChild(li);
  });
}

// ---------- Wire up ----------
function init() {
  initMap();
  for (const c of CANNED_MOODS) {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = c.label;
    b.addEventListener("click", () => {
      document.querySelectorAll("#chips button").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      moodInput.value = c.text; regenOffset = 0; plan(c.text, 0);
    });
    chipsEl.appendChild(b);
  }
  $("#moodForm").addEventListener("submit", (e) => { e.preventDefault(); planFromForm(); });
  $("#regenBtn").addEventListener("click", () => {
    regenOffset += 1;
    plan(moodInput.value.trim(), regenOffset);
  });
  $("#saveBtn").addEventListener("click", () => {
    if (!currentRoute) return;
    const saved = loadSaved();
    saved.unshift({ mood: currentRoute.mood, stops: currentRoute.stops.map((s) => s.name), km: currentRoute.totalKm, cost: currentRoute.totalCost, at: new Date().toISOString() });
    localStorage.setItem("moodmap.saved", JSON.stringify(saved.slice(0, 12)));
    renderSaved();
    statusEl.textContent = "Saved. Find it under Saved routes.";
  });
  $("#shareBtn").addEventListener("click", async () => {
    if (!currentRoute) return;
    const url = location.href.split("#")[0] + "#r=" + encodeShare(currentRoute);
    try { await navigator.clipboard.writeText(url); statusEl.textContent = "Share link copied — it opens this exact route."; }
    catch { statusEl.textContent = "Copy didn't work in this browser. The link is: " + url; }
  });
  $("#exportBtn").addEventListener("click", async () => {
    if (!currentRoute) return;
    const r = currentRoute;
    const text = [`Mood Map — ${r.mood}`, `${r.totalKm} km walking, about ${r.totalMin} minutes, roughly ₹${r.totalCost}.`, ""]
      .concat(r.stops.map((s, i) => `${i + 1}. ${s.name} (${s.area}, ${s.hours}) — ${s.why}`)).join("\n");
    try { await navigator.clipboard.writeText(text); statusEl.textContent = "Route copied as text."; }
    catch { statusEl.textContent = text; }
  });
  $("#savedBtn").addEventListener("click", () => {
    renderSaved();
    $("#savedSection").scrollIntoView({ behavior: "smooth" });
  });

  // Settings
  const dlg = $("#settingsDlg");
  $("#settingsBtn").addEventListener("click", () => {
    $("#geminiKey").value = store.geminiKey;
    $("#orsKey").value = store.orsKey;
    $("#geminiModel").value = store.model;
    $("#keyStatus").textContent = store.geminiKey || store.orsKey ? "Keys saved in this browser only." : "No keys saved yet — the app works without them.";
    dlg.showModal();
  });
  $("#saveKeysBtn").addEventListener("click", () => {
    localStorage.setItem("moodmap.geminiKey", $("#geminiKey").value.trim());
    localStorage.setItem("moodmap.orsKey", $("#orsKey").value.trim());
    localStorage.setItem("moodmap.model", $("#geminiModel").value);
    $("#keyStatus").textContent = "Saved in this browser only. Plan a walk to use them.";
  });
  $("#clearKeysBtn").addEventListener("click", () => {
    localStorage.removeItem("moodmap.geminiKey");
    localStorage.removeItem("moodmap.orsKey");
    $("#geminiKey").value = ""; $("#orsKey").value = "";
    $("#keyStatus").textContent = "Keys removed.";
  });

  renderSaved();
  // Shared link? Open that route; otherwise plan the default mood.
  const hash = location.hash.match(/#r=([A-Za-z0-9_-]+)/);
  if (hash) {
    const shared = decodeShare(hash[1]);
    if (shared) {
      moodInput.value = shared.mood;
      const route = buildRoute(shared.mood);
      route.stops = shared.stops.map((p, i) => ({ ...p, role: i + 1, why: `Stop ${i + 1} on a route shared with you.` }));
      renderRoute(route);
      statusEl.textContent = "Opened a shared route. Press “Plan my walk” to rebuild it from the mood.";
      return;
    }
  }
  plan(moodInput.value.trim(), 0);
}

document.addEventListener("DOMContentLoaded", init);
