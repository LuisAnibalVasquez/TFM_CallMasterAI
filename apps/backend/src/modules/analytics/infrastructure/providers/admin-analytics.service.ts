import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { AdminSupabaseService } from "../../../auth/infrastructure/providers/admin-supabase.service";

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
  totalCalls: number;
  totalCampaigns: number;
  totalCostUSD: number;
}

export interface GlobalAnalyticsResponse {
  kpis: GlobalKpis;
  topTenants: TopTenantEntry[];
}

@Injectable()
export class AdminAnalyticsService {
  constructor(private adminSupabase: AdminSupabaseService) {}

  private getClient() {
    return this.adminSupabase.getClient();
  }

  /**
   * Aggregates KPIs across ALL tenants using the service-role client.
   * RLS is bypassed — every row in campaigns and calls is visible.
   */
  async getGlobalKpis(): Promise<GlobalKpis> {
    const client = this.getClient();

    // Fetch all campaigns (no RLS filter)
    const { data: campaigns, error: campaignError } = await client
      .from("campaigns")
      .select(
        "id, total_calls, successful_calls, failed_calls, total_cost, tenant_id",
      );

    if (campaignError) {
      throw new InternalServerErrorException(
        `Failed to fetch campaigns: ${campaignError.message}`,
      );
    }

    const rows = campaigns ?? [];

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

    // Count distinct tenants with campaigns
    const tenantIds = new Set<string>();
    for (const r of rows) {
      if (r.tenant_id) {
        tenantIds.add(r.tenant_id);
      }
    }
    const totalTenants = tenantIds.size;

    // Fetch all calls for total minutes
    const { data: calls, error: callError } = await client
      .from("calls")
      .select("duration");

    if (callError) {
      throw new InternalServerErrorException(
        `Failed to fetch calls: ${callError.message}`,
      );
    }

    const callRows = calls ?? [];
    const totalMinutes =
      Math.round(
        (callRows.reduce((sum, c) => sum + (c.duration ?? 0), 0) / 60) * 100,
      ) / 100;

    return {
      totalCalls,
      totalCampaigns,
      totalMinutes,
      totalCostUSD,
      successRate,
      totalTenants,
    };
  }

  /**
   * Returns the top 5 tenants ranked by total calls across their campaigns.
   */
  async getTopTenants(): Promise<TopTenantEntry[]> {
    const client = this.getClient();

    const { data: campaigns, error } = await client
      .from("campaigns")
      .select("tenant_id, total_calls, total_cost");

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch campaigns for ranking: ${error.message}`,
      );
    }

    const rows = campaigns ?? [];

    // Group by tenant_id
    const tenantMap = new Map<
      string,
      { totalCalls: number; totalCampaigns: number; totalCostUSD: number }
    >();

    for (const r of rows) {
      if (!r.tenant_id) continue;

      const existing = tenantMap.get(r.tenant_id) ?? {
        totalCalls: 0,
        totalCampaigns: 0,
        totalCostUSD: 0,
      };

      existing.totalCalls += r.total_calls ?? 0;
      existing.totalCampaigns += 1;
      existing.totalCostUSD +=
        typeof r.total_cost === "string"
          ? parseFloat(r.total_cost)
          : (r.total_cost ?? 0);

      tenantMap.set(r.tenant_id, existing);
    }

    // Sort by totalCalls descending, take top 5
    return Array.from(tenantMap.entries())
      .map(([tenantId, stats]) => ({
        tenantId,
        totalCalls: stats.totalCalls,
        totalCampaigns: stats.totalCampaigns,
        totalCostUSD: Math.round(stats.totalCostUSD * 100) / 100,
      }))
      .sort((a, b) => b.totalCalls - a.totalCalls)
      .slice(0, 5);
  }

  /**
   * Combined endpoint payload: global KPIs + top 5 tenants.
   */
  async getGlobalAnalytics(): Promise<GlobalAnalyticsResponse> {
    const [kpis, topTenants] = await Promise.all([
      this.getGlobalKpis(),
      this.getTopTenants(),
    ]);

    return { kpis, topTenants };
  }
}
