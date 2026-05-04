import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SupabaseAuthService } from "./infrastructure/providers/supabase-auth.service";
import { AuthGuard } from "./infrastructure/guards/auth.guard";
import { RolesGuard } from "./infrastructure/guards/roles.guard";
import { AuthController } from "./application/auth.controller";

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [SupabaseAuthService, AuthGuard, RolesGuard],
  exports: [SupabaseAuthService, AuthGuard, RolesGuard],
})
export class AuthModule {}
