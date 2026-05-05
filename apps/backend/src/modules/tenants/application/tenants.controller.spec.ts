import { Test, TestingModule } from "@nestjs/testing";
import { TenantsController } from "./tenants.controller";
import { TenantsService } from "../infrastructure/providers/tenants.service";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { UpdateTenantDto } from "./dto/update-tenant.dto";
import { SupabaseAuthService } from "../../auth/infrastructure/providers/supabase-auth.service";
import { TenantStatus } from "@callmaster/shared";

describe("TenantsController", () => {
  let controller: TenantsController;
  let tenantsService: jest.Mocked<TenantsService>;

  beforeEach(async () => {
    const mockTenantsService = {
      createTenant: jest.fn(),
      getAllTenants: jest.fn(),
      updateTenant: jest.fn(),
      deleteTenant: jest.fn(),
    };

    const mockAuthService = {
      validateToken: jest.fn(),
      getUserProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantsController],
      providers: [
        {
          provide: TenantsService,
          useValue: mockTenantsService,
        },
        {
          provide: SupabaseAuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<TenantsController>(TenantsController);
    tenantsService = module.get(TenantsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("createTenant", () => {
    it("should call tenantsService.createTenant with the provided DTO", async () => {
      const dto: CreateTenantDto = {
        name: "Test Tenant",
        contactEmail: "tenant@test.com",
        sandboxConfig: {
          apiUrl: "https://sandbox.voiceflow.com",
          apiKey: "sk-sandbox",
        },
        productionConfig: {
          apiUrl: "https://api.voiceflow.com",
          apiKey: "sk-prod",
        },
      };

      const expectedResult = {
        tenant: { id: "1", name: "Test Tenant" },
        adminCredentials: {
          email: "tenant@test.com",
          temporaryPassword: "password123",
        },
      };

      tenantsService.createTenant.mockResolvedValue(expectedResult as any);

      const result = await controller.createTenant(dto);

      expect(tenantsService.createTenant).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("getAllTenants", () => {
    it("should call tenantsService.getAllTenants with default pagination", async () => {
      const expectedList = {
        data: [{ id: "1", name: "Tenant 1" }],
        total: 1,
        page: 1,
        limit: 20,
      };
      tenantsService.getAllTenants.mockResolvedValue(expectedList as any);

      const result = await controller.getAllTenants();

      expect(tenantsService.getAllTenants).toHaveBeenCalledWith(1, 20);
      expect(result).toEqual(expectedList);
    });

    it("should pass page and limit query params", async () => {
      tenantsService.getAllTenants.mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 10,
      } as any);

      await controller.getAllTenants(2, 10);

      expect(tenantsService.getAllTenants).toHaveBeenCalledWith(2, 10);
    });
  });

  describe("updateTenant", () => {
    it("should call tenantsService.updateTenant with id and dto", async () => {
      const dto: UpdateTenantDto = {
        name: "Updated Name",
        status: TenantStatus.SUSPENDED,
      };
      const expected = { id: "tenant-1", name: "Updated Name" };
      tenantsService.updateTenant.mockResolvedValue(expected as any);

      const result = await controller.updateTenant("tenant-1", dto);

      expect(tenantsService.updateTenant).toHaveBeenCalledWith("tenant-1", dto);
      expect(result).toEqual(expected);
    });
  });

  describe("deleteTenant", () => {
    it("should call tenantsService.deleteTenant with the tenant id", async () => {
      tenantsService.deleteTenant.mockResolvedValue(undefined);

      const result = await controller.deleteTenant("tenant-1");

      expect(tenantsService.deleteTenant).toHaveBeenCalledWith("tenant-1");
      expect(result).toBeUndefined();
    });
  });
});
