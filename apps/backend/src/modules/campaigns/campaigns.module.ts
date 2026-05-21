import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CampaignsService } from "./infrastructure/providers/campaigns.service";
import { CampaignsController } from "./infrastructure/controllers/campaigns.controller";
import { CreateCampaignUseCase } from "./application/use-cases/create-campaign.use-case";
import { ListCampaignsUseCase } from "./application/use-cases/list-campaigns.use-case";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [CampaignsController],
  providers: [
    CampaignsService,
    CreateCampaignUseCase,
    ListCampaignsUseCase,
    {
      provide: "ICampaignRepository",
      useExisting: CampaignsService,
    },
  ],
  exports: [CampaignsService],
})
export class CampaignsModule {}
