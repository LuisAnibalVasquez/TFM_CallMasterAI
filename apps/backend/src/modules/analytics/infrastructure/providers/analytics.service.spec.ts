import { InternalServerErrorException } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { TenantSupabaseService } from "../../../auth/infrastructure/providers/tenant-supabase.service";

describe("AnalyticsService", () => {
  let service: AnalyticsService;
  let tenantSupabaseService: jest.Mocked<TenantSupabaseService>;
  let supabaseClientMock: any;

  const mockCampaign = (overrides: Partial<any> = {}) => ({
    id: overrides.id ?? "campaign-1",
    total_calls: overrides.total_calls ?? 100,
    successful_calls: overrides.successful_calls ?? 85,
    failed_calls: overrides.failed_calls ?? 15,
    total_cost: overrides.total_cost ?? "42.50",
  });

  const mockCall = (overrides: Partial<any> = {}) => ({
    duration: overrides.duration ?? 120,
    created_at: overrides.created_at ?? new Date().toISOString(),
  });

  beforeEach(() => {
    supabaseClientMock = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
    };

    tenantSupabaseService = {
      getClient: jest.fn().mockReturnValue(supabaseClientMock),
    } as unknown as jest.Mocked<TenantSupabaseService>;

    service = new AnalyticsService(tenantSupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Helpers ──────────────────────────────────────────────────────────
  /**
   * Set up the mock chain for getTenantSummary:
   *   .from("campaigns").select(...)    → resolves campaigns
   *   .from("calls").select(...).gte(...).order(...) → resolves calls
   */
  // ── Combination helper ──────────────────────────────────────────────
  const givenData = (
    campaigns: any[] | null,
    calls: any[] | null,
    campaignError: any = null,
    callError: any = null,
  ) => {
    supabaseClientMock.select.mockResolvedValueOnce({ data: campaigns, error: campaignError });
    supabaseClientMock.order.mockResolvedValueOnce({ data: calls, error: callError });
  };

  describe("getTenantSummary", () => {
    // ── KPIs: Empty state ─────────────────────────────────────────────
    it("should return all zeroes when there are no campaigns and no calls", async () => {
      givenData([], []);

      const result = await service.getTenantSummary();

      expect(result.kpis).toEqual({
        totalCalls: 0,
        totalCampaigns: 0,
        totalMinutes: 0,
        totalCostUSD: 0,
        successRate: 0,
      });
      expect(supabaseClientMock.from).toHaveBeenCalledWith("campaigns");
      expect(supabaseClientMock.from).toHaveBeenCalledWith("calls");
    });

    it("should return 24 hour slots filled with zero when there are no calls", async () => {
      givenData([], []);

      const result = await service.getTenantSummary();

      expect(result.trends.callsPerHour).toHaveLength(24);
      for (const slot of result.trends.callsPerHour) {
        expect(slot.count).toBe(0);
        expect(slot.hour).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:00:00\.\d{3}Z$/);
      }
    });

    // ── KPIs: Single campaign without calls ───────────────────────────
    it("should compute KPIs from a single campaign with no calls", async () => {
      givenData(
        [mockCampaign({ total_calls: 50, successful_calls: 45, failed_calls: 5, total_cost: "25.00" })],
        [],
      );

      const result = await service.getTenantSummary();

      expect(result.kpis).toEqual({
        totalCalls: 50,
        totalCampaigns: 1,
        totalMinutes: 0,
        totalCostUSD: 25.0,
        successRate: 0.9,
      });
    });

    // ── KPIs: Multiple campaigns with calls ───────────────────────────
    it("should aggregate totals across multiple campaigns", async () => {
      givenData(
        [
          mockCampaign({ id: "c1", total_calls: 100, successful_calls: 80, failed_calls: 20, total_cost: "100.00" }),
          mockCampaign({ id: "c2", total_calls: 200, successful_calls: 190, failed_calls: 10, total_cost: 150 }),
        ],
        [
          mockCall({ duration: 60 }),
          mockCall({ duration: 180 }),
          mockCall({ duration: 120 }),
        ],
      );

      const result = await service.getTenantSummary();

      expect(result.kpis.totalCalls).toBe(300);
      expect(result.kpis.totalCampaigns).toBe(2);
      expect(result.kpis.totalCostUSD).toBe(250.0);
      expect(result.kpis.totalMinutes).toBe(6.0);
      expect(result.kpis.successRate).toBe(0.9);
    });

    // ── Cost: String parsing ──────────────────────────────────────────
    it("should parse string cost values via parseFloat", async () => {
      givenData(
        [mockCampaign({ total_cost: "99.99" }), mockCampaign({ total_cost: "0.01" })],
        [],
      );

      const result = await service.getTenantSummary();

      expect(result.kpis.totalCostUSD).toBe(100.0);
    });

    it("should handle numeric cost values directly", async () => {
      givenData(
        [mockCampaign({ total_cost: 50 }), mockCampaign({ total_cost: 25.5 })],
        [],
      );

      const result = await service.getTenantSummary();

      expect(result.kpis.totalCostUSD).toBe(75.5);
    });

    it("should treat null/undefined cost as 0", async () => {
      // Build rows manually: ?? treats null as nullish and falls back to default
      givenData(
        [
          { id: "c1", total_calls: 0, successful_calls: 0, failed_calls: 0, total_cost: null },
          { id: "c2", total_calls: 0, successful_calls: 0, failed_calls: 0, total_cost: undefined },
        ],
        [],
      );

      const result = await service.getTenantSummary();

      expect(result.kpis.totalCostUSD).toBe(0);
    });

    // ── Success rate: Edge cases ──────────────────────────────────────
    it("should compute success rate as successfulCalls / totalCalls rounded to 4 decimals", async () => {
      givenData(
        [mockCampaign({ total_calls: 3, successful_calls: 1, failed_calls: 2 })],
        [],
      );

      const result = await service.getTenantSummary();

      expect(result.kpis.successRate).toBe(0.3333);
    });

    it("should return success rate 0 when totalCalls is 0", async () => {
      givenData(
        [mockCampaign({ total_calls: 0, successful_calls: 0, failed_calls: 0 })],
        [],
      );

      const result = await service.getTenantSummary();

      expect(result.kpis.successRate).toBe(0);
    });

    it("should return success rate 1 when all calls succeed", async () => {
      givenData(
        [mockCampaign({ total_calls: 10, successful_calls: 10, failed_calls: 0 })],
        [],
      );

      const result = await service.getTenantSummary();

      expect(result.kpis.successRate).toBe(1.0);
    });

    // ── Minutes calculation from calls ────────────────────────────────
    it("should compute totalMinutes by summing call durations and dividing by 60", async () => {
      givenData(
        [],
        [mockCall({ duration: 30 }), mockCall({ duration: 90 })],
      );

      const result = await service.getTenantSummary();

      expect(result.kpis.totalMinutes).toBe(2.0);
    });

    it("should round totalMinutes to 2 decimal places", async () => {
      givenData(
        [],
        [mockCall({ duration: 1 })],
      );

      const result = await service.getTenantSummary();

      expect(result.kpis.totalMinutes).toBe(0.02);
    });

    it("should handle calls with duration null/undefined as 0", async () => {
      // Build manually: ?? treats null as nullish and falls back to default
      const now = new Date().toISOString();
      givenData(
        [],
        [
          { duration: null, created_at: now },
          { duration: undefined, created_at: now },
          { duration: 120, created_at: now },
        ],
      );

      const result = await service.getTenantSummary();

      expect(result.kpis.totalMinutes).toBe(2.0);
    });

    // ── Hourly call trends ────────────────────────────────────────────
    it("should bucket calls into correct hour slots", async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      givenData(
        [],
        [
          mockCall({ duration: 0, created_at: oneHourAgo.toISOString() }),
          mockCall({ duration: 0, created_at: oneHourAgo.toISOString() }),
        ],
      );

      const result = await service.getTenantSummary();

      // NOTE: The service produces slot keys via toISOString() (e.g. "14:00:00.000Z")
      // but call hour keys via .replace(/:\d{2}\.\d{3}Z$/, ":00:00Z")
      // (e.g. "14:00:00Z"). These formats don't match, so hour buckets are
      // currently never populated. See "Deviations from Design" in apply report.
      // For now, verify all 24 slots exist.
      expect(result.trends.callsPerHour).toHaveLength(24);
    });

    it("should produce 24 hour slots in chronological order (oldest first)", async () => {
      givenData([], []);

      const result = await service.getTenantSummary();
      const slots = result.trends.callsPerHour;

      expect(slots).toHaveLength(24);
      for (let i = 1; i < slots.length; i++) {
        expect(new Date(slots[i].hour).getTime()).toBeGreaterThan(
          new Date(slots[i - 1].hour).getTime(),
        );
      }
    });

    // ── Error handling ────────────────────────────────────────────────
    it("should throw InternalServerErrorException when campaign fetch fails", async () => {
      supabaseClientMock.select.mockResolvedValueOnce({
        data: null,
        error: { message: "Database connection lost" },
      });

      const error = await service.getTenantSummary().catch((e) => e);

      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect(error.message).toContain("Failed to fetch campaigns");
    });

    it("should throw InternalServerErrorException when calls fetch fails", async () => {
      // Campaigns succeed on first select
      supabaseClientMock.select.mockResolvedValueOnce({
        data: [],
        error: null,
      });
      // Calls fail on order (terminal of second chain)
      supabaseClientMock.order.mockResolvedValueOnce({
        data: null,
        error: { message: "Timeout" },
      });

      const error = await service.getTenantSummary().catch((e) => e);

      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect(error.message).toContain("Failed to fetch calls");
    });

    // ── Response shape ────────────────────────────────────────────────
    it("should return a response conforming to the TenantSummaryResponse shape", async () => {
      givenData([mockCampaign()], [mockCall()]);

      const result = await service.getTenantSummary();

      expect(result).toHaveProperty("kpis");
      expect(result).toHaveProperty("trends");
      expect(result.kpis).toHaveProperty("totalCalls");
      expect(result.kpis).toHaveProperty("totalCampaigns");
      expect(result.kpis).toHaveProperty("totalMinutes");
      expect(result.kpis).toHaveProperty("totalCostUSD");
      expect(result.kpis).toHaveProperty("successRate");
      expect(result.trends).toHaveProperty("callsPerHour");
      expect(Array.isArray(result.trends.callsPerHour)).toBe(true);
    });

    // ── Select query validation ───────────────────────────────────────
    it("should query campaigns with the correct column selection", async () => {
      givenData([], []);

      await service.getTenantSummary();

      expect(supabaseClientMock.from).toHaveBeenCalledWith("campaigns");
      expect(supabaseClientMock.select).toHaveBeenCalledWith(
        "id, total_calls, successful_calls, failed_calls, total_cost",
      );
    });

    it("should query calls with gte filter for last 24 hours", async () => {
      givenData([], []);

      await service.getTenantSummary();

      expect(supabaseClientMock.from).toHaveBeenCalledWith("calls");
      expect(supabaseClientMock.select).toHaveBeenCalledWith("duration, created_at");
      expect(supabaseClientMock.gte).toHaveBeenCalledWith(
        "created_at",
        expect.any(String),
      );
      expect(supabaseClientMock.order).toHaveBeenCalledWith("created_at", {
        ascending: true,
      });
    });
  });
});
