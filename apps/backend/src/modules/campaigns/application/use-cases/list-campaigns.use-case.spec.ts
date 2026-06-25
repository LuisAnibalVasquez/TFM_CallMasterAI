import { Test, TestingModule } from "@nestjs/testing";
import { ListCampaignsUseCase } from "./list-campaigns.use-case";
import { ICampaignRepository } from "../../domain/ports/campaign-repository.port";
import { Campaign } from "../../domain/entities/campaign.entity";

describe("ListCampaignsUseCase", () => {
  let useCase: ListCampaignsUseCase;
  let campaignRepository: jest.Mocked<ICampaignRepository>;

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
        ListCampaignsUseCase,
        {
          provide: "ICampaignRepository",
          useValue: campaignRepository,
        },
      ],
    }).compile();

    useCase = module.get<ListCampaignsUseCase>(ListCampaignsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return paginated campaigns for a tenant", async () => {
    const mockCampaigns = [
      new Campaign({
        id: "c1",
        tenantId: "tenant-1",
        name: "Q1 Outreach",
        status: "Created" as any,
        environment: "Sandbox" as any,
        csvUrl: "",
        totalCalls: 100,
        successfulCalls: 0,
        failedCalls: 0,
        totalCost: 0,
        createdAt: new Date("2026-01-01"),
      }),
      new Campaign({
        id: "c2",
        tenantId: "tenant-1",
        name: "Q2 Follow-up",
        status: "In-Progress" as any,
        environment: "Production" as any,
        csvUrl: "",
        totalCalls: 200,
        successfulCalls: 0,
        failedCalls: 0,
        totalCost: 0,
        createdAt: new Date("2026-03-01"),
      }),
    ];

    campaignRepository.findByTenant.mockResolvedValue({
      data: mockCampaigns,
      total: 5,
    });

    const result = await useCase.execute("tenant-1", { page: 1, limit: 10 });

    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(5);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(campaignRepository.findByTenant).toHaveBeenCalledWith("tenant-1", {
      page: 1,
      limit: 10,
    });
  });

  it("should return empty list when tenant has no campaigns", async () => {
    campaignRepository.findByTenant.mockResolvedValue({
      data: [],
      total: 0,
    });

    const result = await useCase.execute("tenant-empty", {
      page: 1,
      limit: 20,
    });

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it("should use default pagination when not specified", async () => {
    campaignRepository.findByTenant.mockResolvedValue({
      data: [],
      total: 0,
    });

    await useCase.execute("tenant-1");

    expect(campaignRepository.findByTenant).toHaveBeenCalledWith("tenant-1", {
      page: 1,
      limit: 20,
    });
  });
});
