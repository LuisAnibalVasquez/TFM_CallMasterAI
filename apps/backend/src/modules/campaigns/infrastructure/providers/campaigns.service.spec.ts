// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt2 on Tue May 26 2026
import { InternalServerErrorException } from "@nestjs/common";
import { CampaignsService } from "./campaigns.service";
import { Campaign } from "../../domain/entities/campaign.entity";
import { CampaignStatus, CampaignEnvironment } from "@callmaster/shared";
import { TenantSupabaseService } from "../../../auth/infrastructure/providers/tenant-supabase.service";

describe("CampaignsService", () => {
  let service: CampaignsService;
  let tenantSupabaseService: jest.Mocked<TenantSupabaseService>;
  let supabaseClientMock: any;

  const mockCampaignRow = {
    id: "campaign-1",
    tenant_id: "tenant-1",
    name: "Test Campaign",
    status: "Created",
    environment: "Sandbox",
    csv_url: "",
    total_calls: 100,
    successful_calls: 85,
    failed_calls: 15,
    total_cost: "42.50",
    created_at: "2026-01-01T00:00:00.000Z",
  };

  const mockCallRow = {
    id: "call-1",
    campaign_id: "campaign-1",
    customer_name: "John Doe",
    phone_encrypted: "encrypted-phone",
    phone_hash: "hashed-phone",
    language: "en",
    age: 30,
    duration: 120,
    status: "completed",
    cost: "1.50",
    voiceflow_transcript_id: "tx-123",
    created_at: "2026-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    supabaseClientMock = {
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

    tenantSupabaseService = {
      getClient: jest.fn().mockReturnValue(supabaseClientMock),
    } as unknown as jest.Mocked<TenantSupabaseService>;

    service = new CampaignsService(tenantSupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should insert a campaign and return the mapped entity", async () => {
      supabaseClientMock.single.mockResolvedValue({
        data: mockCampaignRow,
        error: null,
      });

      const campaign = new Campaign({
        id: "campaign-1",
        tenantId: "tenant-1",
        name: "Test Campaign",
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

      expect(result.id).toBe("campaign-1");
      expect(result.name).toBe("Test Campaign");
      expect(result.totalCalls).toBe(100);
      expect(result.successfulCalls).toBe(85);
      expect(result.failedCalls).toBe(15);
      expect(result.totalCost).toBe(42.5);
      expect(supabaseClientMock.from).toHaveBeenCalledWith("campaigns");
      expect(supabaseClientMock.insert).toHaveBeenCalled();
    });

    it("should throw InternalServerErrorException when Supabase fails", async () => {
      supabaseClientMock.single.mockResolvedValue({
        data: null,
        error: { message: "DB error" },
      });

      const campaign = new Campaign({
        id: "campaign-1",
        tenantId: "tenant-1",
        name: "Failing Campaign",
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

  describe("findByTenant", () => {
    it("should return paginated campaigns for a tenant", async () => {
      supabaseClientMock.range.mockResolvedValue({
        data: [mockCampaignRow],
        count: 1,
        error: null,
      });

      const result = await service.findByTenant("tenant-1", {
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.data[0]).toBeInstanceOf(Campaign);
      expect(result.data[0].id).toBe("campaign-1");
      expect(supabaseClientMock.from).toHaveBeenCalledWith("campaigns");
    });

    it("should return empty list when tenant has no campaigns", async () => {
      supabaseClientMock.range.mockResolvedValue({
        data: [],
        count: 0,
        error: null,
      });

      const result = await service.findByTenant("tenant-empty", {
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe("bulkInsertCalls", () => {
    it("should insert multiple call records at once", async () => {
      supabaseClientMock.select.mockResolvedValue({
        data: [mockCallRow, { ...mockCallRow, id: "call-2" }],
        error: null,
      });

      const calls = [
        {
          customerName: "John Doe",
          phone: "+14155552671",
          language: "en",
          age: 30,
        },
        {
          customerName: "Jane Smith",
          phone: "+34666111222",
          language: "es",
          age: 25,
        },
      ];

      const result = await service.bulkInsertCalls("campaign-1", calls);

      expect(result).toHaveLength(2);
      expect(result[0].customerName).toBe("John Doe");
      expect(result[1].customerName).toBe("John Doe");
      expect(supabaseClientMock.from).toHaveBeenCalledWith("calls");
      expect(supabaseClientMock.insert).toHaveBeenCalled();
    });

    it("should hash each phone number before inserting", async () => {
      supabaseClientMock.select.mockResolvedValue({
        data: [mockCallRow],
        error: null,
      });

      const calls = [
        {
          customerName: "Test",
          phone: "+14155552671",
          language: "en",
          age: 30,
        },
      ];

      await service.bulkInsertCalls("campaign-1", calls);

      const insertArg = supabaseClientMock.insert.mock.calls[0][0];
      expect(insertArg).toBeDefined();
      // phone_encrypted should contain the plaintext (for now)
      // phone_hash should be a SHA256-like hash
      expect(insertArg[0].phone_hash).toBeDefined();
      expect(insertArg[0].phone_hash).not.toBe("+14155552671");
      expect(insertArg[0].phone_encrypted).toBe("+14155552671");
    });
  });

  describe("findCallsByCampaign", () => {
    it("should return all calls for a given campaign", async () => {
      supabaseClientMock.select.mockReturnThis();
      supabaseClientMock.eq.mockReturnThis();
      supabaseClientMock.order.mockResolvedValue({
        data: [mockCallRow],
        error: null,
      });

      const result = await service.findCallsByCampaign("campaign-1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("call-1");
      expect(result[0].customerName).toBe("John Doe");
    });

    it("should return empty array when no calls exist", async () => {
      supabaseClientMock.select.mockReturnThis();
      supabaseClientMock.eq.mockReturnThis();
      supabaseClientMock.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await service.findCallsByCampaign("campaign-none");

      expect(result).toHaveLength(0);
    });
  });

  describe("updateCall", () => {
    it("should update a call record and return the updated call", async () => {
      const updatedCallRow = {
        ...mockCallRow,
        status: "completed",
        duration: 180,
        cost: "3.50",
        voiceflow_transcript_id: "vf-abc123",
      };

      supabaseClientMock.single.mockResolvedValue({
        data: updatedCallRow,
        error: null,
      });

      const result = await service.updateCall("call-1", {
        status: "completed",
        duration: 180,
        cost: 3.5,
        voiceflowTranscriptId: "vf-abc123",
      });

      expect(result.status).toBe("completed");
      expect(result.duration).toBe(180);
      expect(result.cost).toBe(3.5);
      expect(result.voiceflowTranscriptId).toBe("vf-abc123");
      expect(supabaseClientMock.from).toHaveBeenCalledWith("calls");
      expect(supabaseClientMock.update).toHaveBeenCalled();
    });

    it("should throw InternalServerErrorException when update fails", async () => {
      supabaseClientMock.single.mockResolvedValue({
        data: null,
        error: { message: "Call not found" },
      });

      await expect(
        service.updateCall("nonexistent", { status: "completed" }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe("redactCalls", () => {
    it("should redact sensitive fields for all calls in a campaign", async () => {
      supabaseClientMock.update.mockReturnThis();
      supabaseClientMock.eq.mockResolvedValue({
        data: null,
        error: null,
        count: 5,
      });

      const result = await service.redactCalls("campaign-1");

      expect(result).toBe(5);
      expect(supabaseClientMock.from).toHaveBeenCalledWith("calls");
      expect(supabaseClientMock.update).toHaveBeenCalledWith(
        {
          customer_name: "[redacted]",
          phone_encrypted: "[redacted]",
          phone_hash: "[redacted]",
        },
        { count: "exact" },
      );
      expect(supabaseClientMock.eq).toHaveBeenCalledWith(
        "campaign_id",
        "campaign-1",
      );
    });

    it("should return 0 when no calls exist for the campaign", async () => {
      supabaseClientMock.update.mockReturnThis();
      supabaseClientMock.eq.mockResolvedValue({
        data: null,
        error: null,
        count: 0,
      });

      const result = await service.redactCalls("campaign-empty");

      expect(result).toBe(0);
    });

    it("should throw InternalServerErrorException when redact fails", async () => {
      supabaseClientMock.update.mockReturnThis();
      supabaseClientMock.eq.mockResolvedValue({
        data: null,
        error: { message: "DB error" },
        count: null,
      });

      await expect(service.redactCalls("campaign-1")).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
