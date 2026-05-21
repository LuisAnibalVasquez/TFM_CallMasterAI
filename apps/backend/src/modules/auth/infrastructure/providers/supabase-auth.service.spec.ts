import { ConfigService } from "@nestjs/config";
import { SupabaseAuthService } from "./supabase-auth.service";
import { UnauthorizedException } from "@nestjs/common";
import * as supabaseJs from "@supabase/supabase-js";

// Mock del módulo de supabase-js
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

describe("SupabaseAuthService", () => {
  let service: SupabaseAuthService;
  let configService: jest.Mocked<ConfigService>;
  let supabaseClientMock: any;

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => {
        if (key === "SUPABASE_URL") return "https://mock-url.supabase.co";
        if (key === "SUPABASE_ANON_KEY") return "mock-anon-key";
        return null;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    // Configurar el mock del cliente de Supabase
    supabaseClientMock = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    (supabaseJs.createClient as jest.Mock).mockReturnValue(supabaseClientMock);

    service = new SupabaseAuthService(configService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize the supabase client with variables from ConfigService", () => {
      expect(configService.get).toHaveBeenCalledWith("SUPABASE_URL");
      expect(configService.get).toHaveBeenCalledWith("SUPABASE_ANON_KEY");
      expect(supabaseJs.createClient).toHaveBeenCalledWith(
        "https://mock-url.supabase.co",
        "mock-anon-key",
      );
    });
  });

  describe("validateToken", () => {
    it("should throw UnauthorizedException if supabase auth returns an error", async () => {
      supabaseClientMock.auth.getUser.mockResolvedValue({
        error: { message: "Invalid token" },
        data: { user: null },
      });

      await expect(service.validateToken("bad-token")).rejects.toThrow(
        new UnauthorizedException("Invalid or expired token"),
      );
    });

    it("should throw UnauthorizedException if no user is returned", async () => {
      supabaseClientMock.auth.getUser.mockResolvedValue({
        error: null,
        data: { user: null },
      });

      await expect(service.validateToken("bad-token")).rejects.toThrow(
        new UnauthorizedException("Invalid or expired token"),
      );
    });

    it("should return the user object if the token is valid", async () => {
      const mockUser = { id: "user-1", email: "test@test.com" };
      supabaseClientMock.auth.getUser.mockResolvedValue({
        error: null,
        data: { user: mockUser },
      });

      const result = await service.validateToken("valid-token");
      expect(result).toEqual(mockUser);
    });
  });

  describe("getUserProfile", () => {
    it("should throw UnauthorizedException if profile query returns an error", async () => {
      supabaseClientMock.single.mockResolvedValue({
        error: { message: "Not found" },
        data: null,
      });

      await expect(service.getUserProfile("user-1")).rejects.toThrow(
        new UnauthorizedException("User profile not found"),
      );
    });

    it("should throw UnauthorizedException if no data is returned", async () => {
      supabaseClientMock.single.mockResolvedValue({ error: null, data: null });

      await expect(service.getUserProfile("user-1")).rejects.toThrow(
        new UnauthorizedException("User profile not found"),
      );
    });

    it("should return profile data and map the role string to UserRole enum", async () => {
      const mockData = {
        id: "user-1",
        tenant_id: "tenant-1",
        role: { name: "PlatformOwner" },
      };

      supabaseClientMock.single.mockResolvedValue({
        error: null,
        data: mockData,
      });

      const result = await service.getUserProfile("user-1");

      expect(supabaseClientMock.from).toHaveBeenCalledWith("profiles");
      expect(supabaseClientMock.select).toHaveBeenCalledWith(
        "*, role:roles(name)",
      );
      expect(supabaseClientMock.eq).toHaveBeenCalledWith("id", "user-1");

      expect(result).toEqual({
        id: "user-1",
        tenant_id: "tenant-1",
        role: "PlatformOwner",
      });
    });
  });

  describe("getSupabaseClient", () => {
    it("should return the initialized supabase client", () => {
      const client = service.getSupabaseClient();
      expect(client).toBe(supabaseClientMock);
    });
  });
});
