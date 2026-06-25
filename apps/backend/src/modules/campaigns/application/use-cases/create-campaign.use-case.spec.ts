import { Test, TestingModule } from "@nestjs/testing";
import { CreateCampaignUseCase } from "./create-campaign.use-case";
import { ICampaignRepository } from "../../domain/ports/campaign-repository.port";
import { Campaign } from "../../domain/entities/campaign.entity";

describe("CreateCampaignUseCase", () => {
  let useCase: CreateCampaignUseCase;
  let campaignRepository: jest.Mocked<ICampaignRepository>;

  const validCsvContent = [
    "Customer Name,Phone Number,Age,Preferred Language",
    "John Doe,+14155552671,30,en",
    "Jane Smith,+34666111222,25,es",
  ].join("\n");

  const csvWithInvalidPhone = [
    "Customer Name,Phone Number,Age,Preferred Language",
    "John Doe,+14155552671,30,en",
    "Bad User,555-bad,20,en",
  ].join("\n");

  beforeEach(async () => {
    campaignRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByTenant: jest.fn(),
      update: jest.fn(),
      bulkInsertCalls: jest.fn(),
      findCallsByCampaign: jest.fn(),
      updateCall: jest.fn(),
      redactCalls: jest.fn(),
      delete: jest.fn(),
      getTemplateDownloadUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCampaignUseCase,
        {
          provide: "ICampaignRepository",
          useValue: campaignRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateCampaignUseCase>(CreateCampaignUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute with valid CSV content", () => {
    it("should parse CSV, create campaign, and bulk insert calls", async () => {
      const savedCampaign = new Campaign({
        id: "campaign-uuid",
        tenantId: "tenant-1",
        name: "Q1 Outreach",
        status: "Created" as any,
        environment: "Sandbox" as any,
        csvUrl: "",
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalCost: 0,
        createdAt: new Date(),
      });

      campaignRepository.create.mockResolvedValue(savedCampaign);
      campaignRepository.bulkInsertCalls.mockResolvedValue([]);

      const result = await useCase.execute({
        tenantId: "tenant-1",
        name: "Q1 Outreach",
        environment: "Sandbox",
        csvContent: validCsvContent,
      });

      expect(result.campaign).toBeDefined();
      expect(result.campaign.name).toBe("Q1 Outreach");
      expect(result.insertedCalls).toBe(2);
      expect(campaignRepository.create).toHaveBeenCalledTimes(1);
      expect(campaignRepository.bulkInsertCalls).toHaveBeenCalledTimes(1);

      // Verify campaign was created with the right status
      const createArg = campaignRepository.create.mock.calls[0][0];
      expect(createArg.status).toBe("Created");
      expect(createArg.tenantId).toBe("tenant-1");
    });

    it("should pass parsed rows to bulkInsertCalls", async () => {
      campaignRepository.create.mockResolvedValue(
        new Campaign({
          id: "c1",
          tenantId: "t1",
          name: "Test",
          status: "Created" as any,
          environment: "Sandbox" as any,
          csvUrl: "",
          totalCalls: 0,
          successfulCalls: 0,
          failedCalls: 0,
          totalCost: 0,
          createdAt: new Date(),
        }),
      );
      campaignRepository.bulkInsertCalls.mockResolvedValue([]);

      await useCase.execute({
        tenantId: "t1",
        name: "Test",
        environment: "Sandbox",
        csvContent: validCsvContent,
      });

      const [campaignId, calls] =
        campaignRepository.bulkInsertCalls.mock.calls[0];
      expect(typeof campaignId).toBe("string");
      expect(campaignId.length).toBeGreaterThan(0);
      expect(calls).toHaveLength(2);
      expect(calls[0].customerName).toBe("John Doe");
      expect(calls[0].phone).toBe("+14155552671");
    });
  });

  describe("execute with invalid CSV", () => {
    it("should throw when CSV contains an invalid phone number", async () => {
      await expect(
        useCase.execute({
          tenantId: "tenant-1",
          name: "Bad Campaign",
          environment: "Sandbox",
          csvContent: csvWithInvalidPhone,
        }),
      ).rejects.toThrow(/invalid phone number format/i);
    });

    it("should NOT create campaign or insert calls when validation fails", async () => {
      try {
        await useCase.execute({
          tenantId: "tenant-1",
          name: "Bad Campaign",
          environment: "Sandbox",
          csvContent: csvWithInvalidPhone,
        });
      } catch {
        // Expected
      }

      expect(campaignRepository.create).not.toHaveBeenCalled();
      expect(campaignRepository.bulkInsertCalls).not.toHaveBeenCalled();
    });
  });
});
