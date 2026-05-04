import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesGuard } from "./roles.guard";

describe("RolesGuard", () => {
  let rolesGuard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    rolesGuard = new RolesGuard(reflector);
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

  it("should return true if no roles are required", () => {
    const context = mockExecutionContext();
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const result = rolesGuard.canActivate(context);

    expect(result).toBe(true);
  });

  it("should throw ForbiddenException if roles are required but no user is attached to request", () => {
    const context = mockExecutionContext(undefined); // No user
    reflector.getAllAndOverride.mockReturnValue(["PlatformOwner"]);

    expect(() => rolesGuard.canActivate(context)).toThrow(
      new ForbiddenException("User role not found"),
    );
  });

  it("should throw ForbiddenException if user does not have a role property", () => {
    const context = mockExecutionContext({ id: "user-1" }); // User without role
    reflector.getAllAndOverride.mockReturnValue(["PlatformOwner"]);

    expect(() => rolesGuard.canActivate(context)).toThrow(
      new ForbiddenException("User role not found"),
    );
  });

  it("should throw ForbiddenException if user role is not in the required roles", () => {
    const context = mockExecutionContext({ id: "user-1", role: "TenantAdmin" });
    reflector.getAllAndOverride.mockReturnValue(["PlatformOwner"]);

    expect(() => rolesGuard.canActivate(context)).toThrow(
      new ForbiddenException("Access denied. Requires one of: PlatformOwner"),
    );
  });

  it("should return true if user has the required role", () => {
    const context = mockExecutionContext({
      id: "user-1",
      role: "PlatformOwner",
    });
    reflector.getAllAndOverride.mockReturnValue([
      "PlatformOwner",
      "TenantAdmin",
    ]);

    const result = rolesGuard.canActivate(context);

    expect(result).toBe(true);
  });
});
