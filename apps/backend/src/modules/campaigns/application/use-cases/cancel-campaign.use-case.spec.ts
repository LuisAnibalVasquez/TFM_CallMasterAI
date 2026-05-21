import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CancelCampaignUseCase } from "./cancel-campaign.use-case";
import { Campaign } from "../../domain/entities/campaign.entity";
import { CampaignStatus } from "@callmaster/shared";

describe("CancelCampaignUseCase", () => {
  let useCase: CancelCampaignUseCase;
  let mockRepository: {
    findById: jest.Mock;
    update: jest.Mock;
  };

  const makeCampaign = (overrides: Partial<any> = {}) =>
    new Campaign({
      id: "campaign-1",
      tenantId: "tenant-1",
      name: "Test Campaign",
      status: CampaignStatus.IN_PROGRESS,
      environment: "Sandbox" as any,
      csvUrl: "",
      totalCalls: 10,
      successfulCalls: 5,
      failedCalls: 3,
      totalCost: 12.5,
      createdAt: new Date(),
      ...overrides,
    });

  beforeEach(async () => {
    mockRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelCampaignUseCase,
        {
          provide: "ICampaignRepository",
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CancelCampaignUseCase>(CancelCampaignUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should transition an IN_PROGRESS campaign to CANCELLED status", async () => {
      const campaign = makeCampaign({ status: CampaignStatus.IN_PROGRESS });
      mockRepository.findById.mockResolvedValue(campaign);

      const cancelledCampaign = makeCampaign({
        status: CampaignStatus.CANCELLED,
      });
      mockRepository.update.mockResolvedValue(cancelledCampaign);

      const result = await useCase.execute({
        campaignId: "campaign-1",
        tenantId: "tenant-1",
      });

      expect(mockRepository.findById).toHaveBeenCalledWith("campaign-1");
      expect(mockRepository.update).toHaveBeenCalledWith("campaign-1", {
        status: CampaignStatus.CANCELLED,
      });
      expect(result.status).toBe(CampaignStatus.CANCELLED);
      expect(result.id).toBe("campaign-1");
    });

    it("should throw NotFoundException if campaign does not exist", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute({ campaignId: "nonexistent", tenantId: "tenant-1" }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException if campaign belongs to a different tenant", async () => {
      const campaign = makeCampaign({
        tenantId: "other-tenant",
        status: CampaignStatus.IN_PROGRESS,
      });
      mockRepository.findById.mockResolvedValue(campaign);

      await expect(
        useCase.execute({ campaignId: "campaign-1", tenantId: "tenant-1" }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if campaign is already COMPLETED", async () => {
      const campaign = makeCampaign({ status: CampaignStatus.COMPLETED });
      mockRepository.findById.mockResolvedValue(campaign);

      await expect(
        useCase.execute({ campaignId: "campaign-1", tenantId: "tenant-1" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if campaign is already CANCELLED", async () => {
      const campaign = makeCampaign({ status: CampaignStatus.CANCELLED });
      mockRepository.findById.mockResolvedValue(campaign);

      await expect(
        useCase.execute({ campaignId: "campaign-1", tenantId: "tenant-1" }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
