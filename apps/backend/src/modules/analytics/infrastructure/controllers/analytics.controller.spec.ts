import { Test, TestingModule } from "@nestjs/testing";
import { CanActivate } from "@nestjs/common";
import { UserRole } from "@callmaster/shared";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "../providers/analytics.service";
import { AdminAnalyticsService } from "../providers/admin-analytics.service";
import { AuthGuard } from "../../../auth/infrastructure/guards/auth.guard";
import { RolesGuard } from "../../../auth/infrastructure/guards/roles.guard";

describe("AnalyticsController", () => {
  let controller: AnalyticsController;
  let analyticsService: jest.Mocked<AnalyticsService>;
  let adminAnalyticsService: jest.Mocked<AdminAnalyticsService>;

  const mockGuard: CanActivate = { canActivate: jest.fn(() => true) };

  const tenantSummaryFixture = {
    kpis: {
      totalCalls: 150,
      totalCampaigns: 3,
      totalMinutes: 12.5,
      totalCostUSD: 75.0,
      successRate: 0.8667,
    },
    trends: {
      callsPerHour: Array.from({ length: 24 }, (_, i) => ({
        hour: new Date(Date.now() - (23 - i) * 3600 * 1000).toISOString(),
        count: 0,
      })),
    },
  };

  const globalAnalyticsFixture = {
    kpis: {
      totalCalls: 500,
      totalCampaigns: 10,
      totalMinutes: 120.5,
      totalCostUSD: 2500.0,
      successRate: 0.88,
      totalTenants: 3,
    },
    topTenants: [
      {
        tenantId: "t1",
        totalCalls: 300,
        totalCampaigns: 5,
        totalCostUSD: 1500,
      },
      {
        tenantId: "t2",
        totalCalls: 200,
        totalCampaigns: 5,
        totalCostUSD: 1000,
      },
    ],
  };

  beforeEach(async () => {
    analyticsService = {
      getTenantSummary: jest.fn(),
    } as any;

    adminAnalyticsService = {
      getGlobalAnalytics: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: analyticsService,
        },
        {
          provide: AdminAnalyticsService,
          useValue: adminAnalyticsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /analytics/tenant-summary", () => {
    it("should return 200 with tenant summary data from AnalyticsService", async () => {
      analyticsService.getTenantSummary.mockResolvedValue(tenantSummaryFixture);

      const result = await controller.getTenantSummary();

      expect(analyticsService.getTenantSummary).toHaveBeenCalledTimes(1);
      expect(result).toEqual(tenantSummaryFixture);
    });

    it("should return response with correct kpis shape from service", async () => {
      analyticsService.getTenantSummary.mockResolvedValue(tenantSummaryFixture);

      const result = await controller.getTenantSummary();

      expect(result.kpis).toBeDefined();
      expect(result.kpis.totalCalls).toBe(150);
      expect(result.kpis.totalCampaigns).toBe(3);
      expect(result.kpis.totalMinutes).toBe(12.5);
      expect(result.kpis.totalCostUSD).toBe(75.0);
      expect(result.kpis.successRate).toBe(0.8667);
    });

    it("should return response with trends.callsPerHour as an array from service", async () => {
      analyticsService.getTenantSummary.mockResolvedValue(tenantSummaryFixture);

      const result = await controller.getTenantSummary();

      expect(result.trends).toBeDefined();
      expect(result.trends.callsPerHour).toBeInstanceOf(Array);
      expect(result.trends.callsPerHour).toHaveLength(24);
    });

    it("should pass through empty state (all zeroes) correctly", async () => {
      const emptySummary = {
        kpis: {
          totalCalls: 0,
          totalCampaigns: 0,
          totalMinutes: 0,
          totalCostUSD: 0,
          successRate: 0,
        },
        trends: {
          callsPerHour: Array.from({ length: 24 }, (_, i) => ({
            hour: new Date(Date.now() - (23 - i) * 3600 * 1000).toISOString(),
            count: 0,
          })),
        },
      };

      analyticsService.getTenantSummary.mockResolvedValue(emptySummary);

      const result = await controller.getTenantSummary();

      expect(result.kpis.totalCalls).toBe(0);
      expect(result.kpis.totalCampaigns).toBe(0);
      expect(result.kpis.successRate).toBe(0);
      // All 24 hours should have zero count
      expect(result.trends.callsPerHour.every((s) => s.count === 0)).toBe(true);
    });

    it("should propagate errors thrown by AnalyticsService", async () => {
      const error = new Error("Service unavailable");
      analyticsService.getTenantSummary.mockRejectedValue(error);

      await expect(controller.getTenantSummary()).rejects.toThrow(
        "Service unavailable",
      );
    });

    it("should call AnalyticsService.getTenantSummary exactly once per invocation", async () => {
      analyticsService.getTenantSummary.mockResolvedValue(tenantSummaryFixture);

      await controller.getTenantSummary();

      expect(analyticsService.getTenantSummary).toHaveBeenCalledTimes(1);
    });
  });

  // ── GET /analytics/global ───────────────────────────────────────────
  describe("GET /analytics/global", () => {
    it("should return 200 with global analytics data from AdminAnalyticsService", async () => {
      adminAnalyticsService.getGlobalAnalytics.mockResolvedValue(
        globalAnalyticsFixture,
      );

      const result = await controller.getGlobalAnalytics();

      expect(adminAnalyticsService.getGlobalAnalytics).toHaveBeenCalledTimes(1);
      expect(result).toEqual(globalAnalyticsFixture);
    });

    it("should return response with correct kpis shape", async () => {
      adminAnalyticsService.getGlobalAnalytics.mockResolvedValue(
        globalAnalyticsFixture,
      );

      const result = await controller.getGlobalAnalytics();

      expect(result.kpis).toBeDefined();
      expect(result.kpis.totalCalls).toBe(500);
      expect(result.kpis.totalCampaigns).toBe(10);
      expect(result.kpis.totalMinutes).toBe(120.5);
      expect(result.kpis.totalCostUSD).toBe(2500.0);
      expect(result.kpis.successRate).toBe(0.88);
      expect(result.kpis.totalTenants).toBe(3);
    });

    it("should return response with topTenants array", async () => {
      adminAnalyticsService.getGlobalAnalytics.mockResolvedValue(
        globalAnalyticsFixture,
      );

      const result = await controller.getGlobalAnalytics();

      expect(result.topTenants).toBeInstanceOf(Array);
      expect(result.topTenants).toHaveLength(2);
      expect(result.topTenants[0].tenantId).toBe("t1");
      expect(result.topTenants[0].totalCalls).toBe(300);
    });

    it("should propagate errors thrown by AdminAnalyticsService", async () => {
      const error = new Error("Service unavailable");
      adminAnalyticsService.getGlobalAnalytics.mockRejectedValue(error);

      await expect(controller.getGlobalAnalytics()).rejects.toThrow(
        "Service unavailable",
      );
    });

    it("should call AdminAnalyticsService.getGlobalAnalytics exactly once per invocation", async () => {
      adminAnalyticsService.getGlobalAnalytics.mockResolvedValue(
        globalAnalyticsFixture,
      );

      await controller.getGlobalAnalytics();

      expect(adminAnalyticsService.getGlobalAnalytics).toHaveBeenCalledTimes(1);
    });
  });

  describe("authorization guards", () => {
    it("should have AuthGuard applied at the class level", () => {
      const guards = Reflect.getMetadata("__guards__", AnalyticsController);

      expect(guards).toBeDefined();
      expect(guards).toContain(AuthGuard);
    });

    it("should have RolesGuard applied at the class level", () => {
      const guards = Reflect.getMetadata("__guards__", AnalyticsController);

      expect(guards).toBeDefined();
      expect(guards).toContain(RolesGuard);
    });

    it("should require TenantAdmin role on GET /tenant-summary", () => {
      const roles = Reflect.getMetadata(
        "roles",
        AnalyticsController.prototype.getTenantSummary,
      );

      expect(roles).toBeDefined();
      expect(roles).toContain(UserRole.TenantAdmin);
    });

    it("should require PlatformOwner role on GET /global", () => {
      const roles = Reflect.getMetadata(
        "roles",
        AnalyticsController.prototype.getGlobalAnalytics,
      );

      expect(roles).toBeDefined();
      expect(roles).toContain(UserRole.PlatformOwner);
    });

    it("should NOT have AllowOverride on GET /global (strict PlatformOwner)", () => {
      const allowOverride = Reflect.getMetadata(
        "allowOverride",
        AnalyticsController.prototype.getGlobalAnalytics,
      );

      expect(allowOverride).toBeUndefined();
    });
  });
});
