/** Hourly call count data point for trend charts */
export interface CallsPerHourPoint {
  hour: string; // ISO 8601 truncated to hour
  count: number;
}

/** Per-tenant analytics summary (TenantAdmin scoped via RLS) */
export interface TenantSummaryResponse {
  kpis: {
    totalCalls: number;
    totalCampaigns: number;
    totalMinutes: number;
    totalCostUSD: number;
    successRate: number;
  };
  trends: {
    callsPerHour: CallsPerHourPoint[];
  };
}

/** Global KPIs aggregated across all tenants (PlatformOwner) */
export interface GlobalKpis {
  totalCalls: number;
  totalCampaigns: number;
  totalMinutes: number;
  totalCostUSD: number;
  successRate: number;
  totalTenants: number;
}

/** Entry in the top-5 tenants ranking */
export interface TopTenantEntry {
  tenantId: string;
  tenantName: string;
  totalCalls: number;
  totalCampaigns: number;
  totalCostUSD: number;
}

/** Global analytics response for PlatformOwner */
export interface GlobalAnalyticsResponse {
  kpis: GlobalKpis;
  topTenants: TopTenantEntry[];
  trends: {
    callsPerHour: CallsPerHourPoint[];
  };
}
