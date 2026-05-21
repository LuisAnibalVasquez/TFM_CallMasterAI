import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TenantsService } from "./infrastructure/providers/tenants.service";
import { EncryptionService } from "./infrastructure/providers/encryption.service";
import { TenantsController } from "./application/tenants.controller";
import { CreateTenantUseCase } from "./application/use-cases/create-tenant.use-case";
import { DeleteTenantUseCase } from "./application/use-cases/delete-tenant.use-case";
import { UpdateTenantUseCase } from "./application/use-cases/update-tenant.use-case";
import { ListTenantsUseCase } from "./application/use-cases/list-tenants.use-case";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [TenantsController],
  providers: [
    TenantsService,
    EncryptionService,
    CreateTenantUseCase,
    DeleteTenantUseCase,
    UpdateTenantUseCase,
    ListTenantsUseCase,
    {
      provide: "ITenantRepository",
      useExisting: TenantsService,
    },
  ],
  exports: [TenantsService, EncryptionService],
})
export class TenantsModule {}
