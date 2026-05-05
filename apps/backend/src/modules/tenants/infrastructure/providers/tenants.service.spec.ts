import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { TenantsService } from "./tenants.service";
import { InternalServerErrorException } from "@nestjs/common";
import * as supabaseJs from "@supabase/supabase-js";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

describe("TenantsService", () => {
  let service: TenantsService;
  let configService: jest.Mocked<ConfigService>;
  let supabaseAdminMock: any;

  beforeEach(async () => {
    configService = {
      get: jest.fn((key: string) => {
        if (key === "SUPABASE_URL") return "https://mock-url.supabase.co";
        if (key === "SERVICE_ROLE_KEY") return "mock-service-key";
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
      auth: {
        admin: {
          createUser: jest.fn(),
        },
      },
    };

    (supabaseJs.createClient as jest.Mock).mockReturnValue(supabaseAdminMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllTenants", () => {
    it("should return a list of tenants", async () => {
      const mockData = [{ id: "1", name: "Tenant 1" }];
      supabaseAdminMock.order.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await service.getAllTenants();

      expect(supabaseAdminMock.from).toHaveBeenCalledWith("tenants");
      expect(supabaseAdminMock.select).toHaveBeenCalledWith("*");
      expect(supabaseAdminMock.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result).toEqual(mockData);
    });

    it("should throw an error if supabase fails", async () => {
      supabaseAdminMock.order.mockResolvedValue({
        data: null,
        error: { message: "DB Error" },
      });

      await expect(service.getAllTenants()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe("createTenant", () => {
    const dto = { name: "Acme", contactEmail: "test@acme.com", phone: "123" };

    it("should successfully create a tenant and admin user", async () => {
      // 1. Mock insert tenant
      supabaseAdminMock.single.mockResolvedValue({
        data: { id: "tenant-1", name: "Acme" },
        error: null,
      });
      // 2. Mock create user
      supabaseAdminMock.auth.admin.createUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });
      // 3. Mock update profile
      supabaseAdminMock.eq.mockResolvedValue({ error: null }); // update().eq()

      const result = await service.createTenant(dto);

      expect(supabaseAdminMock.from).toHaveBeenCalledWith("tenants");
      expect(supabaseAdminMock.insert).toHaveBeenCalledWith({
        name: dto.name,
        contact_email: dto.contactEmail,
        phone: dto.phone,
      });
      expect(supabaseAdminMock.auth.admin.createUser).toHaveBeenCalled();
      expect(result.tenant.id).toEqual("tenant-1");
      expect(result.adminCredentials.email).toEqual(dto.contactEmail);
      expect(result.adminCredentials.temporaryPassword).toBeDefined();
    });

    it("should rollback tenant if user creation fails", async () => {
      // 1. Mock insert tenant success
      supabaseAdminMock.single.mockResolvedValue({
        data: { id: "tenant-1" },
        error: null,
      });
      // 2. Mock create user failure
      supabaseAdminMock.auth.admin.createUser.mockResolvedValue({
        data: null,
        error: { message: "Auth error" },
      });
      // Setup mock for rollback delete
      supabaseAdminMock.delete.mockReturnThis();
      supabaseAdminMock.eq.mockResolvedValue({ error: null });

      await expect(service.createTenant(dto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(supabaseAdminMock.from).toHaveBeenCalledWith("tenants");
      expect(supabaseAdminMock.delete).toHaveBeenCalled();
    });
  });
});
