import { Activity, PhoneCall, Users } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { CallsChart } from "./CallsChart";

export function AnalyticOverview() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
      <CallsChart />
    </div>
  );
}
