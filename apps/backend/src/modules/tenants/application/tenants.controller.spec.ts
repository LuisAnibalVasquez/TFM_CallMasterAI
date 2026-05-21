import { Test, TestingModule } from "@nestjs/testing";
import { TenantsController } from "./tenants.controller";
import { CreateTenantUseCase } from "./use-cases/create-tenant.use-case";
import { UpdateTenantUseCase } from "./use-cases/update-tenant.use-case";
import { ListTenantsUseCase } from "./use-cases/list-tenants.use-case";
import { DeleteTenantUseCase } from "./use-cases/delete-tenant.use-case";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { UpdateTenantDto } from "./dto/update-tenant.dto";
import { SupabaseAuthService } from "../../auth/infrastructure/providers/supabase-auth.service";
import { TenantStatus } from "@callmaster/shared";

describe("TenantsController", () => {
  let controller: TenantsController;
  let createTenantUseCase: jest.Mocked<CreateTenantUseCase>;
  let listTenantsUseCase: jest.Mocked<ListTenantsUseCase>;
  let updateTenantUseCase: jest.Mocked<UpdateTenantUseCase>;
  let deleteTenantUseCase: jest.Mocked<DeleteTenantUseCase>;

  beforeEach(async () => {
    const mockCreateUseCase = { execute: jest.fn() };
    const mockListUseCase = { execute: jest.fn() };
    const mockUpdateUseCase = { execute: jest.fn() };
    const mockDeleteUseCase = { execute: jest.fn() };

    const mockAuthService = {
      validateToken: jest.fn(),
      getUserProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantsController],
      providers: [
        { provide: CreateTenantUseCase, useValue: mockCreateUseCase },
        { provide: ListTenantsUseCase, useValue: mockListUseCase },
        { provide: UpdateTenantUseCase, useValue: mockUpdateUseCase },
        { provide: DeleteTenantUseCase, useValue: mockDeleteUseCase },
        { provide: SupabaseAuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<TenantsController>(TenantsController);
    createTenantUseCase = module.get(CreateTenantUseCase);
    listTenantsUseCase = module.get(ListTenantsUseCase);
    updateTenantUseCase = module.get(UpdateTenantUseCase);
    deleteTenantUseCase = module.get(DeleteTenantUseCase);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("createTenant", () => {
    it("should call createTenantUseCase.execute with the provided DTO", async () => {
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

      createTenantUseCase.execute.mockResolvedValue(expectedResult as never);

      const result = await controller.createTenant(dto);

      expect(createTenantUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("getAllTenants", () => {
    it("should call listTenantsUseCase.execute with default pagination", async () => {
      const expectedList = {
        data: [{ id: "1", name: "Tenant 1" }],
        total: 1,
        page: 1,
        limit: 20,
      };
      listTenantsUseCase.execute.mockResolvedValue(expectedList as never);

      const result = await controller.getAllTenants();

      expect(listTenantsUseCase.execute).toHaveBeenCalledWith(1, 20);
      expect(result).toEqual(expectedList);
    });

    it("should pass page and limit query params", async () => {
      listTenantsUseCase.execute.mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 10,
      } as never);

      await controller.getAllTenants(2, 10);

      expect(listTenantsUseCase.execute).toHaveBeenCalledWith(2, 10);
    });
  });

  describe("updateTenant", () => {
    it("should call updateTenantUseCase.execute with id and dto", async () => {
      const dto: UpdateTenantDto = {
        name: "Updated Name",
        status: TenantStatus.SUSPENDED,
      };
      const expected = { id: "tenant-1", name: "Updated Name" };
      updateTenantUseCase.execute.mockResolvedValue(expected as never);

      const result = await controller.updateTenant("tenant-1", dto);

      expect(updateTenantUseCase.execute).toHaveBeenCalledWith("tenant-1", dto);
      expect(result).toEqual(expected);
    });
  });

  describe("deleteTenant", () => {
    it("should call deleteTenantUseCase.execute with the tenant id", async () => {
      deleteTenantUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.deleteTenant("tenant-1");

      expect(deleteTenantUseCase.execute).toHaveBeenCalledWith("tenant-1");
      expect(result).toBeUndefined();
    });
  });
});
