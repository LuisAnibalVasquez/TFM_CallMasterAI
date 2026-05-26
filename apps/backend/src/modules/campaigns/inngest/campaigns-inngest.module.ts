// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt2 on Tue May 26 2026
import { Module } from "@nestjs/common";
import { Inngest } from "inngest";
import { CampaignsAdminService } from "../infrastructure/providers/campaigns-admin.service";

/**
 * Provides the Inngest client singleton and the admin-scoped
 * ICampaignRepository implementation used by background jobs.
 *
 * CampaignsAdminService uses SERVICE_ROLE_KEY to bypass RLS,
 * allowing Inngest functions to access all tenant data.
 */
@Module({
  providers: [
    {
      provide: "InngestClient",
      useFactory: () => {
        return new Inngest({
          id: "callmaster-ai",
          baseUrl: process.env.INNGEST_BASE_URL || "http://localhost:8288",
          eventKey: process.env.INNGEST_EVENT_KEY || "local-dev-key",
        });
      },
    },
    CampaignsAdminService,
  ],
  exports: ["InngestClient", CampaignsAdminService],
})
export class CampaignsInngestModule {}
