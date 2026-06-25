// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt2 on Tue May 26 2026
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Inngest } from "inngest";
import { CampaignsService } from "./infrastructure/providers/campaigns.service";
import { CampaignsAdminService } from "./infrastructure/providers/campaigns-admin.service";
import { VoiceflowProvider } from "./infrastructure/providers/voiceflow.provider";
import { CampaignsController } from "./infrastructure/controllers/campaigns.controller";
import { CreateCampaignUseCase } from "./application/use-cases/create-campaign.use-case";
import { ListCampaignsUseCase } from "./application/use-cases/list-campaigns.use-case";
import { StartCampaignUseCase } from "./application/use-cases/start-campaign.use-case";
import { CancelCampaignUseCase } from "./application/use-cases/cancel-campaign.use-case";
import { DeleteCampaignUseCase } from "./application/use-cases/delete-campaign.use-case";
import { AuthModule } from "../auth/auth.module";
import { CampaignsInngestModule } from "./inngest/campaigns-inngest.module";
import { ICampaignRepository } from "./domain/ports/campaign-repository.port";
import { IAgentProvider } from "./domain/ports/agent-provider.port";
import { createCampaignProcessingFunction } from "./inngest/campaign-processing.function";
import { createCampaignPurgeFunction } from "./inngest/campaign-purge.function";
import { TenantsService } from "../tenants/infrastructure/providers/tenants.service";
import { EncryptionService } from "../tenants/infrastructure/providers/encryption.service";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [ConfigModule, AuthModule, CampaignsInngestModule],
  controllers: [CampaignsController],
  providers: [
    CampaignsService,
    CampaignsAdminService,
    VoiceflowProvider,
    CreateCampaignUseCase,
    ListCampaignsUseCase,
    StartCampaignUseCase,
    CancelCampaignUseCase,
    DeleteCampaignUseCase,
    // HTTP path: tenant-scoped client via TenantSupabaseService (RLS enforced)
    {
      provide: "ICampaignRepository",
      useExisting: CampaignsService,
    },
    // Admin path: service_role key client (bypasses RLS) for Inngest jobs
    {
      provide: "IAdminCampaignRepository",
      useExisting: CampaignsAdminService,
    },
    {
      provide: "IAgentProvider",
      useExisting: VoiceflowProvider,
    },
    {
      provide: "INNGEST_FUNCTIONS",
      useFactory: (
        inngest: Inngest,
        repository: ICampaignRepository,
        agentProvider: IAgentProvider,
        tenantsService: TenantsService,
        encryptionService: EncryptionService,
        configService: ConfigService,
      ) => {
        const masterKey = configService.get<string>("ENCRYPTION_MASTER_KEY");
        if (!masterKey) {
          throw new Error(
            "ENCRYPTION_MASTER_KEY is not configured in environment",
          );
        }
        const processingFn = createCampaignProcessingFunction(inngest, {
          repository,
          agentProvider,
          sendEvent: (event) => inngest.send(event),
          tenantsService,
          encryptionService,
          masterKey,
        });
        const purgeFn = createCampaignPurgeFunction(inngest, {
          repository,
        });
        return [processingFn, purgeFn];
      },
      inject: [
        "InngestClient",
        "IAdminCampaignRepository",
        "IAgentProvider",
        TenantsService,
        EncryptionService,
        ConfigService,
      ],
    },
  ],
  exports: [CampaignsService],
})
export class CampaignsModule {}
