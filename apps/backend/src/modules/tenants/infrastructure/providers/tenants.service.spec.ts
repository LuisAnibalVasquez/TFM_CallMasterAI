import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { TenantsService } from "./tenants.service";
import { CreateTenantUseCase } from "../../application/use-cases/create-tenant.use-case";
import { DeleteTenantUseCase } from "../../application/use-cases/delete-tenant.use-case";
import { UpdateTenantUseCase } from "../../application/use-cases/update-tenant.use-case";
import { ListTenantsUseCase } from "../../application/use-cases/list-tenants.use-case";
import { InternalServerErrorException } from "@nestjs/common";
import * as supabaseJs from "@supabase/supabase-js";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

describe("TenantsService", () => {
  let service: TenantsService;
  let configService: jest.Mocked<ConfigService>;
  let supabaseAdminMock: any;
  let createUseCase: jest.Mocked<CreateTenantUseCase>;
  let deleteUseCase: jest.Mocked<DeleteTenantUseCase>;
  let updateUseCase: jest.Mocked<UpdateTenantUseCase>;
  let listUseCase: jest.Mocked<ListTenantsUseCase>;

  beforeEach(async () => {
    configService = {
      get: jest.fn((key: string) => {
        if (key === "SUPABASE_URL") return "https://mock-url.supabase.co";
        if (key === "SERVICE_ROLE_KEY") return "mock-service-key";
        if (key === "ENCRYPTION_MASTER_KEY") return "mock-master-key";
        return null;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    supabaseAdminMock = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      rpc: jest.fn(),
      auth: {
        admin: {
          createUser: jest.fn(),
        },
      },
    };

    (supabaseJs.createClient as jest.Mock).mockReturnValue(supabaseAdminMock);

    createUseCase = { execute: jest.fn() } as any;
    deleteUseCase = { execute: jest.fn() } as any;
    updateUseCase = { execute: jest.fn() } as any;
    listUseCase = { execute: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        { provide: ConfigService, useValue: configService },
        { provide: CreateTenantUseCase, useValue: createUseCase },
        { provide: DeleteTenantUseCase, useValue: deleteUseCase },
        { provide: UpdateTenantUseCase, useValue: updateUseCase },
        { provide: ListTenantsUseCase, useValue: listUseCase },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createTenant (delegates to CreateTenantUseCase)", () => {
    it("should delegate to CreateTenantUseCase.execute", async () => {
      const dto = {
        name: "Acme",
        contactEmail: "test@acme.com",
        sandboxConfig: {
          apiUrl: "https://sandbox.api.com",
          apiKey: "sk-sandbox",
        },
        productionConfig: { apiUrl: "https://api.com", apiKey: "sk-prod" },
      } as any;

      const expected = {
        tenant: {
          id: "tenant-1",
          name: "Acme",
          phone: "",
          contactEmail: "test@acme.com",
          status: "active",
          sandboxConfig: {
            apiUrl: "https://sandbox.api.com",
            encryptedKey: "enc",
          },
          productionConfig: { apiUrl: "https://api.com", encryptedKey: "enc" },
        },
        adminCredentials: {
          email: "test@acme.com",
          temporaryPassword: "abc123",
        },
      };
      createUseCase.execute.mockResolvedValue(expected as any);

      const result = await service.createTenant(dto);
      expect(createUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected as any);
    });
  });

  describe("getAllTenants (delegates to ListTenantsUseCase)", () => {
    it("should delegate to ListTenantsUseCase.execute with pagination", async () => {
      const expected = { data: [], total: 0, page: 1, limit: 20 };
      listUseCase.execute.mockResolvedValue(expected);

      const result = await service.getAllTenants(1, 20);
      expect(listUseCase.execute).toHaveBeenCalledWith(1, 20);
      expect(result).toEqual(expected);
    });
  });

  describe("updateTenant (delegates to UpdateTenantUseCase)", () => {
    it("should delegate to UpdateTenantUseCase.execute", async () => {
      const dto = { name: "Updated" };
      const expected = { id: "tenant-1", name: "Updated" };
      updateUseCase.execute.mockResolvedValue(expected as any);

      const result = await service.updateTenant("tenant-1", dto);
      expect(updateUseCase.execute).toHaveBeenCalledWith("tenant-1", dto);
      expect(result).toEqual(expected);
    });
  });

  describe("deleteTenant (delegates to DeleteTenantUseCase)", () => {
    it("should delegate to DeleteTenantUseCase.execute", async () => {
      deleteUseCase.execute.mockResolvedValue(undefined);

      const result = await service.deleteTenant("tenant-1");
      expect(deleteUseCase.execute).toHaveBeenCalledWith("tenant-1");
      expect(result).toBeUndefined();
    });
  });

  // ─── ITenantRepository methods (direct Supabase calls) ───────────────

  describe("countCampaigns", () => {
    it("should return the campaign count for a tenant", async () => {
      supabaseAdminMock.select.mockReturnThis();
      supabaseAdminMock.eq.mockResolvedValue({ count: 3, error: null });

      const result = await service.countCampaigns("tenant-1");
      expect(result).toBe(3);
      expect(supabaseAdminMock.from).toHaveBeenCalledWith("campaigns");
      expect(supabaseAdminMock.select).toHaveBeenCalledWith("*", {
        count: "exact",
        head: true,
      });
    });

    it("should throw if supabase fails", async () => {
      supabaseAdminMock.select.mockReturnThis();
      supabaseAdminMock.eq.mockResolvedValue({
        count: null,
        error: { message: "DB error" },
      });

      await expect(service.countCampaigns("tenant-1")).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe("findAll", () => {
    it("should return paginated tenants", async () => {
      supabaseAdminMock.range.mockResolvedValue({
        data: [
          {
            id: "1",
            name: "Tenant 1",
            contact_email: "a@b.com",
            status: "active",
            sandbox_config: {},
            production_config: {},
          },
        ],
        count: 1,
        error: null,
      });

      const result = await service.findAll({ page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe("update (repository method)", () => {
    it("should update tenant fields", async () => {
      supabaseAdminMock.single.mockResolvedValue({
        data: {
          id: "t1",
          name: "Updated",
          contact_email: "a@b.com",
          status: "active",
          sandbox_config: {},
          production_config: {},
        },
        error: null,
      });

      const result = await service.update("t1", { name: "Updated" });
      expect(result).toBeDefined();
    });
  });
});
