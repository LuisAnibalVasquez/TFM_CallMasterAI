import { Test, TestingModule } from "@nestjs/testing";
import { CampaignsController } from "./campaigns.controller";
import { CreateCampaignUseCase } from "../../application/use-cases/create-campaign.use-case";
import { ListCampaignsUseCase } from "../../application/use-cases/list-campaigns.use-case";
import { StartCampaignUseCase } from "../../application/use-cases/start-campaign.use-case";
import { CancelCampaignUseCase } from "../../application/use-cases/cancel-campaign.use-case";
import { DeleteCampaignUseCase } from "../../application/use-cases/delete-campaign.use-case";
import { Campaign } from "../../domain/entities/campaign.entity";
import {
  CanActivate,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { AuthGuard } from "../../../auth/infrastructure/guards/auth.guard";
import { RolesGuard } from "../../../auth/infrastructure/guards/roles.guard";
import { CampaignStatus } from "@callmaster/shared";

describe("CampaignsController", () => {
  let controller: CampaignsController;
  let createCampaignUseCase: jest.Mocked<CreateCampaignUseCase>;
  let listCampaignsUseCase: jest.Mocked<ListCampaignsUseCase>;
  let startCampaignUseCase: jest.Mocked<StartCampaignUseCase>;
  let cancelCampaignUseCase: jest.Mocked<CancelCampaignUseCase>;
  let deleteCampaignUseCase: jest.Mocked<DeleteCampaignUseCase>;
  let mockRepo: { getTemplateDownloadUrl: jest.Mock };

  const mockGuard: CanActivate = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    createCampaignUseCase = {
      execute: jest.fn(),
    } as any;
    listCampaignsUseCase = {
      execute: jest.fn(),
    } as any;
    startCampaignUseCase = {
      execute: jest.fn(),
    } as any;
    cancelCampaignUseCase = {
      execute: jest.fn(),
    } as any;
    deleteCampaignUseCase = {
      execute: jest.fn(),
    } as any;
    mockRepo = {
      getTemplateDownloadUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignsController],
      providers: [
        {
          provide: CreateCampaignUseCase,
          useValue: createCampaignUseCase,
        },
        {
          provide: ListCampaignsUseCase,
          useValue: listCampaignsUseCase,
        },
        {
          provide: StartCampaignUseCase,
          useValue: startCampaignUseCase,
        },
        {
          provide: CancelCampaignUseCase,
          useValue: cancelCampaignUseCase,
        },
        {
          provide: DeleteCampaignUseCase,
          useValue: deleteCampaignUseCase,
        },
        {
          provide: "ICampaignRepository",
          useValue: mockRepo,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<CampaignsController>(CampaignsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /campaigns", () => {
    const mockRequest = {
      user: {
        tenantId: "tenant-1",
        role: "TenantAdmin",
      },
    };

    const validDto = {
      name: "Q1 Outreach",
      environment: "Sandbox",
      csvContent:
        "Customer Name,Phone Number,Age,Preferred Language\nJohn Doe,+14155552671,30,English",
    };

    it("should delegate to CreateCampaignUseCase with tenantId from request", async () => {
      const expectedResult = {
        campaign: new Campaign({
          id: "c1",
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
        }),
        insertedCalls: 1,
      };
      createCampaignUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.create(mockRequest as any, validDto);

      expect(createCampaignUseCase.execute).toHaveBeenCalledWith({
        tenantId: "tenant-1",
        name: "Q1 Outreach",
        environment: "Sandbox",
        csvContent: validDto.csvContent,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe("GET /campaigns", () => {
    const mockRequest = {
      user: {
        tenantId: "tenant-1",
        role: "TenantAdmin",
      },
    };

    it("should delegate to ListCampaignsUseCase with tenantId", async () => {
      const expectedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
      };
      listCampaignsUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.findAll(mockRequest as any, 1, 20);

      expect(listCampaignsUseCase.execute).toHaveBeenCalledWith("tenant-1", {
        page: 1,
        limit: 20,
      });
      expect(result).toEqual(expectedResult);
    });

    it("should use default pagination when not provided", async () => {
      listCampaignsUseCase.execute.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
      });

      await controller.findAll(mockRequest as any);

      expect(listCampaignsUseCase.execute).toHaveBeenCalledWith("tenant-1", {
        page: 1,
        limit: 20,
      });
    });
  });

  describe("POST /campaigns/:id/start", () => {
    const mockRequest = {
      user: { tenantId: "tenant-1", role: "TenantAdmin" },
    };

    it("should delegate to StartCampaignUseCase", async () => {
      const started = new Campaign({
        id: "c1",
        tenantId: "tenant-1",
        name: "Test",
        status: CampaignStatus.IN_PROGRESS,
        environment: "Sandbox" as any,
        csvUrl: "",
        totalCalls: 10,
        successfulCalls: 0,
        failedCalls: 0,
        totalCost: 0,
        createdAt: new Date(),
      });
      startCampaignUseCase.execute.mockResolvedValue(started);

      const result = await controller.start(mockRequest as any, "c1");

      expect(startCampaignUseCase.execute).toHaveBeenCalledWith({
        campaignId: "c1",
        tenantId: "tenant-1",
      });
      expect(result.status).toBe(CampaignStatus.IN_PROGRESS);
    });
  });

  describe("POST /campaigns/:id/cancel", () => {
    const mockRequest = {
      user: { tenantId: "tenant-1", role: "TenantAdmin" },
    };

    it("should delegate to CancelCampaignUseCase", async () => {
      const cancelled = new Campaign({
        id: "c1",
        tenantId: "tenant-1",
        name: "Test",
        status: CampaignStatus.CANCELLED,
        environment: "Sandbox" as any,
        csvUrl: "",
        totalCalls: 10,
        successfulCalls: 5,
        failedCalls: 3,
        totalCost: 7.5,
        createdAt: new Date(),
      });
      cancelCampaignUseCase.execute.mockResolvedValue(cancelled);

      const result = await controller.cancel(mockRequest as any, "c1");

      expect(cancelCampaignUseCase.execute).toHaveBeenCalledWith({
        campaignId: "c1",
        tenantId: "tenant-1",
      });
      expect(result.status).toBe(CampaignStatus.CANCELLED);
    });
  });

  describe("DELETE /campaigns/:id", () => {
    const mockRequest = {
      user: { tenantId: "tenant-1", role: "TenantAdmin" },
    };

    it("should delegate to DeleteCampaignUseCase", async () => {
      deleteCampaignUseCase.execute.mockResolvedValue(undefined);

      await controller.delete(mockRequest as any, "c1");

      expect(deleteCampaignUseCase.execute).toHaveBeenCalledWith({
        campaignId: "c1",
        tenantId: "tenant-1",
      });
    });

    it("should propagate BadRequestException from use case (completed/cancelled restriction)", async () => {
      deleteCampaignUseCase.execute.mockRejectedValue(
        new BadRequestException(
          "Cannot delete a completed or cancelled campaign",
        ),
      );

      await expect(controller.delete(mockRequest as any, "c1")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should propagate NotFoundException from use case", async () => {
      deleteCampaignUseCase.execute.mockRejectedValue(
        new NotFoundException("Campaign not found"),
      );

      await expect(
        controller.delete(mockRequest as any, "nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("GET /campaigns/template", () => {
    it("should return a presigned URL for the template bucket", async () => {
      mockRepo.getTemplateDownloadUrl.mockResolvedValue(
        "https://storage.supabase.co/template/template.csv?token=abc",
      );

      const result = await controller.downloadTemplate();

      expect(mockRepo.getTemplateDownloadUrl).toHaveBeenCalled();
      expect(result).toEqual({
        url: "https://storage.supabase.co/template/template.csv?token=abc",
      });
    });
  });
});
