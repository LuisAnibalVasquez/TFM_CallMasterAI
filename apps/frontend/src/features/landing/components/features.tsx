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
    title: "Orquestación masiva",
    description:
      "Lanza miles de llamadas simultáneas con balanceo automático, reintentos inteligentes y colas priorizadas por campaña.",
    tag: "scale.engine",
  },
  {
    icon: ShieldCheck,
    title: "Seguridad de grado bancario",
    description:
      "Encriptación AES-256 en reposo, TLS 1.3 en tránsito y aislamiento de datos sensibles. Cumplimiento SOC 2 e ISO 27001.",
    tag: "security.core",
  },
  {
    icon: Building2,
    title: "Multi-tenant nativo",
    description:
      "Arquitectura aislada por organización con roles granulares, white-label y facturación independiente por cliente.",
    tag: "tenants.isolated",
  },
  {
    icon: BarChart3,
    title: "Analítica en tiempo real",
    description:
      "Dashboards con KPIs vivos: tasa de conexión, conversión, sentimiento y costo por llamada. Exporta a tu BI favorito.",
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
            // Características
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Una sola plataforma.{" "}
            <span className="text-muted-foreground">
              Toda la operación de tu Call Center.
            </span>
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground">
            Diseñada para agencias y operadores que necesitan escalar sin
            sacrificar control, seguridad ni visibilidad.
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
