import { Test, TestingModule } from "@nestjs/testing";
import { TenantsController } from "./tenants.controller";
import { TenantsService } from "../infrastructure/providers/tenants.service";
import { CreateTenantDto } from "./dto/create-tenant.dto";

describe("TenantsController", () => {
  let controller: TenantsController;
  let tenantsService: jest.Mocked<TenantsService>;

  beforeEach(async () => {
    const mockTenantsService = {
      createTenant: jest.fn(),
      getAllTenants: jest.fn(),
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
    it("should call tenantsService.getAllTenants and return list", async () => {
      const expectedList = [{ id: "1", name: "Tenant 1" }];
      tenantsService.getAllTenants.mockResolvedValue(expectedList as any);

      const result = await controller.getAllTenants();

      expect(tenantsService.getAllTenants).toHaveBeenCalled();
      expect(result).toEqual(expectedList);
    });
  });
});
