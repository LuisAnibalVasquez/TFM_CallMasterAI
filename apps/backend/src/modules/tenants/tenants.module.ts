import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TenantsService } from "./infrastructure/providers/tenants.service";
import { TenantsController } from "./application/tenants.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
