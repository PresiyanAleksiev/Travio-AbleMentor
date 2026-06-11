export interface Coords { lat: number; lng: number; }

export const CITY_COORDS: Record<string, Coords> = {
  sofia: { lat: 42.6977, lng: 23.3219 },
  plovdiv: { lat: 42.1354, lng: 24.7453 },
  varna: { lat: 43.2141, lng: 27.9147 },
  burgas: { lat: 42.5048, lng: 27.4626 },
  ruse: { lat: 43.8356, lng: 25.9657 },
  "stara zagora": { lat: 42.4258, lng: 25.6345 },
  pleven: { lat: 43.4170, lng: 24.6067 },
  "veliko tarnovo": { lat: 43.0757, lng: 25.6172 },
  bansko: { lat: 41.8378, lng: 23.4881 },
  "sunny beach": { lat: 42.6877, lng: 27.7126 },
  sozopol: { lat: 42.4180, lng: 27.6953 },
  nesebar: { lat: 42.6593, lng: 27.7330 },
  blagoevgrad: { lat: 42.0117, lng: 23.0897 },
  shumen: { lat: 43.2706, lng: 26.9229 },
  sliven: { lat: 42.6824, lng: 26.3225 },
  pernik: { lat: 42.6051, lng: 23.0379 },
  vidin: { lat: 43.9907, lng: 22.8728 },
  haskovo: { lat: 41.9344, lng: 25.5556 },
};

export interface Landmark {
  name: string;
  city: string;
  description: string;
  emoji: string;
  lat: number;
  lng: number;
  slug: string;
  longDescription: string;
  hours: string;
  ticketPrice: string;
  bestTime: string;
  website?: string;
  tips?: string[];
}

export const LANDMARKS: Landmark[] = [
  { slug: "rila-monastery", name: "Rila Monastery", city: "Rila Mountains", description: "UNESCO 10th-century monastery tucked in pine forests.", emoji: "⛪", lat: 42.1340, lng: 23.3403,
    longDescription: "Founded in the 10th century by St. Ivan of Rila, this fortified monastery is the spiritual heart of Bulgaria and a UNESCO World Heritage Site. The arcaded courtyard wraps around the striped Nativity Church, whose 1,200+ frescoes are some of the finest examples of the 19th-century Bulgarian National Revival.",
    hours: "Daily 07:00–20:00 (church 06:00–22:00)", ticketPrice: "Courtyard free · Museum 8 BGN · Hrelyo's Tower 5 BGN", bestTime: "Early morning or late afternoon to avoid tour buses",
    website: "https://rilskimanastir.org", tips: ["Dress modestly — covered shoulders and knees", "Photography forbidden inside the main church", "Try the donut-like 'mekitsi' from the bakery outside the gate"] },
  { slug: "plovdiv-old-town", name: "Plovdiv Old Town", city: "Plovdiv", description: "Cobbled Revival quarter with Roman ruins underfoot.", emoji: "🏛️", lat: 42.1500, lng: 24.7510,
    longDescription: "One of the oldest continuously inhabited cities in Europe, layered with Thracian, Roman, Byzantine, Ottoman and 19th-century Revival architecture. The hillside Old Town is a maze of painted merchant houses, while a 2nd-century Roman theatre still hosts summer concerts.",
    hours: "Open 24/7 (Roman Theatre 09:00–18:00)", ticketPrice: "Old Town free · Roman Theatre 5 BGN · Ethnographic Museum 5 BGN", bestTime: "Spring & September — pleasant weather, fewer crowds",
    website: "https://visitplovdiv.com", tips: ["Wear flat shoes for the cobblestones", "Buy a combo ticket if visiting 3+ museums", "Stay for sunset over the Rhodopes from Nebet Tepe"] },
  { slug: "tsarevets-fortress", name: "Tsarevets Fortress", city: "Veliko Tarnovo", description: "Medieval citadel above the Yantra river bend.", emoji: "🏰", lat: 43.0820, lng: 25.6540,
    longDescription: "The crown of the Second Bulgarian Empire, perched on a rocky hill inside a dramatic loop of the Yantra River. Walk the rebuilt walls past the Patriarchal Cathedral and the execution rock to a panoramic view of the old town's stacked houses.",
    hours: "Apr–Oct 08:00–19:00 · Nov–Mar 09:00–17:00", ticketPrice: "Adults 10 BGN · Students 4 BGN", bestTime: "Summer evenings — catch the 'Sound and Light' show",
    website: "https://museumvt.com", tips: ["The Sound and Light show runs on special dates — check the schedule", "Climbing the tower is steep but worth it", "Combine with Samovodska Charshia craft street"] },
  { slug: "belogradchik-rocks", name: "Belogradchik Rocks", city: "Belogradchik", description: "Surreal red sandstone formations and a hilltop fort.", emoji: "🪨", lat: 43.6256, lng: 22.6831,
    longDescription: "A 30 km strip of fantastical red and grey sandstone pillars rising up to 200 m, formed over 230 million years. Roman, Bulgarian and Ottoman builders fused the natural rocks into the Kaleto fortress, one of the most photogenic castles in the Balkans.",
    hours: "Apr–Oct 08:00–20:00 · Nov–Mar 09:00–17:00", ticketPrice: "Fortress 6 BGN · Magura Cave (nearby) 6 BGN", bestTime: "Golden hour — the rocks glow red",
    tips: ["Wear sturdy shoes — there are exposed stairs on the rocks", "Pair with a wine tasting at Magura Winery", "Allow 2–3 hours including the climb"] },
  { slug: "cape-kaliakra", name: "Cape Kaliakra", city: "Black Sea Coast", description: "Dramatic red cliffs jutting into the Black Sea.", emoji: "🌊", lat: 43.3661, lng: 28.4661,
    longDescription: "A narrow 2 km headland of 70 m red cliffs cutting into the Black Sea, with a nature reserve, dolphin pods offshore, and the ruined Thracian/Byzantine fortress of the despot Dobrotitsa.",
    hours: "Daily 08:00–20:00 (reserve gates close earlier off-season)", ticketPrice: "Reserve entry 3 BGN · Museum 3 BGN", bestTime: "May–September for dolphin sightings",
    tips: ["Stop at the cliff-edge restaurant for mussels", "Bring a windbreaker — it's exposed", "Don't lean over the cliffs; they have no railings"] },
  { slug: "seven-rila-lakes", name: "Seven Rila Lakes", city: "Rila National Park", description: "Glacial lakes strung across an alpine cirque.", emoji: "🏞️", lat: 42.2164, lng: 23.3194,
    longDescription: "Seven glacial lakes stair-step across an alpine cirque at 2,100–2,500 m. Each lake has a poetic name — The Tear, The Eye, The Kidney, The Twin, The Trefoil, The Fish Lake, and The Lower Lake — and a chairlift saves the first 1,000 m of elevation.",
    hours: "Chairlift Jun–Oct 08:30–17:00 (weather permitting)", ticketPrice: "Chairlift return 21 BGN · Park entry free", bestTime: "July–September — snow-free trails",
    tips: ["Start early to beat afternoon thunderstorms", "Bring layers — it can drop below 10°C even in August", "The full circuit is 6–7 hours; the viewpoint above The Eye is a shorter 2-hour option"] },
  { slug: "nesebar-old-town", name: "Nesebar Old Town", city: "Nesebar", description: "Island town packed with Byzantine churches.", emoji: "⛵", lat: 42.6593, lng: 27.7330,
    longDescription: "A UNESCO-listed peninsula linked to the mainland by a 400 m isthmus, packed with more than 40 medieval churches in just 27 hectares. Cobbled lanes wind past wooden Revival houses overhanging stone foundations.",
    hours: "Old Town open 24/7 · Most churches 09:30–18:00", ticketPrice: "Combined church ticket 10 BGN", bestTime: "Late spring or September — July & August get packed",
    tips: ["Park on the mainland and walk across", "Try the local fig jam at the small kiosks", "Sunset from the western seawall is unbeatable"] },
  { slug: "buzludzha-monument", name: "Buzludzha Monument", city: "Central Stara Planina", description: "Otherworldly brutalist UFO on a mountain ridge.", emoji: "🛸", lat: 42.7358, lng: 25.3936,
    longDescription: "Built in 1981 as the Bulgarian Communist Party's House-Monument, this concrete saucer at 1,432 m was abandoned in 1991. The interior mosaics covered 937 m² before decay; conservation is ongoing under the Buzludzha Project.",
    hours: "Exterior accessible year-round · Interior CLOSED to public", ticketPrice: "Free (exterior only)", bestTime: "Late spring through autumn — road closed by snow in winter",
    website: "https://buzludzha-monument.com", tips: ["Do not attempt to enter — it's unsafe and patrolled", "The last 12 km of road is steep — check your tyres", "Guided 'open days' run a few times a year — book ahead"] },
  { slug: "pirin-national-park", name: "Pirin National Park", city: "Bansko", description: "Granite peaks, glacial lakes, alpine trails.", emoji: "⛰️", lat: 41.7600, lng: 23.4300,
    longDescription: "A UNESCO World Heritage park of granite and marble peaks above 2,900 m, 176 glacial lakes, and the 1,300-year-old Baikushev's pine. Bansko is the main trailhead and ski hub.",
    hours: "Open year-round · Refuges Jun–Oct", ticketPrice: "Park entry free · Bansko gondola return 30 BGN", bestTime: "July–September for hiking · Dec–April for skiing",
    tips: ["The Vihren peak hike (2,914 m) is full-day, technical near the top", "Refuges accept cash only", "Book gondola tickets online to skip the morning queue"] },
  { slug: "sozopol-old-town", name: "Sozopol Old Town", city: "Sozopol", description: "Wooden houses on a pine-covered peninsula.", emoji: "🏖️", lat: 42.4180, lng: 27.6953,
    longDescription: "Founded by Greek colonists as Apollonia in 610 BC, Sozopol's wooden-clad Revival houses cling to a small rocky peninsula. The Apollonia Arts Festival fills the Old Town with concerts every September.",
    hours: "Open 24/7 · Archaeological Museum 09:00–18:00", ticketPrice: "Town free · Archaeological Museum 5 BGN · St Ivan island boat ~20 BGN", bestTime: "June or September for warm sea without summer crowds",
    tips: ["Boat trips to St Ivan island leave from the southern pier", "Harmanite Beach is wider and less busy than the central beach", "Try local sand-baked bread (parlenka)"] },
  { slug: "koprivshtitsa", name: "Koprivshtitsa", city: "Sredna Gora", description: "Frozen-in-time Revival village of painted houses.", emoji: "🏘️", lat: 42.6356, lng: 24.3550,
    longDescription: "An open-air museum of 388 protected 19th-century Revival houses, where the 1876 April Uprising against Ottoman rule began. Six house-museums tell the stories of the revolutionaries and merchants who lived here.",
    hours: "Museums Tue–Sun 09:30–17:30 (closed Mondays)", ticketPrice: "Combined 6-museum ticket 6 BGN · Single museum 3 BGN", bestTime: "May–October — winters are cold and many museums shorten hours",
    tips: ["Buy the combined ticket at the first museum you visit", "Stop for traditional banitsa and ayran in the village square", "It's a 90 min drive from Sofia, easy day trip"] },
  { slug: "bachkovo-monastery", name: "Bachkovo Monastery", city: "Rhodope Mountains", description: "Second-largest monastery, founded in 1083.", emoji: "🛕", lat: 41.9408, lng: 24.8503,
    longDescription: "Founded in 1083 by Georgian brothers and the second-largest monastery in Bulgaria. The 17th-century murals in the refectory and the miraculous icon of the Virgin Mary draw thousands of pilgrims every Easter.",
    hours: "Daily 07:00–20:00", ticketPrice: "Free · Donations welcome · Ossuary 2 BGN", bestTime: "Weekdays — weekends bring large pilgrim groups",
    tips: ["The ossuary frescoes (1083) are the oldest in Bulgaria — don't skip them", "Buy honey and walnuts from the stalls along the access road", "Combine with Asen's Fortress 15 km north"] },
  { slug: "shipka-memorial", name: "Shipka Memorial", city: "Shipka Pass", description: "Liberation-war monument crowning the Balkan range.", emoji: "🗿", lat: 42.7553, lng: 25.3206,
    longDescription: "A 31.5 m stone tower at 1,326 m on Stoletov Peak, commemorating the 1877 defenders of the Shipka Pass during the Russo-Turkish liberation war. A 894-step staircase from the road leads to the base.",
    hours: "Apr–Oct 09:00–17:30 · Nov–Mar 09:00–16:00", ticketPrice: "Adults 5 BGN · Students 2 BGN", bestTime: "Clear summer days for the 360° Balkan views",
    tips: ["The stairs are steep — pace yourself", "Pair with the golden-domed Shipka Memorial Church 10 km north", "Wind picks up in the afternoon — bring a layer"] },
  { slug: "devils-throat-cave", name: "Devil's Throat Cave", city: "Trigrad Gorge", description: "Roaring underground waterfall in the Rhodopes.", emoji: "🕳️", lat: 41.6158, lng: 24.3736,
    longDescription: "A cave shaped like a devil's head where the Trigrad River disappears underground in a 42 m waterfall — the tallest underground waterfall in the Balkans. Legend says this is where Orpheus descended to find Eurydice.",
    hours: "Apr–Oct 09:00–17:00 · winter by appointment", ticketPrice: "Adults 6 BGN · Children 3 BGN", bestTime: "May & June when the waterfall is at peak flow",
    tips: ["Bring a jacket — the cave stays 6°C year-round", "Tours run every 30 minutes in season", "The road through Trigrad Gorge is a destination on its own"] },
  { slug: "pobiti-kamani", name: "Pobiti Kamani", city: "near Varna", description: "Eerie stone desert of natural rock columns.", emoji: "🏜️", lat: 43.2236, lng: 27.7053,
    longDescription: "A 50-million-year-old field of hollow limestone columns up to 7 m tall, scattered across a sandy semi-desert. Geologists still debate whether they formed under an ancient sea or from gas seeps.",
    hours: "Daily 08:00–20:00 (gates close earlier off-season)", ticketPrice: "Adults 3 BGN · Children 1 BGN", bestTime: "Spring & autumn — summer midday is harsh and shadeless",
    tips: ["Climb the small viewing mound for the best photo", "It's 20 minutes off the Sofia–Varna highway — easy detour", "No food on-site, bring water"] },
  { slug: "sveti-vlas-marina", name: "Sveti Vlas Marina", city: "Sveti Vlas", description: "Yacht harbor under the Stara Planina foothills.", emoji: "⚓", lat: 42.7106, lng: 27.7575,
    longDescription: "The largest yacht marina on the Bulgarian Black Sea coast, with 300 berths and a long boardwalk of seafood restaurants. A quieter alternative to Sunny Beach next door.",
    hours: "Open 24/7 · Restaurants 10:00–23:00", ticketPrice: "Free to walk · Boat trips from 25 BGN", bestTime: "Sunset in summer for the harbour light show",
    tips: ["Catamaran trips to Nesebar leave every hour in summer", "The eastern breakwater has the best sunset view", "Park outside the marina — internal parking is paid"] },
  { slug: "asens-fortress", name: "Asen's Fortress", city: "Asenovgrad", description: "Cliffside medieval fort with a lone red church.", emoji: "🏯", lat: 41.9911, lng: 24.8744,
    longDescription: "A Byzantine-era fortress dramatically perched on a 279 m rock spur above the Asenitsa river gorge. The 12th-century Church of the Holy Mother of God still stands intact, with original frescoes inside.",
    hours: "Apr–Oct 09:00–18:00 · Nov–Mar 10:00–16:00", ticketPrice: "Adults 4 BGN · Students 2 BGN", bestTime: "Late afternoon when the rocks turn gold",
    tips: ["10 minutes' drive from Bachkovo Monastery — combine them", "The final climb is short but steep", "No food on-site"] },
  { slug: "krushuna-falls", name: "Krushuna Falls", city: "near Lovech", description: "Travertine cascades through emerald pools.", emoji: "💧", lat: 43.2336, lng: 25.0150,
    longDescription: "A staircase of turquoise travertine pools cascading through a mossy forest, fed by an underground river. A wooden boardwalk loops around the lower pools; a steeper path climbs to the main 15 m fall.",
    hours: "Daily, daylight hours", ticketPrice: "Park entry 3 BGN", bestTime: "Spring after snowmelt for maximum flow",
    tips: ["Swimming is forbidden to protect the travertine", "Combine with Devetashka Cave 25 km away", "Avoid weekends in July & August — it gets very crowded"] },
];
