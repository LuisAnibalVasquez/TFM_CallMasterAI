import {
  BarChart3,
  Building2,
  Network,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  tag: string;
};

const FEATURES: Feature[] = [
  {
    icon: Network,
    title: "Massive orchestration",
    description:
      "Launch thousands of simultaneous calls with automatic load balancing, smart retries, and prioritized campaign queues.",
    tag: "scale.engine",
  },
  {
    icon: ShieldCheck,
    title: "Bank-grade security",
    description:
      "AES-256 encryption at rest, TLS 1.3 in transit, and sensitive data isolation. SOC 2 and ISO 27001 compliance.",
    tag: "security.core",
  },
  {
    icon: Building2,
    title: "Native multi-tenant",
    description:
      "Isolated architecture per organization with granular roles, white-label, and independent billing per client.",
    tag: "tenants.isolated",
  },
  {
    icon: BarChart3,
    title: "Real-time analytics",
    description:
      "Dashboards with live KPIs: connection rate, conversion, sentiment, and cost per call. Export to your favorite BI.",
    tag: "analytics.live",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="relative border-t border-border bg-card py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            // Features
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            One single platform.{" "}
            <span className="text-muted-foreground">
              Your entire Call Center operation.
            </span>
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground">
            Designed for agencies and operators that need to scale without
            sacrificing control, security, or visibility.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, description, tag }: Feature) {
  return (
    <article className="group relative flex flex-col rounded-2xl border border-border bg-background p-6 shadow-soft transition-all hover:shadow-soft-lg">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
        <Icon className="h-5 w-5 text-foreground" strokeWidth={2} />
      </div>

      <h3 className="mt-5 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {tag}
        </span>
      </div>
    </article>
  );
}
