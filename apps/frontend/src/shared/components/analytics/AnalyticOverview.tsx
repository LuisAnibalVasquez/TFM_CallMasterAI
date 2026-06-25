import { PhoneCall, Clock, DollarSign, BarChart3, Users } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { CallsChart } from "./CallsChart";
import type {
  TenantSummaryResponse,
  GlobalAnalyticsResponse,
} from "../../api/types/analytics";

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function formatCostUSD(n: number): string {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatMinutes(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

interface AnalyticOverviewProps {
  data?: TenantSummaryResponse | GlobalAnalyticsResponse | null;
  loading?: boolean;
  error?: string | null;
}

export function AnalyticOverview({
  data,
  loading = false,
  error = null,
}: AnalyticOverviewProps) {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-background p-3 h-20"
            />
          ))}
        </div>
        <div className="rounded-xl border border-border bg-background p-4 h-28" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive font-medium">
          Failed to load analytics
        </p>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
          {error}
        </p>
      </div>
    );
  }

  const kpis = data?.kpis;
  const callsPerHour = data?.trends?.callsPerHour ?? [];
  const isEmpty = !kpis || kpis.totalCalls === 0;

  if (isEmpty) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center space-y-3">
        <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium text-foreground">
          No campaign data yet
        </p>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          Create your first campaign to start seeing analytics and performance
          metrics here.
        </p>
      </div>
    );
  }

  const showTenants = (kpis as any).totalTenants !== undefined;

  return (
    <div className="space-y-4">
      <div
        className={`grid gap-3 ${showTenants ? "grid-cols-2 sm:grid-cols-5" : "grid-cols-2 sm:grid-cols-4"}`}
      >
        <KpiCard
          icon={<PhoneCall className="h-3.5 w-3.5" />}
          label="Calls"
          value={formatNumber(kpis.totalCalls)}
        />
        <KpiCard
          icon={<BarChart3 className="h-3.5 w-3.5" />}
          label="Campaigns"
          value={formatNumber(kpis.totalCampaigns)}
        />
        <KpiCard
          icon={<Clock className="h-3.5 w-3.5" />}
          label="Minutes"
          value={formatMinutes(kpis.totalMinutes)}
        />
        <KpiCard
          icon={<DollarSign className="h-3.5 w-3.5" />}
          label="Cost"
          value={formatCostUSD(kpis.totalCostUSD)}
        />
        {showTenants && (
          <KpiCard
            icon={<Users className="h-3.5 w-3.5" />}
            label="Tenants"
            value={formatNumber((kpis as any).totalTenants)}
          />
        )}
      </div>
      <CallsChart callsPerHour={callsPerHour} />
    </div>
  );
}
