import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import {
  Bus, Train, Car, Clock, Euro, Zap, PiggyBank, Sparkles, ArrowRight,
  MapPin, Fuel, Ticket, CarTaxiFront, AlertTriangle, Info, CloudRain, Map as MapIcon,
} from "lucide-react";
import { CITY_COORDS, LANDMARKS, type Coords } from "@/lib/bulgaria-data";
import { RouteMap } from "@/components/RouteMap";

export const Route = createFileRoute("/")({
  component: Index,
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

interface Alert {
  level: "info" | "warning" | "delay";
  title: string;
  body: string;
}

const CITIES = Object.keys(CITY_COORDS).map(
  (k) => k.replace(/\b\w/g, (c) => c.toUpperCase())
);

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function distanceKm(a: Coords, b: Coords) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(x)) * 1.25); // road factor
}

function lookupCoords(name: string): Coords | null {
  return CITY_COORDS[name.trim().toLowerCase()] ?? null;
}

function generateRoutes(from: string, to: string, km: number): RouteOption[] {
  const seed = hashStr(from.toLowerCase() + "→" + to.toLowerCase());
  const baseSpeed = 70;
  const fastestTotalMin = Math.max(45, Math.round((km / 95) * 60));
  const cheapestTotalMin = Math.round((km / baseSpeed) * 60) + 60;
  const convTotalMin = Math.round((km / 80) * 60) + 20;

  // Car (fastest)
  const fuel = Math.round(km * 0.085 * 10) / 10; // ~7L/100km @ €1.65
  const tolls = km > 200 ? Math.round((km * 0.012) * 10) / 10 : 0;
  const taxiFromStation = 0;
  const fastestCost = Math.round((fuel + tolls) * 10) / 10;

  // Bus (cheapest)
  const ticket = Math.round((km * 0.045 + 4) * 10) / 10;
  const transfer = Math.round((seed % 3) * 1.5 * 10) / 10;
  const taxiToTerminal = 4 + (seed % 4);
  const cheapestCost = Math.round((ticket + transfer + taxiToTerminal) * 10) / 10;

  // Train (convenient)
  const trainTicket = Math.round((km * 0.06 + 5) * 10) / 10;
  const taxiToStation = 5 + (seed % 5);
  const convCost = Math.round((trainTicket + taxiToStation) * 10) / 10;

  return [
    {
      category: "fastest",
      mode: "car",
      hours: Math.floor(fastestTotalMin / 60),
      minutes: fastestTotalMin % 60,
      cost: fastestCost,
      note: "Direct highway route via private car",
      breakdown: [
        { label: "Fuel (~7L/100km)", amount: fuel, icon: Fuel },
        { label: "Tolls & vignette", amount: tolls, icon: Ticket },
        { label: "Taxi", amount: taxiFromStation, icon: CarTaxiFront },
      ],
    },
    {
      category: "cheapest",
      mode: "bus",
      hours: Math.floor(cheapestTotalMin / 60),
      minutes: cheapestTotalMin % 60,
      cost: cheapestCost,
      note: "Intercity bus, may include a transfer",
      breakdown: [
        { label: "Bus ticket", amount: ticket, icon: Ticket },
        { label: "Transfer fee", amount: transfer, icon: Bus },
        { label: "Taxi to terminal", amount: taxiToTerminal, icon: CarTaxiFront },
      ],
    },
    {
      category: "convenient",
      mode: "train",
      hours: Math.floor(convTotalMin / 60),
      minutes: convTotalMin % 60,
      cost: convCost,
      note: "Direct train, comfortable seating",
      breakdown: [
        { label: "Train ticket", amount: trainTicket, icon: Ticket },
        { label: "Fuel", amount: 0, icon: Fuel },
        { label: "Taxi to station", amount: taxiToStation, icon: CarTaxiFront },
      ],
    },
  ];
}

function generateAlerts(seed: number): Alert[] {
  const pool: Alert[] = [
    { level: "delay", title: "Train BV 8612 delayed 25 min", body: "BDŽ reports a signaling issue near Mezdra. Connections may be affected." },
    { level: "warning", title: "Heavy traffic on A1 near Trakia", body: "Average speeds dropping to 35 km/h between Plovdiv and Stara Zagora." },
    { level: "info", title: "Bus terminal change", body: "Departures temporarily moved to Serdika Center bay 4." },
    { level: "warning", title: "Vignette checkpoint active", body: "Road police are inspecting vignettes on the Hemus highway." },
    { level: "delay", title: "Rain expected in the Balkan range", body: "Plan extra time on mountain passes after 6pm." },
    { level: "info", title: "Discounted weekend train fares", body: "BDŽ offers 30% off return tickets through Sunday." },
  ];
  const picks: Alert[] = [];
  for (let i = 0; i < 3; i++) picks.push(pool[(seed + i * 7) % pool.length]);
  return picks;
}

function pickLandmarks(seed: number) {
  const out = [];
  for (let i = 0; i < 4; i++) out.push(LANDMARKS[(seed + i * 3) % LANDMARKS.length]);
  return out;
}

const MODE_ICON: Record<Mode, typeof Bus> = { bus: Bus, train: Train, car: Car };
const MODE_LABEL: Record<Mode, string> = { bus: "Bus", train: "Train", car: "Car" };

const CAT_META: Record<
  Category,
  { label: string; tagline: string; icon: typeof Zap; accent: string }
> = {
  fastest: { label: "Fastest", tagline: "Save hours", icon: Zap, accent: "from-primary to-accent" },
  cheapest: { label: "Cheapest", tagline: "Stretch your budget", icon: PiggyBank, accent: "from-secondary to-primary" },
  convenient: { label: "Most Convenient", tagline: "Smoothest ride", icon: Sparkles, accent: "from-accent to-secondary" },
};

function Index() {
  const [from, setFrom] = useState("Sofia");
  const [to, setTo] = useState("Plovdiv");
  const [submittedPair, setSubmittedPair] = useState<{ f: string; t: string } | null>(null);

  const trip = useMemo(() => {
    if (!submittedPair) return null;
    const fromCoords = lookupCoords(submittedPair.f);
    const toCoords = lookupCoords(submittedPair.t);
    if (!fromCoords || !toCoords) return null;
    const km = distanceKm(fromCoords, toCoords);
    const seed = hashStr(submittedPair.f.toLowerCase() + "→" + submittedPair.t.toLowerCase());
    return {
      fromCoords, toCoords, km, seed,
      routes: generateRoutes(submittedPair.f, submittedPair.t, km),
      alerts: generateAlerts(seed),
      landmarks: pickLandmarks(seed),
    };
  }, [submittedPair]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!from.trim() || !to.trim()) return;
    setSubmittedPair({ f: from.trim(), t: to.trim() });
  };

  return (
    <main className="min-h-screen bg-background">
      <Hero />

      {/* Search */}
      <section className="mx-auto max-w-4xl px-6 -mt-4">
        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-border bg-card p-3 sm:p-4"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <CityInput label="From" value={from} onChange={setFrom} accentDot="bg-primary" />
            <CityInput label="To" value={to} onChange={setTo} accentDot="bg-secondary" />
            <button
              type="submit"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.99]"
              style={{ background: "var(--gradient-hero)" }}
            >
              Find Routes
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </form>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        {trip && submittedPair ? (
          <div className="space-y-14">
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                {submittedPair.f} <span className="text-muted-foreground">→</span> {submittedPair.t}
              </h2>
              <span className="text-sm text-muted-foreground">
                ~{trip.km} km · 3 routes · estimates in EUR
              </span>
            </div>

            {/* Route cards */}
            <div className="grid gap-5 md:grid-cols-3">
              {trip.routes.map((r) => <RouteCard key={r.category} route={r} />)}
            </div>

            {/* Two-column: map + alerts */}
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <section>
                <SectionHeader icon={MapIcon} title="Route on the map" subtitle="OpenStreetMap overview of your trip" />
                <RouteMap
                  from={trip.fromCoords}
                  to={trip.toCoords}
                  fromName={submittedPair.f}
                  toName={submittedPair.t}
                />
              </section>
              <section>
                <SectionHeader icon={AlertTriangle} title="Live alerts" subtitle="Schedule changes & traffic now" />
                <div className="space-y-3">
                  {trip.alerts.map((a, i) => <AlertCard key={i} alert={a} />)}
                </div>
              </section>
            </div>

            {/* Landmarks */}
            <section>
              <SectionHeader
                icon={Sparkles}
                title="Worth a stop along the way"
                subtitle="Landmarks travelers add to this kind of trip"
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {trip.landmarks.map((l) => <LandmarkCard key={l.name} landmark={l} />)}
              </div>
            </section>
          </div>
        ) : trip === null && submittedPair ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <p className="text-foreground">
              We don't have coordinates for <strong>{submittedPair.f}</strong> or <strong>{submittedPair.t}</strong> yet.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Try one of the popular Bulgarian cities below.</p>
          </div>
        ) : (
          <PopularRoutes onPick={(f, t) => { setFrom(f); setTo(t); }} />
        )}
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Travio · Estimates only · Built for travelers in Bulgaria
      </footer>
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, var(--primary) 0, transparent 40%), radial-gradient(circle at 80% 30%, var(--secondary) 0, transparent 45%), radial-gradient(circle at 50% 90%, var(--accent) 0, transparent 50%)",
        }}
      />
      <div className="mx-auto max-w-6xl px-6 pt-10 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground"
              style={{ background: "var(--gradient-hero)" }}
            >
              <MapPin className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <span className="font-display text-2xl font-extrabold tracking-tight text-foreground">Travio</span>
          </div>
          <span className="hidden text-sm text-muted-foreground sm:block">Bulgaria, end to end</span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 pt-10 pb-14 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Plan smarter trips across Bulgaria
        </span>
        <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] text-foreground sm:text-7xl">
          From the Black Sea
          <br />
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-warm)" }}>
            to the Rila peaks.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
          Compare the fastest, cheapest, and most convenient ways to get anywhere in the country — bus, train, or car.
        </p>
      </div>
    </section>
  );
}

function CityInput({
  label, value, onChange, accentDot,
}: { label: string; value: string; onChange: (v: string) => void; accentDot: string }) {
  const listId = `cities-${label}`;
  return (
    <label className="group relative flex items-center gap-3 rounded-2xl bg-muted/60 px-4 py-3 transition-colors focus-within:bg-muted">
      <span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${accentDot}`} />
      <span className="flex flex-1 flex-col">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <input
          list={listId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="City in Bulgaria"
          className="bg-transparent text-base font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />
        <datalist id={listId}>
          {CITIES.map((c) => <option key={c} value={c} />)}
        </datalist>
      </span>
    </label>
  );
}

function RouteCard({ route }: { route: RouteOption }) {
  const meta = CAT_META[route.category];
  const ModeIcon = MODE_ICON[route.mode];
  const CatIcon = meta.icon;

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${meta.accent}`} />
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <CatIcon className="h-3.5 w-3.5" />
            {meta.tagline}
          </div>
          <h3 className="mt-1 font-display text-2xl font-bold text-foreground">{meta.label}</h3>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-foreground">
          <ModeIcon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between border-t border-border pt-5">
        <Stat icon={<Clock className="h-4 w-4" />} label="Time" value={`${route.hours}h ${route.minutes.toString().padStart(2, "0")}m`} />
        <Stat icon={<Euro className="h-4 w-4" />} label="Total" value={`€${route.cost.toFixed(2)}`} align="right" />
      </div>

      <p className="mt-5 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{MODE_LABEL[route.mode]}</span>
        {" · "}{route.note}
      </p>

      {/* Breakdown */}
      <div className="mt-5 rounded-2xl bg-muted/60 p-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Cost breakdown</div>
        <ul className="mt-3 space-y-2">
          {route.breakdown.map((b) => {
            const Icon = b.icon;
            return (
              <li key={b.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-foreground">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  {b.label}
                </span>
                <span className="font-semibold text-foreground tabular-nums">€{b.amount.toFixed(2)}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}

function Stat({
  icon, label, value, align = "left",
}: { icon: React.ReactNode; label: string; value: string; align?: "left" | "right" }) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {align === "left" && icon}{label}{align === "right" && icon}
      </div>
      <div className="mt-1 font-display text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}

function SectionHeader({
  icon: Icon, title, subtitle,
}: { icon: typeof MapIcon; title: string; subtitle: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h3 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function AlertCard({ alert }: { alert: Alert }) {
  const config = {
    delay:   { Icon: Clock,         dot: "bg-primary",     label: "Delay" },
    warning: { Icon: AlertTriangle, dot: "bg-accent",      label: "Warning" },
    info:    { Icon: Info,          dot: "bg-secondary",   label: "Info" },
  }[alert.level];
  const { Icon } = config;
  return (
    <article
      className="rounded-2xl border border-border bg-card p-4"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
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

function LandmarkCard({ landmark }: { landmark: { name: string; city: string; description: string; emoji: string } }) {
  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div
        className="mb-4 flex h-24 w-full items-center justify-center rounded-xl text-5xl"
        style={{ background: "var(--gradient-warm)", opacity: 0.95 }}
      >
        <span aria-hidden>{landmark.emoji}</span>
      </div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <CloudRain className="mr-1 inline h-3 w-3" />
        {landmark.city}
      </div>
      <h4 className="mt-1 font-display text-lg font-bold text-foreground">{landmark.name}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{landmark.description}</p>
    </article>
  );
}

function PopularRoutes({ onPick }: { onPick: (from: string, to: string) => void }) {
  const pairs: Array<[string, string]> = [
    ["Sofia", "Plovdiv"], ["Sofia", "Bansko"], ["Varna", "Burgas"],
    ["Plovdiv", "Veliko Tarnovo"], ["Sofia", "Sunny Beach"], ["Burgas", "Sozopol"],
  ];
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-foreground">Popular routes</h2>
      <p className="mt-1 text-sm text-muted-foreground">Tap to autofill, then hit Find Routes.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pairs.map(([f, t]) => (
          <button
            key={`${f}-${t}`}
            onClick={() => onPick(f, t)}
            className="group flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 text-left transition-all hover:-translate-y-0.5"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <span className="font-medium text-foreground">
              {f} <span className="text-muted-foreground">→</span> {t}
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
}
