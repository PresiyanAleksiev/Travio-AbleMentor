import type { Coords } from "./bulgaria-data";

const R = 6371; // km

export function haversineKm(a: Coords, b: Coords) {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function roadKm(a: Coords, b: Coords) {
  return Math.round(haversineKm(a, b) * 1.25);
}

// Project lat/lng to local equirectangular km plane (good for short distances)
function toXY(p: Coords, ref: Coords) {
  const x = ((p.lng - ref.lng) * Math.PI) / 180 * R * Math.cos((ref.lat * Math.PI) / 180);
  const y = ((p.lat - ref.lat) * Math.PI) / 180 * R;
  return { x, y };
}

// Distance from point P to segment AB, in km. Bulgaria-scale: small enough that
// equirectangular projection is accurate to <1%.
export function distanceToSegmentKm(p: Coords, a: Coords, b: Coords): number {
  const ref = a;
  const A = { x: 0, y: 0 };
  const B = toXY(b, ref);
  const P = toXY(p, ref);
  const ABx = B.x - A.x, ABy = B.y - A.y;
  const APx = P.x - A.x, APy = P.y - A.y;
  const ab2 = ABx * ABx + ABy * ABy;
  const t = ab2 === 0 ? 0 : Math.max(0, Math.min(1, (APx * ABx + APy * ABy) / ab2));
  const cx = A.x + t * ABx, cy = A.y + t * ABy;
  const dx = P.x - cx, dy = P.y - cy;
  return Math.sqrt(dx * dx + dy * dy);
}
