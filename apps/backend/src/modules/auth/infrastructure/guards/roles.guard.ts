// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt2 on Tue May 26 2026
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@callmaster/shared";
import { ROLES_KEY } from "../../application/decorators/roles.decorator";
import { ALLOW_OVERRIDE_KEY } from "../../application/decorators/allow-override.decorator";
import { SupabaseAuthService } from "../providers/supabase-auth.service";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private supabaseAuthService: SupabaseAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // No hay restricción de roles
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException("User role not found");
    }

    // ── AllowOverride: PlatformOwner emergency bypass ────────────────
    const allowOverride = this.reflector.getAllAndOverride<boolean>(
      ALLOW_OVERRIDE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (allowOverride && user.role === UserRole.PlatformOwner) {
      const client = this.supabaseAuthService.getSupabaseClient();
      const { data: isEmergency } = await client.rpc(
        "is_platform_emergency_access",
      );

      if (isEmergency) {
        return true; // Override active — bypass role check
      }
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Requires one of: ${requiredRoles.join(", ")}`,
      );
    }

    return true;
  }
}
