// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt2 on Tue May 26 2026
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SupabaseAuthService } from "./infrastructure/providers/supabase-auth.service";
import { TenantSupabaseService } from "./infrastructure/providers/tenant-supabase.service";
import { AdminSupabaseService } from "./infrastructure/providers/admin-supabase.service";
import { AuthGuard } from "./infrastructure/guards/auth.guard";
import { RolesGuard } from "./infrastructure/guards/roles.guard";
import { AuthController } from "./application/auth.controller";

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [
    SupabaseAuthService,
    TenantSupabaseService,
    AdminSupabaseService,
    AuthGuard,
    RolesGuard,
  ],
  exports: [
    SupabaseAuthService,
    TenantSupabaseService,
    AdminSupabaseService,
    AuthGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
