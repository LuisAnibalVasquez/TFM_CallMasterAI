import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/auth/auth.module";
import { TenantsModule } from "./modules/tenants/tenants.module";
import { CampaignsModule } from "./modules/campaigns/campaigns.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que ConfigService esté disponible en toda la app
    }),
    AuthModule,
    TenantsModule,
    CampaignsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
