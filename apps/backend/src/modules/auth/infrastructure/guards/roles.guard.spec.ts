// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt2 on Tue May 26 2026
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesGuard } from "./roles.guard";
import { SupabaseAuthService } from "../providers/supabase-auth.service";

describe("RolesGuard", () => {
  let rolesGuard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;
  let supabaseAuthService: jest.Mocked<SupabaseAuthService>;
  let supabaseClientMock: any;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    supabaseClientMock = {
      rpc: jest.fn().mockResolvedValue({ data: false, error: null }),
    };

    supabaseAuthService = {
      getSupabaseClient: jest.fn().mockReturnValue(supabaseClientMock),
    } as unknown as jest.Mocked<SupabaseAuthService>;

    rolesGuard = new RolesGuard(reflector, supabaseAuthService);
  });

  const mockExecutionContext = (user?: any) => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  // ── Original tests (updated for async canActivate) ────────────────

  it("should return true if no roles are required", async () => {
    const context = mockExecutionContext();
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const result = await rolesGuard.canActivate(context);

    expect(result).toBe(true);
  });

  it("should throw ForbiddenException if roles are required but no user is attached to request", async () => {
    const context = mockExecutionContext(undefined); // No user
    reflector.getAllAndOverride.mockReturnValue(["PlatformOwner"]);

    await expect(rolesGuard.canActivate(context)).rejects.toThrow(
      new ForbiddenException("User role not found"),
    );
  });

  it("should throw ForbiddenException if user does not have a role property", async () => {
    const context = mockExecutionContext({ id: "user-1" }); // User without role
    reflector.getAllAndOverride.mockReturnValue(["PlatformOwner"]);

    await expect(rolesGuard.canActivate(context)).rejects.toThrow(
      new ForbiddenException("User role not found"),
    );
  });

  it("should throw ForbiddenException if user role is not in the required roles", async () => {
    const context = mockExecutionContext({ id: "user-1", role: "TenantAdmin" });
    reflector.getAllAndOverride.mockReturnValue(["PlatformOwner"]);

    await expect(rolesGuard.canActivate(context)).rejects.toThrow(
      new ForbiddenException("Access denied. Requires one of: PlatformOwner"),
    );
  });

  it("should return true if user has the required role", async () => {
    const context = mockExecutionContext({
      id: "user-1",
      role: "PlatformOwner",
    });
    reflector.getAllAndOverride.mockReturnValue([
      "PlatformOwner",
      "TenantAdmin",
    ]);

    const result = await rolesGuard.canActivate(context);

    expect(result).toBe(true);
  });

  // ── AllowOverride tests (Tasks 3.2, 3.4, 3.5) ────────────────────

  it("should not bypass role check when @AllowOverride is set but user is NOT PlatformOwner", async () => {
    const context = mockExecutionContext({
      id: "user-1",
      role: "TenantAdmin",
    });

    // Roles required: TenantAdmin (user has it), but AllowOverride is set
    reflector.getAllAndOverride
      .mockReturnValueOnce(["TenantAdmin"]) // roles
      .mockReturnValueOnce(true); // allowOverride

    const result = await rolesGuard.canActivate(context);

    // TenantAdmin has the required role → allowed regardless of override
    expect(result).toBe(true);
  });

  it("should deny PlatformOwner when @AllowOverride is set but emergency is NOT active (Task 3.4)", async () => {
    const context = mockExecutionContext({
      id: "po-1",
      role: "PlatformOwner",
    });

    reflector.getAllAndOverride
      .mockReturnValueOnce(["TenantAdmin"]) // roles
      .mockReturnValueOnce(true); // allowOverride

    // Emergency RPC returns false
    supabaseClientMock.rpc.mockResolvedValue({
      data: false,
      error: null,
    });

    await expect(rolesGuard.canActivate(context)).rejects.toThrow(
      new ForbiddenException("Access denied. Requires one of: TenantAdmin"),
    );
  });

  it("should allow PlatformOwner when @AllowOverride is set AND emergency IS active (Task 3.2)", async () => {
    const context = mockExecutionContext({
      id: "po-1",
      role: "PlatformOwner",
    });

    reflector.getAllAndOverride
      .mockReturnValueOnce(["TenantAdmin"]) // roles
      .mockReturnValueOnce(true); // allowOverride

    // Emergency RPC returns true
    supabaseClientMock.rpc.mockResolvedValue({
      data: true,
      error: null,
    });

    const result = await rolesGuard.canActivate(context);

    expect(result).toBe(true);
    expect(supabaseClientMock.rpc).toHaveBeenCalledWith(
      "is_platform_emergency_access",
    );
  });

  it("should deny PlatformOwner when @AllowOverride is NOT set even if emergency is active (Task 3.4)", async () => {
    const context = mockExecutionContext({
      id: "po-1",
      role: "PlatformOwner",
    });

    reflector.getAllAndOverride
      .mockReturnValueOnce(["TenantAdmin"]) // roles
      .mockReturnValueOnce(undefined); // allowOverride NOT set

    // Even though emergency might be active, no override decorator → deny
    await expect(rolesGuard.canActivate(context)).rejects.toThrow(
      new ForbiddenException("Access denied. Requires one of: TenantAdmin"),
    );
  });
});
