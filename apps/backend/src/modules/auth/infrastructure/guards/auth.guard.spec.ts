import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "./auth.guard";
import { SupabaseAuthService } from "../providers/supabase-auth.service";

describe("AuthGuard", () => {
  let authGuard: AuthGuard;
  let supabaseAuthService: jest.Mocked<SupabaseAuthService>;

  beforeEach(() => {
    supabaseAuthService = {
      validateToken: jest.fn(),
      getUserProfile: jest.fn(),
    } as unknown as jest.Mocked<SupabaseAuthService>;

    authGuard = new AuthGuard(supabaseAuthService);
  });

  const mockExecutionContext = (authHeader?: string) => {
    const req = {
      headers: {
        authorization: authHeader,
      },
    };
    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as ExecutionContext;
  };

  it("should throw UnauthorizedException if no authorization header is provided", async () => {
    const context = mockExecutionContext();

    await expect(authGuard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException(
        "Missing authentication token in cookies or Authorization header",
      ),
    );
  });

  it("should throw UnauthorizedException if authorization header does not start with Bearer", async () => {
    const context = mockExecutionContext("Basic somedata");

    await expect(authGuard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException(
        "Missing authentication token in cookies or Authorization header",
      ),
    );
  });

  it("should throw UnauthorizedException if token validation fails", async () => {
    const context = mockExecutionContext("Bearer invalid-token");
    supabaseAuthService.validateToken.mockRejectedValue(
      new Error("Invalid token"),
    );

    await expect(authGuard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException("Authentication failed"),
    );
  });

  it("should throw UnauthorizedException if user profile fails to load", async () => {
    const context = mockExecutionContext("Bearer valid-token");
    supabaseAuthService.validateToken.mockResolvedValue({
      id: "user-1",
      email: "test@test.com",
    } as any);
    supabaseAuthService.getUserProfile.mockRejectedValue(
      new Error("Profile not found"),
    );

    await expect(authGuard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException("Authentication failed"),
    );
  });

  it("should return true and set request.user if token and profile are valid", async () => {
    const context = mockExecutionContext("Bearer valid-token");
    const request = context.switchToHttp().getRequest();

    supabaseAuthService.validateToken.mockResolvedValue({
      id: "user-1",
      email: "test@test.com",
    } as any);
    supabaseAuthService.getUserProfile.mockResolvedValue({
      role: "TenantAdmin",
      tenant_id: "tenant-1",
    } as any);

    const result = await authGuard.canActivate(context);

    expect(result).toBe(true);
    expect((request as any).user).toEqual({
      id: "user-1",
      email: "test@test.com",
      role: "TenantAdmin",
      tenantId: "tenant-1",
    });
  });
});
