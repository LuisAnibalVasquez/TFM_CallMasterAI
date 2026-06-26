import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { DeleteCampaignUseCase } from "./delete-campaign.use-case";
import { Campaign } from "../../domain/entities/campaign.entity";
import { CampaignStatus } from "@callmaster/shared";

describe("DeleteCampaignUseCase", () => {
  let useCase: DeleteCampaignUseCase;
  let mockRepository: {
    findById: jest.Mock;
    delete: jest.Mock;
  };

  const makeCampaign = (overrides: Partial<any> = {}) =>
    new Campaign({
      id: "campaign-1",
      tenantId: "tenant-1",
      name: "Test Campaign",
      status: CampaignStatus.CREATED,
      environment: "Sandbox" as any,
      csvUrl: "",
      totalCalls: 10,
      successfulCalls: 0,
      failedCalls: 0,
      totalCost: 0,
      createdAt: new Date(),
      ...overrides,
    });

  beforeEach(async () => {
    mockRepository = {
      findById: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCampaignUseCase,
        {
          provide: "ICampaignRepository",
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteCampaignUseCase>(DeleteCampaignUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should delete a CREATED campaign", async () => {
      const campaign = makeCampaign({ status: CampaignStatus.CREATED });
      mockRepository.findById.mockResolvedValue(campaign);

      await useCase.execute({
        campaignId: "campaign-1",
        tenantId: "tenant-1",
      });

      expect(mockRepository.findById).toHaveBeenCalledWith("campaign-1");
      expect(mockRepository.delete).toHaveBeenCalledWith("campaign-1");
    });

    it("should delete an IN_PROGRESS campaign", async () => {
      const campaign = makeCampaign({ status: CampaignStatus.IN_PROGRESS });
      mockRepository.findById.mockResolvedValue(campaign);

      await useCase.execute({
        campaignId: "campaign-1",
        tenantId: "tenant-1",
      });

      expect(mockRepository.delete).toHaveBeenCalledWith("campaign-1");
    });

    it("should reject deletion of a COMPLETED campaign", async () => {
      const campaign = makeCampaign({ status: CampaignStatus.COMPLETED });
      mockRepository.findById.mockResolvedValue(campaign);

      await expect(
        useCase.execute({ campaignId: "campaign-1", tenantId: "tenant-1" }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        useCase.execute({ campaignId: "campaign-1", tenantId: "tenant-1" }),
      ).rejects.toThrow("Cannot delete a completed or cancelled campaign");

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it("should reject deletion of a CANCELLED campaign", async () => {
      const campaign = makeCampaign({ status: CampaignStatus.CANCELLED });
      mockRepository.findById.mockResolvedValue(campaign);

      await expect(
        useCase.execute({ campaignId: "campaign-1", tenantId: "tenant-1" }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        useCase.execute({ campaignId: "campaign-1", tenantId: "tenant-1" }),
      ).rejects.toThrow("Cannot delete a completed or cancelled campaign");

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException if campaign does not exist", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute({ campaignId: "nonexistent", tenantId: "tenant-1" }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException if campaign belongs to different tenant", async () => {
      const campaign = makeCampaign({
        tenantId: "other-tenant",
        status: CampaignStatus.CREATED,
      });
      mockRepository.findById.mockResolvedValue(campaign);

      await expect(
        useCase.execute({ campaignId: "campaign-1", tenantId: "tenant-1" }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
