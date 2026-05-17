import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, Ticket, CalendarHeart, ExternalLink, MapPin, Lightbulb } from "lucide-react";
import { LANDMARKS } from "@/lib/bulgaria-data";
import { Header, Footer } from "./index";

export const Route = createFileRoute("/landmark/")({
  loader: ({ params }) => {
    const landmark = LANDMARKS.find((l) => l.slug === params.slug);
    if (!landmark) throw notFound();
    return { landmark };
  },
  head: ({ loaderData }) => {
    const l = loaderData?.landmark;
    const title = l ? `${l.name} — Travio` : "Landmark — Travio";
    const description = l ? `${l.description} Hours, ticket prices and travel tips for ${l.name}.` : "Landmark details on Travio.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-4xl font-bold text-foreground">Landmark not found</h1>
        <p className="mt-3 text-muted-foreground">We couldn't find that landmark in our catalogue.</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
      </div>
      <Footer />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground">Something went wrong</h1>
        <p className="mt-3 text-muted-foreground">{error.message}</p>
      </div>
      <Footer />
    </div>
  ),
  component: LandmarkPage,
});

function LandmarkPage() {
  const { landmark: l } = Route.useLoaderData();
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${l.lat},${l.lng}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section
        className="relative overflow-hidden border-b border-border"
        style={{ background: "var(--gradient-warm)" }}
      >
        <div className="container mx-auto px-6 py-12 md:py-16">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/80 hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to search
          </Link>
          <div className="mt-6 flex items-start gap-5">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-background/70 text-6xl shadow-lg">
              <span aria-hidden>{l.emoji}</span>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/70">
                <MapPin className="mr-1 inline h-3 w-3" />{l.city}
              </p>
              <h1 className="mt-1 font-display text-4xl font-bold text-foreground md:text-5xl">{l.name}</h1>
              <p className="mt-3 max-w-2xl text-base text-foreground/80">{l.description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <article
              className="rounded-2xl border border-border bg-card p-6"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <h2 className="font-display text-2xl font-bold text-foreground">About</h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">{l.longDescription}</p>
            </article>

            {l.tips && l.tips.length > 0 && (
              <article
                className="rounded-2xl border border-border bg-card p-6"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
                  <Lightbulb className="h-5 w-5 text-primary" /> Travel tips
                </h2>
                <ul className="mt-3 space-y-2">
                  {l.tips.map((tip) => (
                    <li key={tip} className="flex gap-3 text-sm text-muted-foreground">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )}
          </div>

          <aside className="space-y-4">
            <InfoCard icon={Clock} label="Opening hours" value={l.hours} />
            <InfoCard icon={Ticket} label="Tickets & fees" value={l.ticketPrice} />
            <InfoCard icon={CalendarHeart} label="Best time to visit" value={l.bestTime} />

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Open in Google Maps</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>

            {l.website && (
              <a
                href={l.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <span>Official website</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-2xl border border-border bg-card p-4"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
