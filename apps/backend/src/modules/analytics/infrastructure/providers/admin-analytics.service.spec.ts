import { InternalServerErrorException } from "@nestjs/common";
import { AdminAnalyticsService } from "./admin-analytics.service";
import { AdminSupabaseService } from "../../../auth/infrastructure/providers/admin-supabase.service";

describe("AdminAnalyticsService", () => {
  let service: AdminAnalyticsService;
  let adminSupabaseService: jest.Mocked<AdminSupabaseService>;
  let supabaseClientMock: any;

  const mockCampaign = (overrides: Partial<any> = {}) => ({
    id: overrides.id ?? "campaign-1",
    tenant_id: overrides.tenant_id ?? "tenant-1",
    total_calls: overrides.total_calls ?? 100,
    successful_calls: overrides.successful_calls ?? 85,
    failed_calls: overrides.failed_calls ?? 15,
    total_cost: overrides.total_cost ?? "42.50",
  });

  beforeEach(() => {
    supabaseClientMock = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
    };

    adminSupabaseService = {
      getClient: jest.fn().mockReturnValue(supabaseClientMock),
    } as unknown as jest.Mocked<AdminSupabaseService>;

    service = new AdminAnalyticsService(adminSupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const givenCampaigns = (campaigns: any[] | null, error: any = null) => {
    supabaseClientMock.select.mockResolvedValueOnce({
      data: campaigns,
      error,
    });
  };

  const givenCalls = (calls: any[] | null, error: any = null) => {
    supabaseClientMock.select.mockResolvedValueOnce({
      data: calls,
      error,
    });
  };

  const givenTenants = (tenants: any[] | null, error: any = null) => {
    supabaseClientMock.select.mockResolvedValueOnce({
      data: tenants,
      error,
    });
  };

  // ── getGlobalKpis ────────────────────────────────────────────────────
  describe("getGlobalKpis", () => {
    it("should return all zeroes when there are no campaigns and no calls", async () => {
      givenCampaigns([]);
      givenCalls([]);

      const result = await service.getGlobalKpis();

      expect(result).toEqual({
        totalCalls: 0,
        totalCampaigns: 0,
        totalMinutes: 0,
        totalCostUSD: 0,
        successRate: 0,
        totalTenants: 0,
      });
    });

    it("should aggregate KPIs across a single campaign", async () => {
      givenCampaigns([
        mockCampaign({
          total_calls: 50,
          successful_calls: 45,
          failed_calls: 5,
          total_cost: "25.00",
        }),
      ]);
      givenCalls([]);

      const result = await service.getGlobalKpis();

      expect(result.totalCalls).toBe(50);
      expect(result.totalCampaigns).toBe(1);
      expect(result.totalCostUSD).toBe(25.0);
      expect(result.successRate).toBe(0.9);
      expect(result.totalTenants).toBe(1);
    });

    it("should aggregate totals across multiple campaigns from different tenants", async () => {
      givenCampaigns([
        mockCampaign({
          id: "c1",
          tenant_id: "tenant-a",
          total_calls: 100,
          successful_calls: 80,
          failed_calls: 20,
          total_cost: "100.00",
        }),
        mockCampaign({
          id: "c2",
          tenant_id: "tenant-b",
          total_calls: 200,
          successful_calls: 190,
          failed_calls: 10,
          total_cost: 150,
        }),
      ]);
      givenCalls([]);

      const result = await service.getGlobalKpis();

      expect(result.totalCalls).toBe(300);
      expect(result.totalCampaigns).toBe(2);
      expect(result.totalCostUSD).toBe(250.0);
      expect(result.successRate).toBe(0.9);
      expect(result.totalTenants).toBe(2);
    });

    it("should count distinct tenants correctly (deduplication)", async () => {
      givenCampaigns([
        mockCampaign({ id: "c1", tenant_id: "tenant-a" }),
        mockCampaign({ id: "c2", tenant_id: "tenant-a" }),
        mockCampaign({ id: "c3", tenant_id: "tenant-b" }),
      ]);
      givenCalls([]);

      const result = await service.getGlobalKpis();

      expect(result.totalTenants).toBe(2);
      expect(result.totalCampaigns).toBe(3);
    });

    it("should compute totalMinutes from calls across all tenants", async () => {
      givenCampaigns([]);
      givenCalls([{ duration: 600 }, { duration: 300 }, { duration: 900 }]);

      const result = await service.getGlobalKpis();

      // (600 + 300 + 900) / 60 = 30
      expect(result.totalMinutes).toBe(30.0);
    });

    it("should round totalMinutes to 2 decimal places", async () => {
      givenCampaigns([]);
      givenCalls([{ duration: 1 }]);

      const result = await service.getGlobalKpis();

      expect(result.totalMinutes).toBe(0.02);
    });

    it("should handle null/undefined call durations as 0", async () => {
      givenCampaigns([]);
      givenCalls([
        { duration: null },
        { duration: undefined },
        { duration: 120 },
      ]);

      const result = await service.getGlobalKpis();

      expect(result.totalMinutes).toBe(2.0);
    });

    it("should parse string cost values via parseFloat", async () => {
      givenCampaigns([
        mockCampaign({ total_cost: "99.99" }),
        mockCampaign({ total_cost: "0.01" }),
      ]);
      givenCalls([]);

      const result = await service.getGlobalKpis();

      expect(result.totalCostUSD).toBe(100.0);
    });

    it("should throw InternalServerErrorException when campaign fetch fails", async () => {
      supabaseClientMock.select.mockResolvedValueOnce({
        data: null,
        error: { message: "Database connection lost" },
      });

      const error = await service.getGlobalKpis().catch((e) => e);

      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect(error.message).toContain("Failed to fetch campaigns");
    });

    it("should throw InternalServerErrorException when calls fetch fails", async () => {
      givenCampaigns([]);
      supabaseClientMock.select.mockResolvedValueOnce({
        data: null,
        error: { message: "Timeout" },
      });

      const error = await service.getGlobalKpis().catch((e) => e);

      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect(error.message).toContain("Failed to fetch calls");
    });

    it("should select the correct columns from campaigns", async () => {
      givenCampaigns([]);
      givenCalls([]);

      await service.getGlobalKpis();

      expect(supabaseClientMock.from).toHaveBeenCalledWith("campaigns");
      expect(supabaseClientMock.select).toHaveBeenCalledWith(
        "id, total_calls, successful_calls, failed_calls, total_cost, tenant_id",
      );
    });
  });

  // ── getTopTenants ────────────────────────────────────────────────────
  describe("getTopTenants", () => {
    it("should return empty array when there are no campaigns", async () => {
      givenCampaigns([]);

      const result = await service.getTopTenants();

      expect(result).toEqual([]);
    });

    it("should group campaigns by tenant_id and aggregate", async () => {
      givenCampaigns([
        mockCampaign({
          id: "c1",
          tenant_id: "tenant-a",
          total_calls: 100,
          total_cost: "50.00",
        }),
        mockCampaign({
          id: "c2",
          tenant_id: "tenant-a",
          total_calls: 50,
          total_cost: "25.00",
        }),
        mockCampaign({
          id: "c3",
          tenant_id: "tenant-b",
          total_calls: 200,
          total_cost: "100.00",
        }),
      ]);
      givenTenants([
        { id: "tenant-a", name: "Acme Corp" },
        { id: "tenant-b", name: "Beta Inc" },
      ]);

      const result = await service.getTopTenants();

      expect(result).toHaveLength(2);
      // tenant-b should be first (200 total calls)
      expect(result[0].tenantId).toBe("tenant-b");
      expect(result[0].tenantName).toBe("Beta Inc");
      expect(result[0].totalCalls).toBe(200);
      expect(result[0].totalCampaigns).toBe(1);
      expect(result[0].totalCostUSD).toBe(100.0);

      // tenant-a second (150 total calls)
      expect(result[1].tenantId).toBe("tenant-a");
      expect(result[1].tenantName).toBe("Acme Corp");
      expect(result[1].totalCalls).toBe(150);
      expect(result[1].totalCampaigns).toBe(2);
      expect(result[1].totalCostUSD).toBe(75.0);
    });

    it("should limit results to top 5 tenants", async () => {
      givenCampaigns(
        Array.from({ length: 10 }, (_, i) =>
          mockCampaign({
            id: `c${i}`,
            tenant_id: `tenant-${i}`,
            total_calls: (10 - i) * 100,
          }),
        ),
      );
      givenTenants(
        Array.from({ length: 5 }, (_, i) => ({
          id: `tenant-${i}`,
          name: `Tenant ${i}`,
        })),
      );

      const result = await service.getTopTenants();

      expect(result).toHaveLength(5);
      // tenant-0 has 1000 calls, should be first
      expect(result[0].tenantId).toBe("tenant-0");
      expect(result[0].tenantName).toBe("Tenant 0");
      expect(result[0].totalCalls).toBe(1000);
    });

    it("should sort by totalCalls descending", async () => {
      givenCampaigns([
        mockCampaign({ tenant_id: "low", total_calls: 10 }),
        mockCampaign({ tenant_id: "high", total_calls: 500 }),
        mockCampaign({ tenant_id: "mid", total_calls: 100 }),
      ]);
      givenTenants([
        { id: "high", name: "High Volume" },
        { id: "mid", name: "Mid Volume" },
        { id: "low", name: "Low Volume" },
      ]);

      const result = await service.getTopTenants();

      expect(result[0].tenantId).toBe("high");
      expect(result[1].tenantId).toBe("mid");
      expect(result[2].tenantId).toBe("low");
    });

    it("should skip rows with null tenant_id", async () => {
      givenCampaigns([
        mockCampaign({ tenant_id: "valid", total_calls: 50 }),
        {
          id: "orphan",
          tenant_id: null,
          total_calls: 999,
          successful_calls: 0,
          failed_calls: 0,
          total_cost: "0",
        },
      ]);
      givenTenants([{ id: "valid", name: "ValidCo" }]);

      const result = await service.getTopTenants();

      expect(result).toHaveLength(1);
      expect(result[0].tenantId).toBe("valid");
      expect(result[0].tenantName).toBe("ValidCo");
    });

    it("should throw InternalServerErrorException when campaign fetch fails", async () => {
      supabaseClientMock.select.mockResolvedValueOnce({
        data: null,
        error: { message: "Connection refused" },
      });

      const error = await service.getTopTenants().catch((e) => e);

      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect(error.message).toContain("Failed to fetch campaigns for ranking");
    });

    it("should select the correct columns for ranking query", async () => {
      givenCampaigns([]);

      await service.getTopTenants();

      expect(supabaseClientMock.from).toHaveBeenCalledWith("campaigns");
      expect(supabaseClientMock.select).toHaveBeenCalledWith(
        "tenant_id, total_calls, total_cost",
      );
    });

    it("should fall back to tenantId as tenantName when tenant not found", async () => {
      givenCampaigns([
        mockCampaign({ tenant_id: "missing-tenant", total_calls: 50 }),
      ]);
      // tenants table returns empty — no matching names
      givenTenants([]);

      const result = await service.getTopTenants();

      expect(result).toHaveLength(1);
      expect(result[0].tenantId).toBe("missing-tenant");
      expect(result[0].tenantName).toBe("missing-tenant"); // fallback
    });

    it("should query tenants table with correct columns", async () => {
      givenCampaigns([
        mockCampaign({ tenant_id: "t1", total_calls: 50 }),
        mockCampaign({ tenant_id: "t2", total_calls: 100 }),
      ]);
      givenTenants([
        { id: "t1", name: "One" },
        { id: "t2", name: "Two" },
      ]);

      await service.getTopTenants();

      // Verify the tenants query
      expect(supabaseClientMock.from).toHaveBeenCalledWith("tenants");
      expect(supabaseClientMock.select).toHaveBeenCalledWith("id, name");
    });
  });

  // ── getGlobalAnalytics (combined) ────────────────────────────────────
  describe("getGlobalAnalytics", () => {
    it("should return kpis, topTenants, and trends", async () => {
      // Spy on sub-methods to avoid concurrent mock interleaving with Promise.all
      const mockKpis = {
        totalCalls: 100,
        totalCampaigns: 1,
        totalMinutes: 1.0,
        totalCostUSD: 100,
        successRate: 0.9,
        totalTenants: 1,
      };
      const mockTopTenants = [
        {
          tenantId: "t1",
          tenantName: "Test Corp",
          totalCalls: 100,
          totalCampaigns: 1,
          totalCostUSD: 100,
        },
      ];
      const mockTrends = [
        { hour: "2026-06-25", count: 45 },
        { hour: "2026-06-24", count: 30 },
      ];

      jest.spyOn(service, "getGlobalKpis").mockResolvedValue(mockKpis);
      jest.spyOn(service, "getTopTenants").mockResolvedValue(mockTopTenants);
      // getGlobalTrends is private — spy on the prototype or test through getGlobalAnalytics
      jest
        .spyOn(service as any, "getGlobalTrends")
        .mockResolvedValue(mockTrends);

      const result = await service.getGlobalAnalytics();

      expect(result.kpis).toEqual(mockKpis);
      expect(result.topTenants).toEqual(mockTopTenants);
      expect(result.trends).toEqual({ callsPerHour: mockTrends });
      expect(service.getGlobalKpis).toHaveBeenCalledTimes(1);
      expect(service.getTopTenants).toHaveBeenCalledTimes(1);
      expect((service as any).getGlobalTrends).toHaveBeenCalledTimes(1);
    });
  });
});
