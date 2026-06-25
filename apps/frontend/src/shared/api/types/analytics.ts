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
