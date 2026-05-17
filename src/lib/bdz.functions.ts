import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Cities supported by razpisanie.bdz.bg slugs. The site accepts dash-separated
// lowercase names (e.g. "veliko-tarnovo"). Any non-supported city returns
// { supported: false } so the UI can fall back gracefully.
const SUPPORTED_CITIES = new Set([
  "sofia", "plovdiv", "varna", "burgas", "ruse", "stara zagora", "pleven",
  "veliko tarnovo", "blagoevgrad", "shumen", "sliven", "pernik", "vidin",
  "haskovo", "bansko", "razlog", "karlovo", "gorna oryahovitsa", "dobrich",
  "kazanlak", "asenovgrad", "lovech", "yambol", "dimitrovgrad", "mezdra",
]);

function citySlug(name: string): string | null {
  const key = name.trim().toLowerCase();
  if (!SUPPORTED_CITIES.has(key)) return null;
  return key.replace(/\s+/g, "-");
}

const Input = z.object({
  from: z.string().min(1).max(80),
  to: z.string().min(1).max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export interface BdzDeparture {
  trainName: string;
  departTime: string;
  arriveTime: string;
  departDate: string;
  arriveDate: string;
  totalTime: string;
  totalMinutes: number;
  distanceKm: number;
  transfers: number;
  hasFirstClass: boolean;
  hasSecondClass: boolean;
  isDelayed: boolean;
}

export interface BdzScheduleResult {
  supported: boolean;
  fromName?: string;
  toName?: string;
  date?: string;
  departures: BdzDeparture[];
  error?: string;
}

function toDDMMYYYY(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function parseCard(chunk: string, date: string): BdzDeparture | null {
  const times = chunk.match(/(\d{2}:\d{2})\s*[—–-]\s*(\d{2}:\d{2})/);
  if (!times) return null;

  const name = chunk.match(/train-info\/(\d+)\/[^"]+"[^>]*>([^<]+)<\/a>/);
  const trainName = name ? decodeEntities(name[2]).trim() : "Train";

  const dur = chunk.match(/>(?:(\d+)\s*h\s*)?(\d+)\s*min</);
  const hours = dur && dur[1] ? Number(dur[1]) : 0;
  const mins = dur ? Number(dur[2]) : 0;
  const totalMinutes = hours * 60 + mins;
  const totalTime = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;

  const stops = Array.from(
    chunk.matchAll(/list-inline-item ps-1">([^<]+)<\/li>/g),
  ).map((m) => decodeEntities(m[1]).trim());
  const transfers = Math.max(0, stops.length - 2);

  const lower = chunk.toLowerCase();
  const hasFirstClass =
    lower.includes("first class") ||
    lower.includes("1st class") ||
    lower.includes("1/2 class");
  const hasSecondClass =
    lower.includes("second class") ||
    lower.includes("2nd class") ||
    lower.includes("1/2 class");

  return {
    trainName,
    departTime: times[1],
    arriveTime: times[2],
    departDate: date,
    arriveDate: date,
    totalTime,
    totalMinutes,
    distanceKm: 0,
    transfers,
    hasFirstClass,
    hasSecondClass,
    isDelayed: lower.includes("delay"),
  };
}

export const getBdzSchedule = createServerFn({ method: "POST" })
  .inputValidator((input) => Input.parse(input))
  .handler(async ({ data }): Promise<BdzScheduleResult> => {
    const fromSlug = citySlug(data.from);
    const toSlug = citySlug(data.to);
    if (!fromSlug || !toSlug) {
      return { supported: false, departures: [] };
    }
    const isoDate = data.date ?? new Date().toISOString().slice(0, 10);
    const ddmmyyyy = toDDMMYYYY(isoDate);
    const url = `https://razpisanie.bdz.bg/en/${fromSlug}/${toSlug}/${ddmmyyyy}`;

    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
      if (!res.ok) {
        return {
          supported: true,
          departures: [],
          error: `BDŽ site error ${res.status}`,
        };
      }
      const html = await res.text();

      // Each result card starts with the marker class "card uv-card".
      const parts = html.split('card uv-card').slice(1);
      const departures: BdzDeparture[] = [];
      for (const part of parts) {
        // Limit chunk to a reasonable window to avoid leaking into the next card.
        const dep = parseCard(part.slice(0, 4000), ddmmyyyy);
        if (dep) departures.push(dep);
      }

      // Pull display names from the H1 heading: "Sofia — Plovdiv, 18 May".
      const heading = html.match(
        /<h1[^>]*>\s*([^—<]+?)\s*[—–-]\s*([^,<]+?),/,
      );
      const fromName = heading
        ? decodeEntities(heading[1]).trim()
        : data.from;
      const toName = heading ? decodeEntities(heading[2]).trim() : data.to;

      return {
        supported: true,
        fromName,
        toName,
        date: ddmmyyyy,
        departures,
      };
    } catch (err) {
      return {
        supported: true,
        departures: [],
        error: err instanceof Error ? err.message : "Failed to reach BDŽ",
      };
    }
  });
