import { AnalyticOverview } from "../../../shared/components/analytics/AnalyticOverview";
import { useTenantSummary } from "../../../shared/api/hooks/useTenantSummary";

export function TenantAdminDashboard() {
  const { data, loading, error } = useTenantSummary();

  return (
    <div className="space-y-6">
      <AnalyticOverview data={data} loading={loading} error={error} />
    </div>
  );
}
