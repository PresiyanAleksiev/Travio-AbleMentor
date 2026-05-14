import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Bus, Train, Car, Clock, Euro, Zap, PiggyBank, Sparkles, ArrowRight, MapPin } from "lucide-react";

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
}

const CITIES = [
  "Sofia", "Plovdiv", "Varna", "Burgas", "Ruse", "Stara Zagora",
  "Pleven", "Veliko Tarnovo", "Bansko", "Sunny Beach", "Sozopol", "Nesebar",
  "Blagoevgrad", "Shumen", "Sliven", "Pernik", "Vidin", "Haskovo",
];

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function generateRoutes(from: string, to: string): RouteOption[] {
  const seed = hashStr(from.toLowerCase() + "→" + to.toLowerCase());
  const baseHours = 1 + (seed % 7);
  const baseMin = (seed % 4) * 15;

  const fastestH = Math.max(1, baseHours - 1);
  const fastestM = baseMin;
  const cheapestH = baseHours + 2;
  const cheapestM = (baseMin + 30) % 60;
  const convH = baseHours;
  const convM = baseMin;

  const km = 60 + (seed % 380);
  const fastestCost = Math.round((km * 0.18 + 8) * 10) / 10;
  const cheapestCost = Math.round((km * 0.05 + 4) * 10) / 10;
  const convCost = Math.round((km * 0.09 + 6) * 10) / 10;

  return [
    {
      category: "fastest",
      mode: "car",
      hours: fastestH,
      minutes: fastestM,
      cost: fastestCost,
      note: "Direct highway route via private car",
    },
    {
      category: "cheapest",
      mode: "bus",
      hours: cheapestH,
      minutes: cheapestM,
      cost: cheapestCost,
      note: "Intercity bus with one transfer",
    },
    {
      category: "convenient",
      mode: "train",
      hours: convH,
      minutes: convM,
      cost: convCost,
      note: "Direct train, comfortable seating",
    },
  ];
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
  const [results, setResults] = useState<RouteOption[] | null>(null);
  const [submittedPair, setSubmittedPair] = useState<{ f: string; t: string } | null>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!from.trim() || !to.trim()) return;
    setResults(generateRoutes(from.trim(), to.trim()));
    setSubmittedPair({ f: from.trim(), t: to.trim() });
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
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
              <span className="font-display text-2xl font-extrabold tracking-tight text-foreground">
                Travio
              </span>
            </div>
            <span className="hidden text-sm text-muted-foreground sm:block">
              Bulgaria, end to end
            </span>
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
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-warm)" }}
            >
              to the Rila peaks.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Compare the fastest, cheapest, and most convenient ways to get
            anywhere in the country — bus, train, or car.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="mx-auto max-w-4xl px-6 -mt-4">
        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-border bg-card p-3 sm:p-4"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <CityInput
              label="From"
              value={from}
              onChange={setFrom}
              accentDot="bg-primary"
            />
            <CityInput
              label="To"
              value={to}
              onChange={setTo}
              accentDot="bg-secondary"
            />
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
        {results && submittedPair ? (
          <>
            <div className="mb-8 flex items-baseline justify-between gap-4 flex-wrap">
              <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                {submittedPair.f}{" "}
                <span className="text-muted-foreground">→</span>{" "}
                {submittedPair.t}
              </h2>
              <span className="text-sm text-muted-foreground">
                3 routes found · estimates in EUR
              </span>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {results.map((r) => (
                <RouteCard key={r.category} route={r} />
              ))}
            </div>
          </>
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

function CityInput({
  label,
  value,
  onChange,
  accentDot,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  accentDot: string;
}) {
  const listId = `cities-${label}`;
  return (
    <label className="group relative flex items-center gap-3 rounded-2xl bg-muted/60 px-4 py-3 transition-colors focus-within:bg-muted">
      <span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${accentDot}`} />
      <span className="flex flex-1 flex-col">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <input
          list={listId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="City in Bulgaria"
          className="bg-transparent text-base font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />
        <datalist id={listId}>
          {CITIES.map((c) => (
            <option key={c} value={c} />
          ))}
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
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${meta.accent}`}
      />
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <CatIcon className="h-3.5 w-3.5" />
            {meta.tagline}
          </div>
          <h3 className="mt-1 font-display text-2xl font-bold text-foreground">
            {meta.label}
          </h3>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-foreground">
          <ModeIcon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between border-t border-border pt-5">
        <Stat
          icon={<Clock className="h-4 w-4" />}
          label="Time"
          value={`${route.hours}h ${route.minutes.toString().padStart(2, "0")}m`}
        />
        <Stat
          icon={<Euro className="h-4 w-4" />}
          label="Cost"
          value={`€${route.cost.toFixed(2)}`}
          align="right"
        />
      </div>

      <p className="mt-5 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{MODE_LABEL[route.mode]}</span>
        {" · "}
        {route.note}
      </p>
    </article>
  );
}

function Stat({
  icon,
  label,
  value,
  align = "left",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {align === "left" && icon}
        {label}
        {align === "right" && icon}
      </div>
      <div className="mt-1 font-display text-2xl font-bold text-foreground">
        {value}
      </div>
    </div>
  );
}

function PopularRoutes({ onPick }: { onPick: (from: string, to: string) => void }) {
  const pairs: Array<[string, string]> = [
    ["Sofia", "Plovdiv"],
    ["Sofia", "Bansko"],
    ["Varna", "Burgas"],
    ["Plovdiv", "Veliko Tarnovo"],
    ["Sofia", "Sunny Beach"],
    ["Burgas", "Sozopol"],
  ];
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-foreground">
        Popular routes
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Tap to autofill, then hit Find Routes.
      </p>
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
