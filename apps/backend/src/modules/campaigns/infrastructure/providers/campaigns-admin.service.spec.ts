// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt2 on Tue May 26 2026
import { ConfigService } from "@nestjs/config";
import { InternalServerErrorException } from "@nestjs/common";
import { CampaignsAdminService } from "./campaigns-admin.service";
import { Campaign } from "../../domain/entities/campaign.entity";
import { CampaignStatus, CampaignEnvironment } from "@callmaster/shared";
import * as supabaseJs from "@supabase/supabase-js";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

describe("CampaignsAdminService", () => {
  let service: CampaignsAdminService;
  let configService: jest.Mocked<ConfigService>;
  let supabaseAdminMock: any;

  const mockCampaignRow = {
    id: "campaign-1",
    tenant_id: "tenant-1",
    name: "Admin Campaign",
    status: "Created",
    environment: "Sandbox",
    csv_url: "",
    total_calls: 50,
    successful_calls: 40,
    failed_calls: 10,
    total_cost: "25.00",
    created_at: "2026-02-01T00:00:00.000Z",
  };

  const mockCallRow = {
    id: "call-1",
    campaign_id: "campaign-1",
    customer_name: "Jane Doe",
    phone_encrypted: "enc-phone",
    phone_hash: "hash-phone",
    language: "es",
    age: 28,
    duration: 90,
    status: "completed",
    cost: "1.20",
    voiceflow_transcript_id: "tx-456",
    created_at: "2026-02-01T00:00:00.000Z",
  };

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => {
        if (key === "SUPABASE_URL") return "https://mock-admin.supabase.co";
        if (key === "SERVICE_ROLE_KEY") return "mock-service-role-key";
        return null;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    supabaseAdminMock = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      rpc: jest.fn(),
      storage: {
        from: jest.fn().mockReturnThis(),
        createSignedUrl: jest.fn(),
      },
    };

    (supabaseJs.createClient as jest.Mock).mockReturnValue(supabaseAdminMock);

    service = new CampaignsAdminService(configService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Admin client initialization ────────────────────────────────────

  it("should create an admin Supabase client using SERVICE_ROLE_KEY", () => {
    expect(supabaseJs.createClient).toHaveBeenCalledWith(
      "https://mock-admin.supabase.co",
      "mock-service-role-key",
      expect.objectContaining({
        auth: expect.objectContaining({
          autoRefreshToken: false,
          persistSession: false,
        }),
      }),
    );
  });

  // ── create ─────────────────────────────────────────────────────────

  it("should insert a campaign via admin client", async () => {
    supabaseAdminMock.single.mockResolvedValue({
      data: mockCampaignRow,
      error: null,
    });

    const campaign = new Campaign({
      id: "campaign-1",
      tenantId: "tenant-1",
      name: "Admin Campaign",
      status: CampaignStatus.CREATED,
      environment: CampaignEnvironment.SANDBOX,
      csvUrl: "",
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      totalCost: 0,
      createdAt: new Date(),
    });

    const result = await service.create(campaign);

    expect(result.name).toBe("Admin Campaign");
    expect(result.totalCalls).toBe(50);
    expect(supabaseAdminMock.from).toHaveBeenCalledWith("campaigns");
  });

  // ── findByTenant (admin bypasses RLS) ──────────────────────────────

  it("should return campaigns for any tenant via admin client (RLS bypass)", async () => {
    supabaseAdminMock.range.mockResolvedValue({
      data: [mockCampaignRow],
      count: 1,
      error: null,
    });

    const result = await service.findByTenant("any-tenant", {
      page: 1,
      limit: 20,
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].tenantId).toBe("tenant-1");
  });

  // ── bulkInsertCalls ────────────────────────────────────────────────

  it("should insert calls via admin client", async () => {
    supabaseAdminMock.select.mockResolvedValue({
      data: [mockCallRow],
      error: null,
    });

    const calls = [
      {
        customerName: "Jane Doe",
        phone: "+34666111222",
        language: "es",
        age: 28,
      },
    ];

    const result = await service.bulkInsertCalls("campaign-1", calls);

    expect(result).toHaveLength(1);
    expect(result[0].customerName).toBe("Jane Doe");
    expect(supabaseAdminMock.from).toHaveBeenCalledWith("calls");
  });

  // ── Error handling ─────────────────────────────────────────────────

  it("should throw InternalServerErrorException on DB error", async () => {
    supabaseAdminMock.single.mockResolvedValue({
      data: null,
      error: { message: "DB crash" },
    });

    const campaign = new Campaign({
      id: "c-err",
      tenantId: "t-1",
      name: "Fail",
      status: CampaignStatus.CREATED,
      environment: CampaignEnvironment.SANDBOX,
      csvUrl: "",
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      totalCost: 0,
      createdAt: new Date(),
    });

    await expect(service.create(campaign)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
