import { useEffect, useState } from "react";
import type { Coords } from "@/lib/bulgaria-data";

export function RouteMap({
  from,
  to,
  fromName,
  toName,
  path,
}: {
  from: Coords;
  to: Coords;
  fromName: string;
  toName: string;
  path?: Array<[number, number]>;
}) {
  const [mounted, setMounted] = useState(false);
  const [Comp, setComp] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    Promise.all([
      import("react-leaflet"),
      import("leaflet"),
      // @ts-ignore
      import("leaflet/dist/leaflet.css"),
    ]).then(([RL, L]) => {
      // Fix default marker icons (Leaflet expects asset URLs)
      const icon = L.divIcon({
        className: "",
        html: `<div style="background:var(--primary);width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const iconTo = L.divIcon({
        className: "",
        html: `<div style="background:var(--secondary);width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      setComp({ RL, icon, iconTo });
    });
  }, []);

  if (!mounted || !Comp) {
    return (
      <div className="flex h-[420px] w-full items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground">
        Loading map…
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Polyline, Tooltip } = Comp.RL;
  const positions: [number, number][] =
    path && path.length > 1 ? path : [[from.lat, from.lng], [to.lat, to.lng]];
  const center: [number, number] = [
    (from.lat + to.lat) / 2,
    (from.lng + to.lng) / 2,
  ];
  const isReal = !!(path && path.length > 1);

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-2xl border border-border">
      <MapContainer
        center={center}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline
          positions={positions}
          pathOptions={{
            color: "var(--primary)",
            weight: 4,
            opacity: 0.85,
            dashArray: isReal ? undefined : "8 8",
          }}
        />
        <Marker position={positions[0]} icon={Comp.icon}>
          <Tooltip permanent direction="top" offset={[0, -10]}>{fromName}</Tooltip>
        </Marker>
        <Marker position={positions[1]} icon={Comp.iconTo}>
          <Tooltip permanent direction="top" offset={[0, -10]}>{toName}</Tooltip>
        </Marker>
      </MapContainer>
    </div>
  );
}
