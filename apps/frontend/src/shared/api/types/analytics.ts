export interface CallsPerHourPoint {
  hour: string; // ISO 8601 truncated to hour
  count: number;
}

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

export interface GlobalKpis {
  totalCalls: number;
  totalCampaigns: number;
  totalMinutes: number;
  totalCostUSD: number;
  successRate: number;
  totalTenants: number;
}

export interface TopTenantEntry {
  tenantId: string;
  tenantName: string;
  totalCalls: number;
  totalCampaigns: number;
  totalCostUSD: number;
}

export interface GlobalAnalyticsResponse {
  kpis: GlobalKpis;
  topTenants: TopTenantEntry[];
  trends: {
    callsPerHour: CallsPerHourPoint[];
  };
}
