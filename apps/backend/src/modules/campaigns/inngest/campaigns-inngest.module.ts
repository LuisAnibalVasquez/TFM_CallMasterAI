// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt2 on Tue May 26 2026
import { Module } from "@nestjs/common";
import { Inngest } from "inngest";
import { CampaignsAdminService } from "../infrastructure/providers/campaigns-admin.service";
import { TenantsModule } from "../../tenants/tenants.module";

/**
 * Provides the Inngest client singleton, the admin-scoped
 * ICampaignRepository implementation, and tenant services used by background jobs.
 *
 * CampaignsAdminService uses SERVICE_ROLE_KEY to bypass RLS,
 * allowing Inngest functions to access all tenant data.
 */
@Module({
  imports: [TenantsModule],
  providers: [
    {
      provide: "InngestClient",
      useFactory: () => {
        const isProd = process.env.NODE_ENV === "production";
        console.log(
          "[Inngest] NODE_ENV:",
          process.env.NODE_ENV,
          "isProd:",
          isProd,
        );
        return new Inngest({
          id: "callmaster-ai",
          isDev: !isProd,
          // En producción, Inngest usa Inngest Cloud automáticamente si no pasas baseUrl.
          // En local, forzamos 127.0.0.1 para evitar problemas de IPv6 con Node 18+.
          ...(isProd
            ? {}
            : {
                baseUrl:
                  process.env.INNGEST_BASE_URL || "http://127.0.0.1:8288",
              }),
          eventKey: process.env.INNGEST_EVENT_KEY || "local-dev-key",
        });
      },
    },
    CampaignsAdminService,
  ],
  exports: ["InngestClient", CampaignsAdminService, TenantsModule],
})
export class CampaignsInngestModule {}
