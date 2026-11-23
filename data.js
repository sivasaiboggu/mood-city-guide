// Seeded place catalogue — Bengaluru (demo city).
// Coordinates are approximate (street-level, not survey-grade). Hours and
// entry costs are the places' usual published ones; check before you go.
// This is offline demo data: it is labelled as such in the UI.
export const CITY = {
  name: "Bengaluru",
  centre: [12.9716, 77.5946],
  zoom: 13,
  note: "Demo city. 48 places, seeded by hand from public listings."
};

// kind: park | lake | street | cafe | food | viewpoint | culture | market | bookshop | temple
// tags drive the mood scorer. cost: rupees per person, 0 = free.
export const PLACES = [
  { id: "cubbon", name: "Cubbon Park", area: "Central", lat: 12.9763, lon: 77.5929, kind: "park", cost: 0, hours: "6:00–18:00", tags: ["quiet", "green", "solo", "morning", "free", "shade"], vibe: "Old trees, wide paths, and benches nobody hurries past." },
  { id: "lalbagh", name: "Lalbagh Botanical Garden", area: "Basavanagudi", lat: 12.9507, lon: 77.5848, kind: "park", cost: 30, hours: "6:00–19:00", tags: ["quiet", "green", "solo", "morning", "views", "heritage"], vibe: "A glasshouse, a lake, and 240 acres to slow down in." },
  { id: "ulsoor", name: "Ulsoor Lake", area: "Ulsoor", lat: 12.9816, lon: 77.62, kind: "lake", cost: 0, hours: "6:00–20:00", tags: ["quiet", "water", "solo", "morning", "free", "views"], vibe: "Still water at the edge of a loud neighbourhood." },
  { id: "sankey", name: "Sankey Tank", area: "Malleshwaram", lat: 13.0094, lon: 77.5656, kind: "lake", cost: 0, hours: "6:00–19:00", tags: ["quiet", "water", "solo", "morning", "free", "green"], vibe: "A neighbourhood lake with a proper walking loop." },
  { id: "hebbal", name: "Hebbal Lake", area: "Hebbal", lat: 13.0522, lon: 77.5858, kind: "lake", cost: 0, hours: "6:00–19:00", tags: ["quiet", "water", "solo", "morning", "free", "birds"], vibe: "Birds over the water, joggers on the bund." },
  { id: "turahalli", name: "Turahalli Forest", area: "Turahalli", lat: 12.8883, lon: 77.5292, kind: "park", cost: 0, hours: "6:00–18:00", tags: ["quiet", "green", "solo", "views", "free", "hike"], vibe: "Rocky trails and a view over the whole south side." },
  { id: "nandi", name: "Nandi Hills viewpoint", area: "Nandi Hills", lat: 13.3701, lon: 77.6835, kind: "viewpoint", cost: 0, hours: "6:00–18:00", tags: ["views", "sunset", "solo", "morning", "free", "drive"], vibe: "Above the clouds at sunrise; worth the early start." },
  { id: "bannerghatta", name: "Bannerghatta National Park", area: "Bannerghatta", lat: 12.8027, lon: 77.577, kind: "park", cost: 260, hours: "9:30–17:00", tags: ["green", "animals", "social", "day", "views"], vibe: "A safari and a zoo, an hour from the centre." },
  { id: "mgroad", name: "MG Road", area: "Central", lat: 12.9756, lon: 77.606, kind: "street", cost: 0, hours: "Always", tags: ["busy", "social", "night", "shopping", "free", "people"], vibe: "The city's main street, lit up and always moving." },
  { id: "churchst", name: "Church Street", area: "Central", lat: 12.9756, lon: 77.6015, kind: "street", cost: 0, hours: "Always", tags: ["busy", "social", "food", "night", "music", "free", "people"], vibe: "Bookshops, cafés and buskers on one short stretch." },
  { id: "brigade", name: "Brigade Road", area: "Central", lat: 12.9725, lon: 77.6058, kind: "street", cost: 0, hours: "Always", tags: ["busy", "social", "shopping", "night", "free", "people"], vibe: "Shop windows and crowds, shoulder to shoulder." },
  { id: "commercial", name: "Commercial Street", area: "Shivajinagar", lat: 12.9857, lon: 77.6054, kind: "market", cost: 0, hours: "10:00–21:00", tags: ["busy", "shopping", "social", "day", "free", "bargain"], vibe: "A maze of stalls where bargaining is the point." },
  { id: "vvpuram", name: "VV Puram Food Street", area: "Basavanagudi", lat: 12.9487, lon: 77.5807, kind: "food", cost: 150, hours: "18:00–23:00", tags: ["food", "busy", "social", "night", "cheap", "people", "streetfood"], vibe: "A whole lane of dosas, chats and sweets after dark." },
  { id: "mosquerd", name: "Mosque Road, Frazer Town", area: "Frazer Town", lat: 12.9987, lon: 77.6143, kind: "food", cost: 200, hours: "18:00–23:30", tags: ["food", "busy", "social", "night", "cheap", "people"], vibe: "Kebabs and haleem, eaten standing up with strangers." },
  { id: "malleshwaram8th", name: "8th Cross, Malleshwaram", area: "Malleshwaram", lat: 13.0061, lon: 77.5647, kind: "market", cost: 0, hours: "9:00–21:00", tags: ["busy", "shopping", "food", "day", "heritage", "people"], vibe: "Flower sellers, filter coffee and old Bangalore." },
  { id: "jayanagar4th", name: "4th Block, Jayanagar", area: "Jayanagar", lat: 12.9307, lon: 77.5838, kind: "street", cost: 0, hours: "Always", tags: ["quiet", "shopping", "food", "day", "green", "people"], vibe: "Leafy blocks, small shops, and unhurried pavements." },
  { id: "indiranagar100ft", name: "100 Feet Road, Indiranagar", area: "Indiranagar", lat: 12.9784, lon: 77.6408, kind: "street", cost: 0, hours: "Always", tags: ["busy", "social", "food", "night", "music", "people"], vibe: "Breweries, cafés and live music, one after another." },
  { id: "koramangala80ft", name: "80 Feet Road, Koramangala", area: "Koramangala", lat: 12.9352, lon: 77.6245, kind: "street", cost: 0, hours: "Always", tags: ["busy", "social", "food", "night", "people"], vibe: "The startup quarter's loud, hungry main road." },
  { id: "hsrlake", name: "HSR Layout Lake", area: "HSR Layout", lat: 12.9116, lon: 77.6412, kind: "lake", cost: 0, hours: "6:00–19:00", tags: ["quiet", "water", "solo", "morning", "free", "green"], vibe: "A calm loop of water in the middle of the sector grid." },
  { id: "agaram", name: "Agara Lake", area: "HSR Layout", lat: 12.9252, lon: 77.6418, kind: "lake", cost: 0, hours: "6:00–19:00", tags: ["quiet", "water", "solo", "morning", "free", "birds"], vibe: "Reeds, kingfishers, and a long flat walk." },
  { id: "blossom", name: "Blossom Book House", area: "Church Street", lat: 12.9759, lon: 77.6019, kind: "bookshop", cost: 0, hours: "10:00–21:00", tags: ["quiet", "books", "solo", "indoor", "free", "rain"], vibe: "Second-hand shelves stacked to the ceiling." },
  { id: "champaca", name: "Champaca Bookstore", area: "Vasanth Nagar", lat: 12.9875, lon: 77.592, kind: "bookshop", cost: 0, hours: "10:00–20:00", tags: ["quiet", "books", "solo", "indoor", "coffee", "rain"], vibe: "A quiet room of books with coffee downstairs." },
  { id: "ngma", name: "National Gallery of Modern Art", area: "Vasanth Nagar", lat: 12.9906, lon: 77.5891, kind: "culture", cost: 20, hours: "10:00–17:00", tags: ["culture", "art", "quiet", "indoor", "solo", "heritage"], vibe: "A colonial manor full of modern Indian art." },
  { id: "bangalorepalace", name: "Bangalore Palace", area: "Vasanth Nagar", lat: 12.9987, lon: 77.592, kind: "culture", cost: 285, hours: "10:00–17:30", tags: ["culture", "heritage", "views", "indoor", "social", "day"], vibe: "Tudor towers and wood-panelled rooms in the city." },
  { id: "tipu", name: "Tipu Sultan's Summer Palace", area: "Chamrajpet", lat: 12.9593, lon: 77.5736, kind: "culture", cost: 25, hours: "8:30–17:30", tags: ["culture", "heritage", "quiet", "indoor", "solo", "history"], vibe: "Teak pillars from 1791, cool even at noon." },
  { id: "visvesvaraya", name: "Visvesvaraya Museum", area: "Central", lat: 12.9755, lon: 77.5963, kind: "culture", cost: 50, hours: "9:30–18:00", tags: ["culture", "indoor", "social", "day", "science", "rain"], vibe: "Hands-on science across five floors." },
  { id: "govtmuseum", name: "Government Museum", area: "Central", lat: 12.9763, lon: 77.5969, kind: "culture", cost: 20, hours: "10:00–17:00", tags: ["culture", "heritage", "quiet", "indoor", "solo", "history"], vibe: "Coins, sculptures and a very old building." },
  { id: "rangoli", name: "Rangoli Metro Art Center", area: "MG Road", lat: 12.9756, lon: 77.606, kind: "culture", cost: 0, hours: "10:00–20:00", tags: ["culture", "art", "social", "free", "outdoor", "people"], vibe: "Street art and pop-up stalls under the metro." },
  { id: "toit", name: "Toit Brewpub", area: "Indiranagar", lat: 12.9784, lon: 77.6408, kind: "food", cost: 800, hours: "12:00–23:30", tags: ["food", "social", "night", "music", "beer", "people"], vibe: "House-brewed beer and a room that gets louder by the hour." },
  { id: "truffles", name: "Truffles, Koramangala", area: "Koramangala", lat: 12.9352, lon: 77.6245, kind: "food", cost: 400, hours: "11:00–23:00", tags: ["food", "social", "day", "night", "burgers", "people"], vibe: "Burgers and milkshakes, always a short queue." },
  { id: "vidyarthi", name: "Vidyarthi Bhavan", area: "Basavanagudi", lat: 12.9507, lon: 77.5807, kind: "food", cost: 100, hours: "6:30–20:00", tags: ["food", "heritage", "cheap", "morning", "social", "people"], vibe: "Crisp masala dosa in a room that has not changed since 1943." },
  { id: "ctr", name: "CTR (Shri Sagar)", area: "Malleshwaram", lat: 13.0061, lon: 77.5647, kind: "food", cost: 80, hours: "7:00–21:00", tags: ["food", "heritage", "cheap", "morning", "social", "people"], vibe: "Benne dosa at a counter, eaten in ten minutes." },
  { id: "mavalli", name: "MTR, Lalbagh Road", area: "Basavanagudi", lat: 12.9537, lon: 77.5848, kind: "food", cost: 200, hours: "6:30–21:00", tags: ["food", "heritage", "cheap", "morning", "social", "people"], vibe: "A century of rava idli and filter coffee." },
  { id: "airlines", name: "Airlines Hotel", area: "Ashok Nagar", lat: 12.9698, lon: 77.5963, kind: "food", cost: 150, hours: "6:00–22:00", tags: ["food", "quiet", "green", "morning", "cheap", "outdoor"], vibe: "Breakfast under trees, open to the sky." },
  { id: "dusk", name: "Skyye, UB City", area: "Central", lat: 12.9716, lon: 77.5963, kind: "viewpoint", cost: 500, hours: "17:00–23:30", tags: ["views", "sunset", "night", "social", "food", "people"], vibe: "The skyline from sixteen floors up, best at dusk." },
  { id: "highultra", name: "High Ultra Lounge", area: "Malleshwaram", lat: 13.0061, lon: 77.5647, kind: "viewpoint", cost: 600, hours: "17:00–23:30", tags: ["views", "sunset", "night", "social", "food", "people"], vibe: "A rooftop over the north side, city lights below." },
  { id: "bamboo", name: "Bamboo Bazaar, Shivajinagar", area: "Shivajinagar", lat: 12.9857, lon: 77.6054, kind: "market", cost: 0, hours: "9:00–20:00", tags: ["busy", "shopping", "day", "free", "people", "bargain"], vibe: "Cane, baskets and bargaining in narrow lanes." },
  { id: "russell", name: "Russell Market", area: "Shivajinagar", lat: 12.9875, lon: 77.6054, kind: "market", cost: 0, hours: "8:00–20:00", tags: ["busy", "shopping", "food", "day", "heritage", "people"], vibe: "Flowers, fruit and noise under a 1927 roof." },
  { id: "krishnarajapuram", name: "KR Market", area: "Chamrajpet", lat: 12.9593, lon: 77.5736, kind: "market", cost: 0, hours: "5:00–20:00", tags: ["busy", "shopping", "food", "morning", "heritage", "people"], vibe: "The city's oldest market, loudest before 8 in the morning." },
  { id: "attakkalari", name: "Atta Galatta", area: "Koramangala", lat: 12.9352, lon: 77.6245, kind: "culture", cost: 0, hours: "10:00–20:00", tags: ["culture", "books", "quiet", "indoor", "coffee", "solo"], vibe: "A bookshop that also hosts readings and small gigs." },
  { id: "ranga", name: "Ranga Shankara", area: "JP Nagar", lat: 12.9077, lon: 77.5867, kind: "culture", cost: 200, hours: "17:00–21:30", tags: ["culture", "theatre", "social", "night", "indoor", "people"], vibe: "Small-stage theatre, close enough to see every face." },
  { id: "freedom", name: "Freedom Park", area: "Central", lat: 12.9832, lon: 77.5817, kind: "park", cost: 0, hours: "6:00–20:00", tags: ["quiet", "green", "solo", "free", "history", "shade"], vibe: "A former jail ground, now open lawns and old walls." },
  { id: "bugle", name: "Bugle Rock Park", area: "Basavanagudi", lat: 12.9427, lon: 77.5787, kind: "park", cost: 0, hours: "6:00–19:00", tags: ["quiet", "green", "solo", "morning", "free", "views"], vibe: "A giant rock, a small temple, and a view of the rooftops." },
  { id: "kaikondrahalli", name: "Kaikondrahalli Lake", area: "Sarjapur Road", lat: 12.9067, lon: 77.6547, kind: "lake", cost: 0, hours: "6:00–19:00", tags: ["quiet", "water", "solo", "morning", "free", "birds"], vibe: "A restored lake with a proper bird-watching deck." },
  { id: "soulsante", name: "Soul Sante Market", area: "Whitefield", lat: 12.9698, lon: 77.7499, kind: "market", cost: 0, hours: "10:00–22:00", tags: ["busy", "shopping", "social", "day", "art", "people"], vibe: "A weekend flea market of crafts, food and music." },
  { id: "shiva", name: "Shivoham Shiva Temple", area: "Old Airport Road", lat: 12.9593, lon: 77.6418, kind: "culture", cost: 0, hours: "6:00–21:00", tags: ["culture", "quiet", "solo", "morning", "free", "views"], vibe: "A 65-foot Shiva, calm even on a busy road." },
  { id: "iskcon", name: "ISKCON Temple", area: "Rajajinagar", lat: 13.0105, lon: 77.551, kind: "culture", cost: 0, hours: "7:00–21:00", tags: ["culture", "quiet", "solo", "morning", "free", "views"], vibe: "White stone, chanting, and a view over the west side." },
  { id: "coffeeday", name: "Indian Coffee House", area: "MG Road", lat: 12.9756, lon: 77.606, kind: "cafe", cost: 120, hours: "9:00–21:00", tags: ["quiet", "coffee", "solo", "indoor", "cheap", "heritage", "rain"], vibe: "Waiters in livery, cutlets, and nowhere to rush to." },
];

// Canned moods: fully pre-built routes, so the demo works with no key at all.
export const CANNED_MOODS = [
  { label: "lonely but adventurous", text: "lonely but adventurous" },
  { label: "tired but curious", text: "tired but curious" },
  { label: "homesick and hungry", text: "homesick and hungry" },
  { label: "stressed, need air", text: "stressed, need some air" },
  { label: "happy and want a crowd", text: "happy, want a crowd and good food" },
  { label: "rainy day, indoors", text: "rainy day, want to stay indoors" },
];
