import { useEffect, useState } from "react";
import type { Coords } from "@/lib/bulgaria-data";

export function RouteMap({
  from,
  to,
  fromName,
  toName,
}: {
  from: Coords;
  to: Coords;
  fromName: string;
  toName: string;
  path?: Array<[number, number]>;
}) {
  const [mounted, setMounted] = useState(false);
  const [Comp, setComp] = useState<any>(null);
  const [isDark, setIsDark] = useState(false);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.routes?.[0]?.geometry?.coordinates) {
          const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng]
          );
          setRoutePath(coords);
        }
      })
      .catch(() => {
        setRoutePath([[from.lat, from.lng], [to.lat, to.lng]]);
      });
  }, [from.lat, from.lng, to.lat, to.lng]);

  useEffect(() => {
    setMounted(true);
    Promise.all([
      import("react-leaflet"),
      import("leaflet"),
      // @ts-ignore
      import("leaflet/dist/leaflet.css"),
    ]).then(([RL, L]) => {
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

  useEffect(() => {
    if (!mounted) return;
    const applyFilter = () => {
      const pane = document.querySelector(".leaflet-tile-pane") as HTMLElement | null;
      if (pane) {
        pane.style.filter = isDark
          ? "invert(1) hue-rotate(180deg) brightness(0.85) contrast(0.9)"
          : "";
      }
    };
    applyFilter();
    const timer = setTimeout(applyFilter, 500);
    return () => clearTimeout(timer);
  }, [isDark, mounted, Comp]);

  if (!mounted || !Comp) {
    return (
      <div className="flex h-[420px] w-full items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground">
        Loading map…
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Polyline, Tooltip } = Comp.RL;
  const positions: [number, number][] = routePath.length > 1
    ? routePath
    : [[from.lat, from.lng], [to.lat, to.lng]];
  const startPos: [number, number] = [from.lat, from.lng];
  const endPos: [number, number] = [to.lat, to.lng];
  const center: [number, number] = [
    (from.lat + to.lat) / 2,
    (from.lng + to.lng) / 2,
  ];

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
            color: "#e05a2b",
            weight: 4,
            opacity: 0.9,
          }}
        />
        <Marker position={startPos} icon={Comp.icon}>
          <Tooltip permanent direction="top" offset={[0, -10]}>{fromName}</Tooltip>
        </Marker>
        <Marker position={endPos} icon={Comp.iconTo}>
          <Tooltip permanent direction="top" offset={[0, -10]}>{toName}</Tooltip>
        </Marker>
      </MapContainer>
    </div>
  );
}
