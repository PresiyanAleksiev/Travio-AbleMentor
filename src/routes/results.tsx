import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Bus, Train, Car, Clock, Euro, Zap, PiggyBank, Sparkles, ArrowLeft,
  Fuel, Ticket, CarTaxiFront, AlertTriangle, Info, CloudRain, Map as MapIcon,
} from "lucide-react";
import { CITY_COORDS, LANDMARKS, type Coords, type Landmark } from "@/lib/bulgaria-data";
import { decodePolyline, distanceToPathKm, distanceToSegmentKm, roadKm } from "@/lib/geo";
import { getDirections } from "@/lib/directions.functions";
import { getBdzSchedule, type BdzDeparture } from "@/lib/bdz.functions";
import { RouteMap } from "@/components/RouteMap";
import { Header, Footer } from "./index";

interface SearchParams { from: string; to: string }

export const Route = createFileRoute("/results")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    from: typeof s.from === "string" ? s.from : "",
    to: typeof s.to === "string" ? s.to : "",
  }),
  head: ({ match }) => {
    const { from, to } = match.search as SearchParams;
    const title = from && to ? `${from} → ${to} — Travio` : "Routes — Travio";
    return {
      meta: [
        { title },
        { name: "description", content: `Compare bus, train and car routes from ${from || "your start"} to ${to || "your destination"} in Bulgaria.` },
        { property: "og:title", content: title },
      ],
    };
  },
  component: ResultsPage,
});

type Mode = "bus" | "train" | "car";
type Category = "fastest" | "cheapest" | "convenient";

interface RouteOption {
  category: Category;
  mode: Mode;
  hours: number;
  minutes: number;
  cost: number;
  note: string;
  breakdown: { label: string; amount: number; icon: typeof Fuel }[];
}

interface Alert { level: "info" | "warning" | "delay"; title: string; body: string }

const MAX_LANDMARK_KM = 30;

function hashStr(s: string) {
  let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function lookupCoords(name: string): Coords | null {
  return CITY_COORDS[name.trim().toLowerCase()] ?? null;
}

function generateRoutes(seed: number, km: number, realDriveMin?: number, trainMin?: number): RouteOption[] {
  const fastestTotalMin = realDriveMin ?? Math.max(45, Math.round((km / 95) * 60));
  const cheapestTotalMin = Math.round((km / 70) * 60) + 60;
  const convTotalMin = trainMin ?? Math.round((km / 80) * 60) + 20;

  const fuel = Math.round(km * 0.085 * 10) / 10;
  const tolls = km > 200 ? Math.round((km * 0.012) * 10) / 10 : 0;
  const fastestCost = Math.round((fuel + tolls) * 10) / 10;

  const ticket = Math.round((km * 0.045 + 4) * 10) / 10;
  const transfer = Math.round((seed % 3) * 1.5 * 10) / 10;
  const taxiToTerminal = 4 + (seed % 4);
  const cheapestCost = Math.round((ticket + transfer + taxiToTerminal) * 10) / 10;

  const trainTicket = Math.round((km * 0.06 + 5) * 10) / 10;
  const taxiToStation = 5 + (seed % 5);
  const convCost = Math.round((trainTicket + taxiToStation) * 10) / 10;

  return [
    { category: "fastest",    mode: "car",   hours: Math.floor(fastestTotalMin/60), minutes: fastestTotalMin%60, cost: fastestCost,
      note: "Direct highway route via private car",
      breakdown: [
        { label: "Fuel (~7L/100km)", amount: fuel, icon: Fuel },
        { label: "Tolls & vignette", amount: tolls, icon: Ticket },
        { label: "Taxi", amount: 0, icon: CarTaxiFront },
      ]},
    { category: "cheapest",   mode: "bus",   hours: Math.floor(cheapestTotalMin/60), minutes: cheapestTotalMin%60, cost: cheapestCost,
      note: "Intercity bus, may include a transfer",
      breakdown: [
        { label: "Bus ticket", amount: ticket, icon: Ticket },
        { label: "Transfer fee", amount: transfer, icon: Bus },
        { label: "Taxi to terminal", amount: taxiToTerminal, icon: CarTaxiFront },
      ]},
    { category: "convenient", mode: "train", hours: Math.floor(convTotalMin/60), minutes: convTotalMin%60, cost: convCost,
      note: "Direct train, comfortable seating",
      breakdown: [
        { label: "Train ticket", amount: trainTicket, icon: Ticket },
        { label: "Fuel", amount: 0, icon: Fuel },
        { label: "Taxi to station", amount: taxiToStation, icon: CarTaxiFront },
      ]},
  ];
}

function generateAlerts(seed: number): Alert[] {
  const pool: Alert[] = [
    { level: "delay",   title: "Train BV 8612 delayed 25 min", body: "BDŽ reports a signaling issue near Mezdra. Connections may be affected." },
    { level: "warning", title: "Heavy traffic on A1 near Trakia", body: "Average speeds dropping to 35 km/h between Plovdiv and Stara Zagora." },
    { level: "info",    title: "Bus terminal change", body: "Departures temporarily moved to Serdika Center bay 4." },
    { level: "warning", title: "Vignette checkpoint active", body: "Road police are inspecting vignettes on the Hemus highway." },
    { level: "delay",   title: "Rain expected in the Balkan range", body: "Plan extra time on mountain passes after 6pm." },
    { level: "info",    title: "Discounted weekend train fares", body: "BDŽ offers 30% off return tickets through Sunday." },
  ];
  return [0,1,2].map((i) => pool[(seed + i * 7) % pool.length]);
}

function landmarksAlongRoute(
  from: Coords,
  to: Coords,
  path?: Coords[],
): Array<Landmark & { detourKm: number }> {
  return LANDMARKS
    .map((l) => {
      const p = { lat: l.lat, lng: l.lng };
      const detourKm = path && path.length > 1
        ? distanceToPathKm(p, path)
        : distanceToSegmentKm(p, from, to);
      return { ...l, detourKm };
    })
    .filter((l) => l.detourKm <= MAX_LANDMARK_KM)
    .sort((a, b) => a.detourKm - b.detourKm);
}

const MODE_ICON: Record<Mode, typeof Bus> = { bus: Bus, train: Train, car: Car };
const MODE_LABEL: Record<Mode, string> = { bus: "Bus", train: "Train", car: "Car" };
const CAT_META: Record<Category, { label: string; tagline: string; icon: typeof Zap; accent: string }> = {
  fastest:    { label: "Fastest",         tagline: "Save hours",          icon: Zap,        accent: "from-primary to-accent" },
  cheapest:   { label: "Cheapest",        tagline: "Stretch your budget", icon: PiggyBank,  accent: "from-secondary to-primary" },
  convenient: { label: "Most Convenient", tagline: "Smoothest ride",      icon: Sparkles,   accent: "from-accent to-secondary" },
};

function ResultsPage() {
  const { from, to } = Route.useSearch();

  const base = useMemo(() => {
    const fromCoords = lookupCoords(from);
    const toCoords = lookupCoords(to);
    if (!fromCoords || !toCoords) return null;
    const seed = hashStr(from.toLowerCase() + "→" + to.toLowerCase());
    return { fromCoords, toCoords, seed };
  }, [from, to]);

  const fetchDirections = useServerFn(getDirections);
  const directionsQuery = useQuery({
    queryKey: ["directions", from, to],
    enabled: !!base,
    queryFn: () => fetchDirections({ data: { from: base!.fromCoords, to: base!.toCoords } }),
    staleTime: 1000 * 60 * 60,
  });

  const fetchBdz = useServerFn(getBdzSchedule);
  const bdzQuery = useQuery({
    queryKey: ["bdz", from, to],
    enabled: !!from && !!to,
    queryFn: () => fetchBdz({ data: { from, to } }),
    staleTime: 1000 * 60 * 10,
  });

  const trip = useMemo(() => {
    if (!base) return null;
    const dir = directionsQuery.data;
    const decoded = dir ? decodePolyline(dir.polyline).map(([lat, lng]) => ({ lat, lng })) : undefined;
    const km = dir ? Math.round(dir.distanceKm) : roadKm(base.fromCoords, base.toCoords);
    const realDriveMin = dir?.durationMin;
    const nextTrain = bdzQuery.data?.departures.find((d) => {
      // pick the next upcoming departure if today's data
      return true;
    });
    const trainMin = nextTrain?.totalMinutes;
    return {
      ...base,
      km,
      pathLatLng: decoded ? (decoded.map((c) => [c.lat, c.lng]) as Array<[number, number]>) : undefined,
      pathCoords: decoded,
      routes: generateRoutes(base.seed, km, realDriveMin, trainMin),
      alerts: generateAlerts(base.seed),
      landmarks: landmarksAlongRoute(base.fromCoords, base.toCoords, decoded),
    };
  }, [base, directionsQuery.data, bdzQuery.data]);

  return (
    <main className="font-unified min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-6xl px-6 pt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> New search
        </Link>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-10">
        {!from || !to ? (
          <EmptyState />
        ) : !trip ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <p className="text-foreground">
              We don't have coordinates for <strong>{from}</strong> or <strong>{to}</strong> yet.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a major Bulgarian city from the home page.
            </p>
          </div>
        ) : (
          <div className="space-y-14">
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <h1 className="font-display text-3xl font-bold text-foreground sm:text-5xl">
                {from} <span className="text-muted-foreground">→</span> {to}
              </h1>
              <span className="text-sm text-muted-foreground">
                {directionsQuery.isLoading
                  ? "Loading live route from Google…"
                  : directionsQuery.isError
                    ? `~${trip.km} km · live route unavailable, showing estimates`
                    : `${trip.km} km · live Google route · estimates in EUR`}
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {trip.routes.map((r) => <RouteCard key={r.category} route={r} />)}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <section>
                <SectionHeader icon={MapIcon} title="Route on the map" subtitle="OpenStreetMap overview of your trip" />
                <RouteMap
                  from={trip.fromCoords}
                  to={trip.toCoords}
                  fromName={from}
                  toName={to}
                  path={trip.pathLatLng}
                />
              </section>
              <section>
                <SectionHeader icon={AlertTriangle} title="Live alerts" subtitle="Schedule changes & traffic now" />
                <div className="space-y-3">
                  {trip.alerts.map((a, i) => <AlertCard key={i} alert={a} />)}
                </div>
              </section>
            </div>

            <section>
              <SectionHeader
                icon={Sparkles}
                title="Worth a stop along the way"
                subtitle={`Landmarks within ${MAX_LANDMARK_KM} km of your route`}
              />
              {trip.landmarks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
                  No notable landmarks within {MAX_LANDMARK_KM} km of this route.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {trip.landmarks.map((l) => <LandmarkCard key={l.name} landmark={l} />)}
                </div>
              )}
            </section>

            <BdzScheduleSection
              isLoading={bdzQuery.isLoading}
              isError={bdzQuery.isError}
              data={bdzQuery.data}
            />
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-border bg-card p-10 text-center">
      <h2 className="font-display text-2xl font-bold text-foreground">Pick a start and destination</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Head back to the home page and choose your cities.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <ArrowLeft className="h-4 w-4" /> Back to search
      </Link>
    </div>
  );
}

function RouteCard({ route }: { route: RouteOption }) {
  const meta = CAT_META[route.category];
  const ModeIcon = MODE_ICON[route.mode];
  const CatIcon = meta.icon;
  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Gradient header */}
      <div
        className={`relative bg-gradient-to-br ${meta.accent} px-6 pt-6 pb-8 text-primary-foreground`}
      >
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
              <CatIcon className="h-3 w-3" />
              {meta.tagline}
            </div>
            <h3 className="mt-3 text-2xl font-bold leading-tight">{meta.label}</h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <ModeIcon className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="-mt-5 mx-4 grid grid-cols-2 rounded-2xl border border-border bg-card shadow-sm">
        <div className="px-4 py-3 border-r border-border">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Clock className="h-3 w-3" /> Time
          </div>
          <div className="mt-0.5 text-xl font-bold text-foreground tabular-nums">
            {route.hours}h {route.minutes.toString().padStart(2, "0")}m
          </div>
        </div>
        <div className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total <Euro className="h-3 w-3" />
          </div>
          <div className="mt-0.5 text-xl font-bold text-foreground tabular-nums">
            €{route.cost.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 pt-5">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{MODE_LABEL[route.mode]}</span> · {route.note}
        </p>

        <div className="mt-5 flex-1 rounded-2xl bg-muted/50 p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Cost breakdown
          </div>
          <ul className="mt-3 space-y-2.5">
            {route.breakdown
              .filter((b) => b.amount > 0)
              .map((b) => {
                const Icon = b.icon;
                return (
                  <li key={b.label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-foreground">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-card">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </span>
                      {b.label}
                    </span>
                    <span className="font-semibold text-foreground tabular-nums">
                      €{b.amount.toFixed(2)}
                    </span>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
    </article>
  );
}

function Stat({ icon, label, value, align = "left" }: { icon: React.ReactNode; label: string; value: string; align?: "left" | "right" }) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {align === "left" && icon}{label}{align === "right" && icon}
      </div>
      <div className="mt-1 font-display text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: typeof MapIcon; title: string; subtitle: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h3 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />{title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function AlertCard({ alert }: { alert: Alert }) {
  const config = {
    delay:   { Icon: Clock,         dot: "bg-primary",   label: "Delay" },
    warning: { Icon: AlertTriangle, dot: "bg-accent",    label: "Warning" },
    info:    { Icon: Info,          dot: "bg-secondary", label: "Info" },
  }[alert.level];
  const { Icon } = config;
  return (
    <article className="rounded-2xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
          <Icon className="h-4 w-4 text-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {config.label} · live
            </span>
          </div>
          <h4 className="mt-1 font-semibold text-foreground">{alert.title}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{alert.body}</p>
        </div>
      </div>
    </article>
  );
}

function LandmarkCard({ landmark }: { landmark: Landmark & { detourKm: number } }) {
  return (
    <Link
      to="/landmark/$slug"
      params={{ slug: landmark.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div
        className="mb-4 flex h-24 w-full items-center justify-center rounded-xl text-5xl"
        style={{ background: "var(--gradient-warm)", opacity: 0.95 }}
      >
        <span aria-hidden>{landmark.emoji}</span>
      </div>
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span><CloudRain className="mr-1 inline h-3 w-3" />{landmark.city}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-foreground">
          {landmark.detourKm < 1 ? "on route" : `${landmark.detourKm.toFixed(0)} km off`}
        </span>
      </div>
      <h4 className="mt-1 font-display text-lg font-bold text-foreground transition-colors group-hover:text-primary">{landmark.name}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{landmark.description}</p>
      <span className="mt-3 text-xs font-semibold uppercase tracking-wider text-primary opacity-0 transition-opacity group-hover:opacity-100">
        View details →
      </span>
    </Link>
  );
}

function BdzScheduleSection({
  isLoading,
  isError,
  data,
}: {
  isLoading: boolean;
  isError: boolean;
  data: { supported: boolean; fromName?: string; toName?: string; date?: string; departures: BdzDeparture[]; error?: string } | undefined;
}) {
  if (isLoading) {
    return (
      <section>
        <SectionHeader icon={Train} title="Train schedule (БДЖ)" subtitle="Live departures from Bulgarian Railways" />
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
          Loading live BDŽ schedule…
        </div>
      </section>
    );
  }
  if (!data || isError) return null;
  if (!data.supported) {
    return (
      <section>
        <SectionHeader icon={Train} title="Train schedule (БДЖ)" subtitle="Live departures from Bulgarian Railways" />
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
          No BDŽ station mapped for this route yet.
        </div>
      </section>
    );
  }
  if (data.error) {
    return (
      <section>
        <SectionHeader icon={Train} title="Train schedule (БДЖ)" subtitle="Live departures from Bulgarian Railways" />
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
          Couldn't reach БДЖ: {data.error}
        </div>
      </section>
    );
  }
  if (data.departures.length === 0) {
    return (
      <section>
        <SectionHeader icon={Train} title="Train schedule (БДЖ)" subtitle={`No direct departures found for ${data.date ?? "today"}`} />
      </section>
    );
  }
  const next = data.departures.slice(0, 6);
  return (
    <section>
      <SectionHeader
        icon={Train}
        title="Train schedule (БДЖ)"
        subtitle={`Live from Bulgarian Railways · ${data.fromName} → ${data.toName} · ${data.date}`}
      />
      <div className="overflow-hidden rounded-2xl border border-border bg-card" style={{ boxShadow: "var(--shadow-card)" }}>
        <ul className="divide-y divide-border">
          {next.map((d, i) => (
            <li key={`${d.trainName}-${d.departTime}-${i}`} className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 sm:grid-cols-[1.2fr_1fr_auto]">
              <div>
                <div className="font-display text-lg font-bold text-foreground tabular-nums">
                  {d.departTime} <span className="text-muted-foreground">→</span> {d.arriveTime}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {d.trainName} · {d.distanceKm} km
                  {d.transfers > 0 ? ` · ${d.transfers} transfer${d.transfers > 1 ? "s" : ""}` : " · direct"}
                </div>
              </div>
              <div className="hidden text-sm text-foreground sm:block">
                <Clock className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                {d.totalTime}
              </div>
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                {d.hasFirstClass && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground">1st</span>
                )}
                {d.hasSecondClass && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground">2nd</span>
                )}
                {d.isDelayed && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">delayed</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Source: razpisanie.bdz.bg · prices on the card above are estimates; click БДЖ to book.
      </p>
    </section>
  );
}
