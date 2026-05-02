import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { SupabaseAuthService } from "../providers/supabase-auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private supabaseAuthService: SupabaseAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException(
        "Missing or invalid Authorization header",
      );
    }

    const token = authHeader.split(" ")[1];

    try {
      // 1. Validar Token con Supabase Auth
      const user = await this.supabaseAuthService.validateToken(token);

      // 2. Obtener el perfil y rol (PlatformOwner o TenantAdmin)
      const profile = await this.supabaseAuthService.getUserProfile(user.id);

      // 3. Adjuntar info al request para que los controladores la usen
      request.user = {
        id: user.id,
        email: user.email,
        role: profile.role,
        tenantId: profile.tenant_id,
      };

      return true;
    } catch {
      throw new UnauthorizedException("Authentication failed");
    }
  }
}
