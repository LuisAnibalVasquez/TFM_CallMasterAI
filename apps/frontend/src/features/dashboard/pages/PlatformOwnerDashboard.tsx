import { AnalyticOverview } from "../../../shared/components/analytics/AnalyticOverview";
import { useGlobalAnalytics } from "../../../shared/api/hooks/useGlobalAnalytics";

export function PlatformOwnerDashboard() {
  const { data, loading, error } = useGlobalAnalytics();

  return (
    <div className="space-y-6">
      <AnalyticOverview data={data} loading={loading} error={error} />
    </div>
  );
}
