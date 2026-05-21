import { Activity, PhoneCall, Users } from "lucide-react";
import { KpiCard } from "../../../shared/components/analytics/KpiCard";
import { CallsChart } from "../../../shared/components/analytics/CallsChart";

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
          label="Calls"
          value="12,847"
          delta="+18.2%"
        />
        <KpiCard
          icon={<Users className="h-3.5 w-3.5" />}
          label="Conversion"
          value="34.6%"
          delta="+4.1%"
          highlight
        />
        <KpiCard
          icon={<Activity className="h-3.5 w-3.5" />}
          label="Agents"
          value="48"
          delta="online"
        />
      </div>

      {/* Chart area */}
      <div className="mt-4">
        <CallsChart />
      </div>

      {/* Live waveform */}
      <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
            <PhoneCall className="h-4 w-4 text-foreground" />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">
              AI Agent · Sofia
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              on call · 00:42
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
