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
}

export const LANDMARKS: Landmark[] = [
  { name: "Rila Monastery", city: "Rila Mountains", description: "UNESCO 10th-century monastery tucked in pine forests.", emoji: "⛪" },
  { name: "Plovdiv Old Town", city: "Plovdiv", description: "Cobbled Revival quarter with Roman ruins underfoot.", emoji: "🏛️" },
  { name: "Tsarevets Fortress", city: "Veliko Tarnovo", description: "Medieval citadel above the Yantra river bend.", emoji: "🏰" },
  { name: "Belogradchik Rocks", city: "Belogradchik", description: "Surreal red sandstone formations and a hilltop fort.", emoji: "🪨" },
  { name: "Cape Kaliakra", city: "Black Sea Coast", description: "Dramatic red cliffs jutting into the Black Sea.", emoji: "🌊" },
  { name: "Seven Rila Lakes", city: "Rila National Park", description: "Glacial lakes strung across an alpine cirque.", emoji: "🏞️" },
  { name: "Nesebar Old Town", city: "Nesebar", description: "Island town packed with Byzantine churches.", emoji: "⛵" },
  { name: "Buzludzha Monument", city: "Central Stara Planina", description: "Otherworldly brutalist UFO on a mountain ridge.", emoji: "🛸" },
  { name: "Pirin National Park", city: "Bansko", description: "Granite peaks, glacial lakes, alpine trails.", emoji: "⛰️" },
  { name: "Sozopol Old Town", city: "Sozopol", description: "Wooden houses on a pine-covered peninsula.", emoji: "🏖️" },
];
