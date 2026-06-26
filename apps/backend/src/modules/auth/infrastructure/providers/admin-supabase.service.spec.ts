/**
 * Task: AdminSupabaseService Integration Test
 *
 * Validates that AdminSupabaseService constructs a Supabase client using
 * the SERVICE_ROLE_KEY (not a user JWT), bypassing Row-Level Security.
 * This is distinct from TenantSupabaseService, which is request-scoped
 * and propagates the user's JWT.
 */
import { ConfigService } from "@nestjs/config";
import { AdminSupabaseService } from "./admin-supabase.service";

describe("AdminSupabaseService (service-role client)", () => {
  it("should be a singleton (default scope)", () => {
    // NestJS @Injectable() without scope: Scope.REQUEST is singleton
    const metadata = Reflect.getMetadata("scope", AdminSupabaseService);
    // undefined scope means singleton (default)
    expect(metadata).toBeUndefined();
  });

  it("should construct a client using SUPABASE_URL and SERVICE_ROLE_KEY from config", () => {
    const configService = {
      get: jest.fn((key: string) => {
        if (key === "SUPABASE_URL") return "https://test.supabase.co";
        if (key === "SERVICE_ROLE_KEY") return "test-service-role-key";
        return undefined;
      }),
    } as unknown as ConfigService;

    const service = new AdminSupabaseService(configService);

    expect(configService.get).toHaveBeenCalledWith("SUPABASE_URL");
    expect(configService.get).toHaveBeenCalledWith("SERVICE_ROLE_KEY");

    // getClient() should return a non-null client
    const client = service.getClient();
    expect(client).toBeDefined();
    expect(typeof client.from).toBe("function");
    expect(typeof client.rpc).toBe("function");
  });

  it("should return the same client instance on every getClient() call", () => {
    const configService = {
      get: jest.fn((key: string) => {
        if (key === "SUPABASE_URL") return "https://test.supabase.co";
        if (key === "SERVICE_ROLE_KEY") return "test-key";
        return undefined;
      }),
    } as unknown as ConfigService;

    const service = new AdminSupabaseService(configService);

    const client1 = service.getClient();
    const client2 = service.getClient();

    expect(client1).toBe(client2);
  });

  it("should NOT depend on request context (no REQUEST injection)", () => {
    // Verify the constructor parameters don't include REQUEST
    const paramTypes = Reflect.getMetadata(
      "design:paramtypes",
      AdminSupabaseService,
    );

    // Only ConfigService should be injected
    expect(paramTypes).toHaveLength(1);
    expect(paramTypes[0]).toBe(ConfigService);
  });

  it("should throw when SERVICE_ROLE_KEY is missing (empty key rejected by Supabase)", () => {
    const configService = {
      get: jest.fn((key: string) => {
        if (key === "SUPABASE_URL") return "https://test.supabase.co";
        return undefined; // SERVICE_ROLE_KEY missing — results in ""
      }),
    } as unknown as ConfigService;

    // createClient rejects empty supabaseKey
    expect(() => new AdminSupabaseService(configService)).toThrow();
  });
});
