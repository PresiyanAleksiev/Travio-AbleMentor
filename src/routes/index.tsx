import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { ArrowRight, MapPin, Moon, Sun } from "lucide-react";
import { CITY_COORDS } from "@/lib/bulgaria-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Travio — Plan trips across Bulgaria" },
      { name: "description", content: "Compare the fastest, cheapest and most convenient routes across Bulgaria by bus, train or car." },
      { property: "og:title", content: "Travio — Plan trips across Bulgaria" },
      { property: "og:description", content: "Compare the fastest, cheapest and most convenient routes across Bulgaria." },
    ],
  }),
  component: Index,
});

const CITIES = Object.keys(CITY_COORDS).map((k) =>
  k.replace(/\b\w/g, (c) => c.toUpperCase()),
);

function Index() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("Sofia");
  const [to, setTo] = useState("Plovdiv");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!from.trim() || !to.trim()) return;
    navigate({ to: "/results", search: { from: from.trim(), to: to.trim() } });
  };

  const popular: Array<[string, string]> = [
    ["Sofia", "Plovdiv"], ["Sofia", "Bansko"], ["Varna", "Burgas"],
    ["Plovdiv", "Veliko Tarnovo"], ["Sofia", "Sunny Beach"], ["Burgas", "Sozopol"],
  ];

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, var(--primary) 0, transparent 40%), radial-gradient(circle at 80% 30%, var(--secondary) 0, transparent 45%), radial-gradient(circle at 50% 90%, var(--accent) 0, transparent 50%)",
          }}
        />
        <div className="mx-auto max-w-4xl px-6 pt-12 pb-10 text-center">
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

      {/* Search */}
      <section className="mx-auto max-w-4xl px-6">
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

      {/* Popular */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl font-bold text-foreground">Popular routes</h2>
        <p className="mt-1 text-sm text-muted-foreground">Tap to autofill, then hit Find Routes.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map(([f, t]) => (
            <button
              key={`${f}-${t}`}
              onClick={() => { setFrom(f); setTo(t); }}
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
      </section>

      <Footer />
    </main>
  );
}

export function Header() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <div className="mx-auto max-w-6xl px-6 pt-10">
      <div className="flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground"
            style={{ background: "var(--gradient-hero)" }}
          >
            <MapPin className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl font-extrabold tracking-tight text-foreground">Travio</span>
        </a>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted-foreground sm:block">Bulgaria, end to end</span>
          <button
            onClick={() => setDark((d) => !d)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
      Travio · Estimates only · Built for travelers in Bulgaria
    </footer>
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
