import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { TenantSupabaseService } from "../../../auth/infrastructure/providers/tenant-supabase.service";

export interface TenantSummaryResponse {
  kpis: {
    totalCalls: number;
    totalCampaigns: number;
    totalMinutes: number;
    totalCostUSD: number;
    successRate: number;
  };
  trends: {
    callsPerHour: Array<{
      hour: string;
      count: number;
    }>;
  };
}

@Injectable()
export class AnalyticsService {
  constructor(private tenantSupabase: TenantSupabaseService) {}

  private getClient() {
    return this.tenantSupabase.getClient();
  }

  async getTenantSummary(): Promise<TenantSummaryResponse> {
    const client = this.getClient();

    // Fetch all campaigns for the tenant (RLS-enforced)
    const { data: campaigns, error: campaignError } = await client
      .from("campaigns")
      .select("id, total_calls, successful_calls, failed_calls, total_cost");

    if (campaignError) {
      throw new InternalServerErrorException(
        `Failed to fetch campaigns: ${campaignError.message}`,
      );
    }

    const rows = campaigns ?? [];

    // Aggregate campaign KPIs in JS
    const totalCampaigns = rows.length;
    const totalCalls = rows.reduce((sum, r) => sum + (r.total_calls ?? 0), 0);
    const totalCostUSD = rows.reduce(
      (sum, r) =>
        sum +
        (typeof r.total_cost === "string"
          ? parseFloat(r.total_cost)
          : (r.total_cost ?? 0)),
      0,
    );
    const totalSuccessful = rows.reduce(
      (sum, r) => sum + (r.successful_calls ?? 0),
      0,
    );
    const successRate =
      totalCalls > 0
        ? Math.round((totalSuccessful / totalCalls) * 10000) / 10000
        : 0;

    // Fetch all calls for hourly trend (no date filter for debugging)
    const { data: recentCalls, error: callError } = await client
      .from("calls")
      .select("duration, created_at")
      .order("created_at", { ascending: true });

    if (callError) {
      throw new InternalServerErrorException(
        `Failed to fetch calls: ${callError.message}`,
      );
    }

    const callRows = recentCalls ?? [];

    // DEBUG: Ver qué fechas llegan de la DB
    console.log(
      "[AnalyticsService] Fechas encontradas:",
      callRows.map((c) => c.created_at),
    );

    // Compute total minutes from call durations
    const totalMinutes =
      Math.round(
        (callRows.reduce((sum, c) => sum + (c.duration ?? 0), 0) / 60) * 100,
      ) / 100;

    // Group calls by date (YYYY-MM-DD)
    const dayBuckets = new Map<string, number>();
    for (const call of callRows) {
      const date = new Date(call.created_at).toISOString().split("T")[0]; // YYYY-MM-DD
      dayBuckets.set(date, (dayBuckets.get(date) ?? 0) + 1);
    }

    // Sort dates and prepare series
    const sortedDates = Array.from(dayBuckets.keys()).sort();
    const callsPerDay: Array<{ hour: string; count: number }> = sortedDates.map(
      (date) => ({
        hour: date,
        count: dayBuckets.get(date) ?? 0,
      }),
    );

    return {
      kpis: {
        totalCalls,
        totalCampaigns,
        totalMinutes,
        totalCostUSD,
        successRate,
      },
      trends: { callsPerHour: callsPerDay },
    };
  }
}
