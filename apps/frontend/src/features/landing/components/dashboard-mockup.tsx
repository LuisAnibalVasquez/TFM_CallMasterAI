import { Activity, ArrowUpRight, PhoneCall, Users } from "lucide-react";

export function DashboardMockup() {
  return (
    <div
      aria-hidden="true"
      className="relative w-full overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-soft-lg sm:p-5"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-muted ring-1 ring-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted ring-1 ring-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted ring-1 ring-border" />
          <span className="ml-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            campaign / black-friday-2026
          </span>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-soft" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground">
            Live
          </span>
        </span>
      </div>

      {/* KPIs */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <KpiCard
          icon={<PhoneCall className="h-3.5 w-3.5" />}
          label="Llamadas"
          value="12,847"
          delta="+18.2%"
        />
        <KpiCard
          icon={<Users className="h-3.5 w-3.5" />}
          label="Conversión"
          value="34.6%"
          delta="+4.1%"
          highlight
        />
        <KpiCard
          icon={<Activity className="h-3.5 w-3.5" />}
          label="Agentes"
          value="48"
          delta="online"
        />
      </div>

      {/* Chart area */}
      <div className="mt-4 rounded-xl border border-border bg-background p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-foreground">
              Llamadas / hora
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              últimas 24 h
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
            <ArrowUpRight className="h-3 w-3" />
            +12.4%
          </span>
        </div>

        <svg
          viewBox="0 0 320 90"
          className="h-20 w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label="Gráfico de llamadas por hora"
        >
          <defs>
            <linearGradient id="cmai-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3366FF" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#3366FF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,70 L20,62 L40,66 L60,50 L80,55 L100,40 L120,46 L140,30 L160,38 L180,22 L200,28 L220,18 L240,26 L260,14 L280,20 L300,10 L320,16 L320,90 L0,90 Z"
            fill="url(#cmai-area)"
          />
          <path
            d="M0,70 L20,62 L40,66 L60,50 L80,55 L100,40 L120,46 L140,30 L160,38 L180,22 L200,28 L220,18 L240,26 L260,14 L280,20 L300,10 L320,16"
            fill="none"
            stroke="#3366FF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Live waveform */}
      <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
            <PhoneCall className="h-4 w-4 text-foreground" />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">
              Agente IA · Sofía
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              en llamada · 00:42
            </p>
          </div>
        </div>
        <div className="flex items-end gap-0.5" aria-hidden="true">
          {[0.3, 0.7, 0.5, 0.9, 0.6, 0.4, 0.8, 0.5, 0.7, 0.3].map((h, i) => (
            <span
              key={i}
              className="w-0.5 rounded-full bg-accent animate-wave"
              style={{
                height: `${h * 24}px`,
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  delta,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1.5 text-base font-semibold tracking-tight text-foreground sm:text-lg">
        {value}
      </p>
      <p
        className={`font-mono text-[10px] ${
          highlight ? "text-accent" : "text-muted-foreground"
        }`}
      >
        {delta}
      </p>
    </div>
  );
}
