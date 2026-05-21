import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { TenantsService } from "./tenants.service";
import * as supabaseJs from "@supabase/supabase-js";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

describe("TenantsService — campaignCount in findAll", () => {
  let service: TenantsService;
  let supabaseAdminMock: any;

  beforeEach(async () => {
    const configService = {
      get: jest.fn((key: string) => {
        if (key === "SUPABASE_URL") return "https://mock-url.supabase.co";
        if (key === "SERVICE_ROLE_KEY") return "mock-service-key";
        if (key === "ENCRYPTION_MASTER_KEY") return "mock-master-key";
        return null;
      }),
    };

    supabaseAdminMock = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn(),
    };

    (supabaseJs.createClient as jest.Mock).mockReturnValue(supabaseAdminMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should populate campaignCount from campaigns[0].count", async () => {
    supabaseAdminMock.range.mockResolvedValue({
      data: [
        {
          id: "1",
          name: "Tenant 1",
          contact_email: "a@b.com",
          status: "active",
          sandbox_config: {},
          production_config: {},
          campaigns: [{ count: 3 }],
        },
      ],
      count: 1,
      error: null,
    });

    const result = await service.findAll({ page: 1, limit: 20 });
    expect(result.data[0].campaignCount).toBe(3);
  });

  it("should default campaignCount to 0 when campaigns array is empty", async () => {
    supabaseAdminMock.range.mockResolvedValue({
      data: [
        {
          id: "2",
          name: "Tenant 2",
          contact_email: "b@c.com",
          status: "active",
          sandbox_config: {},
          production_config: {},
          campaigns: [],
        },
      ],
      count: 1,
      error: null,
    });

    const result = await service.findAll({ page: 1, limit: 20 });
    expect(result.data[0].campaignCount).toBe(0);
  });

  it("should default campaignCount to 0 when campaigns field is absent", async () => {
    supabaseAdminMock.range.mockResolvedValue({
      data: [
        {
          id: "3",
          name: "Tenant 3",
          contact_email: "c@d.com",
          status: "suspended",
          sandbox_config: {},
          production_config: {},
        },
      ],
      count: 1,
      error: null,
    });

    const result = await service.findAll({ page: 1, limit: 20 });
    expect(result.data[0].campaignCount).toBe(0);
  });

  it("should use recursive select with campaigns(count)", async () => {
    supabaseAdminMock.range.mockResolvedValue({
      data: [],
      count: 0,
      error: null,
    });

    await service.findAll({ page: 1, limit: 20 });

    expect(supabaseAdminMock.select).toHaveBeenCalledWith(
      "*, campaigns(count)",
      { count: "exact" },
    );
  });
});
