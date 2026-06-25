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

    // Fetch calls from the last 24 hours for hourly trend
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data: recentCalls, error: callError } = await client
      .from("calls")
      .select("duration, created_at")
      .gte("created_at", twentyFourHoursAgo)
      .order("created_at", { ascending: true });

    if (callError) {
      throw new InternalServerErrorException(
        `Failed to fetch calls: ${callError.message}`,
      );
    }

    const callRows = recentCalls ?? [];

    // Compute total minutes from call durations
    const totalMinutes =
      Math.round(
        (callRows.reduce((sum, c) => sum + (c.duration ?? 0), 0) / 60) * 100,
      ) / 100;

    // Group calls by hour
    const hourBuckets = new Map<string, number>();
    for (const call of callRows) {
      const hour = new Date(call.created_at)
        .toISOString()
        .replace(/:\d{2}\.\d{3}Z$/, ":00:00Z");
      hourBuckets.set(hour, (hourBuckets.get(hour) ?? 0) + 1);
    }

    // Fill all 24 hours for a complete series even when no calls
    const callsPerHour: Array<{ hour: string; count: number }> = [];
    for (let i = 23; i >= 0; i--) {
      const slotDate = new Date(Date.now() - i * 60 * 60 * 1000);
      // Round to current hour
      slotDate.setMinutes(0, 0, 0);
      const slotHour = slotDate.toISOString();
      callsPerHour.push({
        hour: slotHour,
        count: hourBuckets.get(slotHour) ?? 0,
      });
    }

    return {
      kpis: {
        totalCalls,
        totalCampaigns,
        totalMinutes,
        totalCostUSD,
        successRate,
      },
      trends: { callsPerHour },
    };
  }
}
