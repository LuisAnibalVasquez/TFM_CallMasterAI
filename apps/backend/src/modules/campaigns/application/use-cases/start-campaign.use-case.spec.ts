import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { StartCampaignUseCase } from "./start-campaign.use-case";
import { Campaign } from "../../domain/entities/campaign.entity";
import { CampaignStatus } from "@callmaster/shared";

describe("StartCampaignUseCase", () => {
  let useCase: StartCampaignUseCase;
  let mockRepository: {
    findById: jest.Mock;
    update: jest.Mock;
  };
  let mockInngest: {
    send: jest.Mock;
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
      update: jest.fn(),
    };
    mockInngest = {
      send: jest.fn().mockResolvedValue({ ids: ["evt-1"] }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StartCampaignUseCase,
        {
          provide: "ICampaignRepository",
          useValue: mockRepository,
        },
        {
          provide: "InngestClient",
          useValue: mockInngest,
        },
      ],
    }).compile();

    useCase = module.get<StartCampaignUseCase>(StartCampaignUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should transition a CREATED campaign to IN_PROGRESS status and emit campaign.started event", async () => {
      const campaign = makeCampaign({ status: CampaignStatus.CREATED });
      mockRepository.findById.mockResolvedValue(campaign);

      const startedCampaign = makeCampaign({
        status: CampaignStatus.IN_PROGRESS,
      });
      mockRepository.update.mockResolvedValue(startedCampaign);

      const result = await useCase.execute({
        campaignId: "campaign-1",
        tenantId: "tenant-1",
      });

      expect(mockRepository.findById).toHaveBeenCalledWith("campaign-1");
      expect(mockRepository.update).toHaveBeenCalledWith("campaign-1", {
        status: CampaignStatus.IN_PROGRESS,
      });
      expect(result.status).toBe(CampaignStatus.IN_PROGRESS);
      expect(result.id).toBe("campaign-1");

      // Verify Inngest event is emitted AFTER status update
      expect(mockInngest.send).toHaveBeenCalledWith({
        name: "campaign.started",
        data: {
          campaignId: "campaign-1",
          tenantId: "tenant-1",
        },
      });
    });

    it("should throw NotFoundException if campaign does not exist", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute({ campaignId: "nonexistent", tenantId: "tenant-1" }),
      ).rejects.toThrow(NotFoundException);

      expect(mockInngest.send).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException if campaign belongs to a different tenant", async () => {
      const campaign = makeCampaign({
        tenantId: "other-tenant",
        status: CampaignStatus.CREATED,
      });
      mockRepository.findById.mockResolvedValue(campaign);

      await expect(
        useCase.execute({ campaignId: "campaign-1", tenantId: "tenant-1" }),
      ).rejects.toThrow(NotFoundException);

      expect(mockInngest.send).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException if campaign is already IN_PROGRESS", async () => {
      const campaign = makeCampaign({ status: CampaignStatus.IN_PROGRESS });
      mockRepository.findById.mockResolvedValue(campaign);

      await expect(
        useCase.execute({ campaignId: "campaign-1", tenantId: "tenant-1" }),
      ).rejects.toThrow(BadRequestException);

      expect(mockInngest.send).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException if campaign is already COMPLETED", async () => {
      const campaign = makeCampaign({ status: CampaignStatus.COMPLETED });
      mockRepository.findById.mockResolvedValue(campaign);

      await expect(
        useCase.execute({ campaignId: "campaign-1", tenantId: "tenant-1" }),
      ).rejects.toThrow(BadRequestException);

      expect(mockInngest.send).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException if campaign is already CANCELLED", async () => {
      const campaign = makeCampaign({ status: CampaignStatus.CANCELLED });
      mockRepository.findById.mockResolvedValue(campaign);

      await expect(
        useCase.execute({ campaignId: "campaign-1", tenantId: "tenant-1" }),
      ).rejects.toThrow(BadRequestException);

      expect(mockInngest.send).not.toHaveBeenCalled();
    });
  });
});
