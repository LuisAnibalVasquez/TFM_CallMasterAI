import { Test, TestingModule } from "@nestjs/testing";
import { CampaignsController } from "./campaigns.controller";
import { CreateCampaignUseCase } from "../../application/use-cases/create-campaign.use-case";
import { ListCampaignsUseCase } from "../../application/use-cases/list-campaigns.use-case";
import { Campaign } from "../../domain/entities/campaign.entity";
import { CanActivate } from "@nestjs/common";
import { AuthGuard } from "../../../auth/infrastructure/guards/auth.guard";
import { RolesGuard } from "../../../auth/infrastructure/guards/roles.guard";

describe("CampaignsController", () => {
  let controller: CampaignsController;
  let createCampaignUseCase: jest.Mocked<CreateCampaignUseCase>;
  let listCampaignsUseCase: jest.Mocked<ListCampaignsUseCase>;

  const mockGuard: CanActivate = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    createCampaignUseCase = {
      execute: jest.fn(),
    } as any;
    listCampaignsUseCase = {
      execute: jest.fn(),
    } as any;

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
});
