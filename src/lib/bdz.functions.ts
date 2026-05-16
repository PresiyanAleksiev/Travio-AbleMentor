import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Major Bulgarian city → BDŽ station ID (from api/Nomenclatures/GetNomenclatures)
const STATION_IDS: Record<string, number> = {
  sofia: 2,
  plovdiv: 3,
  varna: 4,
  burgas: 9,
  ruse: 7,
  "stara zagora": 8,
  pleven: 6,
  "veliko tarnovo": 26,
  blagoevgrad: 25,
  shumen: 19,
  sliven: 18,
  pernik: 23,
  vidin: 17,
  haskovo: 24,
  bansko: 92,
};

export function bdzStationId(name: string): number | null {
  return STATION_IDS[name.trim().toLowerCase()] ?? null;
}

const Input = z.object({
  from: z.string().min(1).max(80),
  to: z.string().min(1).max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export interface BdzDeparture {
  trainName: string;       // "БВ 8611"
  departTime: string;      // "06:30"
  arriveTime: string;      // "09:14"
  departDate: string;      // "17.05.2026"
  arriveDate: string;
  totalTime: string;       // "02:44"
  totalMinutes: number;
  distanceKm: number;
  transfers: number;       // trains.length - 1
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

function hhmmToMin(s: string): number {
  const [h, m] = s.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export const getBdzSchedule = createServerFn({ method: "POST" })
  .inputValidator((input) => Input.parse(input))
  .handler(async ({ data }): Promise<BdzScheduleResult> => {
    const fromId = bdzStationId(data.from);
    const toId = bdzStationId(data.to);
    if (!fromId || !toId) {
      return { supported: false, departures: [] };
    }
    const date = data.date ?? new Date().toISOString().slice(0, 10);

    try {
      const res = await fetch("https://tickets.bdz.bg/portal/api/POSRoute/Trains", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Origin: "https://bileti.bdz.bg",
          Referer: "https://bileti.bdz.bg/",
          "User-Agent": "Mozilla/5.0",
        },
        body: JSON.stringify([{ date, station_from: fromId, station_to: toId }]),
      });
      if (!res.ok) {
        return { supported: true, departures: [], error: `BDŽ API error ${res.status}` };
      }
      const json = (await res.json()) as Array<{
        date: string;
        name: string;
        options: Array<{
          total_time: string;
          total_distance: number;
          departure_time: string;
          departure_date: string;
          arrival_time: string;
          arrival_date: string;
          trains: Array<{
            name: string;
            information: { first_class: boolean; second_class: boolean };
            is_delayed: boolean;
          }>;
        }>;
      }>;
      const group = json[0];
      if (!group) return { supported: true, departures: [] };
      const [fromName, toName] = group.name.split(" - ");
      const departures: BdzDeparture[] = group.options.map((o) => {
        const trainNames = o.trains.map((t) => t.name).join(" → ");
        const anyFirst = o.trains.some((t) => t.information.first_class);
        const anySecond = o.trains.some((t) => t.information.second_class);
        const anyDelay = o.trains.some((t) => t.is_delayed);
        return {
          trainName: trainNames,
          departTime: o.departure_time,
          arriveTime: o.arrival_time,
          departDate: o.departure_date,
          arriveDate: o.arrival_date,
          totalTime: o.total_time,
          totalMinutes: hhmmToMin(o.total_time),
          distanceKm: o.total_distance,
          transfers: Math.max(0, o.trains.length - 1),
          hasFirstClass: anyFirst,
          hasSecondClass: anySecond,
          isDelayed: anyDelay,
        };
      });
      return {
        supported: true,
        fromName,
        toName,
        date: group.date,
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
