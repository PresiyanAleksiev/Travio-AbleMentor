import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  from: z.object({ lat: z.number(), lng: z.number() }),
  to: z.object({ lat: z.number(), lng: z.number() }),
});

export interface DirectionsResult {
  distanceKm: number;
  durationMin: number;
  polyline: string; // encoded polyline
  status: string;
}

export const getDirections = createServerFn({ method: "POST" })
  .inputValidator((input) => Input.parse(input))
  .handler(async ({ data }): Promise<DirectionsResult> => {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) {
      throw new Error("GOOGLE_MAPS_API_KEY is not configured");
    }
    const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
    url.searchParams.set("origin", `${data.from.lat},${data.from.lng}`);
    url.searchParams.set("destination", `${data.to.lat},${data.to.lng}`);
    url.searchParams.set("mode", "driving");
    url.searchParams.set("region", "bg");
    url.searchParams.set("key", key);

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`Google Directions error ${res.status}`);
    }
    const json = (await res.json()) as {
      status: string;
      error_message?: string;
      routes: Array<{
        overview_polyline: { points: string };
        legs: Array<{ distance: { value: number }; duration: { value: number } }>;
      }>;
    };
    if (json.status !== "OK" || !json.routes[0]) {
      throw new Error(`Directions failed: ${json.status}${json.error_message ? ` — ${json.error_message}` : ""}`);
    }
    const route = json.routes[0];
    const meters = route.legs.reduce((s, l) => s + l.distance.value, 0);
    const seconds = route.legs.reduce((s, l) => s + l.duration.value, 0);
    return {
      distanceKm: Math.round(meters / 100) / 10,
      durationMin: Math.round(seconds / 60),
      polyline: route.overview_polyline.points,
      status: json.status,
    };
  });